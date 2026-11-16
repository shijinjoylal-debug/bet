const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

function loadEnvironmentFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const contents = fs.readFileSync(filePath, 'utf8');
  for (const [index, rawLine] of contents.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) throw new Error(`Invalid .env entry on line ${index + 1}.`);

    let value = match[2].trim();
    if (value.startsWith('"') || value.startsWith("'")) {
      const quote = value[0];
      if (!value.endsWith(quote)) throw new Error(`Unclosed quote in .env on line ${index + 1}.`);
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '').trim();
    }

    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}

loadEnvironmentFile(path.join(__dirname, '.env'));

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '0.0.0.0';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const COOKIE_NAME = 'horse-racing-session';
const FRONTEND_ORIGINS = new Set((process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)
  .map(origin => {
    const parsedOrigin = new URL(origin);
    if (parsedOrigin.origin !== origin) {
      throw new Error('FRONTEND_ORIGINS must contain origins without paths or trailing slashes.');
    }
    return parsedOrigin.origin;
  }));
const PUBLIC_FILES = new Set(['login.html', 'auth.js', 'api-client.js', 'style.css']);
const PRIVATE_FILES = new Set(['index.html', 'main.js', 'horse_run_cycle_on_place.glb']);
const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

function requiredPassword(name) {
  const password = process.env[name];
  if (!password || password.length < 12 || password.length > 1024) {
    throw new Error(`${name} must be set to a password between 12 and 1024 characters.`);
  }
  return password;
}

const adminPassword = requiredPassword('ADMIN_PASSWORD');
const viewerPassword = requiredPassword('USER_PASSWORD');
if (adminPassword === viewerPassword) {
  throw new Error('ADMIN_PASSWORD and USER_PASSWORD must be different.');
}

const passwordSalts = {
  admin: crypto.randomBytes(16),
  viewer: crypto.randomBytes(16),
};
const passwordHashes = {
  admin: crypto.scryptSync(adminPassword, passwordSalts.admin, 64),
  viewer: crypto.scryptSync(viewerPassword, passwordSalts.viewer, 64),
};
const sessions = new Map();
const loginAttempts = new Map();
const eventStreams = new Map();
const root = __dirname;

const race = {
  phase: 'READY',
  raceStartAt: 0,
  pausedAt: 0,
  timeScale: 1,
  snapshot: null,
};
let startTimer = null;

function sendJson(response, status, value, headers = {}) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });
  response.end(JSON.stringify(value));
}

function sendError(response, status, message, headers) {
  sendJson(response, status, { error: message }, headers);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    let tooLarge = false;
    request.setEncoding('utf8');
    request.on('data', chunk => {
      if (tooLarge) return;
      body += chunk;
      if (body.length > 16 * 1024) {
        tooLarge = true;
        body = '';
      }
    });
    request.on('end', () => {
      if (tooLarge) {
        reject(Object.assign(new Error('Request body is too large.'), { status: 413 }));
        return;
      }
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(Object.assign(new Error('Request body must be valid JSON.'), { status: 400 }));
      }
    });
    request.on('error', reject);
  });
}

function getSession(request) {
  const cookie = request.headers.cookie || '';
  const token = cookie.split(';').map(part => part.trim())
    .find(part => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  const session = token && sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  session.token = token;
  return session;
}

function requireSession(request, response) {
  const session = getSession(request);
  if (!session) {
    sendError(response, 401, 'Please sign in again.');
    return null;
  }
  return session;
}

function requireAdmin(request, response) {
  const session = requireSession(request, response);
  if (session && session.role !== 'admin') {
    sendError(response, 403, 'Administrator access is required.');
    return null;
  }
  return session;
}

function requireSameOrigin(request, response) {
  const origin = request.headers.origin;
  if (!origin || !request.headers.host) {
    sendError(response, 403, 'A same-origin request is required.');
    return false;
  }
  try {
    const parsedOrigin = new URL(origin);
    if (parsedOrigin.origin !== origin ||
        (parsedOrigin.host !== request.headers.host && !FRONTEND_ORIGINS.has(parsedOrigin.origin))) {
      sendError(response, 403, 'A same-origin request is required.');
      return false;
    }
  } catch {
    sendError(response, 403, 'A valid request origin is required.');
    return false;
  }
  return true;
}

function sessionCookie(token, maxAge) {
  const production = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=${production ? 'None' : 'Strict'}; Max-Age=${maxAge}${production ? '; Secure' : ''}`;
}

function publicRaceState() {
  return {
    phase: race.phase,
    raceStartAt: race.raceStartAt,
    timeScale: race.timeScale,
    snapshot: race.snapshot,
    serverTime: Date.now(),
  };
}

function broadcast(event, payload) {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const response of eventStreams.keys()) {
    if (response.destroyed || response.writableEnded) {
      eventStreams.delete(response);
    } else {
      response.write(data);
    }
  }
}

function updateRace(action, fields = {}) {
  const now = Date.now();
  if (action === 'start') {
    if (race.phase !== 'READY' && race.phase !== 'FINISHED') return false;
    clearTimeout(startTimer);
    race.phase = 'COUNTDOWN';
    race.raceStartAt = now + 1800;
    race.snapshot = null;
    startTimer = setTimeout(() => {
      if (race.phase !== 'COUNTDOWN') return;
      race.phase = 'RACING';
      broadcast('state', publicRaceState());
    }, Math.max(0, race.raceStartAt - now));
  } else if (action === 'pause') {
    if (race.phase !== 'RACING') return false;
    race.phase = 'PAUSED';
    race.pausedAt = now;
  } else if (action === 'resume') {
    if (race.phase !== 'PAUSED') return false;
    race.raceStartAt += now - race.pausedAt;
    race.pausedAt = 0;
    race.phase = 'RACING';
  } else if (action === 'reset') {
    clearTimeout(startTimer);
    race.phase = 'READY';
    race.raceStartAt = 0;
    race.pausedAt = 0;
    race.snapshot = null;
  } else if (action === 'speed') {
    if (![0.5, 1, 2].includes(fields.speed)) return false;
    race.timeScale = fields.speed;
  } else if (action === 'finish') {
    if (race.phase !== 'RACING') return false;
    race.phase = 'FINISHED';
  } else {
    return false;
  }

  broadcast('state', { ...publicRaceState(), action });
  return true;
}

function validSnapshot(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.horses) || snapshot.horses.length !== 6) return false;
  const ids = new Set();
  for (const horse of snapshot.horses) {
    if (!horse || !Number.isInteger(horse.id) || horse.id < 1 || horse.id > 6 || ids.has(horse.id)) return false;
    ids.add(horse.id);
    for (const key of ['distance', 'speed', 'finishTime', 'currentStamina', 'laneOffset', 'targetLaneOffset', 'stridePhase', 'idleTimer']) {
      if (!Number.isFinite(horse[key])) return false;
    }
    if (typeof horse.state !== 'string' || typeof horse.finished !== 'boolean') return false;
  }
  return true;
}

function checkLoginLimit(request) {
  const ip = request.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let attempt = loginAttempts.get(ip);
  if (!attempt || attempt.resetAt <= now) {
    attempt = { failures: 0, resetAt: now + 15 * 60 * 1000 };
    loginAttempts.set(ip, attempt);
  }
  return attempt.failures >= 8 ? Math.ceil((attempt.resetAt - now) / 1000) : 0;
}

function failLogin(request) {
  const ip = request.socket.remoteAddress || 'unknown';
  const attempt = loginAttempts.get(ip);
  if (attempt) attempt.failures += 1;
}

function clearLoginFailures(request) {
  loginAttempts.delete(request.socket.remoteAddress || 'unknown');
}

function serveFile(response, file) {
  const filePath = path.join(root, file);
  fs.readFile(filePath, (error, contents) => {
    if (error) {
      sendError(response, 500, 'Unable to load the requested page.');
      console.error(`Failed to read ${filePath}:`, error);
      return;
    }
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Length': contents.length,
      'Content-Type': CONTENT_TYPES[path.extname(file)] || 'application/octet-stream',
    });
    response.end(contents);
  });
}

const server = http.createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  let pathname;
  try {
    pathname = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname;
  } catch {
    sendError(response, 400, 'Invalid request URL.');
    return;
  }

  if (request.headers.origin) {
    if (!requireSameOrigin(request, response)) return;
    response.setHeader('Access-Control-Allow-Origin', request.headers.origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Vary', 'Origin');
  }

  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    response.writeHead(204, {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Max-Age': '600',
    });
    response.end();
    return;
  }

  if (request.method === 'GET' && pathname === '/') {
    response.writeHead(302, { Location: '/login.html', 'Cache-Control': 'no-store' });
    response.end();
    return;
  }

  if (request.method === 'POST' && pathname === '/api/login') {
    if (!requireSameOrigin(request, response)) return;
    const retryAfter = checkLoginLimit(request);
    if (retryAfter) {
      sendError(response, 429, 'Too many sign-in attempts. Try again later.', { 'Retry-After': String(retryAfter) });
      return;
    }
    let body;
    try {
      body = await readJson(request);
    } catch (error) {
      sendError(response, error.status || 400, error.message);
      return;
    }
    const password = typeof body.password === 'string' && body.password.length <= 1024 ? body.password : '';
    const candidate = crypto.scryptSync(password, passwordSalts.admin, 64);
    const matchesAdmin = crypto.timingSafeEqual(candidate, passwordHashes.admin);
    const viewerCandidate = crypto.scryptSync(password, passwordSalts.viewer, 64);
    const matchesViewer = crypto.timingSafeEqual(viewerCandidate, passwordHashes.viewer);
    const role = matchesAdmin ? 'admin' : matchesViewer ? 'viewer' : null;
    if (!role) {
      failLogin(request);
      sendError(response, 401, 'Incorrect password. Please try again.');
      return;
    }

    clearLoginFailures(request);
    const token = crypto.randomBytes(32).toString('base64url');
    sessions.set(token, { role, expiresAt: Date.now() + SESSION_TTL_MS });
    sendJson(response, 200, { role }, {
      'Set-Cookie': sessionCookie(token, SESSION_TTL_MS / 1000),
    });
    return;
  }

  if (request.method === 'POST' && pathname === '/api/logout') {
    if (!requireSameOrigin(request, response)) return;
    const session = requireSession(request, response);
    if (!session) return;
    sessions.delete(session.token);
    for (const [stream, token] of eventStreams) {
      if (token === session.token) {
        eventStreams.delete(stream);
        stream.end();
      }
    }
    sendJson(response, 200, { ok: true }, {
      'Set-Cookie': sessionCookie('', 0),
    });
    return;
  }

  if (request.method === 'GET' && pathname === '/api/session') {
    const session = requireSession(request, response);
    if (!session) return;
    sendJson(response, 200, { role: session.role });
    return;
  }

  if (request.method === 'GET' && pathname === '/api/events') {
    const session = requireSession(request, response);
    if (!session) return;
    response.writeHead(200, {
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Content-Type': 'text/event-stream; charset=utf-8',
      'X-Accel-Buffering': 'no',
    });
    response.write(`event: sync\ndata: ${JSON.stringify(publicRaceState())}\n\n`);
    eventStreams.set(response, session.token);
    const heartbeat = setInterval(() => {
      if (!getSession(request)) {
        response.end();
        return;
      }
      response.write(': keep-alive\n\n');
    }, 20000);
    response.on('close', () => {
      clearInterval(heartbeat);
      eventStreams.delete(response);
    });
    return;
  }

  if (request.method === 'POST' && pathname === '/api/control') {
    if (!requireSameOrigin(request, response)) return;
    if (!requireAdmin(request, response)) return;
    let body;
    try {
      body = await readJson(request);
    } catch (error) {
      sendError(response, error.status || 400, error.message);
      return;
    }
    if (!updateRace(body.action, body)) {
      sendError(response, 409, 'That action is not valid for the current race state.');
      return;
    }
    sendJson(response, 200, publicRaceState());
    return;
  }

  if (request.method === 'POST' && pathname === '/api/snapshot') {
    if (!requireSameOrigin(request, response)) return;
    const session = requireAdmin(request, response);
    if (!session) return;
    if (race.phase !== 'RACING') {
      sendError(response, 409, 'Race snapshots are only accepted while a race is running.');
      return;
    }
    let body;
    try {
      body = await readJson(request);
    } catch (error) {
      sendError(response, error.status || 400, error.message);
      return;
    }
    if (!validSnapshot(body)) {
      sendError(response, 400, 'Invalid race snapshot.');
      return;
    }
    const now = Date.now();
    if (session.lastSnapshotAt && now - session.lastSnapshotAt < 50) {
      sendError(response, 429, 'Race snapshots are arriving too quickly.');
      return;
    }
    session.lastSnapshotAt = now;
    race.snapshot = { ...body, serverTime: now };
    broadcast('snapshot', race.snapshot);
    response.writeHead(204, { 'Cache-Control': 'no-store' });
    response.end();
    return;
  }

  if (request.method === 'GET' && pathname === '/index.html') {
    if (!getSession(request)) {
      response.writeHead(302, { Location: '/login.html', 'Cache-Control': 'no-store' });
      response.end();
      return;
    }
    serveFile(response, 'index.html');
    return;
  }

  if (request.method === 'GET' && PRIVATE_FILES.has(pathname.slice(1))) {
    if (!requireSession(request, response)) return;
    serveFile(response, pathname.slice(1));
    return;
  }

  if (request.method === 'GET' && PUBLIC_FILES.has(pathname.slice(1))) {
    serveFile(response, pathname.slice(1));
    return;
  }

  sendError(response, 404, 'Not found.');
});

server.listen(PORT, HOST, () => {
  const browserHost = HOST === '0.0.0.0' || HOST === '::' ? 'localhost' : HOST;
  console.log(`Horse racing server listening. Open http://${browserHost}:${PORT}`);
  console.log('Use HTTPS when hosting this server outside a trusted local network.');
});
