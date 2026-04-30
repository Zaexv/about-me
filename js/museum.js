/* ═══════════════════════════════════════════════════════
   3D Museum — Full 3D Experience
   WebGL: rooms, particles, lighting, fog
   CSS3D: YouTube videos on walls, floating text panels
   ═══════════════════════════════════════════════════════ */

/* ── Room data ── */
const ROOMS = [
  {
    name: 'World of Promptcraft',
    tag: '⚔️ MULTI-AGENT RPG',
    titleHTML: 'World of<br><em>Promptcraft</em>',
    desc: 'A 3D multiplayer RPG where <strong>your words shape the world</strong>. Every NPC is a fully autonomous LangGraph agent with its own personality, memory, and decision-making graph.',
    stack: ['Three.js', 'TypeScript', 'LangGraph', 'FastAPI', 'GPT-4o', 'WebSocket', 'RAG'],
    videoId: 'TdmNPD9wOhA',
    links: [{ text: 'GitHub →', url: 'https://github.com/Zaexv/world-of-prompcraft' }],
    archHTML: '<div class="an n-ui">🎮 Three.js Client<small>Terrain · NPCs · Chat</small></div><div class="aa">⇅ WebSocket</div><div class="an n-api">🧠 FastAPI + LangGraph<small>Per-NPC StateGraph</small></div><div class="aa">↓</div><div class="ar"><span>Reason</span><span>Act</span><span>Respond</span></div><div class="aa">↓</div><div class="ar"><span>🤖 GPT-4o</span><span>📚 RAG Lore</span></div>',
    fog: 0x0a0500,
    particleRGB: [0.98, 0.57, 0.24],
    spotColor: 0xff6622,
    wallColor: 0x120600,
    accentGrad: 'linear-gradient(135deg, #fb923c, #ef4444, #f59e0b)',
    flashColor: 'rgba(251,146,60,0.25)'
  },
  {
    name: 'SpAIce — Space Odyssey',
    tag: '🛸 LIVE · 4K+ VIEWS/MO',
    titleHTML: 'SpAIce<br><em>Odyssey</em>',
    desc: 'Explore <strong>6,000+ real NASA exoplanets</strong> in 3D. AI-generated planet narratives, text-to-speech, and spacecraft simulation. Hamburg AI Hackathon.',
    stack: ['Three.js', 'NASA API', 'OpenAI GPT-4', 'TTS', 'Spatial Clustering', 'Vite'],
    videoId: 'ZdC-fMK62Fg',
    links: [
      { text: 'Live Demo →', url: 'https://agentic-space-exploration.pages.dev/', primary: true },
      { text: 'GitHub →', url: 'https://github.com/Zaexv/spaice-agentic-3d-exploration' }
    ],
    archHTML: '<div class="an n-ui">🖥️ Three.js Frontend<small>3D Scene · Spacecraft</small></div><div class="aa">↕ REST + Stream</div><div class="ar-nodes"><div class="an n-data">📊 NASA<small>6k+ planets</small></div><div class="an n-ai">🤖 OpenAI<small>Narratives</small></div></div><div class="aa">↓</div><div class="ar"><span>🔊 TTS</span><span>🗺️ Star Map</span></div>',
    fog: 0x02020c,
    particleRGB: [0.39, 0.4, 0.95],
    spotColor: 0x6366f1,
    wallColor: 0x080818,
    accentGrad: 'linear-gradient(135deg, #818cf8, #38bdf8, #c084fc)',
    flashColor: 'rgba(99,102,241,0.25)'
  },
  {
    name: 'AI Digital Twin',
    tag: '🧠 AI AGENTS · RAG · PRODUCTION',
    titleHTML: 'AI Digital<br><em>Twin</em>',
    desc: 'Production-ready multi-agent orchestration with <strong>5 specialized agents</strong> and LLM-based semantic routing at 95% accuracy. RAG over personal data.',
    stack: ['LangChain', 'LangGraph', 'FastAPI', 'React', 'ChromaDB', 'SQLite', 'Docker'],
    videoId: null,
    links: [{ text: 'GitHub →', url: 'https://github.com/Zaexv/agentic-orchestration-app' }],
    archHTML: '<div class="an n-ui">🎨 React + 3D Avatars</div><div class="aa">↓</div><div class="an n-api">🧠 Router Agent<small>GPT-4o-mini · 95% accuracy</small></div><div class="aa">↓ Semantic Routing</div><div class="ar"><span>👔 Pro</span><span>😄 Social</span><span>📚 Know</span><span>⚖️ Dec</span><span>🤖 Gen</span></div><div class="aa">↓</div><div class="ar"><span>ChromaDB</span><span>SQLite</span></div>',
    fog: 0x010805,
    particleRGB: [0.29, 0.77, 0.37],
    spotColor: 0x22c55e,
    wallColor: 0x061210,
    accentGrad: 'linear-gradient(135deg, #4ade80, #22c55e, #34d399)',
    flashColor: 'rgba(34,197,94,0.25)'
  },
  {
    name: 'PlanItNow',
    tag: '📍 STARTUP · DISTRIBUTED SYSTEMS',
    titleHTML: 'PlanIt<br><em>Now</em>',
    desc: 'Geolocation-based social planning for <strong>high-concurrency scaling</strong>. End-to-end distributed architecture supporting millions of social interactions in real time.',
    stack: ['Python', 'Django', 'GCP', 'PostgreSQL', 'Redis', 'Geolocation API'],
    videoId: null,
    links: [
      { text: 'Backend →', url: 'https://github.com/Zaexv/PlanItNow_Backend' },
      { text: 'Frontend →', url: 'https://github.com/Zaexv/PlanItNow_frontend_old' }
    ],
    archHTML: '<div class="an n-ui">📱 Mobile &amp; Web</div><div class="aa">↓</div><div class="an n-api">🐍 Django REST<small>GCP Cloud Run</small></div><div class="aa">↓</div><div class="ar"><span>🗄️ Postgres</span><span>⚡ Redis</span><span>📍 Geo API</span></div>',
    fog: 0x080210,
    particleRGB: [0.66, 0.33, 0.97],
    spotColor: 0xa855f7,
    wallColor: 0x100620,
    accentGrad: 'linear-gradient(135deg, #c084fc, #a855f7, #ec4899)',
    flashColor: 'rgba(168,85,247,0.25)'
  }
];

/* ── Constants ── */
const ROOM_SPACING = 28;
const ROOM_COUNT = ROOMS.length;
const SCALE = 0.02;
const SCREEN_PX = [800, 450];
const SCREEN_3D = [SCREEN_PX[0] * SCALE, SCREEN_PX[1] * SCALE]; // 16 x 9

/* ── State ── */
let currentRoom = 0;
let transitioning = false;
let camTargetZ = null;

/* ── Three.js refs ── */
let camera, glRenderer, cssRenderer, glScene, cssScene;
let dustGeo;
const clock = new THREE.Clock();

/* per-room CSS3D DOM elements for fading */
const roomElements = [];

/* ── DOM ── */
const canvas = document.getElementById('museum-canvas');
const css3dBox = document.getElementById('css3d-container');
const flash = document.getElementById('room-flash');
const loader = document.getElementById('loading-screen');
const label = document.getElementById('room-label');
const btnPrev = document.getElementById('nav-prev');
const btnNext = document.getElementById('nav-next');
const dots = document.getElementById('nav-dots');

/* ═══════════════════════════════════
   INIT
   ═══════════════════════════════════ */
function init() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  /* Camera */
  camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 500);
  camera.position.set(0, 4.5, 10);

  /* WebGL */
  glScene = new THREE.Scene();
  glScene.fog = new THREE.FogExp2(ROOMS[0].fog, 0.02);

  glRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  glRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  glRenderer.setSize(w, h);
  glRenderer.setClearColor(0x000000, 0);

  /* CSS3D */
  cssScene = new THREE.Scene();
  cssRenderer = new THREE.CSS3DRenderer();
  cssRenderer.setSize(w, h);
  const cssDom = cssRenderer.domElement;
  cssDom.style.position = 'fixed';
  cssDom.style.top = '0';
  cssDom.style.left = '0';
  cssDom.style.background = '#030303';
  css3dBox.appendChild(cssDom);

  /* Build */
  addLights();
  addRoomGeometry();
  addCSS3DContent();
  addDust();
  addNav();

  /* Events */
  window.addEventListener('resize', onResize);
  document.addEventListener('keydown', onKey);

  /* Start */
  setRoom(0, false);
  setTimeout(() => loader.classList.add('hidden'), 1200);
  tick();
}

/* ═══════════════════════════════════
   LIGHTING
   ═══════════════════════════════════ */
function addLights() {
  glScene.add(new THREE.AmbientLight(0x111111, 0.4));

  ROOMS.forEach((r, i) => {
    const cz = -i * ROOM_SPACING;

    /* Main spotlight from above */
    const spot = new THREE.SpotLight(r.spotColor, 2.2, 45, Math.PI / 3.5, 0.6, 1);
    spot.position.set(0, 11, cz + 6);
    spot.target.position.set(0, 3, cz - 5);
    glScene.add(spot);
    glScene.add(spot.target);

    /* Accent point light left-low */
    const pl = new THREE.PointLight(r.spotColor, 0.5, 18, 2);
    pl.position.set(-6, 1.5, cz - 2);
    glScene.add(pl);

    /* Back glow behind screen */
    const pb = new THREE.PointLight(r.spotColor, 0.35, 12, 2);
    pb.position.set(0, 5.5, cz - 11);
    glScene.add(pb);
  });
}

/* ═══════════════════════════════════
   ROOM GEOMETRY (WebGL)
   ═══════════════════════════════════ */
function addRoomGeometry() {
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x060606, roughness: 0.85, metalness: 0.15 });
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0x040404, roughness: 1, metalness: 0 });

  ROOMS.forEach((r, i) => {
    const cz = -i * ROOM_SPACING;
    const wMat = new THREE.MeshStandardMaterial({ color: r.wallColor, roughness: 0.9, metalness: 0.1 });

    /* Floor */
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), floorMat);
    fl.rotation.x = -Math.PI / 2;
    fl.position.set(0, 0, cz);
    fl.receiveShadow = true;
    glScene.add(fl);

    /* Ceiling */
    const ce = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), ceilMat);
    ce.rotation.x = Math.PI / 2;
    ce.position.set(0, 11, cz);
    glScene.add(ce);

    /* Walls (left, right) */
    const lw = new THREE.Mesh(new THREE.PlaneGeometry(28, 11), wMat);
    lw.rotation.y = Math.PI / 2;
    lw.position.set(-14, 5.5, cz);
    glScene.add(lw);

    const rw = new THREE.Mesh(new THREE.PlaneGeometry(28, 11), wMat);
    rw.rotation.y = -Math.PI / 2;
    rw.position.set(14, 5.5, cz);
    glScene.add(rw);

    /* Back wall */
    const bz = cz - 14;
    if (r.videoId) {
      addScreenWall(r, bz, wMat);
    } else {
      const bw = new THREE.Mesh(new THREE.PlaneGeometry(28, 11), wMat);
      bw.position.set(0, 5.5, bz);
      glScene.add(bw);
      addOrb(r, cz);
    }

    /* Floor accent line */
    const lineMat = new THREE.MeshBasicMaterial({
      color: r.spotColor, transparent: true, opacity: 0.3
    });
    const line = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.04), lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.01, cz - 4);
    glScene.add(line);
  });
}

/* Back wall with screen cutout */
function addScreenWall(r, bz, wMat) {
  const sw = SCREEN_3D[0]; // 16
  const sh = SCREEN_3D[1]; // 9
  const sy = 5.5;
  const W = 28;
  const H = 11;

  /* Bottom */
  const bh = sy - sh / 2;
  if (bh > 0) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(W, bh), wMat);
    m.position.set(0, bh / 2, bz);
    glScene.add(m);
  }
  /* Top */
  const tTop = sy + sh / 2;
  const th = H - tTop;
  if (th > 0) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(W, th), wMat);
    m.position.set(0, tTop + th / 2, bz);
    glScene.add(m);
  }
  /* Left */
  const lw = (W - sw) / 2;
  const ml = new THREE.Mesh(new THREE.PlaneGeometry(lw, sh), wMat);
  ml.position.set(-(sw / 2 + lw / 2), sy, bz);
  glScene.add(ml);
  /* Right */
  const mr = new THREE.Mesh(new THREE.PlaneGeometry(lw, sh), wMat);
  mr.position.set(sw / 2 + lw / 2, sy, bz);
  glScene.add(mr);

  /* Glowing frame */
  const fMat = new THREE.MeshBasicMaterial({
    color: r.spotColor, transparent: true, opacity: 0.4
  });
  const ft = 0.12;
  [
    [0, sy + sh / 2 + ft / 2, sw + 0.3, ft],
    [0, sy - sh / 2 - ft / 2, sw + 0.3, ft],
    [-(sw / 2 + ft / 2), sy, ft, sh + 0.3],
    [sw / 2 + ft / 2, sy, ft, sh + 0.3]
  ].forEach(([x, y, w2, h2]) => {
    const f = new THREE.Mesh(new THREE.BoxGeometry(w2, h2, 0.06), fMat);
    f.position.set(x, y, bz + 0.04);
    glScene.add(f);
  });
}

/* Wireframe orb for non-video rooms */
function addOrb(r, cz) {
  const orb = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.2, 1),
    new THREE.MeshBasicMaterial({ color: r.spotColor, wireframe: true, transparent: true, opacity: 0.15 })
  );
  orb.position.set(6, 5, cz - 8);
  orb.userData = { orb: true, baseY: 5 };
  glScene.add(orb);

  const inner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, 2),
    new THREE.MeshBasicMaterial({ color: r.spotColor, transparent: true, opacity: 0.05 })
  );
  inner.position.copy(orb.position);
  inner.userData = { orb: true, baseY: 5 };
  glScene.add(inner);
}

/* ═══════════════════════════════════
   CSS3D CONTENT (videos + panels)
   ═══════════════════════════════════ */
function addCSS3DContent() {
  ROOMS.forEach((r, i) => {
    const cz = -i * ROOM_SPACING;
    const bz = cz - 14;
    const els = [];

    /* VIDEO SCREEN */
    if (r.videoId) {
      const screenEl = makeVideoScreen(r);
      const screenObj = new THREE.CSS3DObject(screenEl);
      screenObj.position.set(0, 5.5, bz + 0.1);
      screenObj.scale.set(SCALE, SCALE, SCALE);
      cssScene.add(screenObj);
      els.push(screenEl);

      /* Depth-only occluder so WebGL geometry in front hides the video */
      const occMat = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide });
      const occ = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_3D[0], SCREEN_3D[1]), occMat);
      occ.position.set(0, 5.5, bz + 0.1);
      glScene.add(occ);
    }

    /* INFO PANEL */
    const infoEl = makeInfoPanel(r);
    const infoObj = new THREE.CSS3DObject(infoEl);
    infoObj.position.set(-7, 5.5, cz - 3);
    infoObj.rotation.y = 0.06;
    infoObj.scale.set(SCALE, SCALE, SCALE);
    cssScene.add(infoObj);
    els.push(infoEl);

    /* ARCHITECTURE CARD */
    const archEl = makeArchPanel(r);
    const archObj = new THREE.CSS3DObject(archEl);
    archObj.position.set(r.videoId ? 7 : 6, 3, cz - 5.5);
    archObj.rotation.y = -0.08;
    archObj.scale.set(SCALE, SCALE, SCALE);
    cssScene.add(archObj);
    els.push(archEl);

    roomElements.push(els);
  });
}

function makeVideoScreen(r) {
  const wrap = document.createElement('div');
  wrap.className = 'css3d-el';
  wrap.style.cssText = `width:${SCREEN_PX[0]}px;height:${SCREEN_PX[1]}px;position:relative;overflow:hidden;background:#000;border-radius:4px;`;

  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube.com/embed/' + r.videoId +
    '?autoplay=1&mute=1&loop=1&playlist=' + r.videoId +
    '&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1';
  iframe.allow = 'autoplay; encrypted-media';
  iframe.loading = 'lazy';
  iframe.style.cssText = 'width:100%;height:100%;border:none;pointer-events:none;';
  wrap.appendChild(iframe);

  const shield = document.createElement('div');
  shield.style.cssText = 'position:absolute;inset:0;z-index:1;';
  wrap.appendChild(shield);

  return wrap;
}

function makeInfoPanel(r) {
  const el = document.createElement('div');
  el.className = 'info-panel css3d-el';
  el.style.setProperty('--accent', r.accentGrad);

  const chips = r.stack.map(s => '<span class="ip-chip">' + s + '</span>').join('');
  const links = r.links.map(l =>
    '<a href="' + l.url + '" target="_blank" rel="noopener" class="ip-link' +
    (l.primary ? ' ip-link--primary' : '') + '">' + l.text + '</a>'
  ).join('');

  el.innerHTML =
    '<div class="ip-tag">' + r.tag + '</div>' +
    '<h1 class="ip-title" style="--accent:' + r.accentGrad + '">' + r.titleHTML + '</h1>' +
    '<p class="ip-desc">' + r.desc + '</p>' +
    '<div class="ip-stack">' + chips + '</div>' +
    '<div class="ip-links">' + links + '</div>';

  return el;
}

function makeArchPanel(r) {
  const el = document.createElement('div');
  el.className = 'arch-panel css3d-el';
  el.innerHTML = '<div class="ap-header">Architecture</div>' + r.archHTML;
  return el;
}

/* ═══════════════════════════════════
   DUST PARTICLES
   ═══════════════════════════════════ */
function addDust() {
  const N = 2000;
  dustGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const span = ROOM_COUNT * ROOM_SPACING + 20;
  const c = ROOMS[0].particleRGB;

  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 26;
    pos[i * 3 + 1] = Math.random() * 10;
    pos[i * 3 + 2] = 12 - Math.random() * span;
    col[i * 3] = c[0];
    col[i * 3 + 1] = c[1];
    col[i * 3 + 2] = c[2];
  }

  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dustGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const pts = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  glScene.add(pts);
}

function tintDust(idx) {
  const c = ROOMS[idx].particleRGB;
  const ca = dustGeo.attributes.color;
  const pa = dustGeo.attributes.position;
  const rz = -idx * ROOM_SPACING;
  for (let i = 0; i < ca.count; i++) {
    if (Math.abs(pa.getZ(i) - rz) < ROOM_SPACING * 0.6) {
      ca.setXYZ(i, c[0], c[1], c[2]);
    }
  }
  ca.needsUpdate = true;
}

/* ═══════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════ */
function addNav() {
  ROOMS.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'nav-dot';
    d.addEventListener('click', () => goTo(i));
    dots.appendChild(d);
  });
  btnPrev.addEventListener('click', () => goTo(currentRoom - 1));
  btnNext.addEventListener('click', () => goTo(currentRoom + 1));
}

function goTo(idx) {
  if (transitioning || idx < 0 || idx >= ROOM_COUNT || idx === currentRoom) return;
  transitioning = true;
  flash.style.background = ROOMS[idx].flashColor;
  flash.classList.remove('flash');
  void flash.offsetWidth;
  flash.classList.add('flash');
  setTimeout(() => {
    setRoom(idx, true);
    transitioning = false;
  }, 100);
}

function setRoom(idx, animated) {
  currentRoom = idx;
  const tz = -idx * ROOM_SPACING + 10;
  if (animated) { camTargetZ = tz; } else { camera.position.z = tz; }

  /* Fade CSS3D panels */
  roomElements.forEach((els, i) => {
    const vis = i === idx;
    els.forEach(el => { el.style.opacity = vis ? '1' : '0'; });
  });

  /* UI */
  dots.querySelectorAll('.nav-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  btnPrev.disabled = idx === 0;
  btnNext.disabled = idx === ROOM_COUNT - 1;
  label.textContent = ROOMS[idx].name;

  /* Scene mood */
  glScene.fog.color.set(ROOMS[idx].fog);
  tintDust(idx);
}

function onKey(e) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(currentRoom + 1);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(currentRoom - 1);
}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  glRenderer.setSize(w, h);
  cssRenderer.setSize(w, h);
}

/* ═══════════════════════════════════
   ANIMATION LOOP
   ═══════════════════════════════════ */
function tick() {
  requestAnimationFrame(tick);
  const t = clock.getElapsedTime();

  /* Camera lerp */
  if (camTargetZ !== null) {
    camera.position.z += (camTargetZ - camera.position.z) * 0.06;
    if (Math.abs(camTargetZ - camera.position.z) < 0.03) {
      camera.position.z = camTargetZ;
      camTargetZ = null;
    }
  }

  /* Gentle sway */
  camera.position.x = Math.sin(t * 0.12) * 0.2;
  camera.position.y = 4.5 + Math.sin(t * 0.18) * 0.1;
  camera.lookAt(camera.position.x, 3.8, camera.position.z - 12);

  /* Dust drift */
  if (dustGeo) {
    const pa = dustGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      let y = pa.getY(i);
      y += Math.sin(t * 0.4 + i * 0.07) * 0.002;
      if (y > 10) y = 0.5;
      if (y < 0) y = 10;
      pa.setY(i, y);
    }
    pa.needsUpdate = true;
  }

  /* Orbs */
  glScene.traverse(o => {
    if (o.userData.orb) {
      o.rotation.x = t * 0.22;
      o.rotation.y = t * 0.15;
      o.position.y = o.userData.baseY + Math.sin(t * 0.35) * 0.35;
    }
  });

  /* Render */
  glRenderer.render(glScene, camera);
  cssRenderer.render(cssScene, camera);
}

/* ── Go ── */
init();
