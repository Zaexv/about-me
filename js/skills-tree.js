/**
 * Interactive 3D Particle Network
 * A constellation of nodes representing a living distributed system.
 * Mouse-reactive, with depth-of-field glow and organic motion.
 */

(function () {
    const CONTAINER_ID = 'skills-tree-container';
    const PARTICLE_COUNT = 200;
    const CONNECTION_DISTANCE = 3.2;
    const MOUSE_RADIUS = 4.0;
    const COLORS = [
        new THREE.Color(0xff4757), // accent red
        new THREE.Color(0xe84393), // rose
        new THREE.Color(0xff6348), // warm orange
        new THREE.Color(0xff7979), // soft coral
        new THREE.Color(0xffffff), // white accent
    ];

    let scene, camera, renderer, particles, lines;
    const mouseNDC = { x: 0, y: 0 };
    let mouse3D = new THREE.Vector3(999, 999, 0);
    let _animId;
    let positions, velocities, basePositions, sizes, colors;

    function init() {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;

        container.innerHTML = '';
        const w = container.clientWidth;
        const h = container.clientHeight;

        // Scene
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
        camera.position.z = 8;

        // Renderer
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        createParticles();
        createConnections();

        // Mouse tracking
        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseleave', onMouseLeave);

        animate();
    }

    function createParticles() {
        positions = new Float32Array(PARTICLE_COUNT * 3);
        velocities = new Float32Array(PARTICLE_COUNT * 3);
        basePositions = new Float32Array(PARTICLE_COUNT * 3);
        sizes = new Float32Array(PARTICLE_COUNT);
        colors = new Float32Array(PARTICLE_COUNT * 3);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;

            // Distribute on a sphere with some inner volume
            const radius = 2.5 + Math.random() * 1.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;

            basePositions[i3] = x;
            basePositions[i3 + 1] = y;
            basePositions[i3 + 2] = z;

            // Gentle drift velocities
            velocities[i3] = (Math.random() - 0.5) * 0.002;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.002;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.002;

            // Size variation — larger and more varied for visibility
            sizes[i] = Math.random() * 0.8 + 0.25;

            // Color from palette
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                varying float vAlpha;
                uniform float uTime;
                uniform float uPixelRatio;

                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    float dist = length(mvPosition.xyz);
                    vAlpha = smoothstep(12.0, 3.0, dist);
                    gl_PointSize = size * uPixelRatio * (200.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    float d = length(gl_PointCoord - 0.5);
                    if (d > 0.5) discard;

                    // Soft glow falloff
                    float strength = 1.0 - smoothstep(0.0, 0.5, d);
                    strength = pow(strength, 1.5);

                    // Core glow
                    float core = 1.0 - smoothstep(0.0, 0.15, d);

                    vec3 finalColor = mix(vColor, vec3(1.0), core * 0.6);
                    float alpha = strength * vAlpha * 1.0;
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);
    }

    function createConnections() {
        const lineGeometry = new THREE.BufferGeometry();
        const maxLines = PARTICLE_COUNT * 6;
        const linePositions = new Float32Array(maxLines * 6);
        const lineColors = new Float32Array(maxLines * 6);

        lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
        lineGeometry.setDrawRange(0, 0);

        const lineMaterial = new THREE.LineBasicMaterial({
            transparent: true,
            opacity: 0.3,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);
    }

    function updateConnections() {
        const linePos = lines.geometry.attributes.position.array;
        const lineCol = lines.geometry.attributes.color.array;
        let lineIdx = 0;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ix = positions[i * 3];
            const iy = positions[i * 3 + 1];
            const iz = positions[i * 3 + 2];

            for (let j = i + 1; j < PARTICLE_COUNT; j++) {
                const jx = positions[j * 3];
                const jy = positions[j * 3 + 1];
                const jz = positions[j * 3 + 2];

                const dx = ix - jx;
                const dy = iy - jy;
                const dz = iz - jz;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < CONNECTION_DISTANCE) {
                    const alpha = 1.0 - dist / CONNECTION_DISTANCE;
                    const li = lineIdx * 6;

                    linePos[li] = ix;
                    linePos[li + 1] = iy;
                    linePos[li + 2] = iz;
                    linePos[li + 3] = jx;
                    linePos[li + 4] = jy;
                    linePos[li + 5] = jz;

                    const r = (colors[i * 3] + colors[j * 3]) * 0.5 * alpha;
                    const g = (colors[i * 3 + 1] + colors[j * 3 + 1]) * 0.5 * alpha;
                    const b = (colors[i * 3 + 2] + colors[j * 3 + 2]) * 0.5 * alpha;

                    lineCol[li] = r;
                    lineCol[li + 1] = g;
                    lineCol[li + 2] = b;
                    lineCol[li + 3] = r;
                    lineCol[li + 4] = g;
                    lineCol[li + 5] = b;

                    lineIdx++;
                    if (lineIdx >= PARTICLE_COUNT * 6) break;
                }
            }
            if (lineIdx >= PARTICLE_COUNT * 6) break;
        }

        lines.geometry.setDrawRange(0, lineIdx * 2);
        lines.geometry.attributes.position.needsUpdate = true;
        lines.geometry.attributes.color.needsUpdate = true;
    }

    function onMouseMove(e) {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;
        const rect = container.getBoundingClientRect();
        mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        // Project mouse to 3D at z=0
        const vec = new THREE.Vector3(mouseNDC.x, mouseNDC.y, 0.5);
        vec.unproject(camera);
        const dir = vec.sub(camera.position).normalize();
        const t = -camera.position.z / dir.z;
        mouse3D = camera.position.clone().add(dir.multiplyScalar(t));
    }

    function onMouseLeave() {
        mouse3D.set(999, 999, 0);
    }

    function animate() {
        _animId = requestAnimationFrame(animate);

        const time = performance.now() * 0.001;
        particles.material.uniforms.uTime.value = time;

        // Slow global rotation
        particles.rotation.y = time * 0.08;
        lines.rotation.y = time * 0.08;

        // Update particle positions
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;

            // Organic floating motion
            const phase = i * 0.37;
            positions[i3] = basePositions[i3] + Math.sin(time * 0.3 + phase) * 0.15;
            positions[i3 + 1] = basePositions[i3 + 1] + Math.cos(time * 0.25 + phase * 1.3) * 0.15;
            positions[i3 + 2] = basePositions[i3 + 2] + Math.sin(time * 0.2 + phase * 0.7) * 0.1;

            // Mouse repulsion (in rotated space)
            const euler = new THREE.Euler(0, -particles.rotation.y, 0);
            const rotatedMouse = mouse3D.clone().applyEuler(euler);

            const dx = positions[i3] - rotatedMouse.x;
            const dy = positions[i3 + 1] - rotatedMouse.y;
            const dz = positions[i3 + 2] - rotatedMouse.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < MOUSE_RADIUS && dist > 0.01) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                const pushStrength = force * force * 1.2;
                positions[i3] += (dx / dist) * pushStrength;
                positions[i3 + 1] += (dy / dist) * pushStrength;
                positions[i3 + 2] += (dz / dist) * pushStrength;
            }
        }

        particles.geometry.attributes.position.needsUpdate = true;

        updateConnections();

        renderer.render(scene, camera);
    }

    function onResize() {
        const container = document.getElementById(CONTAINER_ID);
        if (!container || !renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    // Init
    document.addEventListener('DOMContentLoaded', init);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(onResize, 200);
    });
})();
