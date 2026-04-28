/**
 * Ambient Floating Particles
 * Full-page lightweight particle system for a "wow" ambient effect.
 * Uses vanilla Canvas 2D for maximum performance.
 */

(function () {
    const PARTICLE_COUNT = 80;
    const MAX_SIZE = 3;
    const MIN_SIZE = 0.5;
    const DRIFT_SPEED = 0.3;
    const COLORS = [
        'rgba(99, 102, 241,',   // indigo
        'rgba(129, 140, 248,',  // light indigo
        'rgba(56, 189, 248,',   // sky blue
        'rgba(255, 255, 255,',  // white sparkle
    ];

    let canvas, ctx, particles, width, height;
    let mouseX = -1000, mouseY = -1000;

    function init() {
        canvas = document.getElementById('ambient-particles');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        resize();
        createParticles();

        window.addEventListener('resize', debounce(resize, 200));
        document.addEventListener('mousemove', onMouse);

        animate();
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * Math.min(window.devicePixelRatio, 2);
        canvas.height = height * Math.min(window.devicePixelRatio, 2);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(Math.min(window.devicePixelRatio, 2), Math.min(window.devicePixelRatio, 2));
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE,
                speedX: (Math.random() - 0.5) * DRIFT_SPEED,
                speedY: (Math.random() - 0.5) * DRIFT_SPEED - 0.1,
                opacity: Math.random() * 0.5 + 0.1,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                phase: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
            });
        }
    }

    function onMouse(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    function animate() {
        requestAnimationFrame(animate);

        ctx.clearRect(0, 0, width, height);

        const time = performance.now() * 0.001;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Twinkle effect
            const twinkle = 0.5 + 0.5 * Math.sin(time * p.twinkleSpeed * 60 + p.phase);
            const alpha = p.opacity * twinkle;

            // Gentle drift
            p.x += p.speedX + Math.sin(time * 0.5 + p.phase) * 0.15;
            p.y += p.speedY + Math.cos(time * 0.3 + p.phase) * 0.1;

            // Mouse attraction — subtle pull towards cursor
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200 && dist > 1) {
                const force = (200 - dist) / 200 * 0.3;
                p.x += (dx / dist) * force;
                p.y += (dy / dist) * force;
            }

            // Wrap around edges
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;
            if (p.y < -10) p.y = height + 10;
            if (p.y > height + 10) p.y = -10;

            // Draw particle with glow
            ctx.save();
            ctx.globalAlpha = alpha;

            // Outer glow
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
            gradient.addColorStop(0, p.color + (alpha * 0.8).toFixed(2) + ')');
            gradient.addColorStop(0.4, p.color + (alpha * 0.2).toFixed(2) + ')');
            gradient.addColorStop(1, p.color + '0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
            ctx.fill();

            // Bright core
            ctx.fillStyle = p.color + alpha.toFixed(2) + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    function debounce(fn, ms) {
        let timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(fn, ms);
        };
    }

    document.addEventListener('DOMContentLoaded', init);
})();
