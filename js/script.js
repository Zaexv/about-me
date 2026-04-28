// Custom cursor
const cursor = document.querySelector('.cursor');

document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    document.documentElement.style.setProperty('--mouse-x', `${x}px`);
    document.documentElement.style.setProperty('--mouse-y', `${y}px`);
});

// Cursor hover effects
const interactiveElements = document.querySelectorAll('a, button, circle, .cert-item, .competency-group, .project-card, .contact-link');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.scale = '2.5';
        cursor.style.borderColor = 'var(--accent)';
        cursor.style.background = 'rgba(255, 71, 87, 0.1)';
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

// Intersection Observer with stagger support
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all sections and stagger containers
document.querySelectorAll('section:not(.hero)').forEach(section => {
    section.classList.add('reveal');
    observer.observe(section);
});

document.querySelectorAll('.projects-list, .edu-grid, .cert-grid, .exp-timeline, .competencies').forEach(container => {
    container.classList.add('stagger-children');
    observer.observe(container);
});

// Header shrink on scroll + scroll progress bar
const header = document.querySelector('.header');
const scrollProgress = document.querySelector('.scroll-progress');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.style.padding = '0.75rem 3rem';
    } else {
        header.style.padding = '1.25rem 3rem';
    }

    // Scroll progress
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgress) {
        scrollProgress.style.width = scrollPercent + '%';
    }
}, { passive: true });
