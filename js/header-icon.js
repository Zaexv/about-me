/**
 * Header 3D Icon
 * Renders a floating wireframe octahedron in the logo area.
 * Reacts to mouse: tilts and speeds up on hover.
 */

(function () {
    let mesh, renderer, scene, camera;
    let targetRotX = 0, targetRotY = 0;
    let currentRotX = 0, currentRotY = 0;
    let hoverIntensity = 0;

    function init() {
        const container = document.getElementById('header-3d-container');
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === 0 || height === 0) {
            requestAnimationFrame(init);
            return;
        }

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 2.5;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const geometry = new THREE.OctahedronGeometry(1, 0);
        const material = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            wireframe: true,
            transparent: true,
            opacity: 0.8,
        });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const pointLight = new THREE.PointLight(0x38bdf8, 1);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // Track mouse across entire header for a wider interaction area
        const header = document.querySelector('.header');
        if (header) {
            header.addEventListener('mousemove', onHeaderMove);
            header.addEventListener('mouseleave', onHeaderLeave);
        }

        animate();
    }

    function onHeaderMove(e) {
        const header = e.currentTarget;
        const rect = header.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        targetRotX = ny * 0.6;
        targetRotY = nx * 0.6;
        hoverIntensity = 1;
    }

    function onHeaderLeave() {
        targetRotX = 0;
        targetRotY = 0;
        hoverIntensity = 0;
    }

    function animate() {
        requestAnimationFrame(animate);

        currentRotX += (targetRotX - currentRotX) * 0.08;
        currentRotY += (targetRotY - currentRotY) * 0.08;

        const speed = 0.01 + hoverIntensity * 0.02;
        mesh.rotation.x += speed;
        mesh.rotation.y += speed;

        // Mouse tilt overlay
        mesh.rotation.x += currentRotX * 0.05;
        mesh.rotation.y += currentRotY * 0.05;

        mesh.position.y = Math.sin(Date.now() * 0.002) * 0.1;

        // Glow brighter on hover
        mesh.material.opacity = 0.7 + hoverIntensity * 0.25;

        // Decay hover intensity smoothly
        hoverIntensity *= 0.97;

        renderer.render(scene, camera);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
