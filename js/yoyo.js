// 3D Yo-yo (Yoyó in Spanish) with Three.js
let scene, camera, renderer, yoyo, string;
let isAnimating = false;
let yoyoPosition = 0;
let animationDirection = 1;

function initYoyo() {
    // Create container
    const container = document.getElementById('yoyo-container');

    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 8); // Fixed position to match yo-yo height
    camera.lookAt(0, 2, 0); // Look at the yo-yo

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Create Yo-yo
    createYoyo();

    // Create string
    createString();

    // Mouse interaction
    let isDragging = false;
    let previousMouseY = 0;

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMouseY = e.clientY;
        isAnimating = false;
    });

    container.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaY = (e.clientY - previousMouseY) * 0.01;
            yoyoPosition = THREE.MathUtils.clamp(yoyoPosition + deltaY, -3, 0);
            updateYoyoPosition();
            previousMouseY = e.clientY;
        }
    });

    container.addEventListener('mouseup', () => {
        isDragging = false;
        isAnimating = true;
    });

    container.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    // Click to toggle animation
    container.addEventListener('click', () => {
        isAnimating = !isAnimating;
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Scroll-based movement
    window.addEventListener('scroll', () => {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        // Move yo-yo based on scroll (0 at top, -3 at bottom)
        yoyoPosition = -scrollPercent * 3;
        updateYoyoPosition();
        isAnimating = false; // Disable auto-animation when scrolling
    });

    // Start animation
    animate();
}

function createYoyo() {
    // Yo-yo group
    yoyo = new THREE.Group();

    // Top disc
    const topDiscGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32);
    const topDiscMaterial = new THREE.MeshPhongMaterial({
        color: 0xff1744,
        shininess: 100,
        specular: 0x444444
    });
    const topDisc = new THREE.Mesh(topDiscGeometry, topDiscMaterial);
    topDisc.position.y = 0.15;
    yoyo.add(topDisc);

    // Bottom disc
    const bottomDiscGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32);
    const bottomDiscMaterial = new THREE.MeshPhongMaterial({
        color: 0x2979ff,
        shininess: 100,
        specular: 0x444444
    });
    const bottomDisc = new THREE.Mesh(bottomDiscGeometry, bottomDiscMaterial);
    bottomDisc.position.y = -0.15;
    yoyo.add(bottomDisc);

    // Middle axle
    const axleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16);
    const axleMaterial = new THREE.MeshPhongMaterial({
        color: 0xffd700,
        shininess: 150,
        specular: 0x888888
    });
    const axle = new THREE.Mesh(axleGeometry, axleMaterial);
    yoyo.add(axle);

    // Decorative rings on discs
    const ringGeometry = new THREE.TorusGeometry(0.5, 0.05, 16, 32);
    const ringMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 100
    });

    const topRing = new THREE.Mesh(ringGeometry, ringMaterial);
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = 0.25;
    yoyo.add(topRing);

    const bottomRing = new THREE.Mesh(ringGeometry, ringMaterial);
    bottomRing.rotation.x = Math.PI / 2;
    bottomRing.position.y = -0.25;
    yoyo.add(bottomRing);

    yoyo.position.y = 2;
    scene.add(yoyo);
}

function createString() {
    // String from top to yo-yo
    const stringMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 2
    });

    const stringGeometry = new THREE.BufferGeometry();
    const points = [
        new THREE.Vector3(0, 4, 0),
        new THREE.Vector3(0, 2, 0)
    ];
    stringGeometry.setFromPoints(points);

    string = new THREE.Line(stringGeometry, stringMaterial);
    scene.add(string);
}

function updateYoyoPosition() {
    yoyo.position.y = 2 + yoyoPosition;

    // Update string
    const points = [
        new THREE.Vector3(0, 4, 0),
        new THREE.Vector3(0, 2 + yoyoPosition, 0)
    ];
    string.geometry.setFromPoints(points);
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate yo-yo
    yoyo.rotation.y += 0.05;

    // Animate yo-yo up and down
    if (isAnimating) {
        yoyoPosition += 0.02 * animationDirection;

        if (yoyoPosition <= -3) {
            animationDirection = 1;
        } else if (yoyoPosition >= 0) {
            animationDirection = -1;
        }

        updateYoyoPosition();
    }

    // Render
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initYoyo);
} else {
    initYoyo();
}
