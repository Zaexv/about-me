/**
 * 3D Contact Torus
 * Animated wireframe torus knot behind the contact section.
 * Reacts to mouse: tilts toward cursor, pulses on proximity.
 */

(function () {
    const CONTAINER_ID = 'contact-3d-container';
    const TILT_STRENGTH = 0.5;

    let scene, camera, renderer, torusKnot, torusWire;
    let targetTiltX = 0, targetTiltY = 0;
    let currentTiltX = 0, currentTiltY = 0;
    let mouseProximity = 0;

    function init() {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;

        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) {
            requestAnimationFrame(init);
            return;
        }

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        camera.position.z = 7;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Torus knot
        const geometry = new THREE.TorusKnotGeometry(2, 0.6, 100, 16, 2, 3);
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            wireframe: true,
            transparent: true,
            opacity: 0.12,
        });
        torusKnot = new THREE.Mesh(geometry, wireMat);
        scene.add(torusKnot);

        // Outer ring
        const ringGeo = new THREE.TorusGeometry(3.2, 0.02, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.15,
        });
        torusWire = new THREE.Mesh(ringGeo, ringMat);
        scene.add(torusWire);

        // Mouse tracking on the contact section (parent)
        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseleave', onMouseLeave);

        animate();
    }

    function onMouseMove(e) {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        targetTiltX = -ny * TILT_STRENGTH;
        targetTiltY = nx * TILT_STRENGTH;

        // Distance from center for proximity glow (0=center, 1=edge)
        mouseProximity = 1.0 - Math.min(1, Math.sqrt(nx * nx + ny * ny));
    }

    function onMouseLeave() {
        targetTiltX = 0;
        targetTiltY = 0;
        mouseProximity = 0;
    }

    function animate() {
        requestAnimationFrame(animate);

        const time = performance.now() * 0.001;

        // Smooth lerp
        currentTiltX += (targetTiltX - currentTiltX) * 0.05;
        currentTiltY += (targetTiltY - currentTiltY) * 0.05;

        // Auto-rotation + mouse tilt
        torusKnot.rotation.x = time * 0.15 + currentTiltX;
        torusKnot.rotation.y = time * 0.1 + currentTiltY;

        // Mouse proximity boosts opacity
        const baseOpacity = 0.1 + Math.sin(time * 0.6) * 0.04;
        torusKnot.material.opacity = baseOpacity + mouseProximity * 0.08;

        // Ring reacts independently
        torusWire.rotation.x = Math.PI * 0.5 + Math.sin(time * 0.2) * 0.1 + currentTiltX * 0.5;
        torusWire.rotation.z = time * 0.08 + currentTiltY * 0.3;
        torusWire.material.opacity = 0.12 + mouseProximity * 0.1;

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
