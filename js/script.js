// Custom cursor and Lighting effect
const cursor = document.querySelector('.cursor');
const mouseLight = document.querySelector('.mouse-light');

document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    // Update cursor position
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    // Update lighting effect position
    document.documentElement.style.setProperty('--mouse-x', `${x}px`);
    document.documentElement.style.setProperty('--mouse-y', `${y}px`);
});

// Cursor hover effects
const interactiveElements = document.querySelectorAll('a, .project, circle, .cert-item');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.scale = '2.5';
        cursor.style.borderColor = 'var(--accent)';
        cursor.style.background = 'rgba(0, 255, 136, 0.1)';
    });

    el.addEventListener('mouseleave', () => {
        cursor.style.scale = '1';
        cursor.style.borderColor = 'var(--accent)';
        cursor.style.background = 'transparent';
    });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(50px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
});

console.log('Portfolio loaded ✨');
