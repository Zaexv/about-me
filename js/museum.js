/* ═══════════════════════════════════════════
   3D Museum — Dual Renderer (WebGL + CSS3D)
   Videos embedded as 3D screens in the scene
   ═══════════════════════════════════════════ */

/* ── Room config ── */
const ROOMS = [
  {
    name: 'World of Promptcraft',
    videoId: 'TdmNPD9wOhA',
    fog: 0x0a0500,
    accent: new THREE.Color(0xfb923c),
    particleColor: new THREE.Color(0xfb923c),
    spotColor: 0xff6622,
    wallColor: 0x1a0800
  },
  {
    name: 'SpAIce — Space Odyssey',
    videoId: 'ZdC-fMK62Fg',
    fog: 0x02020c,
    accent: new THREE.Color(0x818cf8),
    particleColor: new THREE.Color(0x6366f1),
    spotColor: 0x6366f1,
    wallColor: 0x0a0a1a
  },
  {
    name: 'AI Digital Twin',
    videoId: null,
    fog: 0x010805,
    accent: new THREE.Color(0x22c55e),
    particleColor: new THREE.Color(0x4ade80),
    spotColor: 0x22c55e,
    wallColor: 0x081a10
  },
  {
    name: 'PlanItNow',
    videoId: null,
    fog: 0x080210,
    accent: new THREE.Color(0xa855f7),
    particleColor: new THREE.Color(0xc084fc),
    spotColor: 0xa855f7,
    wallColor: 0x140828
  }
];

const ROOM_SPACING = 60;
const ROOM_COUNT = ROOMS.length;
let currentRoom = 0;
let isTransitioning = false;

/* ── Three.js globals ── */
let camera, webglRenderer, cssRenderer;
let scene, cssScene;
let dustParticles, dustGeo;
let ambientLight;
const spotlights = [];
const clock = new THREE.Clock();

/* ── DOM refs ── */
const canvas = document.getElementById('museum-canvas');
const css3dContainer = document.getElementById('css3d-container');
const flash = document.getElementById('room-flash');
const loadingScreen = document.getElementById('loading-screen');
const roomLabel = document.getElementById('room-label');
const navPrev = document.getElementById('nav-prev');
const navNext = document.getElementById('nav-next');
const navDots = document.getElementById('nav-dots');
const roomInfos = document.querySelectorAll('.room-info');

/* ════════════════════════════
   INIT
   ════════════════════════════ */
function init() {
  /* Camera */
  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 4, 18);
  camera.lookAt(0, 3, 0);

  /* ── WebGL scene ── */
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(ROOMS[0].fog, 0.018);

  webglRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  webglRenderer.setSize(window.innerWidth, window.innerHeight);
  webglRenderer.setClearColor(0x000000, 0);
  webglRenderer.shadowMap.enabled = true;

  /* ── CSS3D scene ── */
  cssScene = new THREE.Scene();
  cssRenderer = new THREE.CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.style.position = 'fixed';
  cssRenderer.domElement.style.top = '0';
  cssRenderer.domElement.style.left = '0';
  cssRenderer.domElement.style.pointerEvents = 'none';
  css3dContainer.appendChild(cssRenderer.domElement);

  /* Build */
  buildLighting();
  buildRooms();
  buildDust();
  buildNav();

  /* Events */
  window.addEventListener('resize', onResize);
  document.addEventListener('keydown', onKey);

  /* Start */
  setActiveRoom(0, false);

  setTimeout(() => {
    loadingScreen.classList.add('hidden');
  }, 1200);

  animate();
}

/* ════════════════════════════
   LIGHTING
   ════════════════════════════ */
function buildLighting() {
  ambientLight = new THREE.AmbientLight(0x111111, 0.6);
  scene.add(ambientLight);

  ROOMS.forEach((room, i) => {
    const z = -i * ROOM_SPACING;

    /* Main spot from above-front, pointing at the screen area */
    const spot = new THREE.SpotLight(room.spotColor, 1.8, 80, Math.PI / 4, 0.5, 1.2);
    spot.position.set(0, 14, z + 10);
    spot.target.position.set(0, 3, z - 5);
    scene.add(spot);
    scene.add(spot.target);
    spotlights.push(spot);

    /* Accent point light near ground */
    const point = new THREE.PointLight(room.spotColor, 0.5, 30, 2);
    point.position.set(-8, 1, z);
    scene.add(point);
  });
}

/* ════════════════════════════
   ROOMS — geometry + video screens
   ════════════════════════════ */
function buildRooms() {
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x080808,
    roughness: 0.8,
    metalness: 0.3
  });
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 1,
    metalness: 0
  });

  ROOMS.forEach((room, i) => {
    const z = -i * ROOM_SPACING;
    const wallMat = new THREE.MeshStandardMaterial({ color: room.wallColor, roughness: 0.9 });

    /* Floor */
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 60), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, z);
    floor.receiveShadow = true;
    scene.add(floor);

    /* Ceiling */
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(50, 60), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 16, z);
    scene.add(ceiling);

    /* Left wall */
    const lWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 16), wallMat);
    lWall.rotation.y = Math.PI / 2;
    lWall.position.set(-25, 8, z);
    scene.add(lWall);

    /* Right wall */
    const rWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 16), wallMat);
    rWall.rotation.y = -Math.PI / 2;
    rWall.position.set(25, 8, z);
    scene.add(rWall);

    /* Back wall — build around screen hole if video exists */
    if (room.videoId) {
      buildScreenWall(room, z, wallMat);
      buildVideoScreen(room, z);
    } else {
      /* Solid back wall */
      const bWall = new THREE.Mesh(new THREE.PlaneGeometry(50, 16), wallMat);
      bWall.position.set(0, 8, z - 30);
      scene.add(bWall);

      /* Glowing orb for non-video rooms */
      buildGlowOrb(room, z);
    }

    /* Screen frame glow (floor line) */
    const glowLine = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 0.05),
      new THREE.MeshBasicMaterial({ color: room.spotColor, transparent: true, opacity: 0.4 })
    );
    glowLine.rotation.x = -Math.PI / 2;
    glowLine.position.set(0, 0.01, z - 10);
    scene.add(glowLine);
  });
}

/* Build back wall with a rectangular hole for the video screen */
function buildScreenWall(room, z, wallMat) {
  const screenW = 19.2;
  const screenH = 10.8;
  const screenY = 6.5;
  const wallW = 50;
  const wallH = 16;

  /* We build 4 wall segments around the screen opening */
  /* Bottom strip */
  const bH = screenY - screenH / 2;
  if (bH > 0) {
    const bottom = new THREE.Mesh(new THREE.PlaneGeometry(wallW, bH), wallMat);
    bottom.position.set(0, bH / 2, z - 30);
    scene.add(bottom);
  }

  /* Top strip */
  const topY = screenY + screenH / 2;
  const tH = wallH - topY;
  if (tH > 0) {
    const top = new THREE.Mesh(new THREE.PlaneGeometry(wallW, tH), wallMat);
    top.position.set(0, topY + tH / 2, z - 30);
    scene.add(top);
  }

  /* Left strip */
  const lW = (wallW - screenW) / 2;
  const mH = screenH;
  const left = new THREE.Mesh(new THREE.PlaneGeometry(lW, mH), wallMat);
  left.position.set(-(screenW / 2 + lW / 2), screenY, z - 30);
  scene.add(left);

  /* Right strip */
  const right = new THREE.Mesh(new THREE.PlaneGeometry(lW, mH), wallMat);
  right.position.set(screenW / 2 + lW / 2, screenY, z - 30);
  scene.add(right);

  /* Screen frame (thin emissive border) */
  const frameMat = new THREE.MeshBasicMaterial({ color: room.spotColor, transparent: true, opacity: 0.3 });
  const frameThick = 0.15;
  const topFrame = new THREE.Mesh(new THREE.BoxGeometry(screenW + 0.4, frameThick, 0.1), frameMat);
  topFrame.position.set(0, screenY + screenH / 2 + frameThick / 2, z - 29.95);
  scene.add(topFrame);

  const botFrame = new THREE.Mesh(new THREE.BoxGeometry(screenW + 0.4, frameThick, 0.1), frameMat);
  botFrame.position.set(0, screenY - screenH / 2 - frameThick / 2, z - 29.95);
  scene.add(botFrame);

  const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThick, screenH + 0.4, 0.1), frameMat);
  leftFrame.position.set(-screenW / 2 - frameThick / 2, screenY, z - 29.95);
  scene.add(leftFrame);

  const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThick, screenH + 0.4, 0.1), frameMat);
  rightFrame.position.set(screenW / 2 + frameThick / 2, screenY, z - 29.95);
  scene.add(rightFrame);
}

/* Place a YouTube iframe as a CSS3DObject at the screen position */
function buildVideoScreen(room, z) {
  const screenW = 19.2;
  const screenH = 10.8;
  const screenY = 6.5;

  /* Create iframe element */
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${room.videoId}?autoplay=1&mute=1&loop=1&playlist=${room.videoId}&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0&vq=hd720`;
  iframe.style.width = '960px';
  iframe.style.height = '540px';
  iframe.style.border = 'none';
  iframe.style.pointerEvents = 'none';
  iframe.allow = 'autoplay; encrypted-media';

  /* Wrap in a container div with a shield */
  const container = document.createElement('div');
  container.style.width = '960px';
  container.style.height = '540px';
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.appendChild(iframe);

  /* Shield to block interaction */
  const shield = document.createElement('div');
  shield.style.position = 'absolute';
  shield.style.inset = '0';
  shield.style.zIndex = '1';
  container.appendChild(shield);

  /* Create CSS3DObject */
  const cssObject = new THREE.CSS3DObject(container);
  /* Scale: 960px iframe → 19.2 three.js units (1px = 0.02 units) */
  cssObject.position.set(0, screenY, z - 29.9);
  cssObject.scale.set(0.02, 0.02, 0.02);
  cssScene.add(cssObject);

  /* Occluder mesh in WebGL scene — writes to depth buffer only, */
  /* so WebGL geometry in front of it occludes the CSS3D content, */
  /* but where there's nothing in front, the CSS3D (video) shows through. */
  const occluderMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    colorWrite: false,
    side: THREE.DoubleSide
  });
  const occluder = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), occluderMat);
  occluder.position.set(0, screenY, z - 29.9);
  scene.add(occluder);
}

/* Glowing wireframe orb for rooms without video */
function buildGlowOrb(room, z) {
  const geo = new THREE.IcosahedronGeometry(3, 1);
  const mat = new THREE.MeshBasicMaterial({
    color: room.spotColor,
    wireframe: true,
    transparent: true,
    opacity: 0.2
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.position.set(8, 6, z - 15);
  orb.userData.isOrb = true;
  orb.userData.baseY = 6;
  scene.add(orb);

  /* Inner solid glow */
  const innerGeo = new THREE.IcosahedronGeometry(1.5, 2);
  const innerMat = new THREE.MeshBasicMaterial({
    color: room.spotColor,
    transparent: true,
    opacity: 0.08
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.position.copy(orb.position);
  inner.userData.isOrb = true;
  inner.userData.baseY = 6;
  scene.add(inner);
}

/* ════════════════════════════
   DUST PARTICLES
   ════════════════════════════ */
function buildDust() {
  const count = 2500;
  dustGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const totalDepth = ROOM_COUNT * ROOM_SPACING;
  const baseColor = ROOMS[0].particleColor;

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = Math.random() * 14;
    positions[i * 3 + 2] = -Math.random() * totalDepth;
    colors[i * 3] = baseColor.r;
    colors[i * 3 + 1] = baseColor.g;
    colors[i * 3 + 2] = baseColor.b;
    sizes[i] = Math.random() * 2 + 0.5;
  }

  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  dustGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  dustGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const dustMat = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  dustParticles = new THREE.Points(dustGeo, dustMat);
  scene.add(dustParticles);
}

function updateDustColors(roomIndex) {
  const target = ROOMS[roomIndex].particleColor;
  const colorsAttr = dustGeo.attributes.color;
  const count = colorsAttr.count;
  for (let i = 0; i < count; i++) {
    const cz = dustGeo.attributes.position.getZ(i);
    const roomZ = -roomIndex * ROOM_SPACING;
    const dist = Math.abs(cz - roomZ);
    if (dist < ROOM_SPACING * 0.7) {
      colorsAttr.setXYZ(i, target.r, target.g, target.b);
    }
  }
  colorsAttr.needsUpdate = true;
}

/* ════════════════════════════
   NAVIGATION
   ════════════════════════════ */
function buildNav() {
  ROOMS.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'nav-dot';
    dot.addEventListener('click', () => goToRoom(i));
    navDots.appendChild(dot);
  });

  navPrev.addEventListener('click', () => goToRoom(currentRoom - 1));
  navNext.addEventListener('click', () => goToRoom(currentRoom + 1));
}

function goToRoom(index) {
  if (isTransitioning || index < 0 || index >= ROOM_COUNT || index === currentRoom) return;
  isTransitioning = true;

  /* Flash */
  flash.classList.remove('flash');
  void flash.offsetWidth;
  flash.classList.add('flash');

  /* Slight delay so flash covers the cut */
  setTimeout(() => {
    setActiveRoom(index, true);
    isTransitioning = false;
  }, 120);
}

function setActiveRoom(index, animated) {
  currentRoom = index;
  const targetZ = -index * ROOM_SPACING + 18;

  if (animated) {
    animateCamera(targetZ);
  } else {
    camera.position.z = targetZ;
  }

  /* Update overlay panels */
  roomInfos.forEach((el) => {
    const r = parseInt(el.dataset.room, 10);
    el.classList.toggle('active', r === index);
  });

  /* Dots */
  const dots = navDots.querySelectorAll('.nav-dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === index));

  /* Arrows */
  navPrev.disabled = index === 0;
  navNext.disabled = index === ROOM_COUNT - 1;

  /* Label */
  roomLabel.textContent = ROOMS[index].name;

  /* Fog */
  scene.fog.color.set(ROOMS[index].fog);

  /* Dust */
  updateDustColors(index);
}

/* Smooth camera slide */
let cameraTarget = null;
function animateCamera(targetZ) {
  cameraTarget = targetZ;
}

function onKey(e) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToRoom(currentRoom + 1);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToRoom(currentRoom - 1);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  webglRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
}

/* ════════════════════════════
   ANIMATION LOOP
   ════════════════════════════ */
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  /* Camera lerp */
  if (cameraTarget !== null) {
    camera.position.z += (cameraTarget - camera.position.z) * 0.06;
    if (Math.abs(cameraTarget - camera.position.z) < 0.05) {
      camera.position.z = cameraTarget;
      cameraTarget = null;
    }
  }

  /* Gentle camera sway */
  camera.position.x = Math.sin(elapsed * 0.15) * 0.4;
  camera.position.y = 4 + Math.sin(elapsed * 0.2) * 0.2;

  /* Animate dust */
  if (dustParticles) {
    const pos = dustGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      y += Math.sin(elapsed + i) * 0.003;
      if (y > 14) y = 0;
      if (y < 0) y = 14;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
    dustParticles.rotation.y = elapsed * 0.01;
  }

  /* Animate orbs */
  scene.traverse((obj) => {
    if (obj.userData.isOrb) {
      obj.rotation.x = elapsed * 0.3;
      obj.rotation.y = elapsed * 0.2;
      obj.position.y = obj.userData.baseY + Math.sin(elapsed * 0.5) * 0.5;
    }
  });

  /* Render both layers */
  webglRenderer.render(scene, camera);
  cssRenderer.render(cssScene, camera);
}

/* ── GO ── */
init();
