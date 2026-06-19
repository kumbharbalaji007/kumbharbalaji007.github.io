// Expose openCert to global scope for inline onclick handlers
window.openCert = function(certUrl) {
    const modal = document.getElementById('certModal');
    const container = document.getElementById('certViewerContainer');
    
    // Clear previous content
    container.innerHTML = '';
    
    // Check if it's an image or pdf
    if (certUrl.toLowerCase().endsWith('.png') || certUrl.toLowerCase().endsWith('.jpg') || certUrl.toLowerCase().endsWith('.jpeg')) {
        const img = document.createElement('img');
        img.src = certUrl;
        container.appendChild(img);
    } else {
        // Assume PDF or other embedded format
        const iframe = document.createElement('iframe');
        iframe.src = certUrl + "#toolbar=0&navpanes=0&scrollbar=0"; // Try to disable download/print toolbars natively
        container.appendChild(iframe);
    }
    
    modal.style.display = 'block';
};

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
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

    // Intersection Observer for scroll animations (fade in / slide up)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Select elements to animate
    const cards = document.querySelectorAll('.glass-card, .v-timeline-item');
    
    // Set initial state for cards
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s, border-color 0.3s ease, box-shadow 0.3s ease`;
        observer.observe(card);
    });

    // CSS class to add visibility
    const style = document.createElement('style');
    style.innerHTML = `
        .glass-card.visible, .v-timeline-item.visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
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

    // Modal Close Logic
    const modal = document.getElementById('certModal');
    const closeBtn = document.querySelector('.close-btn');

    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = "none";
            document.getElementById('certViewerContainer').innerHTML = ''; // Stop video/pdf processing
        }
    }

    // Close when clicking outside of the modal content
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            document.getElementById('certViewerContainer').innerHTML = '';
        }
    }
});
