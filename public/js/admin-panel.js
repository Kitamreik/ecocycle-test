import { attachUserEventListeners, showModal } from './users.js';

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuIcon = document.querySelector(".menuicn");
    const nav = document.querySelector(".navcontainer");

    menuIcon.addEventListener("click", () => {
        nav.classList.toggle("navclose");
    });

    // Search functionality
    const searchInputs = document.querySelectorAll('.searchbar input, .searchbar2 input');
    const userCards = document.querySelectorAll('.user-card');

    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            userCards.forEach(card => {
                const userName = card.querySelector('.user-name').textContent.toLowerCase();
                const userRole = card.querySelector('.user-role').textContent.toLowerCase();
                if (userName.includes(searchTerm) || userRole.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
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
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                document.querySelector('.main').innerHTML = html;
                attachUserEventListeners();
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
    page('/admin/schools', () => fetchAndRenderContent('/admin/api/schools'));
    page('/admin/presentations', () => fetchAndRenderContent('/admin/api/presentations'));
    page('/admin/fundings', () => fetchAndRenderContent('/admin/api/fundings'));
    page('/admin/users', () => fetchAndRenderContent('/admin/api/users'));
    page('/admin/users/add', () => fetchAndRenderContent('/admin/api/users/add'));
    page('/admin/users/edit/:userId', (ctx) => fetchAndRenderContent(`/admin/api/users/edit/${ctx.params.userId}`));
    page('/admin/calendar', () => fetchAndRenderContent('/admin/api/calendar'));
    page('/admin/logout', () => window.location.href = '/admin/logout');
    // Catch-all route for the admin panel
    page('/admin/*', () => fetchAndRenderContent('/admin/api/dashboard'));

    // Initialize the router
    page();

    // Initial call to attach event listeners
    attachUserEventListeners();
});