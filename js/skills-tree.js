/**
 * Hero 3D Background — Particle Constellation
 * Floating connected particles filling the hero section.
 * Mouse pushes nearby particles. Lines connect close neighbours.
 * No custom shaders, no shared buffers, no camera drift.
 */

(function () {
    const CONTAINER_ID = 'hero-3d-bg';
    const COUNT = 140;
    const SPREAD_X = 24;
    const SPREAD_Y = 18;
    const SPREAD_Z = 6;
    const CONNECT_DIST = 2.6;
    const MAX_LINES = 700;
    const MOUSE_RADIUS = 4;
    const MOUSE_PUSH = 0.15;

    let scene, camera, renderer, heroEl;
    let pointsMesh, linesMesh;
    let pos, vel;
    let linePositions, lineColors;

    let mouseWorldX = 999, mouseWorldY = 999;
    let mouseActive = false;

    // Cached visible area at z=0 for mouse projection
    let visHalfH = 1, visHalfW = 1;

    let accentR, accentG, accentB;

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
        camera.position.set(0, 0, 20);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        computeVisibleArea();

        const accent = new THREE.Color(0x6366f1);
        accentR = accent.r;
        accentG = accent.g;
        accentB = accent.b;

        createParticles();
        createLines();

        heroEl = document.querySelector('.hero');
        if (heroEl) {
            heroEl.addEventListener('mousemove', onMouseMove);
            heroEl.addEventListener('mouseleave', onMouseLeave);
        }

        animate();
    }

    function computeVisibleArea() {
        const halfFovRad = camera.fov * Math.PI / 360;
        visHalfH = Math.tan(halfFovRad) * camera.position.z;
        visHalfW = visHalfH * camera.aspect;
    }

    function createDotTexture() {
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.2, 'rgba(255,255,255,0.6)');
        g.addColorStop(0.5, 'rgba(255,255,255,0.15)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
    }

    function createParticles() {
        pos = new Float32Array(COUNT * 3);
        vel = new Float32Array(COUNT * 3);

        for (let i = 0; i < COUNT; i++) {
            const i3 = i * 3;
            pos[i3] = (Math.random() - 0.5) * SPREAD_X;
            pos[i3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
            pos[i3 + 2] = (Math.random() - 0.5) * SPREAD_Z;

            vel[i3] = (Math.random() - 0.5) * 0.006;
            vel[i3 + 1] = (Math.random() - 0.5) * 0.006;
            vel[i3 + 2] = (Math.random() - 0.5) * 0.002;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

        const mat = new THREE.PointsMaterial({
            color: 0x6366f1,
            size: 0.25,
            map: createDotTexture(),
            transparent: true,
            opacity: 0.85,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        pointsMesh = new THREE.Points(geo, mat);
        scene.add(pointsMesh);
    }

    function createLines() {
        linePositions = new Float32Array(MAX_LINES * 6);
        lineColors = new Float32Array(MAX_LINES * 6);

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
        geo.setDrawRange(0, 0);

        const mat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        linesMesh = new THREE.LineSegments(geo, mat);
        scene.add(linesMesh);
    }

    function onMouseMove(e) {
        if (!heroEl) return;
        const rect = heroEl.getBoundingClientRect();
        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        mouseWorldX = ndcX * visHalfW;
        mouseWorldY = ndcY * visHalfH;
        mouseActive = true;
    }

    function onMouseLeave() {
        mouseActive = false;
        mouseWorldX = 999;
        mouseWorldY = 999;
    }

    function moveParticles() {
        const halfX = SPREAD_X * 0.5;
        const halfY = SPREAD_Y * 0.5;
        const halfZ = SPREAD_Z * 0.5;

        for (let i = 0; i < COUNT; i++) {
            const i3 = i * 3;
            pos[i3] += vel[i3];
            pos[i3 + 1] += vel[i3 + 1];
            pos[i3 + 2] += vel[i3 + 2];

            if (pos[i3] > halfX) pos[i3] = -halfX;
            if (pos[i3] < -halfX) pos[i3] = halfX;
            if (pos[i3 + 1] > halfY) pos[i3 + 1] = -halfY;
            if (pos[i3 + 1] < -halfY) pos[i3 + 1] = halfY;
            if (pos[i3 + 2] > halfZ) pos[i3 + 2] = -halfZ;
            if (pos[i3 + 2] < -halfZ) pos[i3 + 2] = halfZ;

            if (mouseActive) {
                const dx = pos[i3] - mouseWorldX;
                const dy = pos[i3 + 1] - mouseWorldY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_RADIUS && dist > 0.01) {
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                    pos[i3] += (dx / dist) * force * MOUSE_PUSH;
                    pos[i3 + 1] += (dy / dist) * force * MOUSE_PUSH;
                }
            }
        }

        pointsMesh.geometry.attributes.position.needsUpdate = true;
    }

    function updateConnections() {
        let lineIdx = 0;
        const connectSq = CONNECT_DIST * CONNECT_DIST;

        for (let i = 0; i < COUNT && lineIdx < MAX_LINES; i++) {
            const i3 = i * 3;
            for (let j = i + 1; j < COUNT && lineIdx < MAX_LINES; j++) {
                const j3 = j * 3;
                const dx = pos[i3] - pos[j3];
                const dy = pos[i3 + 1] - pos[j3 + 1];
                const dz = pos[i3 + 2] - pos[j3 + 2];
                const distSq = dx * dx + dy * dy + dz * dz;

                if (distSq < connectSq) {
                    const alpha = 1 - Math.sqrt(distSq) / CONNECT_DIST;
                    const idx = lineIdx * 6;

                    linePositions[idx] = pos[i3];
                    linePositions[idx + 1] = pos[i3 + 1];
                    linePositions[idx + 2] = pos[i3 + 2];
                    linePositions[idx + 3] = pos[j3];
                    linePositions[idx + 4] = pos[j3 + 1];
                    linePositions[idx + 5] = pos[j3 + 2];

                    lineColors[idx] = accentR * alpha;
                    lineColors[idx + 1] = accentG * alpha;
                    lineColors[idx + 2] = accentB * alpha;
                    lineColors[idx + 3] = accentR * alpha;
                    lineColors[idx + 4] = accentG * alpha;
                    lineColors[idx + 5] = accentB * alpha;

                    lineIdx++;
                }
            }
        }

        linesMesh.geometry.setDrawRange(0, lineIdx * 2);
        linesMesh.geometry.attributes.position.needsUpdate = true;
        linesMesh.geometry.attributes.color.needsUpdate = true;
    }

    function animate() {
        requestAnimationFrame(animate);
        moveParticles();
        updateConnections();
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
        computeVisibleArea();
    }

    document.addEventListener('DOMContentLoaded', init);

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(onResize, 200);
    });
})();
