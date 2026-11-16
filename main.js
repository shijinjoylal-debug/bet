import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

/* ==========================================================================
   WINNER CONTROLLER CONFIGURATION (PLACEHOLDER)
   ==========================================================================
   Set PREDETERMINED_WINNER to a horse ID (1 to 6) to force that horse to win!
   Set to null or 0 for an organic, fair race where stats determine the winner.

   Horse Options:
     1 -> Margaret (Chestnut Sorrel)
     2 -> Midnight (Obsidian Black)
     3 -> Silver Ghost (Dapple White/Grey)
     4 -> Apollo (Golden Palomino)
     5 -> Thunder Bay (Dark Bay)
     6 -> Copper Sunset (Copper Dun)
     null -> Fair Race (No predetermined winner)
   ========================================================================== */
export const PREDETERMINED_WINNER = 1; // <--- CHANGE THIS TO 1, 2, 3, 4, 5, 6, OR null

function getPredeterminedWinnerId(val) {
  if (val === null || val === undefined || val === 0 || val === 'random') return null;
  if (typeof val === 'number') return (val >= 1 && val <= 6) ? val : null;
  if (typeof val === 'string') {
    const trimmed = val.trim().toLowerCase();
    const found = HORSES_DATA.find(h => h.name.toLowerCase().includes(trimmed) || h.id.toString() === trimmed);
    return found ? found.id : parseInt(val, 10) || null;
  }
  return null;
}

/* ==========================================================================
   RACETRACK PARAMETERS
   ========================================================================== */
const TRACK = {
  straightLength: 140, // Length of each straightaway (Z axis)
  turnRadius: 52,      // Radius of the two semicircles (X axis)
  width: 30,           // Total track width
  lanes: 6,            // 6 lanes for 6 horses
  laneSpacing: 4.0,    // Width per lane
};

const HORSE_MODEL_HEIGHT = 5.2;
const TRACK_PERIMETER = 2 * TRACK.straightLength + 2 * Math.PI * TRACK.turnRadius;

/* ==========================================================================
   DISTINCT HORSE ROSTER (Real Equine Traits, Conformation & Racing Styles)
   ========================================================================== */
const HORSES_DATA = [
  {
    id: 1,
    name: "Margaret",
    breed: "Chestnut Sorrel",
    age: "4yo Mare",
    height: "15.3 hh",
    coatColor: 0x9a3818,   // Warm rich reddish-copper
    maneColor: 0x6e240c,   // Dark chestnut mane
    silkColor: 0xef4444,   // Scarlet Red
    badgeHex: "#ef4444",
    topSpeed: 43.5,
    acceleration: 8.5,
    stamina: 8.8,
    runningStyle: "Pacesetter",
    styleClass: "pacesetter",
    trait: "Iron Will",
    traitDesc: "Counters outside challenges with immediate counter-burst",
    gear: {
      blinkers: true,       // Aero hood with eye cups
      blinkerColor: 0xef4444,
      shadowRoll: true,     // Sheepskin roll on noseband
      wraps: "front",       // White wraps on forelegs
      wrapColor: 0xffffff,
    },
    markings: {
      face: "blaze",        // Bold white blaze down nose
      socks: [false, true, true, false], // [FL, FR, HL, HR] white socks
      isBay: false,
    },
    jockey: {
      name: "R. Moore",
    }
  },
  {
    id: 2,
    name: "Midnight",
    breed: "Obsidian Black",
    age: "5yo Stallion",
    height: "16.3 hh",
    coatColor: 0x18181b,   // Sleek jet black
    maneColor: 0x09090b,   // Midnight black mane
    silkColor: 0xf59e0b,   // Gold
    badgeHex: "#f59e0b",
    topSpeed: 42.8,
    acceleration: 9.4,
    stamina: 7.8,
    runningStyle: "Stalker",
    styleClass: "stalker",
    trait: "Slipstream",
    traitDesc: "Gains speed boost when drafting behind leaders",
    gear: {
      blinkers: false,
      shadowRoll: true,     // White sheepskin roll
      wraps: "all",         // Gold wraps on all 4 legs
      wrapColor: 0xf59e0b,
    },
    markings: {
      face: "star",         // Diamond star on forehead
      socks: [false, false, false, true], // Single rear white ankle
      isBay: false,
    },
    jockey: {
      name: "L. Dettori",
    }
  },
  {
    id: 3,
    name: "Silver Ghost",
    breed: "Dapple Grey",
    age: "4yo Gelding",
    height: "16.1 hh",
    coatColor: 0xf1f5f9,   // Pearl silver white
    maneColor: 0xe2e8f0,   // Platinum mane
    silkColor: 0x2563eb,   // Royal Blue
    badgeHex: "#2563eb",
    topSpeed: 44.2,
    acceleration: 7.6,
    stamina: 9.5,
    runningStyle: "Closer",
    styleClass: "closer",
    trait: "Turbine Kick",
    traitDesc: "Devastating closing kick in the final 200m",
    gear: {
      blinkers: true,
      blinkerColor: 0x2563eb,
      shadowRoll: false,
      wraps: "front",
      wrapColor: 0x2563eb,
    },
    markings: {
      face: "snip",         // Dark muzzle with white snip
      socks: [false, false, false, false],
      isBay: false,
    },
    jockey: {
      name: "J. Velazquez",
    }
  },
  {
    id: 4,
    name: "Apollo",
    breed: "Golden Palomino",
    age: "3yo Colt",
    height: "16.0 hh",
    coatColor: 0xd97706,   // Golden bronze
    maneColor: 0xfef08a,   // Flaxen blonde mane
    silkColor: 0x9333ea,   // Purple
    badgeHex: "#9333ea",
    topSpeed: 43.8,
    acceleration: 8.0,
    stamina: 8.4,
    runningStyle: "Rail Runner",
    styleClass: "railrunner",
    trait: "Inside Track",
    traitDesc: "Corners with razor precision along the rail",
    gear: {
      blinkers: true,
      blinkerColor: 0x9333ea,
      shadowRoll: false,
      wraps: "none",
    },
    markings: {
      face: "bald",         // Wide white bald face (flaxen mane)
      socks: [true, true, true, true], // 4 high white stockings!
      isBay: false,
    },
    jockey: {
      name: "M. Smith",
    }
  },
  {
    id: 5,
    name: "Thunder Bay",
    breed: "Dark Bay",
    age: "4yo Colt",
    height: "16.2 hh",
    coatColor: 0x451a03,   // Deep mahogany bay
    maneColor: 0x1c1917,   // Black mane & points
    silkColor: 0x059669,   // Emerald Green
    badgeHex: "#059669",
    topSpeed: 42.4,
    acceleration: 8.8,
    stamina: 8.6,
    runningStyle: "Battler",
    styleClass: "battler",
    trait: "Tenacity",
    traitDesc: "Grinds out tough finishes when shoulder-to-shoulder",
    gear: {
      blinkers: false,
      shadowRoll: true,
      wraps: "all",
      wrapColor: 0x059669,
    },
    markings: {
      face: "stripe",       // Narrow connected stripe
      socks: [false, false, true, false], // Bay black points with 1 white sock
      isBay: true,
    },
    jockey: {
      name: "I. Ortiz Jr",
    }
  },
  {
    id: 6,
    name: "Copper Sunset",
    breed: "Copper Dun",
    age: "4yo Mare",
    height: "15.2 hh",
    coatColor: 0xc2410c,   // Warm copper tan
    maneColor: 0x431407,   // Dark rust mane
    silkColor: 0xea580c,   // Sunset Orange
    badgeHex: "#ea580c",
    topSpeed: 44.8,
    acceleration: 7.2,
    stamina: 7.6,
    runningStyle: "Speed Burner",
    styleClass: "speed",
    trait: "Wildcard",
    traitDesc: "Capable of blistering raw straightaway bursts",
    gear: {
      blinkers: true,
      blinkerColor: 0xea580c,
      shadowRoll: false,
      wraps: "front",
      wrapColor: 0xea580c,
    },
    markings: {
      face: "star-stripe",  // Star and stripe
      socks: [false, false, true, true], // Two rear white socks
      isBay: false,
    },
    jockey: {
      name: "F. Prat",
    }
  }
];

/* ==========================================================================
   WEB AUDIO SOUND ENGINE
   ========================================================================== */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.gallopInterval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopGallop();
    }
    return !this.muted;
  }

  playTrumpetFanfare() {
    if (this.muted) return;
    this.init();
    const notes = [
      { f: 261.63, d: 0.14 },
      { f: 392.00, d: 0.14 },
      { f: 523.25, d: 0.28 },
      { f: 659.25, d: 0.14 },
      { f: 783.99, d: 0.35 },
      { f: 659.25, d: 0.14 },
      { f: 523.25, d: 0.18 },
      { f: 392.00, d: 0.18 },
      { f: 523.25, d: 0.55 },
    ];
    let time = this.ctx.currentTime + 0.05;
    notes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(0.24, time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, time + note.d);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + note.d + 0.05);
      time += note.d + 0.04;
    });
  }

  startGallop() {
    if (this.muted) return;
    this.init();
    if (this.gallopInterval) clearInterval(this.gallopInterval);

    let beat = 0;
    this.gallopInterval = setInterval(() => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(beat % 2 === 0 ? 100 : 80, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.06);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, t);

      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);

      beat++;
    }, 115);
  }

  stopGallop() {
    if (this.gallopInterval) {
      clearInterval(this.gallopInterval);
      this.gallopInterval = null;
    }
  }

  playFinishChime() {
    if (this.muted) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1180, t);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 1.3);
  }
}

/* ==========================================================================
   HOOF DUST PARTICLE SYSTEM
   ========================================================================== */
class DustParticles {
  constructor(scene, maxParticles = 300) {
    this.scene = scene;
    this.maxParticles = maxParticles;
    this.positions = new Float32Array(maxParticles * 3);
    this.lifetimes = new Float32Array(maxParticles);
    this.velocities = [];

    for (let i = 0; i < maxParticles; i++) {
      this.lifetimes[i] = 0;
      this.velocities.push(new THREE.Vector3());
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xc8a87c,
      size: 0.55,
      transparent: true,
      opacity: 0.5,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
  }

  emit(pos, velocity) {
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.lifetimes[i] <= 0) {
        this.positions[i * 3] = pos.x + (Math.random() - 0.5) * 0.4;
        this.positions[i * 3 + 1] = 0.15;
        this.positions[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.4;

        this.velocities[i].set(
          -velocity.x * 0.15 + (Math.random() - 0.5) * 1.2,
          Math.random() * 1.0 + 0.3,
          -velocity.z * 0.15 + (Math.random() - 0.5) * 1.2
        );

        this.lifetimes[i] = 0.65;
        break;
      }
    }
  }

  update(delta) {
    let needsUpdate = false;
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.lifetimes[i] > 0) {
        this.lifetimes[i] -= delta;

        this.positions[i * 3] += this.velocities[i].x * delta;
        this.positions[i * 3 + 1] += this.velocities[i].y * delta;
        this.positions[i * 3 + 2] += this.velocities[i].z * delta;

        this.velocities[i].y -= 2.2 * delta;

        if (this.positions[i * 3 + 1] < 0) {
          this.positions[i * 3 + 1] = 0;
        }
        needsUpdate = true;
      } else {
        this.positions[i * 3 + 1] = -999;
      }
    }
    if (needsUpdate) {
      this.points.geometry.attributes.position.needsUpdate = true;
    }
  }
}

/* ==========================================================================
   3D HORSE & JOCKEY BUILDER (Articulated Quadruped Running Rig)
   ========================================================================== */
function buildArticulatedThoroughbred(data) {
  // Root group – world position & yaw applied here
  const root = new THREE.Group();

  // Primary local model container (handles banking in turns)
  const container = new THREE.Group();
  root.add(container);

  // ── Materials ──────────────────────────────────────────────────────────────
  const coatMat = new THREE.MeshStandardMaterial({
    color: data.coatColor,
    roughness: 0.6,
    metalness: 0.08,
  });
  const maneMat = new THREE.MeshStandardMaterial({
    color: data.maneColor,
    roughness: 0.8,
  });
  const hoofMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.4,
    metalness: 0.2,
  });
  const silkMat = new THREE.MeshStandardMaterial({
    color: data.silkColor,
    roughness: 0.35,
  });
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.5,
  });
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x271c19,
    roughness: 0.45,
  });
  const bridleMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3 });

  // ── 1. Spine / Torso Root ──────────────────────────────────────────────────
  const spine = new THREE.Group();
  spine.position.y = 1.55;
  container.add(spine);

  // Deep muscular chest & barrel (ribcage)
  const barrelGeo = new THREE.CylinderGeometry(0.54, 0.48, 1.65, 14);
  const barrelMesh = new THREE.Mesh(barrelGeo, coatMat);
  barrelMesh.rotation.x = Math.PI / 2;
  barrelMesh.castShadow = true;
  spine.add(barrelMesh);

  // Muscular front withers / chest bulb
  const withersGeo = new THREE.SphereGeometry(0.52, 12, 10);
  const withersMesh = new THREE.Mesh(withersGeo, coatMat);
  withersMesh.position.set(0, 0.12, 0.75);
  withersMesh.scale.set(0.9, 1.1, 1.0);
  withersMesh.castShadow = true;
  spine.add(withersMesh);

  // Muscular rear haunches / croup
  const croupGeo = new THREE.SphereGeometry(0.55, 12, 10);
  const croupMesh = new THREE.Mesh(croupGeo, coatMat);
  croupMesh.position.set(0, 0.1, -0.75);
  croupMesh.scale.set(0.95, 1.05, 1.1);
  croupMesh.castShadow = true;
  spine.add(croupMesh);

  // ── 2. Arched Neck & Head ──────────────────────────────────────────────────
  const neckPivot = new THREE.Group();
  neckPivot.position.set(0, 0.25, 0.75);
  spine.add(neckPivot);

  const neckGeo = new THREE.CylinderGeometry(0.24, 0.42, 1.25, 10);
  const neckMesh = new THREE.Mesh(neckGeo, coatMat);
  neckMesh.position.set(0, 0.45, 0.35);
  neckMesh.rotation.x = -0.65;
  neckMesh.castShadow = true;
  neckPivot.add(neckMesh);

  // Mane along the neck crest
  const maneGeo = new THREE.BoxGeometry(0.08, 1.1, 0.22);
  const maneMesh = new THREE.Mesh(maneGeo, maneMat);
  maneMesh.position.set(0, 0.52, 0.22);
  maneMesh.rotation.x = -0.65;
  neckPivot.add(maneMesh);

  // ── Head Pivot ────────────────────────────────────────────────────────────
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.9, 0.65);
  neckPivot.add(headPivot);

  // Sculpted Equine Muzzle & Face
  const headGeo = new THREE.ConeGeometry(0.26, 0.85, 8);
  const headMesh = new THREE.Mesh(headGeo, coatMat);
  headMesh.rotation.x = -1.25;
  headMesh.position.set(0, 0.15, 0.32);
  headMesh.castShadow = true;
  headPivot.add(headMesh);

  // Conditional facial markings based on data.markings.face
  const faceMark = data.markings ? data.markings.face : null;
  if (faceMark) {
    const markGeo = new THREE.BoxGeometry(0.07, 0.65, 0.05);
    const markMesh = new THREE.Mesh(markGeo, whiteMat);
    switch (faceMark) {
      case 'blaze':
        markMesh.position.set(0, 0.26, 0.32);
        markMesh.rotation.x = -1.25;
        break;
      case 'star':
        markMesh.scale.set(0.6, 0.5, 1);
        markMesh.position.set(0, 0.3, 0.4);
        markMesh.rotation.x = -1.2;
        break;
      case 'snip':
        markMesh.scale.set(0.5, 0.3, 1);
        markMesh.position.set(0, 0.1, 0.42);
        markMesh.rotation.x = -1.2;
        break;
      case 'bald':
        markMesh.scale.set(1.5, 1.2, 1);
        markMesh.position.set(0, 0.25, 0.3);
        markMesh.rotation.x = -1.25;
        break;
      case 'stripe':
        markMesh.scale.set(0.5, 1.0, 1);
        markMesh.position.set(0, 0.26, 0.32);
        markMesh.rotation.x = -1.25;
        break;
      case 'star-stripe': {
        const starMark = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.65, 0.05), whiteMat);
        starMark.scale.set(0.6, 0.5, 1);
        starMark.position.set(0, 0.3, 0.4);
        starMark.rotation.x = -1.2;
        headPivot.add(starMark);
        markMesh.scale.set(0.5, 1.0, 1);
        markMesh.position.set(0, 0.26, 0.32);
        markMesh.rotation.x = -1.25;
        break;
      }
      default:
        markMesh.position.set(0, 0.26, 0.32);
        markMesh.rotation.x = -1.25;
    }
    headPivot.add(markMesh);
  }

  // Ears (exposed for twitch animation)
  const earGeo = new THREE.ConeGeometry(0.065, 0.24, 6);
  const earL = new THREE.Mesh(earGeo, coatMat);
  earL.position.set(0.12, 0.35, 0.05);
  earL.rotation.set(-0.2, 0, 0.15);
  const earR = new THREE.Mesh(earGeo, coatMat);
  earR.position.set(-0.12, 0.35, 0.05);
  earR.rotation.set(-0.2, 0, -0.15);
  headPivot.add(earL, earR);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.045, 6, 6);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(0.18, 0.2, 0.15);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(-0.18, 0.2, 0.15);
  headPivot.add(eyeL, eyeR);

  // Bridle straps & noseband
  const noseBand = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 4, 12), bridleMat);
  noseBand.position.set(0, 0.08, 0.45);
  noseBand.rotation.x = Math.PI / 2 + 0.3;
  headPivot.add(noseBand);

  // Gear: Blinkers
  if (data.gear && data.gear.blinkers) {
    const blinkerGeo = new THREE.TorusGeometry(0.15, 0.03, 8, 16);
    const blinkerMat = new THREE.MeshStandardMaterial({ color: data.gear.blinkerColor || 0xffffff });
    const blinker = new THREE.Mesh(blinkerGeo, blinkerMat);
    blinker.rotation.x = Math.PI / 2;
    blinker.position.set(0, 0.2, 0.45);
    headPivot.add(blinker);
  }

  // Gear: Shadow Roll (sheepskin roll on noseband)
  if (data.gear && data.gear.shadowRoll) {
    const rollGeo = new THREE.TorusGeometry(0.12, 0.02, 6, 12);
    const roll = new THREE.Mesh(rollGeo, whiteMat);
    roll.rotation.x = Math.PI / 2;
    roll.position.set(0, 0.1, 0.45);
    headPivot.add(roll);
  }

  // ── 3. Tail (billows in the wind) ─────────────────────────────────────────
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.2, -0.85);
  spine.add(tailPivot);

  const tailSeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.7, 8), maneMat);
  tailSeg1.position.set(0, -0.3, -0.15);
  tailSeg1.rotation.x = 0.4;
  tailPivot.add(tailSeg1);

  const tailSeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.8, 8), maneMat);
  tailSeg2.position.set(0, -0.65, -0.35);
  tailSeg2.rotation.x = 0.55;
  tailPivot.add(tailSeg2);

  // ── 4. Four Articulated Legs ───────────────────────────────────────────────
  function createFrontLeg(isLeft) {
    const hipX = isLeft ? 0.38 : -0.38;
    const legRoot = new THREE.Group();
    legRoot.position.set(hipX, -0.2, 0.65);
    spine.add(legRoot);

    // Upper Leg (Shoulder / Humerus)
    const upperGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.72, 8);
    const upperMesh = new THREE.Mesh(upperGeo, coatMat);
    upperMesh.position.y = -0.36;
    upperMesh.castShadow = true;
    legRoot.add(upperMesh);

    // Knee Pivot (Carpus)
    const kneePivot = new THREE.Group();
    kneePivot.position.y = -0.72;
    legRoot.add(kneePivot);

    const kneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), coatMat);
    kneePivot.add(kneeJoint);

    // Lower Leg (Cannon bone & fetlock)
    const lowerGeo = new THREE.CylinderGeometry(0.08, 0.065, 0.75, 8);
    const lowerMesh = new THREE.Mesh(lowerGeo, coatMat);
    lowerMesh.position.y = -0.38;
    lowerMesh.castShadow = true;
    kneePivot.add(lowerMesh);

    // Hoof
    const hoofGeo = new THREE.CylinderGeometry(0.07, 0.1, 0.18, 8);
    const hoofMesh = new THREE.Mesh(hoofGeo, hoofMat);
    hoofMesh.position.y = -0.78;
    hoofMesh.castShadow = true;
    kneePivot.add(hoofMesh);

    return { root: legRoot, knee: kneePivot };
  }

  function createRearLeg(isLeft) {
    const hipX = isLeft ? 0.42 : -0.42;
    const legRoot = new THREE.Group();
    legRoot.position.set(hipX, -0.1, -0.7);
    spine.add(legRoot);

    // Upper Leg (Muscular Thigh / Haunch)
    const upperGeo = new THREE.CylinderGeometry(0.2, 0.12, 0.75, 8);
    const upperMesh = new THREE.Mesh(upperGeo, coatMat);
    upperMesh.position.y = -0.38;
    upperMesh.castShadow = true;
    legRoot.add(upperMesh);

    // Hock Pivot
    const hockPivot = new THREE.Group();
    hockPivot.position.y = -0.75;
    legRoot.add(hockPivot);

    const hockJoint = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), coatMat);
    hockPivot.add(hockJoint);

    // Lower Leg (Gaskin & Cannon bone)
    const lowerGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.8, 8);
    const lowerMesh = new THREE.Mesh(lowerGeo, coatMat);
    lowerMesh.position.y = -0.4;
    lowerMesh.castShadow = true;
    hockPivot.add(lowerMesh);

    // Hoof
    const hoofGeo2 = new THREE.CylinderGeometry(0.07, 0.1, 0.18, 8);
    const hoofMesh2 = new THREE.Mesh(hoofGeo2, hoofMat);
    hoofMesh2.position.y = -0.82;
    hoofMesh2.castShadow = true;
    hockPivot.add(hoofMesh2);

    return { root: legRoot, hock: hockPivot };
  }

  const frontLeft  = createFrontLeg(true);
  const frontRight = createFrontLeg(false);
  const rearLeft   = createRearLeg(true);
  const rearRight  = createRearLeg(false);

  // legMap defined AFTER legs are created
  const legMap = { frontLeft, frontRight, rearLeft, rearRight };

  // ── 5. Racing Tack (Saddle cloth, saddle, reins) ──────────────────────────
  const saddlePadGeo = new THREE.BoxGeometry(0.85, 0.08, 0.95);
  const saddlePad = new THREE.Mesh(saddlePadGeo, silkMat);
  saddlePad.position.set(0, 0.46, 0.05);
  saddlePad.castShadow = true;
  spine.add(saddlePad);

  const saddleGeo = new THREE.BoxGeometry(0.7, 0.14, 0.65);
  const saddleMesh = new THREE.Mesh(saddleGeo, leatherMat);
  saddleMesh.position.set(0, 0.52, 0.02);
  saddleMesh.castShadow = true;
  spine.add(saddleMesh);

  // ── 6. Complete 3D Jockey ─────────────────────────────────────────────────
  const jockeyGroup = new THREE.Group();
  jockeyGroup.position.set(0, 0.58, 0.15);
  spine.add(jockeyGroup);

  // Jockey Torso in colorful silk jersey
  const jTorsoGeo = new THREE.BoxGeometry(0.42, 0.48, 0.65);
  const jTorsoMesh = new THREE.Mesh(jTorsoGeo, silkMat);
  jTorsoMesh.position.set(0, 0.28, 0.05);
  jTorsoMesh.rotation.x = 0.55;
  jTorsoMesh.castShadow = true;
  jockeyGroup.add(jTorsoMesh);

  // Jockey Breeches (Legs gripping sides)
  const jLegGeo = new THREE.BoxGeometry(0.16, 0.5, 0.25);
  const jLegL = new THREE.Mesh(jLegGeo, whiteMat);
  jLegL.position.set(0.32, 0.08, 0.0);
  jLegL.rotation.x = -0.3;
  const jLegR = new THREE.Mesh(jLegGeo, whiteMat);
  jLegR.position.set(-0.32, 0.08, 0.0);
  jLegR.rotation.x = -0.3;
  jockeyGroup.add(jLegL, jLegR);

  // Jockey Riding Boots
  const bootGeo = new THREE.BoxGeometry(0.15, 0.25, 0.32);
  const bootL = new THREE.Mesh(bootGeo, hoofMat);
  bootL.position.set(0.33, -0.16, -0.12);
  const bootR = new THREE.Mesh(bootGeo, hoofMat);
  bootR.position.set(-0.33, -0.16, -0.12);
  jockeyGroup.add(bootL, bootR);

  // Jockey Helmet & Head
  const jHeadGeo = new THREE.SphereGeometry(0.18, 10, 8);
  const jHeadMesh = new THREE.Mesh(jHeadGeo, silkMat);
  jHeadMesh.position.set(0, 0.55, 0.38);
  jHeadMesh.castShadow = true;
  jockeyGroup.add(jHeadMesh);

  // Goggles band
  const gogglesGeo = new THREE.BoxGeometry(0.26, 0.07, 0.15);
  const gogglesMesh = new THREE.Mesh(gogglesGeo, bridleMat);
  gogglesMesh.position.set(0, 0.56, 0.48);
  jockeyGroup.add(gogglesMesh);

  // Jockey Arms holding reins
  const jArmGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.45);
  const jArmL = new THREE.Mesh(jArmGeo, silkMat);
  jArmL.position.set(0.24, 0.32, 0.35);
  jArmL.rotation.set(0.9, 0, -0.2);
  const jArmR = new THREE.Mesh(jArmGeo, silkMat);
  jArmR.position.set(-0.24, 0.32, 0.35);
  jArmR.rotation.set(0.9, 0, 0.2);
  jockeyGroup.add(jArmL, jArmR);

  // Jockey Riding Crop
  const cropGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6);
  const cropMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
  const crop = new THREE.Mesh(cropGeo, cropMat);
  crop.rotation.z = Math.PI / 2;
  crop.position.set(-0.3, 0.1, 0.35);
  jockeyGroup.add(crop);

  // ── Socks / Stockings ─────────────────────────────────────────────────────
  if (data.markings && data.markings.socks) {
    const sockKeys = ['frontLeft', 'frontRight', 'rearLeft', 'rearRight'];
    data.markings.socks.forEach((hasSock, idx) => {
      if (!hasSock) return;
      const leg = legMap[sockKeys[idx]];
      if (!leg) return;
      const cuffGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.13, 8);
      const cuff = new THREE.Mesh(cuffGeo, whiteMat);
      // For rear legs use hock pivot, for front use knee pivot
      const pivot = leg.knee || leg.hock;
      cuff.position.set(0, -0.65, 0);
      pivot.add(cuff);
    });
  }

  // ── Wraps (polo bandages) ─────────────────────────────────────────────────
  if (data.gear && data.gear.wraps && data.gear.wraps !== 'none') {
    const wrapColor = data.gear.wrapColor || 0xffffff;
    const wrapMat = new THREE.MeshStandardMaterial({ color: wrapColor });
    const wrapGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.2, 8);
    const targetLegs = data.gear.wraps === 'all'
      ? ['frontLeft', 'frontRight', 'rearLeft', 'rearRight']
      : data.gear.wraps === 'front'
        ? ['frontLeft', 'frontRight']
        : [];
    targetLegs.forEach(name => {
      const leg = legMap[name];
      if (!leg) return;
      const wrap = new THREE.Mesh(wrapGeo, wrapMat);
      wrap.position.set(0, -0.45, 0);
      const pivot = leg.knee || leg.hock;
      pivot.add(wrap);
    });
  }

  // ── 7. Overhead Number Badge ───────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = data.badgeHex;
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 74px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.id.toString(), 64, 66);

  const badgeTex = new THREE.CanvasTexture(canvas);
  const badgeSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTex, depthTest: true }));
  badgeSprite.position.set(0, HORSE_MODEL_HEIGHT + 0.6, 0);
  badgeSprite.scale.set(0.82, 0.82, 0.82);
  root.add(badgeSprite);

  // ── Return full rig ────────────────────────────────────────────────────────
  return {
    root,
    container,
    spine,
    neck: neckPivot,
    head: headPivot,
    tail: tailPivot,
    frontLeft,
    frontRight,
    rearLeft,
    rearRight,
    jockey: jockeyGroup,
    earL,
    earR,
  };
}


/* ==========================================================================
   MAIN SIMULATION CONTROLLER
   ========================================================================== */
class HorseRacingSimulation {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.sound = new SoundEngine();
    this.isAdmin = document.documentElement.dataset.role === 'admin';

    this.state = 'READY'; // 'READY', 'COUNTDOWN', 'RACING', 'PAUSED', 'FINISHED'
    this.raceStartTime = 0;
    this.pausedAt = 0;
    this.countdownTimer = null;
    this.eventSource = null;
    this.lastStandingsUpdateAt = 0;
    this.serverOffsetMs = 0;
    this.snapshotPending = false;
    this.timeScale = 1.0;
    this.cameraMode = 'follow';
    this.focusedHorseId = 1;
    this.forcedWinnerId = getPredeterminedWinnerId(PREDETERMINED_WINNER);

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.clock = new THREE.Clock();

    this.horses = [];
    this.dust = null;
    this.gateDoors = [];
    this.finishDistance = TRACK.straightLength - 12;

    this.initThree();
    this.buildTrackEnvironment();
    this.dust = new DustParticles(this.scene);
    this.initUI();
    this.loadHorseAnimation()
      .then(horseGltf => {
        this.horseModelSource = horseGltf.scene;
        const clipSource = horseGltf.animations[0];

        if (!clipSource) {
          throw new Error('No horse animation clips were available from the GLB files.');
        }

        this.runningClip = clipSource.clone();
        this.runningClip.name = 'Running';
        let clipStartTime = Infinity;
        this.runningClip.tracks.forEach(track => {
          for (const keyTime of track.times) {
            clipStartTime = Math.min(clipStartTime, keyTime);
          }
        });
        if (!Number.isFinite(clipStartTime)) {
          throw new Error('The horse animation clip has no keyframes.');
        }
        this.runningClip.tracks.forEach(track => {
          for (let i = 0; i < track.times.length; i++) {
            track.times[i] -= clipStartTime;
          }
        });
        this.runningClip.resetDuration();

        const rootPositionTrack = this.runningClip.tracks.find(track =>
          track.name.includes('Bip01_00') && track.name.endsWith('.position')
        );
        if (rootPositionTrack) {
          const rootX = rootPositionTrack.values[0];
          const rootZ = rootPositionTrack.values[2];
          for (let i = 0; i < rootPositionTrack.values.length; i += 3) {
            rootPositionTrack.values[i] = rootX;
            rootPositionTrack.values[i + 2] = rootZ;
          }
        }
        this.createThoroughbredRoster();
        this.connectLiveRace();
        this.animate();
      })
      .catch(error => {
        console.error('Failed to load horse model and animation files.', error);
        const statusText = document.getElementById('loading-status');
        if (statusText) statusText.textContent = `Unable to load horse assets: ${error.message}`;
      });
  }

  /* --------------------------------------------------------------------------
     THREE.JS SETUP
     -------------------------------------------------------------------------- */
  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0xd6e8f5, 0.0022);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 1600);
    this.camera.position.set(TRACK.turnRadius + 22, 18, -TRACK.straightLength / 2 - 20);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 350;
    this.controls.enabled = false;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x3d5a3a, 0.8);
    hemiLight.position.set(0, 100, 0);
    this.scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xfffaee, 1.4);
    sun.position.set(130, 160, 90);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 450;
    const sRange = 160;
    sun.shadow.camera.left = -sRange;
    sun.shadow.camera.right = sRange;
    sun.shadow.camera.top = sRange;
    sun.shadow.camera.bottom = -sRange;
    this.scene.add(sun);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  loadHorseAnimation() {
    return new GLTFLoader().loadAsync('./horse_run_cycle_on_place.glb').then(gltf => {
      if (!gltf.scene) {
        throw new Error('horse_run_cycle_on_place.glb did not provide a valid scene graph.');
      }
      if (!gltf.animations.length) {
        throw new Error('horse_run_cycle_on_place.glb contains no animation clips.');
      }
      return gltf;
    });
  }

  /* --------------------------------------------------------------------------
     OVAL TRACK MATHEMATICS
     -------------------------------------------------------------------------- */
  getTrackTransform(distance, laneOffset = 0) {
    const L = TRACK.straightLength;
    const R = TRACK.turnRadius;
    const P = TRACK_PERIMETER;

    const s = ((distance % P) + P) % P;
    const effR = R + laneOffset;

    const pos = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    let isTurning = false;

    if (s <= L) {
      pos.x = effR;
      pos.y = 0;
      pos.z = -L / 2 + s;
      tangent.set(0, 0, 1);
    } else if (s <= L + Math.PI * R) {
      isTurning = true;
      const arc = s - L;
      const theta = arc / R;
      pos.x = effR * Math.cos(theta);
      pos.y = 0;
      pos.z = L / 2 + effR * Math.sin(theta);
      tangent.set(-Math.sin(theta), 0, Math.cos(theta));
    } else if (s <= 2 * L + Math.PI * R) {
      const straightDist = s - (L + Math.PI * R);
      pos.x = -effR;
      pos.y = 0;
      pos.z = L / 2 - straightDist;
      tangent.set(0, 0, -1);
    } else {
      isTurning = true;
      const arc = s - (2 * L + Math.PI * R);
      const theta = Math.PI + (arc / R);
      pos.x = effR * Math.cos(theta);
      pos.y = 0;
      pos.z = -L / 2 + effR * Math.sin(theta);
      tangent.set(-Math.sin(theta), 0, Math.cos(theta));
    }

    const heading = Math.atan2(tangent.x, tangent.z);
    return { pos, tangent, heading, isTurning };
  }

  /* --------------------------------------------------------------------------
     ENVIRONMENT BUILDER
     -------------------------------------------------------------------------- */
  buildTrackEnvironment() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 900),
      new THREE.MeshLambertMaterial({ color: 0x275924 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Oval Dirt Ribbon
    const segments = 260;
    const halfW = TRACK.width / 2;
    const geom = new THREE.BufferGeometry();
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
      const dist = (i / segments) * TRACK_PERIMETER;
      const innerT = this.getTrackTransform(dist, -halfW);
      const outerT = this.getTrackTransform(dist, halfW);

      positions.push(innerT.pos.x, 0.02, innerT.pos.z);
      positions.push(outerT.pos.x, 0.02, outerT.pos.z);

      const v = (i / segments) * 40;
      uvs.push(0, v, 1, v);

      if (i < segments) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x9c7645,
      roughness: 0.92,
      metalness: 0.05,
    });
    const trackMesh = new THREE.Mesh(geom, trackMat);
    trackMesh.receiveShadow = true;
    this.scene.add(trackMesh);

    // Infield Turf Center
    const innerGrass = new THREE.Mesh(
      new THREE.CylinderGeometry(TRACK.turnRadius - halfW - 0.5, TRACK.turnRadius - halfW - 0.5, 0.1, 48),
      new THREE.MeshLambertMaterial({ color: 0x1d471d })
    );
    innerGrass.position.set(0, 0, 0);
    innerGrass.receiveShadow = true;
    this.scene.add(innerGrass);

    this.buildSafetyRails();
    this.buildFinishLine();
    this.buildStartingGate();
    this.buildGrandstand();
  }

  buildSafetyRails() {
    const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 8);
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });

    [-TRACK.width / 2, TRACK.width / 2].forEach(offset => {
      const postsCount = 100;
      const railCurvePoints = [];

      for (let i = 0; i <= postsCount; i++) {
        const dist = (i / postsCount) * TRACK_PERIMETER;
        const transform = this.getTrackTransform(dist, offset);

        const post = new THREE.Mesh(postGeo, whiteMat);
        post.position.set(transform.pos.x, 0.7, transform.pos.z);
        post.castShadow = true;
        this.scene.add(post);

        railCurvePoints.push(new THREE.Vector3(transform.pos.x, 1.1, transform.pos.z));
      }

      const curve = new THREE.CatmullRomCurve3(railCurvePoints, true);
      const tubeGeo = new THREE.TubeGeometry(curve, 180, 0.08, 6, true);
      const tubeMesh = new THREE.Mesh(tubeGeo, whiteMat);
      tubeMesh.castShadow = true;
      this.scene.add(tubeMesh);
    });
  }

  buildFinishLine() {
    const finishDist = this.finishDistance;
    const centerT = this.getTrackTransform(finishDist, 0);
    const leftT = this.getTrackTransform(finishDist, -TRACK.width / 2);
    const rightT = this.getTrackTransform(finishDist, TRACK.width / 2);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 32);
    ctx.fillStyle = '#000000';
    for (let x = 0; x < 128; x += 16) {
      for (let y = 0; y < 32; y += 16) {
        if ((x / 16 + y / 16) % 2 === 0) ctx.fillRect(x, y, 16, 16);
      }
    }
    const checkTex = new THREE.CanvasTexture(canvas);
    checkTex.wrapS = THREE.RepeatWrapping;
    checkTex.repeat.set(5, 1);

    const finishStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(TRACK.width, 2.5),
      new THREE.MeshBasicMaterial({ map: checkTex })
    );
    finishStrip.rotation.x = -Math.PI / 2;
    finishStrip.rotation.z = Math.PI / 2;
    finishStrip.position.set(centerT.pos.x, 0.04, centerT.pos.z);
    this.scene.add(finishStrip);

    const gantry = new THREE.Group();
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 10, 12), pillarMat);
    postL.position.set(leftT.pos.x, 5, leftT.pos.z);

    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 10, 12), pillarMat);
    postR.position.set(rightT.pos.x, 5, rightT.pos.z);

    const beam = new THREE.Mesh(new THREE.BoxGeometry(TRACK.width + 2, 1.2, 0.8), pillarMat);
    beam.position.set(centerT.pos.x, 9.5, centerT.pos.z);
    beam.rotation.y = centerT.heading + Math.PI / 2;

    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sCtx = signCanvas.getContext('2d');
    sCtx.fillStyle = '#0f172a';
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.strokeStyle = '#f59e0b';
    sCtx.lineWidth = 8;
    sCtx.strokeRect(4, 4, 504, 120);
    sCtx.fillStyle = '#f59e0b';
    sCtx.font = 'bold 54px Arial';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText('★ FINISH LINE ★', 256, 64);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 2.5),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signMesh.position.set(centerT.pos.x, 9.5, centerT.pos.z - 0.5);
    signMesh.rotation.y = centerT.heading + Math.PI;

    gantry.add(postL, postR, beam, signMesh);
    this.scene.add(gantry);
  }

  buildStartingGate() {
    const gateGroup = new THREE.Group();
    const startDist = 4;
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.35 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25 });

    this.gateDoors = [];

    for (let i = 0; i < TRACK.lanes; i++) {
      const laneOffset = (i - (TRACK.lanes - 1) / 2) * TRACK.laneSpacing;
      const t = this.getTrackTransform(startDist, laneOffset);

      const stall = new THREE.Mesh(new THREE.BoxGeometry(TRACK.laneSpacing * 0.9, 3.5, 3.8), gateMat);
      stall.position.set(t.pos.x, 1.75, t.pos.z);
      stall.rotation.y = t.heading;
      stall.castShadow = true;
      gateGroup.add(stall);

      const doorWidth = (TRACK.laneSpacing * 0.9) / 2 - 0.05;

      const leftPivot = new THREE.Group();
      leftPivot.position.set(t.pos.x - (doorWidth) * Math.cos(t.heading), 1.6, t.pos.z + 1.9 * Math.cos(t.heading));
      leftPivot.rotation.y = t.heading;
      const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, 2.6, 0.1), doorMat);
      leftDoor.position.set(doorWidth / 2, 0, 0);
      leftPivot.add(leftDoor);

      const rightPivot = new THREE.Group();
      rightPivot.position.set(t.pos.x + (doorWidth) * Math.cos(t.heading), 1.6, t.pos.z + 1.9 * Math.cos(t.heading));
      rightPivot.rotation.y = t.heading;
      const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, 2.6, 0.1), doorMat);
      rightDoor.position.set(-doorWidth / 2, 0, 0);
      rightPivot.add(rightDoor);

      gateGroup.add(leftPivot, rightPivot);

      this.gateDoors.push({
        left: leftPivot,
        right: rightPivot,
        baseHeading: t.heading,
        isOpen: false
      });
    }

    this.scene.add(gateGroup);
  }

  setGateDoorsOpen(open) {
    this.gateDoors.forEach(d => {
      d.isOpen = open;
      const targetL = open ? -Math.PI / 2 : 0;
      const targetR = open ? Math.PI / 2 : 0;
      d.left.rotation.y = d.baseHeading + targetL;
      d.right.rotation.y = d.baseHeading + targetR;
    });
  }

  buildGrandstand() {
    const standGroup = new THREE.Group();
    const standMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

    const standX = TRACK.turnRadius + TRACK.width / 2 + 18;
    const standZ = 0;

    for (let s = 0; s < 8; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2 * (s + 1), 90), seatMat);
      step.position.set(standX + s * 2.8, (1.2 * (s + 1)) / 2, standZ);
      step.castShadow = true;
      step.receiveShadow = true;
      standGroup.add(step);
    }

    const roof = new THREE.Mesh(new THREE.BoxGeometry(26, 0.8, 96), roofMat);
    roof.position.set(standX + 8, 16, standZ);
    roof.rotation.z = 0.15;
    roof.castShadow = true;
    standGroup.add(roof);

    this.scene.add(standGroup);
  }

  /* --------------------------------------------------------------------------
     INITIALIZE PRO THOROUGHBRED HORSES
     -------------------------------------------------------------------------- */
  createThoroughbredRoster() {
    const statusText = document.getElementById('loading-status');
    const loadingScreen = document.getElementById('loading-screen');

    statusText.textContent = 'Rigging 3D Thoroughbred racehorses & jockeys...';

    HORSES_DATA.forEach((data, index) => {
      const horseRig = buildArticulatedThoroughbred(data);
      const animatedHorse = cloneSkeleton(this.horseModelSource);
      animatedHorse.getObjectByName('pDiscShape1_2_0')?.removeFromParent();
      const horseModel = new THREE.Group();
      horseModel.add(animatedHorse);
      horseModel.rotation.y = -Math.PI / 2;
      const sourceBounds = new THREE.Box3().setFromObject(horseModel);
      const sourceHeight = sourceBounds.max.y - sourceBounds.min.y;
      if (sourceHeight <= 0) {
        throw new Error('horse_run_cycle_on_place.glb has no measurable horse height.');
      }
      horseModel.scale.setScalar(HORSE_MODEL_HEIGHT / sourceHeight);
      horseModel.updateMatrixWorld(true);
      const horseBounds = new THREE.Box3().setFromObject(horseModel);
      const horseCenter = horseBounds.getCenter(new THREE.Vector3());
      const horseHeight = horseBounds.max.y - horseBounds.min.y;
      horseModel.position.set(-horseCenter.x, -horseBounds.min.y, -horseCenter.z);
      animatedHorse.traverse(object => {
        if (!object.isMesh) return;
        object.castShadow = true;
        object.receiveShadow = true;
        object.material = Array.isArray(object.material)
          ? object.material.map(material => material.clone())
          : object.material.clone();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => material.color?.setHex(data.coatColor));
      });
      horseRig.root.add(horseModel);
      horseRig.root.attach(horseRig.jockey);
      horseRig.jockey.position.y = horseModel.position.y + horseHeight * 0.68;
      horseRig.container.visible = false;
      this.scene.add(horseRig.root);

      const mixer = new THREE.AnimationMixer(animatedHorse);
      const runningAction = mixer.clipAction(this.runningClip);
      runningAction.setLoop(THREE.LoopRepeat, Infinity);
      runningAction.play();
      runningAction.paused = true;

      const laneOffset = (index - (TRACK.lanes - 1) / 2) * TRACK.laneSpacing;
      const startDist = 4;

      const horse = {
        data: data,
        rig: horseRig,
        animatedHorse,
        mixer,
        runningAction,
        jockeyBaseY: horseRig.jockey.position.y,
        laneOffset: laneOffset,
        baseLaneOffset: laneOffset,
        targetLaneOffset: laneOffset,
        distance: startDist,
        speed: 0,
        targetSpeed: 0,
        currentStamina: data.stamina,
        state: 'STALL_IDLE',
        idleTimer: Math.random() * Math.PI * 2,
        stridePhase: (index * 0.8), // Stagger stride phases so they don't look robotic!
        surgePhase: Math.random() * Math.PI * 2,
        surgeFreq: 0.35 + Math.random() * 0.3,
        tactics: {
          midSurge: (Math.random() - 0.4) * 2.8,
          lateKick: (Math.random() - 0.3) * 3.5,
        },
        finished: false,
        finishTime: 0,
        rank: index + 1
      };

      this.horses.push(horse);
      this.updateHorseTransform(horse);
    });

    loadingScreen.classList.add('fade-out');
    setTimeout(() => loadingScreen.remove(), 600);

    this.updateLeaderboardUI();
  }

  /* --------------------------------------------------------------------------
     ANIMATION & ROTARY GALLOP INVERSE KINEMATICS
     -------------------------------------------------------------------------- */
  updateHorseTransform(horse) {
    const t = this.getTrackTransform(horse.distance, horse.laneOffset);
    const rig = horse.rig;

    // 1. Root group: Pure world translation & pure yaw heading (Never pitches or rolls over!)
    rig.root.position.set(t.pos.x, 0, t.pos.z);
    rig.root.rotation.set(0, t.heading, 0);

    // 2. State-driven body & leg kinematics
    if (horse.state === 'STALL_IDLE' || horse.state === 'COOLING_DOWN') {
      // Resting Four-Legged Standing Pose
      rig.spine.position.y = 1.55 + Math.sin(horse.idleTimer * 2.0) * 0.015;
      rig.spine.rotation.x = 0;
      rig.spine.rotation.z = 0;

      // Straight legs resting on ground
      rig.frontLeft.root.rotation.x = 0.05;
      rig.frontLeft.knee.rotation.x = 0;
      rig.frontRight.root.rotation.x = -0.05;
      rig.frontRight.knee.rotation.x = 0;

      rig.rearLeft.root.rotation.x = -0.08;
      rig.rearLeft.hock.rotation.x = 0;
      rig.rearRight.root.rotation.x = 0.08;
      rig.rearRight.hock.rotation.x = 0;

      // Gentle head bob and tail flick
      rig.neck.rotation.x = Math.sin(horse.idleTimer * 1.5) * 0.03;
      rig.tail.rotation.x = 0.3 + Math.sin(horse.idleTimer * 1.8) * 0.05;
      rig.tail.rotation.z = Math.sin(horse.idleTimer * 2.2) * 0.06;
      return;
    }

    // ACTIVE RUNNING STATES: 'GATE_BREAK', 'ACCELERATING', 'GALLOP', 'FINAL_SPRINT', 'DECELERATING'
    const phase = horse.stridePhase;

    // A. Rotary 4-Beat Stride Phases
    const phaseHL = phase;                 // Hind Left
    const phaseHR = phase + 0.35;          // Hind Right
    const phaseFL = phase + 1.25;          // Fore Left
    const phaseFR = phase + 1.65;          // Fore Right

    // B. Spine Bounce & Dynamic Rotary Pitch
    const bounce = Math.sin(phase * 2) * 0.10;
    const pitch = Math.cos(phase) * 0.08 + ((horse.state === 'FINAL_SPRINT') ? -0.06 : -0.02);
    rig.spine.position.y = 1.55 + bounce;
    rig.spine.rotation.x = pitch;

    // Inward Bank in Turns (Safe 3 degrees on local Z)
    const targetBank = t.isTurning ? -0.05 : 0.0;
    rig.container.rotation.z += (targetBank - rig.container.rotation.z) * 0.1;
    horse.animatedHorse.rotation.z += (targetBank - horse.animatedHorse.rotation.z) * 0.1;

    // C. Forelegs Kinematics (Bending Knees)
    // Left Foreleg
    const flSwing = Math.sin(phaseFL);
    rig.frontLeft.root.rotation.x = flSwing * 0.65;
    // Knee bends backwards during recovery swing forward!
    rig.frontLeft.knee.rotation.x = -Math.max(0, -flSwing * 1.25);

    // Right Foreleg
    const frSwing = Math.sin(phaseFR);
    rig.frontRight.root.rotation.x = frSwing * 0.65;
    rig.frontRight.knee.rotation.x = -Math.max(0, -frSwing * 1.25);

    // D. Hindlegs Kinematics (Bending Hocks)
    // Left Hindleg
    const hlSwing = Math.sin(phaseHL);
    rig.rearLeft.root.rotation.x = hlSwing * 0.75;
    // Hock bends forward during ground clearance!
    rig.rearLeft.hock.rotation.x = Math.max(0, hlSwing * 1.1);

    // Right Hindleg
    const hrSwing = Math.sin(phaseHR);
    rig.rearRight.root.rotation.x = hrSwing * 0.75;
    rig.rearRight.hock.rotation.x = Math.max(0, hrSwing * 1.1);

    // E. Dynamic Arched Neck Bobbing (Counter-balance to foreleg strike)
    rig.neck.rotation.x = Math.cos(phaseFL) * 0.12 - 0.05;

    // F. Aerodynamic Tail Billow (Streams back with speed)
    const speedRatio = Math.min(1.0, horse.speed / 44);
    rig.tail.rotation.x = -0.55 - speedRatio * 0.55;
    rig.tail.rotation.y = Math.sin(phase) * 0.14;

    // G. Jockey Riding Drive
    if (horse.state === 'FINAL_SPRINT') {
      rig.jockey.position.y = horse.jockeyBaseY + Math.sin(phase) * 0.04;
      rig.jockey.rotation.x = -0.15;
    } else {
      rig.jockey.position.y = horse.jockeyBaseY;
      rig.jockey.rotation.x = 0;
    }
  }

  /* --------------------------------------------------------------------------
     CAMERA SYSTEM
     -------------------------------------------------------------------------- */
  updateCamera() {
    if (this.cameraMode === 'orbit') {
      this.controls.update();
      return;
    }

    const focusHorse = this.horses.find(h => h.data.id === this.focusedHorseId) || this.horses[0];
    if (!focusHorse) return;

    const t = this.getTrackTransform(focusHorse.distance, focusHorse.laneOffset);

    if (this.cameraMode === 'follow') {
      const backOffset = t.tangent.clone().multiplyScalar(-22);
      const heightOffset = new THREE.Vector3(0, HORSE_MODEL_HEIGHT * 1.55, 0);
      const lateralOffset = new THREE.Vector3(-t.tangent.z, 0, t.tangent.x).multiplyScalar(2.0);

      const targetPos = t.pos.clone().add(backOffset).add(heightOffset).add(lateralOffset);
      this.camera.position.lerp(targetPos, 0.08);

      const lookTarget = t.pos.clone().add(t.tangent.clone().multiplyScalar(10))
        .add(new THREE.Vector3(0, HORSE_MODEL_HEIGHT * 0.6, 0));
      this.camera.lookAt(lookTarget);
    }
    else if (this.cameraMode === 'side') {
      const railPos = new THREE.Vector3(TRACK.turnRadius + 18, HORSE_MODEL_HEIGHT * 1.4, 10);
      this.camera.position.lerp(railPos, 0.04);
      this.camera.lookAt(focusHorse.rig.root.position.clone()
        .add(new THREE.Vector3(0, HORSE_MODEL_HEIGHT * 0.55, 0)));
    }
    else if (this.cameraMode === 'finish') {
      const finishPos = new THREE.Vector3(TRACK.turnRadius + 9, HORSE_MODEL_HEIGHT * 1.4, this.finishDistance + 14);
      this.camera.position.lerp(finishPos, 0.06);

      const oncomingTarget = new THREE.Vector3(TRACK.turnRadius, HORSE_MODEL_HEIGHT * 0.55, this.finishDistance - 25);
      this.camera.lookAt(oncomingTarget);
    }
    else if (this.cameraMode === 'drone') {
      const dronePos = new THREE.Vector3(0, 130, 0);
      this.camera.position.lerp(dronePos, 0.05);
      this.camera.lookAt(focusHorse.rig.root.position);
    }
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    document.querySelectorAll('.nav-btn[data-mode]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'orbit') {
      this.controls.enabled = true;
      const focus = this.horses.find(h => h.data.id === this.focusedHorseId) || this.horses[0];
      if (focus) this.controls.target.copy(focus.rig.root.position);
    } else {
      this.controls.enabled = false;
    }
  }

  setFocusedHorse(id) {
    this.focusedHorseId = id;
    document.querySelectorAll('.horse-row').forEach(row => {
      row.classList.toggle('active', parseInt(row.dataset.id, 10) === id);
    });
  }

  /* --------------------------------------------------------------------------
     RACE SIMULATION & STATE MACHINE
     -------------------------------------------------------------------------- */
  startRace() {
    if (!this.isAdmin) return;
    if (this.state === 'RACING' || this.state === 'COUNTDOWN') return;
    this.requestControl(this.state === 'PAUSED' ? 'resume' : 'start');
  }

  pauseRace() {
    if (!this.isAdmin) return;
    if (this.state !== 'RACING' && this.state !== 'PAUSED') return;
    this.requestControl(this.state === 'PAUSED' ? 'resume' : 'pause');
  }

  resetRace() {
    if (!this.isAdmin) return;
    this.requestControl('reset');
  }

  resetRaceLocal() {
    clearTimeout(this.countdownTimer);
    this.state = 'READY';
    this.forcedWinnerId = getPredeterminedWinnerId(PREDETERMINED_WINNER);
    this.sound.stopGallop();
    document.getElementById('results-overlay').classList.remove('active');
    document.getElementById('status-text').textContent = this.isAdmin
      ? "Ready for race. Click 'Start Race' or press Spacebar."
      : "Waiting for the administrator to start the race.";
    document.getElementById('race-state-tag').textContent = "GATE READY";

    this.setGateDoorsOpen(false);

    this.horses.forEach((h) => {
      h.state = 'STALL_IDLE';
      h.distance = 4;
      h.speed = 0;
      h.targetSpeed = 0;
      h.laneOffset = h.baseLaneOffset;
      h.targetLaneOffset = h.baseLaneOffset;
      h.finished = false;
      h.finishTime = 0;
      h.stridePhase = 0;
      h.idleTimer = Math.random() * Math.PI * 2;
      h.runningAction.time = 0;
      h.runningAction.paused = true;
      h.mixer.update(0);
      // Re-randomize tactical surges for fresh positional battles every race
      h.surgePhase = Math.random() * Math.PI * 2;
      h.tactics = {
        midSurge: (Math.random() - 0.4) * 3.0,
        lateKick: (Math.random() - 0.3) * 3.8,
      };
      this.updateHorseTransform(h);
    });

    this.horses.sort((a, b) => a.data.id - b.data.id);
    this.updateLeaderboardUI();
  }

  connectLiveRace() {
    this.eventSource = new EventSource('/api/events');
    this.eventSource.addEventListener('sync', event => {
      try {
        this.handleServerState(JSON.parse(event.data), true);
      } catch (error) {
        console.error('Unable to apply the shared race state.', error);
      }
    });
    this.eventSource.addEventListener('state', event => {
      try {
        this.handleServerState(JSON.parse(event.data));
      } catch (error) {
        console.error('Unable to apply the shared race state.', error);
      }
    });
    this.eventSource.addEventListener('snapshot', event => {
      if (!this.isAdmin) {
        try {
          this.applyRaceSnapshot(JSON.parse(event.data));
        } catch (error) {
          console.error('Unable to apply the live race update.', error);
        }
      }
    });
    this.eventSource.onerror = () => {
      if (this.eventSource.readyState === EventSource.CLOSED) {
        console.error('The live race connection closed.');
        document.getElementById('status-text').textContent = 'Live race connection lost. Refresh after signing in again.';
      }
    };

    if (this.isAdmin) {
      this.snapshotTimer = setInterval(() => {
        if (this.state === 'RACING') this.publishRaceSnapshot();
      }, 200);
    }
  }

  async requestControl(action, fields = {}) {
    try {
      const response = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...fields }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || `Server rejected ${action}.`);
      }
    } catch (error) {
      console.error(`Unable to ${action} the shared race.`, error);
      document.getElementById('status-text').textContent = `Unable to ${action} the race: ${error.message}`;
    }
  }

  async publishRaceSnapshot() {
    if (this.snapshotPending) return;
    this.snapshotPending = true;
    const snapshot = {
      horses: this.horses.map(horse => ({
        id: horse.data.id,
        distance: horse.distance,
        speed: horse.speed,
        state: horse.state,
        finished: horse.finished,
        finishTime: horse.finishTime,
        currentStamina: horse.currentStamina,
        laneOffset: horse.laneOffset,
        targetLaneOffset: horse.targetLaneOffset,
        stridePhase: horse.stridePhase,
        idleTimer: horse.idleTimer,
      })),
    };
    try {
      const response = await fetch('/api/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot),
      });
      if (!response.ok && response.status !== 409) {
        const result = await response.json();
        throw new Error(result.error || 'The server rejected the race update.');
      }
    } catch (error) {
      console.error('Unable to publish the live race update.', error);
      document.getElementById('status-text').textContent = `Live update failed: ${error.message}`;
    } finally {
      this.snapshotPending = false;
    }
  }

  handleServerState(sharedState, isSync = false) {
    if (Number.isFinite(sharedState.serverTime)) {
      this.serverOffsetMs = sharedState.serverTime - Date.now();
    }
    if (Number.isFinite(sharedState.timeScale)) {
      this.timeScale = sharedState.timeScale;
      document.querySelectorAll('.speed-btn').forEach(button => {
        button.classList.toggle('active', Number(button.dataset.speed) === this.timeScale);
      });
    }

    if (sharedState.action === 'start') {
      this.beginRaceCountdown(sharedState.raceStartAt);
    } else if (sharedState.action === 'pause') {
      this.state = 'PAUSED';
      this.pausedAt = performance.now();
      this.sound.stopGallop();
      document.getElementById('status-text').textContent = 'RACE PAUSED';
      document.getElementById('race-state-tag').textContent = 'PAUSED';
    } else if (sharedState.action === 'resume') {
      this.resumeRaceLocal();
    } else if (sharedState.action === 'reset') {
      this.resetRaceLocal();
    } else if (sharedState.action === 'finish') {
      this.finishRace(false);
    } else if (isSync) {
      if (sharedState.phase === 'READY') {
        this.resetRaceLocal();
      } else if (sharedState.phase === 'COUNTDOWN') {
        this.beginRaceCountdown(sharedState.raceStartAt);
      } else {
        this.enterRace(sharedState.raceStartAt);
        if (sharedState.snapshot) this.applyRaceSnapshot(sharedState.snapshot);
        if (sharedState.phase === 'PAUSED') {
          this.state = 'PAUSED';
          this.pausedAt = performance.now();
          this.sound.stopGallop();
          document.getElementById('status-text').textContent = 'RACE PAUSED';
          document.getElementById('race-state-tag').textContent = 'PAUSED';
        } else if (sharedState.phase === 'FINISHED') {
          this.state = 'RACING';
          this.finishRace(false);
        } else {
          this.state = 'RACING';
          this.sound.startGallop();
        }
      }
    }
  }

  beginRaceCountdown(raceStartAt) {
    clearTimeout(this.countdownTimer);
    this.forcedWinnerId = getPredeterminedWinnerId(PREDETERMINED_WINNER);
    this.state = 'COUNTDOWN';
    this.sound.playTrumpetFanfare();
    document.getElementById('status-banner').style.display = 'flex';
    document.getElementById('status-text').textContent = 'GATES OPEN IN 3... 2... 1...';
    this.countdownTimer = setTimeout(() => {
      if (this.state === 'COUNTDOWN') this.enterRace(raceStartAt);
    }, Math.max(0, raceStartAt - this.serverNow()));
  }

  enterRace(raceStartAt) {
    this.state = 'RACING';
    this.raceStartTime = performance.now() - Math.max(0, this.serverNow() - raceStartAt);
    this.pausedAt = 0;
    this.sound.startGallop();
    document.getElementById('status-text').textContent = "AND THEY'RE OFF!";
    document.getElementById('race-state-tag').textContent = 'IN PROGRESS';
    this.setGateDoorsOpen(true);
    this.horses.forEach(horse => {
      horse.state = 'GATE_BREAK';
      horse.distance = 4;
      horse.speed = 12 + (horse.data.acceleration * 1.6);
      horse.finished = false;
      horse.currentStamina = horse.data.stamina;
    });
  }

  resumeRaceLocal() {
    if (this.state === 'PAUSED') {
      this.raceStartTime += performance.now() - this.pausedAt;
    }
    this.pausedAt = 0;
    this.state = 'RACING';
    this.sound.startGallop();
    document.getElementById('status-text').textContent = 'RACE RESUMED!';
    document.getElementById('race-state-tag').textContent = 'IN PROGRESS';
  }

  applyRaceSnapshot(snapshot) {
    if (!Array.isArray(snapshot.horses)) return;
    if (Number.isFinite(snapshot.serverTime)) {
      this.serverOffsetMs = snapshot.serverTime - Date.now();
    }
    const horsesById = new Map(snapshot.horses.map(horse => [horse.id, horse]));
    this.horses.forEach(horse => {
      const update = horsesById.get(horse.data.id);
      if (!update) return;
      for (const key of ['distance', 'speed', 'finishTime', 'currentStamina', 'laneOffset', 'targetLaneOffset', 'stridePhase', 'idleTimer']) {
        if (Number.isFinite(update[key])) horse[key] = update[key];
      }
      if (typeof update.state === 'string') horse.state = update.state;
      if (typeof update.finished === 'boolean') horse.finished = update.finished;
      this.updateHorseTransform(horse);
    });
    this.horses.sort((a, b) => b.distance - a.distance);
    this.horses.forEach((horse, index) => { horse.rank = index + 1; });
    this.updateLeaderboardUI();
  }

  serverNow() {
    return Date.now() + this.serverOffsetMs;
  }

  updateViewerRace(delta) {
    if (this.state !== 'RACING') {
      this.horses.forEach(horse => this.updateHorseTransform(horse));
      return;
    }
    this.horses.forEach(horse => {
      horse.distance += horse.speed * delta;
      horse.stridePhase += (horse.state === 'FINAL_SPRINT' ? horse.speed * 0.35 : horse.speed * 0.28) * delta;
      horse.laneOffset += (horse.targetLaneOffset - horse.laneOffset) * delta * 2.2;
      this.updateHorseTransform(horse);
    });
    this.horses.sort((a, b) => b.distance - a.distance);
    this.horses.forEach((horse, index) => { horse.rank = index + 1; });
    if (Date.now() - this.lastStandingsUpdateAt >= 200) {
      this.lastStandingsUpdateAt = Date.now();
      this.updateLeaderboardUI();
    }
  }

  updateRace(delta) {
    this.horses.forEach(h => {
      h.idleTimer += delta;
    });

    if (this.state !== 'RACING') {
      this.horses.forEach(h => this.updateHorseTransform(h));
      return;
    }

    const totalRaceDistance = TRACK_PERIMETER + this.finishDistance;
    let allFinished = true;

    // Identify predetermined winner & current pack leader
    const forcedId = this.forcedWinnerId;
    const winnerHorse = forcedId ? this.horses.find(other => other.data.id === forcedId) : null;
    const currentLeaderDist = Math.max(...this.horses.map(h => h.distance));

    this.horses.forEach((h) => {
      if (h.finished) {
        if (h.state === 'DECELERATING') {
          h.speed = Math.max(0, h.speed - 12.0 * delta);
          h.distance += h.speed * delta;
          h.stridePhase += (h.speed * 0.25) * delta;

          if (h.speed <= 0.5) {
            h.speed = 0;
            h.state = 'COOLING_DOWN';
          }
          this.updateHorseTransform(h);
        }
        return;
      }

      allFinished = false;

      const progress = h.distance / totalRaceDistance;

      if (progress < 0.12) {
        h.state = 'ACCELERATING';
      } else if (progress < 0.70) {
        h.state = 'GALLOP';
      } else {
        h.state = 'FINAL_SPRINT';
      }

      const isChosenWinner = (forcedId !== null && h.data.id === forcedId);
      const baseMaxSpeed = h.data.topSpeed;

      // Dynamic tactical surges: causes frequent position shifting among competitors!
      const surgeWave = Math.sin((h.distance * 0.04) + h.surgePhase) * 2.6;
      const midSurge = Math.sin(progress * Math.PI) * (h.tactics ? h.tactics.midSurge : 1.2);
      const lateKick = (progress > 0.65 && h.tactics) ? ((progress - 0.65) * 5.0) * h.tactics.lateKick : 0;
      const randomJostle = (Math.random() - 0.49) * 1.5;

      let staminaMultiplier = 1.0;
      if (h.state === 'FINAL_SPRINT') {
        staminaMultiplier = 0.88 + (h.currentStamina / 10) * 0.32;
      } else {
        h.currentStamina -= delta * 0.14;
      }

      // Base desired speed for this horse
      let desiredSpeed = (baseMaxSpeed + surgeWave + midSurge + lateKick + randomJostle) * staminaMultiplier;

      // ======================================================================
      // PREDETERMINED WINNER DYNAMICS & DYNAMIC SHIFTS FOR OTHERS
      // ======================================================================
      if (forcedId !== null && winnerHorse) {
        if (isChosenWinner) {
          // A. Early & Mid race: Winner stays in the lead group (1st to 3rd)
          if (progress < 0.56) {
            if (h.distance < currentLeaderDist - 1.2) {
              desiredSpeed = Math.max(desiredSpeed, 45.2);
            }
          }
          // B. Final Turn (56% - 72%): Winner accelerates to take the lead!
          else if (progress < 0.72) {
            desiredSpeed = Math.max(desiredSpeed, 47.2);
            h.currentStamina = 10.0;
          }
          // C. Home Stretch (72% - 100%): Winner charges ahead for victory!
          else {
            desiredSpeed = Math.max(desiredSpeed, 49.5);
            h.currentStamina = 10.0;
          }
        } else {
          // For all other competitors:
          // In the home stretch, ensure only the closest challenger stays just behind the winner,
          // while all competitors duel freely among each other!
          if (progress > 0.68) {
            if (h.distance >= winnerHorse.distance - 0.9) {
              desiredSpeed = Math.min(desiredSpeed, winnerHorse.speed - 2.2);
              h.distance = Math.min(h.distance, winnerHorse.distance - 0.9);
            }
          }
          // Near finish line: Competitor cannot cross the wire before the winner
          if (!winnerHorse.finished && h.distance >= totalRaceDistance - 1.5) {
            h.distance = totalRaceDistance - 1.8;
            desiredSpeed = Math.min(desiredSpeed, 35.0);
          }
        }
      }

      h.targetSpeed = desiredSpeed;
      const accelFactor = (isChosenWinner && progress > 0.56) ? 0.75 : 0.38;
      h.speed += (h.targetSpeed - h.speed) * Math.min(1.0, delta * (h.data.acceleration * accelFactor));

      // Advance distance along track
      h.distance += h.speed * delta;

      // Gallop stride cadence linked directly to velocity
      const strideCadence = (h.state === 'FINAL_SPRINT') ? (h.speed * 0.35) : (h.speed * 0.28);
      h.stridePhase += strideCadence * delta;

      // ======================================================================
      // LATERAL STEERING & OVERTAKING MANEUVERS
      // ======================================================================
      const t = this.getTrackTransform(h.distance, h.laneOffset);

      // Check if another horse is directly ahead blocking this horse
      const blocker = this.horses.find(other =>
        other !== h &&
        other.distance > h.distance &&
        (other.distance - h.distance) < 3.5 &&
        Math.abs(other.laneOffset - h.laneOffset) < 1.4
      );

      const railBias = t.isTurning ? -1.2 : 0; // Natural drift to the inside rail on turns

      if (blocker) {
        // Steer laterally to pass around the blocker!
        const steerDir = (h.laneOffset >= blocker.laneOffset) ? 1.6 : -1.6;
        h.targetLaneOffset = h.baseLaneOffset + steerDir;
      } else {
        // Subtle natural jockey drift
        const naturalDrift = Math.sin((h.distance * 0.03) + h.data.id) * 0.5;
        h.targetLaneOffset = h.baseLaneOffset + railBias + naturalDrift;
      }

      // Clamp lane offset within track safety rails
      const maxOffset = (TRACK.width / 2) - 2.0;
      h.targetLaneOffset = THREE.MathUtils.clamp(h.targetLaneOffset, -maxOffset, maxOffset);
      h.laneOffset += (h.targetLaneOffset - h.laneOffset) * delta * 2.2;

      // Emit hoof dust particles
      if (this.dust && Math.random() < 0.35) {
        this.dust.emit(t.pos, t.tangent.clone().multiplyScalar(h.speed));
      }

      this.updateHorseTransform(h);

      // Check finish line crossing
      if (h.distance >= totalRaceDistance) {
        h.finished = true;
        h.finishTime = (performance.now() - this.raceStartTime) / 1000;
        h.state = 'DECELERATING';
      }
    });

    this.horses.sort((a, b) => b.distance - a.distance);
    this.horses.forEach((h, i) => { h.rank = i + 1; });
    this.updateLeaderboardUI();

    if (allFinished) {
      this.finishRace();
    }
  }

  finishRace(notifyServer = true) {
    if (this.state === 'FINISHED') return;
    this.state = 'FINISHED';
    this.sound.stopGallop();
    this.sound.playFinishChime();
    if (notifyServer && this.isAdmin) this.requestControl('finish');

    const winner = this.horses[0];
    document.getElementById('status-text').textContent = `★ ${winner.data.name} TAKES 1st PLACE! ★`;
    document.getElementById('race-state-tag').textContent = "FINISHED";

    setTimeout(() => {
      const modal = document.getElementById('results-overlay');
      const winnerName = document.getElementById('winner-name');
      const winnerTime = document.getElementById('winner-time');
      const podiumList = document.getElementById('podium-list');

      winnerName.textContent = `${winner.data.name} Wins!`;
      winnerTime.textContent = `Winning Time: ${winner.finishTime.toFixed(2)}s | Breed: ${winner.data.breed}`;

      podiumList.innerHTML = this.horses.map((h, i) => `
        <div class="podium-item">
          <span style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 800; color: ${i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : i === 2 ? '#d97706' : '#94a3b8'};">
              #${i + 1}
            </span>
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${h.data.badgeHex};"></span>
            <span>${h.data.name}</span>
          </span>
          <span style="color: #94a3b8; font-size: 0.8rem;">${h.finishTime ? h.finishTime.toFixed(2) + 's' : '--'}</span>
        </div>
      `).join('');

      modal.classList.add('active');
    }, 1400);
  }

  /* --------------------------------------------------------------------------
     UI CONTROLLER & EVENT LISTENERS
     -------------------------------------------------------------------------- */
  initUI() {
    document.getElementById('status-text').textContent = this.isAdmin
      ? "Ready for race. Click 'Start Race' or press Spacebar."
      : "Waiting for the administrator to start the race.";

    const rosterContainer = document.getElementById('roster-items');
    rosterContainer.innerHTML = '';

    HORSES_DATA.forEach(data => {
      const row = document.createElement('div');
      row.className = `horse-row ${data.id === this.focusedHorseId ? 'active' : ''}`;
      row.dataset.id = data.id;

      row.innerHTML = `
        <div class="horse-color-swatch" style="background: ${data.badgeHex};">
          ${data.id}
        </div>
        <div class="horse-info">
          <div class="horse-name-row">
            <span class="horse-name">${data.name}</span>
            <span class="state-pill stall" id="state-pill-${data.id}">STALL</span>
          </div>
          <div class="horse-breed">${data.breed}</div>
        </div>
      `;

      row.addEventListener('click', () => this.setFocusedHorse(data.id));
      rosterContainer.appendChild(row);
    });

    document.querySelectorAll('.nav-btn[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => this.setCameraMode(btn.dataset.mode));
    });

    document.getElementById('btn-start-race').addEventListener('click', () => this.startRace());
    document.getElementById('btn-pause-race').addEventListener('click', () => this.pauseRace());
    document.getElementById('btn-reset-race').addEventListener('click', () => this.resetRace());
    document.getElementById('btn-restart-from-results').addEventListener('click', () => this.resetRace());
    document.getElementById('btn-close-results').addEventListener('click', () => {
      document.getElementById('results-overlay').classList.remove('active');
    });
    document.getElementById('btn-logout').addEventListener('click', async () => {
      try {
        const response = await fetch('/api/logout', { method: 'POST' });
        if (!response.ok) throw new Error(`Sign-out failed (${response.status}).`);
        window.location.replace('/login.html');
      } catch (error) {
        console.error('Unable to sign out.', error);
        document.getElementById('status-text').textContent = `Unable to sign out: ${error.message}`;
      }
    });

    const standingsHud = document.getElementById('standings-hud');
    const standingsToggle = document.getElementById('btn-toggle-standings');
    standingsToggle.addEventListener('click', () => {
      const expanded = standingsToggle.getAttribute('aria-expanded') === 'true';
      standingsToggle.setAttribute('aria-expanded', String(!expanded));
      standingsToggle.textContent = expanded ? 'Show' : 'Hide';
      standingsHud.classList.toggle('is-collapsed', expanded);
    });

    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isAdmin) this.requestControl('speed', { speed: Number(btn.dataset.speed) });
      });
    });

    const soundBtn = document.getElementById('btn-sound');
    soundBtn.addEventListener('click', () => {
      const unmuted = this.sound.toggleMute();
      soundBtn.textContent = unmuted ? '🔊' : '🔇';
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' && this.isAdmin) {
        e.preventDefault();
        if (this.state === 'READY') this.startRace();
        else if (this.state === 'RACING') this.pauseRace();
        else if (this.state === 'PAUSED') this.startRace();
      }
      if (this.isAdmin && (e.key === 'r' || e.key === 'R')) this.resetRace();
      if (e.key === '1') this.setCameraMode('follow');
      if (e.key === '2') this.setCameraMode('orbit');
      if (e.key === '3') this.setCameraMode('side');
      if (e.key === '4') this.setCameraMode('finish');
      if (e.key === '5') this.setCameraMode('drone');
    });
  }

  updateLeaderboardUI() {
    const list = document.getElementById('standings-list');
    if (!list || this.horses.length === 0) return;

    list.innerHTML = this.horses.map((h, i) => {
      const isFocused = h.data.id === this.focusedHorseId;
      return `
        <div class="standings-item" style="${isFocused ? 'border: 1px solid var(--primary-gold); background: rgba(245,158,11,0.15);' : ''}">
          <span class="rank-badge rank-${i + 1}">${i + 1}</span>
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${h.data.badgeHex}; margin-right: 2px;"></span>
          <span class="standings-name">${h.data.name} ${isFocused ? '⭐' : ''}</span>
          <span class="standings-speed">${h.speed.toFixed(0)} u/s</span>
        </div>
      `;
    }).join('');

    this.horses.forEach(h => {
      const pill = document.getElementById(`state-pill-${h.data.id}`);
      if (pill) {
        if (h.state === 'STALL_IDLE') {
          pill.className = 'state-pill stall';
          pill.textContent = 'STALL';
        } else if (h.state === 'GATE_BREAK' || h.state === 'ACCELERATING') {
          pill.className = 'state-pill break';
          pill.textContent = 'ACCEL';
        } else if (h.state === 'GALLOP') {
          pill.className = 'state-pill gallop';
          pill.textContent = 'GALLOP';
        } else if (h.state === 'FINAL_SPRINT') {
          pill.className = 'state-pill sprint';
          pill.textContent = '⚡SPRINT';
        } else if (h.state === 'DECELERATING') {
          pill.className = 'state-pill decel';
          pill.textContent = 'SLOWING';
        } else if (h.state === 'COOLING_DOWN') {
          pill.className = 'state-pill idle';
          pill.textContent = 'FINISH';
        }
      }
    });

    const totalDist = TRACK_PERIMETER + this.finishDistance;
    const leader = this.horses[0];
    if (leader) {
      const pct = Math.min(100, Math.round((leader.distance / totalDist) * 100));
      const fill = document.getElementById('progress-bar-fill');
      const label = document.getElementById('progress-pct');
      if (fill) fill.style.width = `${pct}%`;
      if (label) label.textContent = `${pct}%`;
    }
  }

  /* --------------------------------------------------------------------------
     MAIN RENDER LOOP
     -------------------------------------------------------------------------- */
  animate() {
    requestAnimationFrame(() => this.animate());

    const rawDelta = this.clock.getDelta();
    const delta = rawDelta * this.timeScale;

    if (this.dust) {
      this.dust.update(delta);
    }

    if (this.isAdmin || this.state !== 'RACING') this.updateRace(delta);
    else this.updateViewerRace(delta);
    this.horses.forEach(horse => {
      horse.runningAction.paused = this.state !== 'RACING' || horse.state === 'COOLING_DOWN';
      horse.mixer.update(delta);
    });
    this.updateCamera();
    this.renderer.render(this.scene, this.camera);
  }
}

// Launch simulation
const launchSimulation = () => {
  new HorseRacingSimulation();
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', launchSimulation, { once: true });
} else {
  launchSimulation();
}
