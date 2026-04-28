/**
 * Interactive 3D Geodesic Network
 * A structured icosphere wireframe with floating orbital particles.
 * Mouse-reactive: sphere tilts toward cursor, particles repelled.
 * Zero per-frame allocations.
 */

(function () {
    const CONTAINER_ID = 'skills-tree-container';

    const SUBDIVISIONS = 3;
    const SPHERE_RADIUS = 3.2;
    const FLOAT_PARTICLES = 30;
    const MOUSE_RADIUS = 3.5;
    const MOUSE_TILT_STRENGTH = 0.4;

    let scene, camera, renderer;
    let sphereWire, sphereGlow, floatPoints;
    let floatPositions, floatBasePositions, floatSizes, floatColors;

    // Pre-allocated reusable objects (no per-frame GC)
    const _euler = new THREE.Euler();
    const _vec = new THREE.Vector3();
    const _mouseWorld = new THREE.Vector3(999, 999, 0);
    const _raycaster = new THREE.Vector3();
    const mouseNDC = { x: 0, y: 0 };
    let mouseActive = false;

    // Smooth lerp targets for mouse tilt
    let targetTiltX = 0, targetTiltY = 0;
    let currentTiltX = 0, currentTiltY = 0;

    const ACCENT = new THREE.Color(0x6366f1);
    const SKY = new THREE.Color(0x38bdf8);
    const LAVENDER = new THREE.Color(0xa5b4fc);
    const WHITE = new THREE.Color(0xe8e8e8);
    const PALETTE = [ACCENT, SKY, LAVENDER, WHITE];

    function init() {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;

        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) {
            requestAnimationFrame(init);
            return;
        }

        container.innerHTML = '';

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
        camera.position.z = 9;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        createGeodesicSphere();
        createFloatingParticles();

        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseleave', onMouseLeave);

        animate();
    }

    function createGeodesicSphere() {
        const geo = new THREE.IcosahedronGeometry(SPHERE_RADIUS, SUBDIVISIONS);

        const wireMat = new THREE.MeshBasicMaterial({
            color: ACCENT,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
        });
        sphereWire = new THREE.Mesh(geo, wireMat);
        scene.add(sphereWire);

        const glowGeo = new THREE.IcosahedronGeometry(SPHERE_RADIUS * 0.92, SUBDIVISIONS);
        const glowMat = new THREE.MeshBasicMaterial({
            color: SKY,
            transparent: true,
            opacity: 0.04,
            side: THREE.BackSide,
        });
        sphereGlow = new THREE.Mesh(glowGeo, glowMat);
        scene.add(sphereGlow);
    }

    function createFloatingParticles() {
        floatPositions = new Float32Array(FLOAT_PARTICLES * 3);
        floatBasePositions = new Float32Array(FLOAT_PARTICLES * 3);
        floatSizes = new Float32Array(FLOAT_PARTICLES);
        floatColors = new Float32Array(FLOAT_PARTICLES * 3);

        for (let i = 0; i < FLOAT_PARTICLES; i++) {
            const i3 = i * 3;
            const r = SPHERE_RADIUS * (0.6 + Math.random() * 0.9);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            floatPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
            floatPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            floatPositions[i3 + 2] = r * Math.cos(phi);
            floatBasePositions[i3] = floatPositions[i3];
            floatBasePositions[i3 + 1] = floatPositions[i3 + 1];
            floatBasePositions[i3 + 2] = floatPositions[i3 + 2];

            floatSizes[i] = Math.random() * 0.4 + 0.15;

            const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
            floatColors[i3] = c.r;
            floatColors[i3 + 1] = c.g;
            floatColors[i3 + 2] = c.b;
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(floatPositions, 3));
        geom.setAttribute('size', new THREE.BufferAttribute(floatSizes, 1));
        geom.setAttribute('color', new THREE.BufferAttribute(floatColors, 3));

        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                varying float vAlpha;
                uniform float uPixelRatio;
                void main() {
                    vColor = color;
                    vec4 mv = modelViewMatrix * vec4(position, 1.0);
                    vAlpha = smoothstep(14.0, 4.0, length(mv.xyz));
                    gl_PointSize = size * uPixelRatio * (180.0 / -mv.z);
                    gl_Position = projectionMatrix * mv;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                void main() {
                    float d = length(gl_PointCoord - 0.5);
                    if (d > 0.5) discard;
                    float strength = pow(1.0 - smoothstep(0.0, 0.5, d), 1.8);
                    float core = 1.0 - smoothstep(0.0, 0.12, d);
                    vec3 col = mix(vColor, vec3(1.0), core * 0.5);
                    gl_FragColor = vec4(col, strength * vAlpha * 0.8);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
        });

        floatPoints = new THREE.Points(geom, mat);
        scene.add(floatPoints);
    }

    function onMouseMove(e) {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;
        const rect = container.getBoundingClientRect();
        mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        mouseActive = true;

        // Mouse tilt targets (sphere leans toward cursor)
        targetTiltX = -mouseNDC.y * MOUSE_TILT_STRENGTH;
        targetTiltY = mouseNDC.x * MOUSE_TILT_STRENGTH;

        // Project to world z=0 plane for particle repulsion
        _raycaster.set(mouseNDC.x, mouseNDC.y, 0.5).unproject(camera);
        const dir = _raycaster.sub(camera.position).normalize();
        const t = -camera.position.z / dir.z;
        _mouseWorld.copy(camera.position).addScaledVector(dir, t);
    }

    function onMouseLeave() {
        mouseActive = false;
        targetTiltX = 0;
        targetTiltY = 0;
        _mouseWorld.set(999, 999, 0);
    }

    function animate() {
        requestAnimationFrame(animate);

        const time = performance.now() * 0.001;

        // Smooth lerp toward mouse tilt
        currentTiltX += (targetTiltX - currentTiltX) * 0.06;
        currentTiltY += (targetTiltY - currentTiltY) * 0.06;

        // Base auto-rotation + mouse tilt
        const rotY = time * 0.1 + currentTiltY;
        const rotX = Math.sin(time * 0.05) * 0.15 + currentTiltX;

        sphereWire.rotation.set(rotX, rotY, 0);
        sphereGlow.rotation.set(rotX, rotY, 0);
        floatPoints.rotation.set(rotX, rotY, 0);

        // Breathe effect — stronger when mouse is active
        const breatheBase = mouseActive ? 0.28 : 0.2;
        const breatheAmp = mouseActive ? 0.08 : 0.06;
        sphereWire.material.opacity = breatheBase + Math.sin(time * 0.8) * breatheAmp;

        // Animate orbital particles with mouse repulsion
        _euler.set(-rotX, -rotY, 0);
        for (let i = 0; i < FLOAT_PARTICLES; i++) {
            const i3 = i * 3;
            const phase = i * 0.73;

            floatPositions[i3] = floatBasePositions[i3] + Math.sin(time * 0.4 + phase) * 0.3;
            floatPositions[i3 + 1] = floatBasePositions[i3 + 1] + Math.cos(time * 0.35 + phase * 1.2) * 0.3;
            floatPositions[i3 + 2] = floatBasePositions[i3 + 2] + Math.sin(time * 0.25 + phase * 0.6) * 0.2;

            _vec.copy(_mouseWorld).applyEuler(_euler);
            const dx = floatPositions[i3] - _vec.x;
            const dy = floatPositions[i3 + 1] - _vec.y;
            const dz = floatPositions[i3 + 2] - _vec.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < MOUSE_RADIUS && dist > 0.01) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                const push = force * force * 1.5;
                floatPositions[i3] += (dx / dist) * push;
                floatPositions[i3 + 1] += (dy / dist) * push;
                floatPositions[i3 + 2] += (dz / dist) * push;
            }
        }
        floatPoints.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    function onResize() {
        const container = document.getElementById(CONTAINER_ID);
        if (!container || !renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    document.addEventListener('DOMContentLoaded', init);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(onResize, 200);
    });
})();
