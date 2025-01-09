import { showModal } from './utils.js';
import { UserManager } from './users.js';
import { FundingManager } from './fundings.js';
import { SchoolManager } from './schools.js';
import { PresentationManager } from './presentations.js';
import { RequestManager } from './requests.js';
import { TrainingSessionManager } from './trainingsessions.js';
import { CalendarManager } from './calendar.js';

class AdminPanel {
    constructor() {
        this.managers = {};
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        try {
            this.managers = {
                user: new UserManager(),
                funding: new FundingManager(),
                school: new SchoolManager(),
                presentation: new PresentationManager(),
                request: new RequestManager(),
                trainingsessions: new TrainingSessionManager(),
                calendar: new CalendarManager()
            };

            this.setupEventListeners();
            this.setupRoutes();
            this.initializeSearch();
            page();

            this.initialized = true;
            window.managers = this.managers;
        } catch (error) {
            console.error('Error initializing admin panel:', error);
            showModal('Error initializing application', true);
        }
    }

    setupEventListeners() {
        // Mobile menu toggle
        const menuIcon = document.querySelector(".menuicn");
        const nav = document.querySelector(".navcontainer");

        if (menuIcon && nav) {
            menuIcon.addEventListener("click", () => {
                nav.classList.toggle("navclose");
            });
        }

        // Navigation active state
        const navOptions = document.querySelectorAll('.nav-option');
        navOptions.forEach(option => {
            option.addEventListener('click', function() {
                navOptions.forEach(opt => opt.classList.remove('option-active'));
                this.classList.add('option-active');
            });
        });

        // Responsive behavior
        this.handleResponsive();
        window.addEventListener('resize', () => this.handleResponsive());
    }

    handleResponsive() {
        const nav = document.querySelector(".navcontainer");
        if (nav) {
            if (window.innerWidth <= 850) {
                nav.classList.add('navclose');
            } else {
                nav.classList.remove('navclose');
            }
        }
    }

    async fetchAndRenderContent(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');

            const html = await response.text();
            const mainContent = document.querySelector('.main');
            if (mainContent) {
                mainContent.innerHTML = html;
                this.updateManagerListeners();
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            showModal('Error loading content. Please try again.', true);
        }
    }

    updateManagerListeners() {
        Object.values(this.managers).forEach(manager => {
            if (manager && typeof manager.attachEventListeners === 'function') {
                manager.attachEventListeners();
            }
        });
    }

    setupRoutes() {
        const API_BASE = '/admin/api';

        // Dashboard routes
        page('/admin/panel', () => this.fetchAndRenderContent(`${API_BASE}/dashboard`));
        page('/admin/dashboard', () => this.fetchAndRenderContent(`${API_BASE}/dashboard`));

        // Funding routes
        page('/admin/fundings', () => this.fetchAndRenderContent(`${API_BASE}/fundings`));
        page('/admin/fundings/add', () => this.fetchAndRenderContent(`${API_BASE}/fundings/add`));
        page('/admin/fundings/edit/:fundingId', (ctx) =>
            this.fetchAndRenderContent(`${API_BASE}/fundings/edit/${ctx.params.fundingId}`));

        // School routes
        page('/admin/schools', () => this.fetchAndRenderContent(`${API_BASE}/schools`));
        page('/admin/schools/add', () => this.fetchAndRenderContent(`${API_BASE}/schools/add`));
        page('/admin/schools/edit/:schoolId', (ctx) =>
            this.fetchAndRenderContent(`${API_BASE}/schools/edit/${ctx.params.schoolId}`));

        // User routes
        page('/admin/users', () => this.fetchAndRenderContent(`${API_BASE}/users`));
        page('/admin/users/add', () => this.fetchAndRenderContent(`${API_BASE}/users/add`));
        page('/admin/users/edit/:userId', (ctx) =>
            this.fetchAndRenderContent(`${API_BASE}/users/edit/${ctx.params.userId}`));

        // Presentation routes
        page('/admin/presentations', () => this.fetchAndRenderContent(`${API_BASE}/presentations`));
        page('/admin/presentations/add', () => this.fetchAndRenderContent(`${API_BASE}/presentations/add`));
        page('/admin/presentations/edit/:presentationId', (ctx) =>
            this.fetchAndRenderContent(`${API_BASE}/presentations/edit/${ctx.params.presentationId}`));

        // Request routes
        page('/admin/requests', () => this.fetchAndRenderContent(`${API_BASE}/requests`));
        page('/admin/requests/add', () => this.fetchAndRenderContent(`${API_BASE}/requests/add`));
        page('/admin/requests/edit/:requestId', (ctx) =>
            this.fetchAndRenderContent(`${API_BASE}/requests/edit/${ctx.params.requestId}`));

        // Training session routes
        page('/admin/training-sessions', () => this.fetchAndRenderContent(`${API_BASE}/training-sessions`));
        page('/admin/training-sessions/add', (ctx) => {
            const queryString = ctx.querystring ? `?${ctx.querystring}` : '';
            console.log("queryString"+queryString);
            this.fetchAndRenderContent(`${API_BASE}/training-sessions/add${queryString}`);
        });
        page('/admin/training-sessions/edit/:sessionId', (ctx) => this.fetchAndRenderContent(`${API_BASE}/training-sessions/edit/${ctx.params.sessionId}`));
        
        // Calendar routes
        page('/admin/calendar', async () => {
            await this.fetchAndRenderContent(`${API_BASE}/calendar`);
            if (window.calendarData && this.managers.calendar) {
                await this.managers.calendar.init(window.calendarData);
            }
        });
        
        // Other routes
        page('/admin/logout', () => window.location.href = '/admin/logout');

        // Catch-all route
        page('/admin/*', () => this.fetchAndRenderContent(`${API_BASE}/dashboard`));
    }

    initializeSearch() {
        const searchInputs = document.querySelectorAll('.searchbar input, .searchbar2 input');
        const userCards = document.querySelectorAll('.user-card');

        searchInputs.forEach(input => {
            input?.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                userCards.forEach(card => {
                    const userName = card.querySelector('.user-name')?.textContent?.toLowerCase();
                    const userRole = card.querySelector('.user-role')?.textContent?.toLowerCase();
                    if (userName && userRole) {
                        card.style.display = (userName.includes(searchTerm) ||
                            userRole.includes(searchTerm)) ? 'flex' : 'none';
                    }
                });
            });
        });
    }
}

// Initialize once when DOM is ready
const adminPanel = new AdminPanel();
document.addEventListener('DOMContentLoaded', () => adminPanel.init());

export { adminPanel };