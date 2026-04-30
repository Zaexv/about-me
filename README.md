# Eduardo Pertierra Puche — Portfolio & 3D Museum

> A personal portfolio website featuring an **interactive 3D Museum** that showcases AI projects with particle atmospheres, custom shaders, and YouTube demos.

---

## ✨ Features

### Portfolio (`index.html`)
- Responsive single-page portfolio with animated gradient mesh background
- Canvas 2D ambient particle system with mouse interactivity
- 3D header icon and contact section powered by Three.js
- Card tilt effects, scroll progress, and smooth animations
- Sections: Hero · About · Experience · Education · Projects · Contact

### 3D Museum (`museum.html`)
- **5-room navigable experience** — Entrance + 4 project rooms
- Three.js WebGL particle atmosphere with per-room color themes
- Custom GLSL sparkle shader with per-particle twinkle (250 particles)
- 3,000 dust particles with soft radial-gradient canvas texture
- Smooth camera transitions between rooms (lerp on z-axis)
- Floating wireframe shapes (icosahedron + octahedron) per room
- Staggered CSS entrance animations for text and UI elements
- Keyboard (arrows), button, and dot navigation
- Auto-playing YouTube video demos with shield overlay
- Architecture diagrams for each project
- Fully responsive layout (mobile-first breakpoints)

---

## 🏗️ Architecture

```
about-me/
├── index.html           # Main portfolio page
├── museum.html          # 3D Museum experience
├── style.css            # Portfolio styles
├── museum.css           # Museum styles (rooms, nav, entrance, responsive)
├── js/
│   ├── museum.js        # Three.js scene, particles, shaders, navigation
│   ├── ambient-particles.js  # Canvas 2D particle system (portfolio)
│   ├── skills-tree.js   # Hero 3D background
│   ├── header-icon.js   # Animated 3D logo
│   ├── contact-3d.js    # Contact section 3D effect
│   ├── card-tilt.js     # Project card tilt interaction
│   └── script.js        # Main portfolio logic (scroll, observers)
├── assets/
│   └── favicon.svg
├── eslint.config.mjs    # ESLint flat config (TypeScript-aware)
├── tsconfig.json        # TypeScript config (type-checking only)
└── package.json
```

### Museum Technical Stack

| Layer | Technology |
|-------|-----------|
| 3D Engine | Three.js r128 (CDN) |
| Particles | `PointsMaterial` + canvas radial-gradient texture |
| Sparkles | Custom `ShaderMaterial` with GLSL vertex/fragment shaders |
| Navigation | Keyboard, click, and dot-based room switching |
| Camera | Perspective camera with lerp transitions + gentle sway |
| Videos | YouTube `iframe` embeds (autoplay, muted, looped) |
| Styling | Vanilla CSS with custom properties, glass morphism, gradients |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Zaexv/about-me.git
cd about-me
npm install
```

### Development

```bash
npm start        # Starts http-server on port 8080 and opens browser
npm run dev      # Starts live-server with hot reload on port 8080
```

Then visit:
- **Portfolio:** http://localhost:8080
- **3D Museum:** http://localhost:8080/museum.html

### Linting

```bash
npm run lint         # Run ESLint on all JS files
npm run lint:fix     # Auto-fix lint issues
npm run typecheck    # TypeScript type checking (no emit)
npm run check        # Lint + typecheck
```

---

## 🎨 Museum Rooms

| # | Room | Theme | Content |
|---|------|-------|---------|
| 0 | Entrance | Indigo | Welcome animation with gradient title |
| 1 | World of Promptcraft | Fire/Orange | Multi-agent 3D RPG with LangGraph |
| 2 | SpAIce Odyssey | Cosmic/Blue | NASA exoplanet explorer (6k+ planets) |
| 3 | AI Digital Twin | Neural/Green | 5-agent semantic routing system |
| 4 | PlanItNow | Urban/Purple | Geolocation social planning platform |

Each room features unique particle colors, fog density, point lights, and floating wireframe shapes that match the project's personality.

---

## 📦 Deployment

This is a static site — deploy to any static hosting provider:

- **GitHub Pages** — push to `main` and enable Pages
- **Cloudflare Pages** — connect repo, no build step needed
- **Vercel / Netlify** — zero-config static deployment

No build step required. All assets are served directly.

---

## 🛠️ Tech Stack

- **Three.js** — 3D rendering, particles, shaders, lights
- **Vanilla JS** — No frameworks, minimal dependencies
- **CSS3** — Custom properties, animations, glass morphism, gradients
- **ESLint** — Code quality with TypeScript-aware rules
- **Google Fonts** — Inter + JetBrains Mono

---

## 📄 License

MIT © Eduardo Pertierra Puche
