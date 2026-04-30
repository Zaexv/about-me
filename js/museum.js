/**
 * 3D Museum — Project Showcase
 * 4 dramatic rooms, each with a unique color theme and particle system.
 * Click-through navigation on a linear camera rail.
 */

(function () {
  'use strict';

  const ROOM_COUNT = 4;
  const ROOM_DEPTH = 24;
  const ROOM_WIDTH = 18;
  const ROOM_HEIGHT = 9;
  const CAMERA_LERP = 0.03;

  const ROOMS = [
    { name: 'World of Promptcraft', color: 0xfb923c, accent: 0xef4444, fog: 0x0a0500 },
    { name: 'SpAIce — Space Odyssey', color: 0x6366f1, accent: 0x38bdf8, fog: 0x020208 },
    { name: 'AI Digital Twin',       color: 0x22c55e, accent: 0x4ade80, fog: 0x010805 },
    { name: 'PlanItNow',             color: 0xa855f7, accent: 0xc084fc, fog: 0x080210 },
  ];

  let currentRoom = 0;
  let targetRoom = 0;

  let scene, camera, renderer, clock;
  const spotlights = [];
  let dustPositions;
  let dustParticles;
  let targetFogColor, currentFogColor;

  function cameraPos(i) { return new THREE.Vector3(0, 3, -i * ROOM_DEPTH + 10); }

  /* ── Init ── */
  function init() {
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(ROOMS[0].fog);
    scene.fog = new THREE.Fog(ROOMS[0].fog, 12, 50);
    targetFogColor = new THREE.Color(ROOMS[0].fog);
    currentFogColor = new THREE.Color(ROOMS[0].fog);

    camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);
    camera.position.copy(cameraPos(0));

    const canvas = document.getElementById('museum-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    buildMuseum();
    buildDust();
    setupNav();
    setActiveRoom(0);

    addEventListener('resize', onResize);
    setTimeout(() => {
      const ls = document.getElementById('loading-screen');
      if (ls) ls.classList.add('hidden');
    }, 600);

    animate();
  }

  /* ── Museum geometry ── */
  function buildMuseum() {
    scene.add(new THREE.AmbientLight(0x111122, 0.25));

    const floorMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.8, metalness: 0.2 });
    const wallMat  = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.95, metalness: 0.05 });

    for (let i = 0; i < ROOM_COUNT; i++) {
      const z = -i * ROOM_DEPTH;
      const rm = ROOMS[i];
      const halfW = ROOM_WIDTH / 2;
      const halfD = ROOM_DEPTH / 2;

      // Floor
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, 0, z);
      floor.receiveShadow = true;
      scene.add(floor);

      // Ceiling
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH), wallMat);
      ceil.rotation.x = Math.PI / 2;
      ceil.position.set(0, ROOM_HEIGHT, z);
      scene.add(ceil);

      // Left wall
      const lw = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT), wallMat);
      lw.rotation.y = Math.PI / 2;
      lw.position.set(-halfW, ROOM_HEIGHT / 2, z);
      scene.add(lw);

      // Right wall
      const rw = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT), wallMat);
      rw.rotation.y = -Math.PI / 2;
      rw.position.set(halfW, ROOM_HEIGHT / 2, z);
      scene.add(rw);

      // Back wall
      const bw = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT), wallMat);
      bw.position.set(0, ROOM_HEIGHT / 2, z - halfD);
      scene.add(bw);

      // Accent floor stripe
      const stripeMat = new THREE.MeshBasicMaterial({ color: rm.color, transparent: true, opacity: 0.12 });
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.4, ROOM_DEPTH), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.01, z);
      scene.add(stripe);

      // Wall accent strips
      const wsMat = new THREE.MeshBasicMaterial({ color: rm.color, transparent: true, opacity: 0.2 });
      const wsL = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_DEPTH, 0.08), wsMat);
      wsL.rotation.y = Math.PI / 2;
      wsL.position.set(-halfW + 0.01, 2, z);
      scene.add(wsL);

      const wsR = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_DEPTH, 0.08), wsMat);
      wsR.rotation.y = -Math.PI / 2;
      wsR.position.set(halfW - 0.01, 2, z);
      scene.add(wsR);

      // Main spotlight
      const spot = new THREE.SpotLight(rm.color, 0.8, 35, Math.PI / 4, 0.6, 1);
      spot.position.set(0, ROOM_HEIGHT - 0.5, z + 4);
      spot.target.position.set(0, 0, z - 4);
      spot.castShadow = true;
      scene.add(spot);
      scene.add(spot.target);
      spotlights.push(spot);

      // Accent point lights
      const pl = new THREE.PointLight(rm.accent, 0.2, 18);
      pl.position.set(-halfW + 1, ROOM_HEIGHT - 1.5, z);
      scene.add(pl);
      const pr = new THREE.PointLight(rm.accent, 0.2, 18);
      pr.position.set(halfW - 1, ROOM_HEIGHT - 1.5, z);
      scene.add(pr);

      // Doorway
      if (i < ROOM_COUNT - 1) {
        const fMat = new THREE.MeshBasicMaterial({ color: rm.color, transparent: true, opacity: 0.25 });
        const dz = z - halfD;
        const top = new THREE.Mesh(new THREE.BoxGeometry(5, 0.12, 0.12), fMat);
        top.position.set(0, 7, dz);
        scene.add(top);
        const dl = new THREE.Mesh(new THREE.BoxGeometry(0.12, 7, 0.12), fMat);
        dl.position.set(-2.5, 3.5, dz);
        scene.add(dl);
        const dr = new THREE.Mesh(new THREE.BoxGeometry(0.12, 7, 0.12), fMat);
        dr.position.set(2.5, 3.5, dz);
        scene.add(dr);
      }
    }
  }

  /* ── Dust particles ── */
  function buildDust() {
    const count = 600;
    dustPositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const totalZ = ROOM_COUNT * ROOM_DEPTH;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      dustPositions[i3]     = (Math.random() - 0.5) * ROOM_WIDTH * 0.85;
      dustPositions[i3 + 1] = Math.random() * ROOM_HEIGHT;
      dustPositions[i3 + 2] = -Math.random() * totalZ;

      const roomIdx = Math.min(Math.floor(-dustPositions[i3 + 2] / ROOM_DEPTH), ROOM_COUNT - 1);
      const c = new THREE.Color(ROOMS[roomIdx].color);
      colors[i3]     = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.06,
      transparent: true,
      opacity: 0.5,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    dustParticles = new THREE.Points(geo, mat);
    scene.add(dustParticles);
  }

  /* ── Navigation ── */
  function setupNav() {
    const dots = document.getElementById('nav-dots');
    for (let i = 0; i < ROOM_COUNT; i++) {
      const dot = document.createElement('div');
      dot.className = 'nav-dot';
      dot.dataset.room = i;
      dot.addEventListener('click', () => goToRoom(i));
      dots.appendChild(dot);
    }

    document.getElementById('nav-prev').addEventListener('click', () => goToRoom(currentRoom - 1));
    document.getElementById('nav-next').addEventListener('click', () => goToRoom(currentRoom + 1));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goToRoom(currentRoom + 1); }
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); goToRoom(currentRoom - 1); }
    });
  }

  function goToRoom(idx) {
    if (idx < 0 || idx >= ROOM_COUNT || idx === currentRoom) return;
    targetRoom = idx;
    currentRoom = idx;
    targetFogColor = new THREE.Color(ROOMS[idx].fog);

    // Flash transition
    const flash = document.getElementById('room-flash');
    flash.style.background = 'radial-gradient(ellipse at center, ' + new THREE.Color(ROOMS[idx].color).getStyle() + ', transparent 70%)';
    flash.classList.remove('flash');
    void flash.offsetWidth;
    flash.classList.add('flash');

    setActiveRoom(idx);
  }

  function setActiveRoom(idx) {
    document.querySelectorAll('.room-overlay').forEach((el) => el.classList.remove('active'));
    const active = document.querySelector('.room-overlay[data-room="' + idx + '"]');
    if (active) active.classList.add('active');

    document.querySelectorAll('.nav-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
    document.getElementById('nav-prev').disabled = (idx === 0);
    document.getElementById('nav-next').disabled = (idx === ROOM_COUNT - 1);
    document.getElementById('room-label').textContent = ROOMS[idx].name;
  }

  /* ── Resize ── */
  function onResize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }

  /* ── Animation loop ── */
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Camera lerp
    const target = cameraPos(targetRoom);
    camera.position.lerp(target, CAMERA_LERP);
    camera.lookAt(camera.position.x, camera.position.y * 0.7, camera.position.z - 12);

    // Fog color transition
    currentFogColor.lerp(targetFogColor, 0.02);
    scene.fog.color.copy(currentFogColor);
    scene.background.copy(currentFogColor);

    // Dust float
    for (let i = 0; i < dustPositions.length; i += 3) {
      dustPositions[i]     += Math.sin(t * 0.3 + i) * 0.0008;
      dustPositions[i + 1] += Math.cos(t * 0.2 + i) * 0.0004;
    }
    dustParticles.geometry.attributes.position.needsUpdate = true;

    // Spotlight pulse
    for (let s = 0; s < spotlights.length; s++) {
      spotlights[s].intensity = 0.7 + Math.sin(t * 0.4 + s * 1.5) * 0.25;
    }

    renderer.render(scene, camera);
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
