document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navContainer = document.querySelector('.nav-container');

    if (menuToggle && navContainer) {
        menuToggle.addEventListener('click', () => {
            navContainer.classList.toggle('active');
            
            // Change icon based on state
            const icon = menuToggle.querySelector('i');
            if (navContainer.classList.contains('active')) {
                icon.classList.remove('ph-list');
                icon.classList.add('ph-x');
            } else {
                icon.classList.remove('ph-x');
                icon.classList.add('ph-list');
            }
        });
    }

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navContainer.classList.contains('active')) {
                navContainer.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('ph-x');
                icon.classList.add('ph-list');
            }
        });
    });

    // Simple smooth scrolling for anchor links (handled mostly by CSS scroll-behavior)
    // This is just a fallback/enhancement if needed
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll event listener for navbar shadow
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            navbar.style.boxShadow = 'var(--shadow-sm)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
});
