/**
 * 3D Card Tilt Effect
 * Adds perspective tilt + moving light highlight on mousemove.
 */

(function () {
    const TILT_MAX = 8;
    const SCALE_HOVER = 1.02;
    const SELECTORS = '.project-card, .competency-group, .edu-item, .cert-item';

    function init() {
        const cards = document.querySelectorAll(SELECTORS);
        cards.forEach(card => {
            card.style.transformStyle = 'preserve-3d';
            card.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';

            card.addEventListener('mousemove', onMove);
            card.addEventListener('mouseleave', onLeave);
        });
    }

    function onMove(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * TILT_MAX * 2;
        const rotateX = (0.5 - y) * TILT_MAX * 2;

        card.style.transform =
            `perspective(800px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) scale3d(${SCALE_HOVER}, ${SCALE_HOVER}, 1)`;

        // Moving light highlight
        const lightX = (x * 100).toFixed(0);
        const lightY = (y * 100).toFixed(0);
        card.style.background =
            `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(99, 102, 241, 0.08), transparent 60%)`;
    }

    function onLeave(e) {
        e.currentTarget.style.transform =
            'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        e.currentTarget.style.background = '';
    }

    document.addEventListener('DOMContentLoaded', init);
})();
