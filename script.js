// ========================================
// CONFIGURATION
// ========================================

const CONFIG = {
    whatsappNumber: '919929969577', // Replace with your WhatsApp number
    whatsappMessage: 'Hello! I am interested in Runwal The Central Park. Please provide more details.',
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ========================================
// MOBILE MENU (SIDEBAR)
// ========================================

class SidebarMenu {
    constructor() {
        this.hamburger = $('#hamburger');
        this.sidebar = $('#sidebar');
        this.sidebarClose = $('#sidebarClose');
        this.sidebarOverlay = $('#sidebarOverlay');
        this.sidebarLinks = $$('.sidebar-link');

        this.init();
    }

    init() {
        this.hamburger.addEventListener('click', () => this.toggle());
        this.sidebarClose.addEventListener('click', () => this.close());
        this.sidebarOverlay.addEventListener('click', () => this.close());

        this.sidebarLinks.forEach(link => {
            link.addEventListener('click', () => this.close());
        });
    }

    toggle() {
        const isActive = this.sidebar.classList.toggle('active');
        this.sidebarOverlay.classList.toggle('active', isActive);
        this.hamburger.classList.toggle('active', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    }

    close() {
        this.sidebar.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
        this.hamburger.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ========================================
// SMOOTH SCROLL NAVIGATION
// ========================================

class SmoothScroll {
    constructor() {
        this.navLinks = $$('.nav-link, .sidebar-link');
        this.sections = $$('section[id]');
        this.navbar = $('#navbar');
        this.header = $('#header');
        this.offset = this.navbar.offsetHeight + this.header.offsetHeight;

        this.init();
    }

    init() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleClick(e));
        });

        window.addEventListener('scroll', debounce(() => this.updateActiveLink(), 100));
        this.updateActiveLink();
    }

    handleClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        const targetSection = $(targetId);

        if (targetSection) {
            const targetPosition = targetSection.offsetTop - this.offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    updateActiveLink() {
        let currentSection = '';
        const scrollPosition = window.pageYOffset + this.offset + 100;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
}

// ========================================
// FORM VALIDATION
// ========================================

class FormValidator {
    constructor() {
        this.rules = {
            name: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-Z\s]+$/,
                message: 'Please enter a valid name (letters only, min 2 characters)'
            },
            mobile: {
                required: true,
                pattern: /^[0-9]{10}$/,
                message: 'Please enter a valid 10-digit mobile number'
            },
            email: {
                required: false,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            }
        };
    }

    validateField(input) {
        const name = input.name || input.id;
        const value = input.value.trim();
        const rule = this.rules[name];

        if (!rule) return { isValid: true };

        // Check required
        if (rule.required && !value) {
            return {
                isValid: false,
                message: `${this.capitalize(name)} is required`
            };
        }

        // If not required and empty, it's valid
        if (!rule.required && !value) {
            return { isValid: true };
        }

        // Check min length
        if (rule.minLength && value.length < rule.minLength) {
            return {
                isValid: false,
                message: rule.message
            };
        }

        // Check pattern
        if (rule.pattern && !rule.pattern.test(value)) {
            return {
                isValid: false,
                message: rule.message
            };
        }

        return { isValid: true };
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], input[name], input[id]');
        let isValid = true;

        inputs.forEach(input => {
            const result = this.validateField(input);
            if (!result.isValid) {
                this.showError(input, result.message);
                isValid = false;
            } else {
                this.clearError(input);
            }
        });

        return isValid;
    }

    showError(input, message) {
        input.classList.add('error');
        input.classList.remove('success');

        // Remove existing error message
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
    }

    clearError(input) {
        input.classList.remove('error');
        input.classList.add('success');

        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// ========================================
// MODAL MANAGER
// ========================================

class ModalManager {
    constructor() {
        this.modals = {
            schedule: $('#scheduleModal'),
            costSheet: $('#costSheetModal'),
            enquire: $('#enquireModal')
        };

        this.overlay = $('#modalOverlay');
        this.validator = new FormValidator();

        this.init();
    }

    init() {
        // Schedule Visit Modal
        $('#scheduleVisitBtn')?.addEventListener('click', () => this.open('schedule'));
        $('#scheduleModalClose')?.addEventListener('click', () => this.close('schedule'));

        // Cost Sheet Modal
        $('#downloadCostSheetBtn')?.addEventListener('click', () => this.open('costSheet'));
        $('#costSheetHeroBtn')?.addEventListener('click', () => this.open('costSheet'));
        $('#costSheetModalClose')?.addEventListener('click', () => this.close('costSheet'));

        // All "Download Cost Sheet" buttons
        $$('.btn-gold').forEach(btn => {
            if (btn.textContent.includes('Cost Sheet') || btn.textContent.includes('cost sheet')) {
                btn.addEventListener('click', () => this.open('costSheet'));
            }
        });

        // Hero Buttons for WhatsApp navigation
        $('#paymentScheduleBtn')?.addEventListener('click', () => this.openWhatsApp('payment'));
        $('#getTokenNoBtn')?.addEventListener('click', () => this.openWhatsApp('token'));
        $('#floorPlansCTABtn')?.addEventListener('click', () => this.openWhatsApp('floorplans'));
        $('#brochureHeroBtn')?.addEventListener('click', () => this.openWhatsApp('brochure'));
        $('#floorPlansBtn')?.addEventListener('click', () => this.openWhatsApp('floorplans'));

        // Enquire Modal
        $('#enquireBtn')?.addEventListener('click', () => this.open('enquire'));
        $('#enquireModalClose')?.addEventListener('click', () => this.close('enquire'));

        // Overlay click
        this.overlay?.addEventListener('click', () => this.closeAll());

        // Form submissions
        $('#scheduleForm')?.addEventListener('submit', (e) => this.handleScheduleSubmit(e));
        $('#costSheetForm')?.addEventListener('submit', (e) => this.handleCostSheetSubmit(e));
        $('#enquireForm')?.addEventListener('submit', (e) => this.handleEnquireSubmit(e));

        // Real-time validation
        Object.values(this.modals).forEach(modal => {
            const inputs = modal.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validator.validateField(input);
                });

                input.addEventListener('input', () => {
                    if (input.classList.contains('error')) {
                        this.validator.clearError(input);
                    }
                });
            });
        });
    }

    open(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            this.closeAll();
            modal.classList.add('active');
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    close(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.classList.remove('active');
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    closeAll() {
        Object.values(this.modals).forEach(modal => {
            modal.classList.remove('active');
        });
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    openWhatsApp(type) {
        let message = '';

        switch (type) {
            case 'payment':
                message = `*Payment Schedule Request*\n\nI would like to receive the payment schedule details for Runwal The Central Park.`;
                break;
            case 'brochure':
                message = `*E-Brochure Request*\n\nI would like to receive the e-brochure for Runwal The Central Park.`;
                break;
            case 'floorplans':
                message = `*Floor Plans Request*\n\nI would like to receive detailed floor plans including Master Plan, Floor Plans, Refuge Plans, and Unit Plans with dimensions for Runwal The Central Park.`;
                break;
            case 'token':
                message = `*Token No. Request*\n\nI would like to receive the token number for Runwal The Central Park.`;
                break;

            default:
                message = CONFIG.whatsappMessage;
        }

        const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    handleScheduleSubmit(e) {
        e.preventDefault();
        const form = e.target;

        if (!this.validator.validateForm(form)) {
            return;
        }

        const formData = new FormData(form);
        const data = {
            name: form.querySelector('input[type="text"]').value,
            mobile: form.querySelector('input[type="tel"]').value,
            email: form.querySelector('input[type="email"]').value,
            date: form.querySelector('input[type="date"]').value,
            requirements: form.querySelector('textarea').value
        };

        this.submitToWhatsApp(data, 'schedule');
    }

    handleCostSheetSubmit(e) {
        e.preventDefault();
        const form = e.target;

        if (!this.validator.validateForm(form)) {
            return;
        }

        const data = {
            name: form.querySelector('input[type="text"]').value,
            mobile: form.querySelector('input[type="tel"]').value,
            email: form.querySelector('input[type="email"]').value
        };

        this.submitToWhatsApp(data, 'costSheet');
    }

    handleEnquireSubmit(e) {
        e.preventDefault();
        const form = e.target;

        if (!this.validator.validateForm(form)) {
            return;
        }

        const data = {
            name: form.querySelector('input[type="text"]').value,
            mobile: form.querySelector('input[type="tel"]').value,
            email: form.querySelector('input[type="email"]').value,
            message: form.querySelector('textarea').value
        };

        this.submitToWhatsApp(data, 'enquire');
    }

    submitToWhatsApp(data, type) {
        let message = '';

        switch (type) {
            case 'schedule':
                message = `*Site Visit Request*\n\nName: ${data.name}\nMobile: ${data.mobile}\nEmail: ${data.email || 'Not provided'}\nPreferred Date: ${data.date}\nRequirements: ${data.requirements || 'None'}`;
                break;
            case 'costSheet':
                message = `*Cost Sheet Request*\n\nName: ${data.name}\nMobile: ${data.mobile}\nEmail: ${data.email}`;
                break;
            case 'enquire':
                message = `*General Enquiry*\n\nName: ${data.name}\nMobile: ${data.mobile}\nEmail: ${data.email || 'Not provided'}\nMessage: ${data.message}`;
                break;
        }

        const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        this.closeAll();
        this.showSuccessMessage();
    }

    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.textContent = 'Redirecting to WhatsApp...';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #27ae60;
            color: white;
            padding: 1rem 2rem;
            border-radius: 4px;
            z-index: 10000;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => successDiv.remove(), 300);
        }, 2000);
    }
}

// ========================================
// PRE-REGISTRATION FORM
// ========================================

class PreRegistrationForm {
    constructor() {
        this.form = $('#preRegisterForm');
        this.validator = new FormValidator();

        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validator.validateField(input);
            });

            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validator.clearError(input);
                }
            });
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        if (!this.validator.validateForm(this.form)) {
            return;
        }

        const data = {
            name: $('#name').value,
            mobile: $('#mobile').value
        };

        const message = `*Pre-Registration Request*\n\nName: ${data.name}\nMobile: ${data.mobile}\n\nI would like to pre-register for a 1 Lakh discount on Runwal The Central Park.`;

        const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        this.showSuccessMessage();
        this.form.reset();
    }

    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.textContent = 'Redirecting to WhatsApp...';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #27ae60;
            color: white;
            padding: 1rem 2rem;
            border-radius: 4px;
            z-index: 10000;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => successDiv.remove(), 300);
        }, 2000);
    }
}

// ========================================
// LAZY LOADING IMAGES
// ========================================

class LazyLoadImages {
    constructor() {
        this.images = $$('img[loading="lazy"]');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            this.images.forEach(img => imageObserver.observe(img));
        }
    }
}

// ========================================
// SCROLL TO TOP
// ========================================

class ScrollToTop {
    constructor() {
        this.button = this.createButton();
        this.init();
    }

    createButton() {
        const button = document.createElement('button');
        button.innerHTML = '↑';
        button.className = 'scroll-to-top';
        button.setAttribute('aria-label', 'Scroll to top');
        button.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: var(--gold);
            color: white;
            font-size: 1.5rem;
            border: none;
            cursor: pointer;
            z-index: 997;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;

        document.body.appendChild(button);
        return button;
    }

    init() {
        window.addEventListener('scroll', debounce(() => {
            if (window.pageYOffset > 500) {
                this.button.style.opacity = '1';
                this.button.style.visibility = 'visible';
            } else {
                this.button.style.opacity = '0';
                this.button.style.visibility = 'hidden';
            }
        }, 100));

        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ========================================
// HEADER SCROLL EFFECT
// ========================================

class HeaderScrollEffect {
    constructor() {
        this.header = $('#header');
        this.lastScroll = 0;
        this.init();
    }

    init() {
        window.addEventListener('scroll', debounce(() => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                this.header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            } else {
                this.header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }

            this.lastScroll = currentScroll;
        }, 50));
    }
}

// ========================================
// ANIMATION ON SCROLL
// ========================================

class AnimateOnScroll {
    constructor() {
        this.elements = $$('.pricing-card, .floor-plan-card, .amenity-item, .highlights-section');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });

            this.elements.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(element);
            });
        }
    }
}

// ========================================
// ADD CSS ANIMATIONS
// ========================================

const addAnimationStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
            }
        
        @keyframes scaleIn {
            from {
                transform: scale(0.9);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
};

// ========================================
// PHONE NUMBER FORMATTING
// ========================================

class PhoneFormatter {
    constructor() {
        this.phoneInputs = $$('input[type="tel"]');
        this.init();
    }

    init() {
        this.phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 10) {
                    value = value.slice(0, 10);
                }
                e.target.value = value;
            });

            input.addEventListener('keypress', (e) => {
                if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                    e.preventDefault();
                }
            });
        });
    }
}

// ========================================
// PERFORMANCE MONITORING
// ========================================

const monitorPerformance = () => {
    if ('PerformanceObserver' in window) {
        // Monitor Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Monitor First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
    }
};

// ========================================
// INITIALIZATION
// ========================================

const init = () => {
    // Add animation styles
    addAnimationStyles();

    // Initialize all components
    new SidebarMenu();
    new SmoothScroll();
    new ModalManager();
    new PreRegistrationForm();
    new LazyLoadImages();
    new ScrollToTop();
    new HeaderScrollEffect();
    new AnimateOnScroll();
    new PhoneFormatter();

    // Monitor performance (development only)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        monitorPerformance();
    }

    // Log initialization
    console.log('🏢 Runwal The Central Park - Website Initialized');
    console.log('📱 For support, contact: +91 9929969577');
};

// ========================================
// START APP
// ========================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden');
    } else {
        console.log('Page visible');
    }
});

// Service Worker Registration (for PWA support - optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SidebarMenu,
        SmoothScroll,
        ModalManager,
        FormValidator,
        PreRegistrationForm
    };
}