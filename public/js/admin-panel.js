// admin-panel.js
import { UserManager } from './users.js';
import { FundingManager } from './fundings.js';
import { SchoolManager } from './schools.js';
import { PresentationManager } from "./presentations";

document.addEventListener('DOMContentLoaded', function() {
    // Initialize managers
    const userManager = new UserManager();
    const fundingManager = new FundingManager();
    const schoolManager = new SchoolManager();
    const presentationManager = new PresentationManager();
    // Mobile menu toggle
    const menuIcon = document.querySelector(".menuicn");
    const nav = document.querySelector(".navcontainer");

    menuIcon.addEventListener("click", () => {
        nav.classList.toggle("navclose");
    });

    // Navigation active state
    const navOptions = document.querySelectorAll('.nav-option');
    navOptions.forEach(option => {
        option.addEventListener('click', function() {
            navOptions.forEach(opt => opt.classList.remove('option-active'));
            this.classList.add('option-active');
        });
    });

    // Responsive behavior
    function handleResponsive() {
        if (window.innerWidth <= 850) {
            nav.classList.add('navclose');
        } else {
            nav.classList.remove('navclose');
        }
    }
    window.addEventListener('resize', handleResponsive);
    handleResponsive(); // Call once on load

    // Function to fetch and render content
    function fetchAndRenderContent(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.text();
            })
            .then(html => {
                document.querySelector('.main').innerHTML = html;
                userManager.init();
                fundingManager.init();
                schoolManager.init();
                presentationManager.init();
            })
            .catch(error => {
                console.error('Error fetching content:', error);
                showModal('Error loading content. Please try again.', true);
            });
    }

    // Define routes
    page('/admin/panel', () => fetchAndRenderContent('/admin/api/dashboard'));
    page('/admin/dashboard', () => fetchAndRenderContent('/admin/api/dashboard'));
    page('/admin/requests', () => fetchAndRenderContent('/admin/api/requests'));
    page('/admin/training-sessions', () => fetchAndRenderContent('/admin/api/training-sessions'));

    // Funding routes
    page('/admin/fundings', () => fetchAndRenderContent('/admin/api/fundings'));
    page('/admin/fundings/add', () => fetchAndRenderContent('/admin/api/fundings/add'));
    page('/admin/fundings/edit/:fundingId', (ctx) =>
        fetchAndRenderContent(`/admin/api/fundings/edit/${ctx.params.fundingId}`)
    );
    // School routes
    page('/admin/schools', () => fetchAndRenderContent('/admin/api/schools'));
    page('/admin/schools/add', () => fetchAndRenderContent('/admin/api/schools/add'));
    page('/admin/schools/edit/:schoolId', (ctx) =>
        fetchAndRenderContent(`/admin/api/schools/edit/${ctx.params.schoolId}`)
    );
    
    // User routes
    page('/admin/users', () => fetchAndRenderContent('/admin/api/users'));
    page('/admin/users/add', () => fetchAndRenderContent('/admin/api/users/add'));
    page('/admin/users/edit/:userId', (ctx) =>
        fetchAndRenderContent(`/admin/api/users/edit/${ctx.params.userId}`)
    );
    
    // Presentation routes
    page('/admin/presentations', () => fetchAndRenderContent('/admin/api/presentations'));
    page('/admin/presentations/add', () => fetchAndRenderContent('/admin/api/presentations/add'));
    page('/admin/presentations/edit/:presentationId', (ctx) => fetchAndRenderContent(`/admin/api/presentations/edit/${ctx.params.presentationId}`));
    
    page('/admin/calendar', () => fetchAndRenderContent('/admin/api/calendar'));
    page('/admin/logout', () => window.location.href = '/admin/logout');

    // Catch-all route for the admin panel
    page('/admin/*', () => fetchAndRenderContent('/admin/api/dashboard'));

    // Initialize the router
    page();

    // Initialize Search Functionality
    function initializeSearch() {
        const searchInputs = document.querySelectorAll('.searchbar input, .searchbar2 input');
        const userCards = document.querySelectorAll('.user-card');

        searchInputs.forEach(input => {
            input.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                userCards.forEach(card => {
                    const userName = card.querySelector('.user-name')?.textContent.toLowerCase();
                    const userRole = card.querySelector('.user-role')?.textContent.toLowerCase();
                    if (userName && userRole) {
                        card.style.display = (userName.includes(searchTerm) ||
                            userRole.includes(searchTerm)) ? 'flex' : 'none';
                    }
                });
            });
        });
    }

    // Hook up the search functionality
    initializeSearch();

    // Expose managers to window for debugging if needed
    if (process.env.NODE_ENV === 'development') {
        window.managers = {
            user: userManager,
            funding: fundingManager,
            school: schoolManager,
            presentation: presentationManager
        };
    }
});

// Utility function to show modals (if needed at panel level)
function showModal(message, isError = false) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-content ${isError ? 'error' : 'success'}">
            <p>${message}</p>
            <button class="close-modal">Close</button>
        </div>
    `;

    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.close-modal');
    const closeModal = () => document.body.removeChild(modal);

    closeButton.addEventListener('click', closeModal);
    setTimeout(closeModal, 3000);
}