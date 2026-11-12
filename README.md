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

Double-click **[`start.bat`](./start.bat)** (or run `python -m http.server 8000`) and open `http://localhost:8000` in your browser.
