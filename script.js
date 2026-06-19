document.addEventListener('DOMContentLoaded', () => {
    const scrollContainer = document.querySelector('.scroll-container');

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target && scrollContainer) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for scroll animations (fade in / slide up)
    const observerOptions = {
        root: scrollContainer,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Select elements to animate
    const cards = document.querySelectorAll('.glass-card');
    
    // Set initial state for cards
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s, border-color 0.3s ease, box-shadow 0.3s ease`;
        observer.observe(card);
    });

    // CSS class to add visibility
    const style = document.createElement('style');
    style.innerHTML = `
        .glass-card.visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        .glass-card:hover {
            transform: translateY(-5px) !important;
        }
    `;
    document.head.appendChild(style);

    // Mouse move effect for glows
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        const glows = document.querySelectorAll('.glow');
        glows.forEach((glow, index) => {
            const speed = (index + 1) * 20;
            const xOffset = (x - 0.5) * speed;
            const yOffset = (y - 0.5) * speed;
            glow.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    });
});
