// ========================================
// CONFIGURATION
// ========================================

const CONFIG = {
    whatsappNumber: '918857090799',
    whatsappMessage: 'Hello! I am interested in Runwal The Central Park. Please provide more details.',
    // Replace this URL with your Google Apps Script Web App URL after deployment
    googleSheetURL: 'https://script.google.com/macros/s/AKfycbw0c_YiZ9W0-f2fRIe0MGSUuyMcd5BoCNoero-SFiHxYo5y7-c2W3Iz7YGGAqBfy6k/exec'
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

        if (rule.required && !value) {
            return {
                isValid: false,
                message: `${this.capitalize(name)} is required`
            };
        }

        if (!rule.required && !value) {
            return { isValid: true };
        }

        if (rule.minLength && value.length < rule.minLength) {
            return {
                isValid: false,
                message: rule.message
            };
        }

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

        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

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
// GOOGLE SHEETS INTEGRATION (FIXED)
// ========================================

class GoogleSheetsIntegration {
    constructor() {
        this.url = CONFIG.googleSheetURL;
    }

    async submitData(data) {
        // Check if URL is configured
        if (!this.url || this.url === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
            console.warn('Google Sheets URL not configured. Data will not be saved to sheets.');
            return { success: true, warning: 'Sheets not configured' };
        }

        try {
            // Create form data instead of JSON
            const formData = new URLSearchParams();
            for (const key in data) {
                formData.append(key, data[key]);
            }

            const response = await fetch(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
                redirect: 'follow'
            });

            // Check if request was successful
            if (response.ok || response.type === 'opaque') {
                console.log('Data submitted to Google Sheets successfully');
                return { success: true };
            } else {
                console.error('Failed to submit to Google Sheets:', response.status);
                return { success: false, error: `HTTP ${response.status}` };
            }
        } catch (error) {
            console.error('Error submitting to Google Sheets:', error);
            // Don't block user flow if sheets fail
            return { success: true, warning: error.message };
        }
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
        this.googleSheets = new GoogleSheetsIntegration();

        this.init();
    }

    init() {
        // Schedule Visit Modal
        $('#scheduleVisitBtn')?.addEventListener('click', () => this.openWhatsApp('schedule'));
        $('#scheduleModalClose')?.addEventListener('click', () => this.close('schedule'));

        // Cost Sheet Modal
        $('#downloadCostSheetBtn')?.addEventListener('click', () => this.openWhatsApp('costSheet'));
        
        $('#costSheetModalClose')?.addEventListener('click', () => this.close('costSheet'));

        // All "Download Cost Sheet" buttons
        // $$('.btn-gold').forEach(btn => {
        //     if (btn.textContent.includes('Cost Sheet') || btn.textContent.includes('cost sheet')) {
        //         btn.addEventListener('click', () => this.open('costSheet'));
        //     }
        // });
        

        // Hero Buttons for WhatsApp navigation
        $('#paymentScheduleBtn')?.addEventListener('click', () => this.openWhatsApp('payment'));
         $('#viewSkyBtn')?.addEventListener('click', () => this.openWhatsApp('viewSky'));
        $('#enquireNowBtn')?.addEventListener('click', () => this.openWhatsApp('enquire'));
        $('#getTokenNoBtn')?.addEventListener('click', () => this.openWhatsApp('token'));
        $('#floorPlansCTABtn')?.addEventListener('click', () => this.openWhatsApp('floorplans'));
        $('#costSheetHeroBtn')?.addEventListener('click', () => this.openWhatsApp('costSheet'));
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
                case 'viewSky':
                message = `*View Sky Club  Request*\n\nI would like to receive the View Sky Club plan for Runwal The Central Park.`;
                break;
                case 'schedule':
                message = `*Schedule Request*\n\nI would like to schedule visit for Runwal The Central Park.`;
                break;
                case 'enquire':
                message = `*Enquire  Request*\n\nI would like to enquire details for Runwal The Central Park.`;
                break;
                case 'costSheet':
                message = `*Cost Sheet Request*\n\nI would like to receive the cost sheet details for Runwal The Central Park.`;
                break;
            case 'brochure':
                message = `*E-Brochure Request*\n\nI would like to receive the e-brochure for Runwal The Central Park.`;
                break;
            case 'floorplans':
                message = `*Floor Plans Request*\n\nI would like to receive detailed floor plans including Master Plan, Floor Plans, Refuge Plans, and Unit Plans with dimensions for Runwal The Central Park.`;
                break;
            case 'token':
                message = `*Discount Code Request*\n\nI would like to receive the discount code for Runwal The Central Park.`;
                break;
            default:
                message = CONFIG.whatsappMessage;
        }

        const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    async handleScheduleSubmit(e) {
        e.preventDefault();
        const form = e.target;

        if (!this.validator.validateForm(form)) {
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        const data = {
            type: 'Schedule Visit',
            name: form.querySelector('input[type="text"]').value,
            mobile: form.querySelector('input[type="tel"]').value,
            email: form.querySelector('input[type="email"]').value || 'Not provided',
            date: form.querySelector('input[type="date"]').value,
            requirements: form.querySelector('textarea').value || 'None',
            message: '',
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };

        // Submit to Google Sheets (non-blocking)
        this.googleSheets.submitData(data).then(result => {
            if (result.success) {
                console.log('Schedule visit saved to Google Sheets');
            } else {
                console.warn('Google Sheets save failed, but continuing...');
            }
        });

        // Always proceed with WhatsApp regardless of sheets result
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            this.showSuccessMessage('Request submitted successfully!');
            this.submitToWhatsApp(data, 'schedule');
            form.reset();
        }, 500);
    }

    async handleCostSheetSubmit(e) {
        e.preventDefault();
        const form = e.target;

        if (!this.validator.validateForm(form)) {
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        const data = {
            type: 'Cost Sheet Request',
            name: form.querySelector('input[type="text"]').value,
            mobile: form.querySelector('input[type="tel"]').value,
            email: form.querySelector('input[type="email"]').value,
            date: '',
            requirements: '',
            message: '',
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };

        // Submit to Google Sheets (non-blocking)
        this.googleSheets.submitData(data).then(result => {
            if (result.success) {
                console.log('Cost sheet request saved to Google Sheets');
            } else {
                console.warn('Google Sheets save failed, but continuing...');
            }
        });

        // Always proceed with WhatsApp regardless of sheets result
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            this.showSuccessMessage('Request submitted successfully!');
            this.submitToWhatsApp(data, 'costSheet');
            form.reset();
        }, 500);
    }

    async handleEnquireSubmit(e) {
        e.preventDefault();
        const form = e.target;

        if (!this.validator.validateForm(form)) {
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        const data = {
            type: 'General Enquiry',
            name: form.querySelector('input[type="text"]').value,
            mobile: form.querySelector('input[type="tel"]').value,
            email: form.querySelector('input[type="email"]').value || 'Not provided',
            date: '',
            requirements: '',
            message: form.querySelector('textarea').value,
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };

        // Submit to Google Sheets (non-blocking)
        this.googleSheets.submitData(data).then(result => {
            if (result.success) {
                console.log('Enquiry saved to Google Sheets');
            } else {
                console.warn('Google Sheets save failed, but continuing...');
            }
        });

        // Always proceed with WhatsApp regardless of sheets result
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            this.showSuccessMessage('Enquiry submitted successfully!');
            this.submitToWhatsApp(data, 'enquire');
            form.reset();
        }, 500);
    }

    submitToWhatsApp(data, type) {
        let message = '';

        switch (type) {
            case 'schedule':
                message = `*Site Visit Request*\n\nName: ${data.name}\nMobile: ${data.mobile}\nEmail: ${data.email}\nPreferred Date: ${data.date}\nRequirements: ${data.requirements}`;
                break;
            case 'costSheet':
                message = `*Cost Sheet Request*\n\nName: ${data.name}\nMobile: ${data.mobile}\nEmail: ${data.email}`;
                break;
            case 'enquire':
                message = `*General Enquiry*\n\nName: ${data.name}\nMobile: ${data.mobile}\nEmail: ${data.email}\nMessage: ${data.message}`;
                break;
        }

        const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        this.closeAll();
    }

    showSuccessMessage(text = 'Data submitted successfully!') {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.innerHTML = `
            <span style="font-size: 1.5rem; margin-right: 0.5rem;">✓</span>
            <span>${text}</span>
        `;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #27ae60;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            max-width: 90%;
        `;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => successDiv.remove(), 300);
        }, 3000);
    }

    showErrorMessage(text = 'Something went wrong. Please try again.') {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-toast';
        errorDiv.innerHTML = `
            <span style="font-size: 1.5rem; margin-right: 0.5rem;">⚠</span>
            <span>${text}</span>
        `;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #e74c3c;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            max-width: 90%;
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }, 4000);
    }
}

// ========================================
// PRE-REGISTRATION FORM
// ========================================

class PreRegistrationForm {
    constructor() {
        this.form = $('#preRegisterForm');
        this.validator = new FormValidator();
        this.googleSheets = new GoogleSheetsIntegration();

        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

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

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validator.validateForm(this.form)) {
            return;
        }

        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        const data = {
            type: 'Pre-Registration',
            name: $('#name').value,
            mobile: $('#mobile').value,
            email: '',
            date: '',
            requirements: '',
            message: '',
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };

        // Submit to Google Sheets (non-blocking)
        this.googleSheets.submitData(data).then(result => {
            if (result.success) {
                console.log('Pre-registration saved to Google Sheets');
            } else {
                console.warn('Google Sheets save failed, but continuing...');
            }
        });

        // Always proceed with WhatsApp regardless of sheets result
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            this.showSuccessMessage();

            const message = `*Pre-Registration Request*\n\nName: ${data.name}\nMobile: ${data.mobile}\n\nI would like to pre-register for a 1 Lakh discount on Runwal The Central Park.`;
            const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');

            this.form.reset();
        }, 500);
    }

    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.innerHTML = `
            <span style="font-size: 1.5rem; margin-right: 0.5rem;">✓</span>
            <span>Pre-registration successful! Redirecting to WhatsApp...</span>
        `;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #27ae60;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            max-width: 90%;
        `;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => successDiv.remove(), 300);
        }, 3000);
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

    // Log initialization
    console.log('🏢 Runwal The Central Park - Website Initialized');
    console.log('📱 For support, contact: +91 9929969577');
    console.log('📊 Google Sheets Integration: Active');
};

// ========================================
// START APP
// ========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden');
    } else {
        console.log('Page visible');
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SidebarMenu,
        SmoothScroll,
        ModalManager,
        FormValidator,
        PreRegistrationForm,
        GoogleSheetsIntegration
    };
}
