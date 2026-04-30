/**
 * 3D Museum Portfolio
 * Click-through gallery with 6 rooms on a linear camera rail.
 * Uses Three.js r128 (loaded via CDN).
 */

(function () {
  'use strict';

  /* ── Constants ── */
  const ROOM_COUNT = 6;
  const ROOM_DEPTH = 20;
  const ROOM_WIDTH = 16;
  const ROOM_HEIGHT = 8;
  const CAMERA_LERP_SPEED = 0.035;

  const ROOM_NAMES = [
    'Entrance', 'About', 'Experience', 'Projects', 'Cinema', 'Contact'
  ];

  /* ── State ── */
  let currentRoom = 0;
  let targetRoom = 0;
  let isAnimating = false;

  /* ── Three.js globals ── */
  let scene, camera, renderer, clock;
  let videoMesh;
  const spotlights = [];
  let dustParticles;

  /* ── Camera positions for each room ── */
  function getRoomCameraPos(index) {
    return new THREE.Vector3(0, 2, -index * ROOM_DEPTH + 8);
  }

  function getRoomLookAt(index) {
    return new THREE.Vector3(0, 2, -index * ROOM_DEPTH - 5);
  }

  /* ── Init ── */
  function init() {
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.Fog(0x050505, 15, 50);

    camera = new THREE.PerspectiveCamera(
      55, window.innerWidth / window.innerHeight, 0.1, 200
    );
    const startPos = getRoomCameraPos(0);
    camera.position.copy(startPos);
    const startLook = getRoomLookAt(0);
    camera.lookAt(startLook);

    const canvas = document.getElementById('museum-canvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    buildMuseum();
    buildDustParticles();
    setupNavigation();
    setActiveRoom(0);

    window.addEventListener('resize', onResize);

    // Hide loading screen
    setTimeout(function () {
      const ls = document.getElementById('loading-screen');
      if (ls) ls.classList.add('hidden');
    }, 800);

    animate();
  }

  /* ── Build Museum Geometry ── */
  function buildMuseum() {
    // Ambient light
    scene.add(new THREE.AmbientLight(0x222233, 0.3));

    // Floor material
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 0.7,
      metalness: 0.3,
    });

    // Wall material
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d0f,
      roughness: 0.9,
      metalness: 0.1,
    });

    // Accent stripe material
    const accentMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.15,
    });

    for (let i = 0; i < ROOM_COUNT; i++) {
      const zOffset = -i * ROOM_DEPTH;
      buildRoom(i, zOffset, floorMat, wallMat, accentMat);
    }
  }

  function buildRoom(index, zOff, floorMat, wallMat, accentMat) {
    const halfW = ROOM_WIDTH / 2;
    const halfD = ROOM_DEPTH / 2;

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH),
      floorMat
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, zOff);
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH),
      wallMat
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, ROOM_HEIGHT, zOff);
    scene.add(ceiling);

    // Left wall
    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT),
      wallMat
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-halfW, ROOM_HEIGHT / 2, zOff);
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT),
      wallMat
    );
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(halfW, ROOM_HEIGHT / 2, zOff);
    scene.add(rightWall);

    // Back wall (far end of room)
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT),
      wallMat
    );
    backWall.position.set(0, ROOM_HEIGHT / 2, zOff - halfD);
    scene.add(backWall);

    // Floor accent stripe
    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, ROOM_DEPTH),
      accentMat
    );
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(0, 0.01, zOff);
    scene.add(stripe);

    // Spotlight for each room
    const spot = new THREE.SpotLight(0x6366f1, 0.6, 30, Math.PI / 5, 0.5, 1);
    spot.position.set(0, ROOM_HEIGHT - 0.5, zOff + 2);
    spot.target.position.set(0, 0, zOff - 3);
    spot.castShadow = true;
    scene.add(spot);
    scene.add(spot.target);
    spotlights.push(spot);

    // Side accent lights
    const pointL = new THREE.PointLight(0x38bdf8, 0.15, 15);
    pointL.position.set(-halfW + 0.5, ROOM_HEIGHT - 1, zOff);
    scene.add(pointL);

    const pointR = new THREE.PointLight(0x818cf8, 0.15, 15);
    pointR.position.set(halfW - 0.5, ROOM_HEIGHT - 1, zOff);
    scene.add(pointR);

    // Doorway frames between rooms
    if (index < ROOM_COUNT - 1) {
      buildDoorway(zOff - halfD, accentMat);
    }

    // Cinema room: add video screen
    if (index === 4) {
      buildCinemaScreen(zOff);
    }

    // Room-specific decorative frames
    buildWallFrames(index, zOff, halfW);
  }

  function buildDoorway(zPos, _accentMat) {
    const doorW = 4;
    const doorH = 6;
    const frameThick = 0.15;

    const frameMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.25,
    });

    // Top bar
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(doorW + frameThick * 2, frameThick, frameThick),
      frameMat
    );
    top.position.set(0, doorH, zPos);
    scene.add(top);

    // Left post
    const left = new THREE.Mesh(
      new THREE.BoxGeometry(frameThick, doorH, frameThick),
      frameMat
    );
    left.position.set(-doorW / 2, doorH / 2, zPos);
    scene.add(left);

    // Right post
    const right = new THREE.Mesh(
      new THREE.BoxGeometry(frameThick, doorH, frameThick),
      frameMat
    );
    right.position.set(doorW / 2, doorH / 2, zPos);
    scene.add(right);
  }

  function buildCinemaScreen(zOff) {
    // Screen frame
    const frameMat = new THREE.MeshBasicMaterial({
      color: 0x1a1a2e,
    });
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(10.5, 6.2, 0.15),
      frameMat
    );
    frame.position.set(0, 3.5, zOff - 9);
    scene.add(frame);

    // Screen surface (video will be mapped here)
    const screenGeo = new THREE.PlaneGeometry(10, 5.625);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    videoMesh = new THREE.Mesh(screenGeo, screenMat);
    videoMesh.position.set(0, 3.5, zOff - 8.92);
    videoMesh.name = 'cinemaScreen';
    scene.add(videoMesh);

    // Projector-style spotlight
    const projector = new THREE.SpotLight(0xffffff, 0.4, 20, Math.PI / 6, 0.3, 1);
    projector.position.set(0, ROOM_HEIGHT - 0.5, zOff + 5);
    projector.target = videoMesh;
    scene.add(projector);
  }

  function buildWallFrames(roomIndex, zOff, halfW) {
    const frameMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.08,
    });

    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a1a,
    });

    // Place 2-3 decorative frames on walls per room
    let frameConfigs;
    if (roomIndex === 0) {
      // Entrance — minimal
      frameConfigs = [];
    } else if (roomIndex === 4 || roomIndex === 5) {
      // Cinema + Contact — minimal
      frameConfigs = [];
    } else {
      frameConfigs = [
        { x: -halfW + 0.08, y: 3.5, z: zOff - 3, w: 3, h: 2, rotY: Math.PI / 2 },
        { x: halfW - 0.08, y: 3.5, z: zOff + 3, w: 3, h: 2, rotY: -Math.PI / 2 },
        { x: -halfW + 0.08, y: 3.5, z: zOff + 5, w: 2.5, h: 1.8, rotY: Math.PI / 2 },
      ];
    }

    for (let f = 0; f < frameConfigs.length; f++) {
      const cfg = frameConfigs[f];
      // Frame border
      const border = new THREE.Mesh(
        new THREE.PlaneGeometry(cfg.w + 0.15, cfg.h + 0.15),
        frameMat
      );
      border.position.set(cfg.x, cfg.y, cfg.z);
      border.rotation.y = cfg.rotY;
      scene.add(border);

      // Inner dark panel
      const inner = new THREE.Mesh(
        new THREE.PlaneGeometry(cfg.w, cfg.h),
        innerMat
      );
      inner.position.set(
        cfg.x + (cfg.rotY > 0 ? 0.01 : -0.01),
        cfg.y,
        cfg.z
      );
      inner.rotation.y = cfg.rotY;
      scene.add(inner);
    }
  }

  /* ── Dust Particles ── */
  function buildDustParticles() {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const totalDepth = ROOM_COUNT * ROOM_DEPTH;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * ROOM_WIDTH * 0.8;
      positions[i3 + 1] = Math.random() * ROOM_HEIGHT;
      positions[i3 + 2] = -Math.random() * totalDepth;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x6366f1,
      size: 0.04,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    dustParticles = new THREE.Points(geo, mat);
    scene.add(dustParticles);
  }

  /* ── Navigation ── */
  function setupNavigation() {
    // Build dots
    const dotsContainer = document.getElementById('nav-dots');
    for (let i = 0; i < ROOM_COUNT; i++) {
      const dot = document.createElement('div');
      dot.className = 'nav-dot';
      dot.setAttribute('data-room', i);
      dot.addEventListener('click', onDotClick);
      dotsContainer.appendChild(dot);
    }

    document.getElementById('nav-prev').addEventListener('click', function () {
      goToRoom(currentRoom - 1);
    });
    document.getElementById('nav-next').addEventListener('click', function () {
      goToRoom(currentRoom + 1);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToRoom(currentRoom + 1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToRoom(currentRoom - 1);
      }
    });
  }

  function onDotClick(e) {
    const room = parseInt(e.target.getAttribute('data-room'), 10);
    goToRoom(room);
  }

  function goToRoom(index) {
    if (index < 0 || index >= ROOM_COUNT) return;
    if (index === currentRoom && !isAnimating) return;

    targetRoom = index;
    currentRoom = index;
    isAnimating = true;
    setActiveRoom(index);
  }

  function setActiveRoom(index) {
    // Update overlays
    const overlays = document.querySelectorAll('.room-overlay');
    for (let i = 0; i < overlays.length; i++) {
      overlays[i].classList.remove('active');
    }
    const active = document.querySelector('.room-overlay[data-room="' + index + '"]');
    if (active) active.classList.add('active');

    // Update dots
    const dots = document.querySelectorAll('.nav-dot');
    for (let d = 0; d < dots.length; d++) {
      dots[d].classList.toggle('active', d === index);
    }

    // Update arrows
    document.getElementById('nav-prev').disabled = (index === 0);
    document.getElementById('nav-next').disabled = (index === ROOM_COUNT - 1);

    // Update label
    document.getElementById('room-label').textContent = ROOM_NAMES[index];
  }

  /* ── Resize ── */
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /* ── Animation Loop ── */
  function animate() {
    requestAnimationFrame(animate);

    const targetPos = getRoomCameraPos(targetRoom);
    const targetLook = getRoomLookAt(targetRoom);

    // Smooth camera movement
    camera.position.lerp(targetPos, CAMERA_LERP_SPEED);
    const dist = camera.position.distanceTo(targetPos);
    if (dist < 0.05) {
      camera.position.copy(targetPos);
      isAnimating = false;
    }

    // Smooth look-at via a helper target
    camera.lookAt(
      camera.position.x + (targetLook.x - camera.position.x),
      camera.position.y + (targetLook.y - camera.position.y) * 0.5,
      camera.position.z - 10
    );

    // Animate dust
    if (dustParticles) {
      const positions = dustParticles.geometry.attributes.position.array;
      const time = clock.getElapsedTime();
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(time * 0.3 + i) * 0.001;
        positions[i + 1] += Math.cos(time * 0.2 + i) * 0.0005;
      }
      dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Pulse spotlights subtly
    const t = clock.getElapsedTime();
    for (let s = 0; s < spotlights.length; s++) {
      spotlights[s].intensity = 0.5 + Math.sin(t * 0.5 + s) * 0.15;
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
