/**
 * Hero 3D Background — Flowing Wireframe Grid
 * An animated wave mesh filling the hero section.
 * Mouse creates ripples on the surface. Glowing node points at vertices.
 * Zero per-frame allocations.
 */

(function () {
    const CONTAINER_ID = 'hero-3d-bg';
    const SEGMENTS = 50;
    const GRID_SCALE = 36;
    const WAVE_HEIGHT = 1.0;
    const MOUSE_RADIUS = 4.0;
    const MOUSE_PUSH = 1.8;

    let scene, camera, renderer;
    let gridMesh, gridGeo, gridPoints;
    let origY;

    const mouse = { x: 999, y: 999 };
    let mouseActive = false;

    const ACCENT = 0x6366f1;
    const ACCENT_BRIGHT = 0x818cf8;

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
        scene.fog = new THREE.FogExp2(0x050505, 0.028);

        camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 200);
        camera.position.set(0, 10, 16);
        camera.lookAt(0, 0, -2);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        createGrid();
        createVertexDots();

        const hero = document.querySelector('.hero');
        if (hero) {
            hero.addEventListener('mousemove', onMouseMove);
            hero.addEventListener('mouseleave', onMouseLeave);
        }

        animate();
    }

    function createGrid() {
        gridGeo = new THREE.PlaneGeometry(GRID_SCALE, GRID_SCALE, SEGMENTS, SEGMENTS);
        gridGeo.rotateX(-Math.PI * 0.5);

        const mat = new THREE.MeshBasicMaterial({
            color: ACCENT,
            wireframe: true,
            transparent: true,
            opacity: 0.12,
        });

        gridMesh = new THREE.Mesh(gridGeo, mat);
        scene.add(gridMesh);

        const pos = gridGeo.attributes.position;
        origY = new Float32Array(pos.count);
        for (let i = 0; i < pos.count; i++) {
            origY[i] = pos.getY(i);
        }
    }

    function createVertexDots() {
        const pos = gridGeo.attributes.position;
        const count = pos.count;
        const sizes = new Float32Array(count);
        const colors = new Float32Array(count * 3);
        const c1 = new THREE.Color(ACCENT);
        const c2 = new THREE.Color(ACCENT_BRIGHT);

        for (let i = 0; i < count; i++) {
            sizes[i] = Math.random() * 0.15 + 0.05;
            const t = Math.random();
            colors[i * 3] = c1.r + (c2.r - c1.r) * t;
            colors[i * 3 + 1] = c1.g + (c2.g - c1.g) * t;
            colors[i * 3 + 2] = c1.b + (c2.b - c1.b) * t;
        }

        const dotGeo = new THREE.BufferGeometry();
        dotGeo.setAttribute('position', pos);
        dotGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        dotGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            },
            vertexShader: [
                'attribute float size;',
                'attribute vec3 color;',
                'varying vec3 vColor;',
                'varying float vAlpha;',
                'uniform float uPixelRatio;',
                'void main() {',
                '  vColor = color;',
                '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
                '  vAlpha = smoothstep(30.0, 5.0, length(mv.xyz));',
                '  gl_PointSize = size * uPixelRatio * (200.0 / -mv.z);',
                '  gl_Position = projectionMatrix * mv;',
                '}',
            ].join('\n'),
            fragmentShader: [
                'varying vec3 vColor;',
                'varying float vAlpha;',
                'void main() {',
                '  float d = length(gl_PointCoord - 0.5);',
                '  if (d > 0.5) discard;',
                '  float glow = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0);',
                '  gl_FragColor = vec4(vColor, glow * vAlpha * 0.6);',
                '}',
            ].join('\n'),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
        });

        gridPoints = new THREE.Points(dotGeo, mat);
        scene.add(gridPoints);
    }

    function onMouseMove(e) {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        const rect = hero.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        mouse.x = nx * GRID_SCALE * 0.5;
        mouse.y = ny * GRID_SCALE * 0.35;
        mouseActive = true;
    }

    function onMouseLeave() {
        mouseActive = false;
    }

    function animate() {
        requestAnimationFrame(animate);

        const time = performance.now() * 0.001;
        const pos = gridGeo.attributes.position;

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);

            let y = origY[i];
            y += Math.sin(x * 0.35 + time * 0.5) * WAVE_HEIGHT * 0.5;
            y += Math.cos(z * 0.28 + time * 0.4) * WAVE_HEIGHT * 0.4;
            y += Math.sin((x + z) * 0.18 + time * 0.25) * WAVE_HEIGHT * 0.3;

            if (mouseActive) {
                const dx = x - mouse.x;
                const dz = z - mouse.y;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < MOUSE_RADIUS) {
                    const factor = 1 - dist / MOUSE_RADIUS;
                    y += Math.sin(dist * 2.5 - time * 5) * factor * factor * MOUSE_PUSH;
                }
            }

            pos.setY(i, y);
        }
        pos.needsUpdate = true;

        camera.position.x = Math.sin(time * 0.08) * 1.5;
        camera.position.y = 10 + Math.sin(time * 0.12) * 0.5;

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
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(onResize, 200);
    });
})();
