document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Mobile Hamburger Menu Toggle
    // ==========================================
    const navToggle = document.getElementById('navToggle');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const hamburgerIcon = document.getElementById('hamburgerIcon');

    function toggleMobileMenu() {
        const isOpen = mobileNavOverlay.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen);

        if (isOpen) {
            // Switch hamburger icon to a close (X) icon
            hamburgerIcon.innerHTML = `
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      `;
            document.body.style.overflow = 'hidden'; // Prevent scroll when menu is open
        } else {
            // Restore hamburger icon
            hamburgerIcon.innerHTML = `
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="4" y1="18" x2="20" y2="18"></line>
      `;
            document.body.style.overflow = ''; // Restore scroll
        }
    }

    if (navToggle && mobileNavOverlay) {
        navToggle.addEventListener('click', toggleMobileMenu);

        // Close mobile menu when a navigation link is clicked
        const mobileLinks = mobileNavOverlay.querySelectorAll('.nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNavOverlay.classList.contains('open')) {
                    toggleMobileMenu();
                }
            });
        });
    }

    // ==========================================
    // 2. Scroll Reveal System (IntersectionObserver)
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Once visible, stop observing to prevent repeatedly refiring
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters viewport
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // ==========================================
    // 3. Active Section Link Highlighter
    // ==========================================
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-container .nav-link, .mobile-nav-overlay .nav-link');

    const activeSectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');

                navLinks.forEach(link => {
                    // Remove active class from all links
                    link.classList.remove('active');
                    // Add active class if the href matches the section ID
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.35, // Trigger when 35% of the section is visible
        rootMargin: '-10% 0px -40% 0px'
    });

    sections.forEach(section => {
        activeSectionObserver.observe(section);
    });

    // ==========================================
    // 4. Smooth Scrolling offset adjuster
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // 5. Contact Form Handler (Mock Submission)
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const formSubmitBtn = document.getElementById('formSubmitBtn');

    if (contactForm && formStatus && formSubmitBtn) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Disable inputs and button
            formSubmitBtn.disabled = true;
            formSubmitBtn.innerHTML = `
        <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" style="animation: spin 1s linear infinite; margin-right: 0.5rem; display: inline-block;">
          <circle cx="12" cy="12" r="10" stroke="rgba(255, 255, 255, 0.2)"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"></path>
        </svg>
        Sending...
      `;
            formStatus.className = 'form-status';
            formStatus.style.display = 'none';

            const name = document.getElementById('formName').value;
            const formData = new FormData(contactForm);

            // Send request to Web3Forms API
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })
            .then(async (response) => {
                const json = await response.json();
                if (response.status === 200) {
                    formStatus.innerText = `Thank you, ${name}! Your message has been sent successfully.`;
                    formStatus.classList.add('success');
                    contactForm.reset();
                } else {
                    formStatus.innerText = json.message || "Something went wrong. Please try again.";
                    formStatus.classList.add('error');
                }
            })
            .catch((error) => {
                console.error('Submission error:', error);
                formStatus.innerText = "Failed to submit. Please check your internet connection and try again.";
                formStatus.classList.add('error');
            })
            .finally(() => {
                // Re-enable submit button
                formSubmitBtn.disabled = false;
                formSubmitBtn.innerHTML = `
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  Send Message
                `;
            });
        });
    }
});

// Inline keyframes style injection for form spinner rotate
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
