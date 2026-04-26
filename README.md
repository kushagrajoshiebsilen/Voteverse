# 🏛️ VoteVerse: City of Democracy

**VoteVerse** is a high-fidelity, 2.5D isometric RPG designed to educate players on the electoral process through immersive spatial storytelling and cinematic gameplay.

![Version](https://img.shields.io/badge/version-2.5.0--Premium-cyan)
![Tech Stack](https://img.shields.io/badge/tech-React--Vite--Canvas-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 Key Features

### 📐 High-Fidelity 2.5D Engine
- **Isometric Projection:** Custom `(x, y) -> (ix, iy)` transformation matrix using 30-degree tilt logic.
- **Z-Axis Physics:** Dynamic jumping system with gravity, vertical velocity, and shadow scaling.
- **Kinetic Feedback:** Procedural camera shake on impact and smooth LERP-based viewport tracking.

### 🎭 Articulated Character System
- **Limb Animation:** Procedural sinusoidal walk cycles for arms and legs.
- **Squash & Stretch:** Landing physics that respond to vertical momentum.
- **Silhouette Distinction:** NPC roles are distinguished by unique visual layers (e.g., Officer uniforms vs. Citizen casuals).

### 🏛️ Architectural Reconstruction
- **Civic Facades:** Procedural building renderer supporting stone pillars, recessed windows, and entrance awnings.
- **Functional Props:** Hand-designed office interiors featuring service counters, waiting benches, and stanchion barriers.
- **Atmospheric Lighting:** Volumetric street lamp "blooms" and atmospheric flicker effects.

### 📡 Holographic UI/UX
- **Tactical Minimap:** Real-time 2.5D radar tracking player and NPC positions.
- **Neural Cursor:** Native CSS-embedded SVG holographic crosshair for zero-latency navigation.
- **Cinematic Layers:** Scanlines, Chromatic Aberration, and Digital Vignettes for a "high-tech terminal" aesthetic.

---

## 🛠️ Technical Setup

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

---

## 📖 Civic Learning Path
1. **Neighborhood:** Discover the importance of documents (Aadhaar/Form 6).
2. **Registration:** Experience the administrative verification process.
3. **Campaign:** Engage with candidates and learn about political platforms.
4. **Polling:** Perform the official act of voting in a secure pavilion.
5. **Results:** Understand the collective voice in the Counting Chamber.

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Created with focus on Visual Excellence and Democratic Education.*
