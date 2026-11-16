# 🏇 3D Horse Racing Simulator

An interactive 3D horse racing simulator built with **Three.js**, featuring animated thoroughbreds from `horse_run_cycle_on_place.glb`, 3D jockeys, state-driven racing, and cinematic cameras.

---

## 🌟 3D Thoroughbred Model & Kinematics

1. **Animated Thoroughbred Model**:
   - Each competitor uses the horse model and running animation from `horse_run_cycle_on_place.glb`.
   - The animation plays during the race and pauses at the gate, while race movement and camera tracking remain simulation-controlled.
   - Root-motion drift is removed so the animated horse stays aligned with its lane on the oval track.

2. **Full 3D Jockeys in Racing Tuck**:
   - Each horse features a 3D jockey in an aerodynamic forward riding crouch over the withers.
   - Wearing colored silk jerseys matching their horse's number, white racing breeches, black riding boots, and racing helmets with goggles.
   - Rhythmic driving motion during the final home-stretch sprint!

3. **6 Distinct Competitors**:
   - **#1 Margaret** — *Chestnut Sorrel* (Copper coat, scarlet silks `#ef4444`)
   - **#2 Midnight** — *Obsidian Black* (Jet black coat, gold silks `#f59e0b`)
   - **#3 Silver Ghost** — *Dapple White/Grey* (Platinum silver coat, royal blue silks `#2563eb`)
   - **#4 Apollo** — *Golden Palomino* (Golden bronze coat, purple silks `#9333ea`)
   - **#5 Thunder Bay** — *Dark Bay* (Mahogany brown coat, emerald silks `#059669`)
   - **#6 Copper Sunset** — *Copper Dun* (Warm tan coat, orange silks `#ea580c`)

4. **Complete State-Driven Behavior**:
   - `STALL_IDLE`: The running clip pauses while horses wait at the starting gate.
   - `GATE_BREAK`: Starting doors swing open 90° as horses surge forward.
   - `ACCELERATING`, `GALLOP`, and `FINAL_SPRINT`: Race-state logic drives position and speed while the GLB running clip plays.
   - `COOLING_DOWN`: The running clip pauses when a horse finishes.

## 🚀 Running the Simulation

The app requires Node.js 18 or newer. It cannot be run with a static file server because sign-in and race controls are enforced by the server.

Set different passwords of at least 12 characters in the root `.env` file:

```dotenv
ADMIN_PASSWORD=your-private-admin-password
USER_PASSWORD=your-private-user-password
```

Keep `.env` private; it is excluded from Git. `.env.example` is the template. Environment variables already set by the hosting platform take precedence over `.env`.

Run `node server.js` or double-click `start.bat`, then open `http://localhost:8000`. Users on the same network can open the server machine's address on port 8000. Set `PORT` to change the port.

For a hosted deployment, configure `ADMIN_PASSWORD` and `USER_PASSWORD` as deployment secrets, set `NODE_ENV=production`, and put the server behind HTTPS. On Railway, deploy the repository root as a Node service and use `npm start`; Railway supplies the `PORT` value. Run one server instance: sign-in sessions and the live race state are held in memory.

### Separate Vercel frontend and Railway API

Deploy the repository root to Vercel and Railway. `vercel.json` proxies `/api/*` requests to the Railway service, so the browser uses the Vercel origin for both the frontend and API. This avoids third-party-cookie blocking between `vercel.app` and `railway.app`. The API base URL metadata in `login.html` and `index.html` is intentionally blank: local and Railway-hosted pages use their own origin, while Vercel uses its `/api` rewrite.

On Railway, set `FRONTEND_ORIGINS` to the exact Vercel origin (no trailing slash), for example `https://shijinjoylal-debug-bet.vercel.app`, and set `NODE_ENV=production`. Set distinct `ADMIN_PASSWORD` and `USER_PASSWORD` values there as well. Railway must run one server instance because sign-in sessions and live race state are held in memory.

The admin and viewer use the same race page, but the admin sees race controls while the viewer is read-only. This is intentional; Railway enforces the role for protected actions.

Use the site's `https://…vercel.app` address. Vercel provides HTTPS automatically; a browser warning such as “Your connection isn't private” or “Deceptive site ahead” is not fixed by application code and should be checked against the exact deployed URL and warning.

## 🔐 Access roles

The server validates sign-ins and issues an HTTP-only session cookie. Administrators can start, pause, reset, and change race speed; viewers can watch the administrator's live simulation but cannot control it. Race state is streamed to signed-in users, and new viewers receive the latest race snapshot.

The frontend and 3D assets must be sent to a browser to render, so browser developer tools can inspect them. That does not grant access to server-protected pages, sessions, or administrator actions: the server checks the session and role for each protected request. Do not expose this service over plain HTTP on an untrusted network.
