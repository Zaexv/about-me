/**
 * Header 3D Icon
 * Renders a small floating 3D object in the logo area.
 */

function initHeaderIcon() {
    const container = document.getElementById('header-3d-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Geometry: A sleek octahedron representing architecture/nodes
    const geometry = new THREE.OctahedronGeometry(1, 0);
    const material = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f2fe, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        mesh.position.y = Math.sin(Date.now() * 0.002) * 0.1;
        renderer.render(scene, camera);
    }

    animate();
}

document.addEventListener('DOMContentLoaded', initHeaderIcon);
