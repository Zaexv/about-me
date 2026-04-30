/**
 * 3D Museum — Interactive Project Showcase
 *
 * Three.js particle atmosphere with HTML room overlays.
 * Each room has themed colors, sparkle particles, and floating shapes.
 *
 * Architecture:
 *   - Canvas (z-index 1): Three.js scene with particles, lights, shapes
 *   - HTML   (z-index 10): Room content overlays (pointer-events: none)
 *   - Nav    (z-index 200): Navigation controls
 *
 * @author Eduardo Pertierra Puche
 * @version 2.0.0
 */

const ROOMS = [
  { name: 'Entrance',              color: [0.45, 0.50, 0.95], fog: 0x020208, light: 0x6366f1, flash: 'rgba(99,102,241,0.2)' },
  { name: 'World of Promptcraft',  color: [0.98, 0.57, 0.24], fog: 0x0a0500, light: 0xff6622, flash: 'rgba(251,146,60,0.2)' },
  { name: 'SpAIce — Space Odyssey', color: [0.39, 0.40, 0.95], fog: 0x02020c, light: 0x6366f1, flash: 'rgba(99,102,241,0.2)' },
  { name: 'AI Digital Twin',       color: [0.29, 0.77, 0.37], fog: 0x010805, light: 0x22c55e, flash: 'rgba(34,197,94,0.2)' },
  { name: 'PlanItNow',             color: [0.66, 0.33, 0.97], fog: 0x080210, light: 0xa855f7, flash: 'rgba(168,85,247,0.2)' }
];

const SPACING = 30;
const COUNT = ROOMS.length;
let cur = 0;
let busy = false;
let camZ = null;

/* Three globals */
let camera, renderer, scene, dustGeo, sparkGeo, sparkMat;
const clock = new THREE.Clock();

/* DOM */
const canvas   = document.getElementById('c3d');
const flashEl  = document.getElementById('flash');
const loader   = document.getElementById('loader');
const labelEl  = document.getElementById('rlabel');
const prevBtn  = document.getElementById('prev');
const nextBtn  = document.getElementById('next');
const dotsBox  = document.getElementById('dots');
const roomEls  = document.querySelectorAll('.room');

/* ═══════════ INIT ═══════════ */
function init() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  camera = new THREE.PerspectiveCamera(65, w / h, 0.1, 600);
  camera.position.set(0, 0, 0);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(ROOMS[0].fog, 0.012);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x050505, 1);

  buildParticles();
  buildSparkles();
  buildLights();
  buildShapes();
  buildNav();

  window.addEventListener('resize', onResize);
  document.addEventListener('keydown', onKey);

  setRoom(0, false);
  setTimeout(() => loader.classList.add('gone'), 900);
  tick();
}

/* Soft circular sprite (matches main-page radial-gradient particles) */
function createDotTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.15, 'rgba(255,255,255,0.8)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.25)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* ═══════════ PARTICLES ═══════════ */
function buildParticles() {
  const N = 3000;
  dustGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const totalZ = COUNT * SPACING + 40;
  const c = ROOMS[0].color;

  for (let i = 0; i < N; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 50;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 2] = 20 - Math.random() * totalZ;
    col[i * 3]     = c[0];
    col[i * 3 + 1] = c[1];
    col[i * 3 + 2] = c[2];
  }

  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dustGeo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.25,
    map: createDotTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  scene.add(new THREE.Points(dustGeo, mat));
}

function tintParticles(idx) {
  const c = ROOMS[idx].color;
  const ca = dustGeo.attributes.color;
  const pa = dustGeo.attributes.position;
  const rz = -idx * SPACING;
  for (let i = 0; i < ca.count; i++) {
    const d = Math.abs(pa.getZ(i) - rz);
    if (d < SPACING * 0.65) {
      ca.setXYZ(i, c[0], c[1], c[2]);
    }
  }
  ca.needsUpdate = true;

  if (sparkGeo) {
    const sc = sparkGeo.attributes.aColor;
    const sp = sparkGeo.attributes.position;
    for (let i = 0; i < sc.count; i++) {
      const d = Math.abs(sp.getZ(i) - rz);
      if (d < SPACING * 0.65) {
        sc.setXYZ(i, c[0], c[1], c[2]);
      }
    }
    sc.needsUpdate = true;
  }
}

/* ═══════════ SPARKLES (twinkle shader) ═══════════ */
function buildSparkles() {
  const N = 250;
  const totalZ = COUNT * SPACING + 40;
  const positions = new Float32Array(N * 3);
  const sizes = new Float32Array(N);
  const phases = new Float32Array(N);
  const colors = new Float32Array(N * 3);
  const c = ROOMS[0].color;

  for (let i = 0; i < N; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 55;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 32;
    positions[i * 3 + 2] = 20 - Math.random() * totalZ;
    sizes[i] = 0.4 + Math.random() * 2.2;
    phases[i] = Math.random() * Math.PI * 2;
    colors[i * 3]     = c[0];
    colors[i * 3 + 1] = c[1];
    colors[i * 3 + 2] = c[2];
  }

  sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  sparkGeo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
  sparkGeo.setAttribute('aPhase',   new THREE.BufferAttribute(phases, 1));
  sparkGeo.setAttribute('aColor',   new THREE.BufferAttribute(colors, 3));

  sparkMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      attribute float aSize;
      attribute float aPhase;
      attribute vec3 aColor;
      uniform float uTime;
      varying float vAlpha;
      varying vec3 vColor;
      void main() {
        vColor = aColor;
        float twinkle = sin(uTime * 1.8 + aPhase) * 0.5 + 0.5;
        twinkle = pow(twinkle, 4.0);
        vAlpha = 0.05 + 0.95 * twinkle;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (0.3 + 0.7 * twinkle) * (200.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float core = exp(-d * d * 28.0);
        float glow = exp(-d * d * 5.0);
        float b = core * 0.7 + glow * 0.3;
        gl_FragColor = vec4(vColor * (0.5 + b * 0.5), vAlpha * b);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  scene.add(new THREE.Points(sparkGeo, sparkMat));
}

/* ═══════════ LIGHTS ═══════════ */
function buildLights() {
  scene.add(new THREE.AmbientLight(0x111111, 0.3));

  ROOMS.forEach((r, i) => {
    const z = -i * SPACING;
    const p = new THREE.PointLight(r.light, 1.2, 35, 1.5);
    p.position.set(0, 3, z);
    scene.add(p);

    const p2 = new THREE.PointLight(r.light, 0.4, 20, 2);
    p2.position.set(-8, -2, z + 5);
    scene.add(p2);
  });
}

/* ═══════════ FLOATING SHAPES ═══════════ */
function buildShapes() {
  ROOMS.forEach((r, i) => {
    const z = -i * SPACING;

    /* Wireframe icosahedron */
    const geo = new THREE.IcosahedronGeometry(1.8, 1);
    const mat = new THREE.MeshBasicMaterial({
      color: r.light, wireframe: true,
      transparent: true, opacity: 0.08
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(12, 4, z - 5);
    m.userData = { shape: true, base: m.position.clone(), speed: 0.15 + i * 0.05 };
    scene.add(m);

    /* Second smaller shape */
    const geo2 = new THREE.OctahedronGeometry(1, 0);
    const mat2 = new THREE.MeshBasicMaterial({
      color: r.light, wireframe: true,
      transparent: true, opacity: 0.06
    });
    const m2 = new THREE.Mesh(geo2, mat2);
    m2.position.set(-10, -3, z + 3);
    m2.userData = { shape: true, base: m2.position.clone(), speed: 0.1 + i * 0.03 };
    scene.add(m2);
  });
}

/* ═══════════ NAVIGATION ═══════════ */
function buildNav() {
  ROOMS.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot';
    d.addEventListener('click', () => goTo(i));
    dotsBox.appendChild(d);
  });
  prevBtn.addEventListener('click', () => goTo(cur - 1));
  nextBtn.addEventListener('click', () => goTo(cur + 1));
}

function goTo(idx) {
  if (busy || idx < 0 || idx >= COUNT || idx === cur) return;
  busy = true;

  flashEl.style.background = ROOMS[idx].flash;
  flashEl.classList.remove('on');
  void flashEl.offsetWidth;
  flashEl.classList.add('on');

  setTimeout(() => {
    setRoom(idx, true);
    busy = false;
  }, 80);
}

function setRoom(idx, animated) {
  cur = idx;
  const tz = -idx * SPACING;

  if (animated) {
    camZ = tz;
  } else {
    camera.position.z = tz;
  }

  /* Toggle room overlays */
  roomEls.forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.idx, 10) === idx);
  });

  /* Nav */
  dotsBox.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('on', i === idx));
  prevBtn.disabled = idx === 0;
  nextBtn.disabled = idx === COUNT - 1;
  labelEl.textContent = ROOMS[idx].name;

  /* Scene mood */
  scene.fog.color.set(ROOMS[idx].fog);
  renderer.setClearColor(ROOMS[idx].fog, 1);
  tintParticles(idx);
}

function onKey(e) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(cur + 1);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(cur - 1);
}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

/* ═══════════ ANIMATION ═══════════ */
function tick() {
  requestAnimationFrame(tick);
  const t = clock.getElapsedTime();

  /* Camera lerp */
  if (camZ !== null) {
    camera.position.z += (camZ - camera.position.z) * 0.055;
    if (Math.abs(camZ - camera.position.z) < 0.02) {
      camera.position.z = camZ;
      camZ = null;
    }
  }

  /* Gentle sway */
  camera.position.x = Math.sin(t * 0.1) * 0.5;
  camera.position.y = Math.sin(t * 0.15) * 0.3;
  camera.lookAt(camera.position.x, 0, camera.position.z - 20);

  /* Drift particles */
  if (dustGeo) {
    const pa = dustGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      let y = pa.getY(i);
      y += Math.sin(t * 0.3 + i * 0.05) * 0.0015;
      if (y > 15) y = -15;
      if (y < -15) y = 15;
      pa.setY(i, y);
    }
    pa.needsUpdate = true;
  }

  /* Rotate shapes */
  scene.traverse(o => {
    if (o.userData.shape) {
      const s = o.userData.speed;
      o.rotation.x = t * s;
      o.rotation.y = t * s * 0.7;
      o.position.y = o.userData.base.y + Math.sin(t * s * 2) * 0.4;
    }
  });

  /* Sparkle twinkle */
  if (sparkMat) sparkMat.uniforms.uTime.value = t;

  renderer.render(scene, camera);
}

/* GO */
init();
