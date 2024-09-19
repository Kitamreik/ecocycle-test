// Wait for the DOM to be fully loaded before running the script
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

    // Add new user functionality
    const addUserBtn = document.querySelector('.add-user-btn');
    const userContainer = document.querySelector('.user-container');

    addUserBtn.addEventListener('click', function() {
        const newUser = {
            name: 'New User',
            role: 'New Role',
            img: 'default-profile.png'
        };
        addUserCard(newUser);
    });

    function addUserCard(user) {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.innerHTML = `
            <img src="${user.img}" alt="${user.name}" class="user-img">
            <h3 class="user-name">${user.name}</h3>
            <p class="user-role">${user.role}</p>
        `;
        userContainer.appendChild(userCard);
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
                attachEventListeners();
            })
            .catch(error => {
                console.error('Error fetching content:', error);
                // Optionally, display an error message to the user
                // document.querySelector('.main').innerHTML = '<p>Error loading content. Please try again.</p>';
            });
    }

    function attachEventListeners() {
        const addUserBtn = document.querySelector('.button[onclick="location.href=\'/admin/users/add\'"]');
        if (addUserBtn) {
            addUserBtn.removeAttribute('onclick');
            addUserBtn.addEventListener('click', function(e) {
                e.preventDefault();
                page('/admin/users/add');
            });
        }

        // Attach event listeners to edit buttons
        const editButtons = document.querySelectorAll('.edit-user-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const userId = this.dataset.userId;
                fetchAndRenderContent(`/admin/api/users/edit`);
            });
        });

        // Attach event listeners to delete buttons
        const deleteButtons = document.querySelectorAll('.delete-user-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const userId = this.dataset.userId;
                if (confirm('Are you sure you want to delete this user?')) {
                    deleteUser(userId);
                }
            });
        });
    }
    
    function deleteUser(userId) {
        fetch(`/admin/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'User deleted successfully') {
                    // Refresh the user list
                    fetchAndRenderContent('/admin/api/users');
                } else {
                    alert('Error deleting user');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error deleting user');
            });
    }
    
    // Function to handle form submission for editing a user
    function handleEditFormSubmission(event) {
        event.preventDefault();
        const form = event.target;
        const userId = form.dataset.userId;
        const formData = new FormData(form);

        fetch(`/admin/api/users/${userId}`, {
            method: 'PUT',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'User updated successfully') {
                    // Refresh the user list
                    fetchAndRenderContent('/admin/api/users');
                } else {
                    alert('Error updating user');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error updating user');
            });
    }
    
    // Call this function after the content is loaded
    document.addEventListener('DOMContentLoaded', attachEventListeners);

// Define routes
    page('/admin/panel', () => fetchAndRenderContent('/admin/api/dashboard'));
    page('/admin/dashboard', () => fetchAndRenderContent('/admin/api/dashboard'));
    page('/admin/requests', () => fetchAndRenderContent('/admin/api/requests'));
    page('/admin/schools', () => fetchAndRenderContent('/admin/api/schools'));
    page('/admin/users', () => fetchAndRenderContent('/admin/api/users'));
    page('/admin/users/add', () => fetchAndRenderContent('/admin/api/users/add'));
    page('/admin/users/edit/:userId', (ctx) => fetchAndRenderContent(`/admin/api/users/edit/${ctx.params.userId}`));
    page('/admin/calendar', () => fetchAndRenderContent('/admin/api/calendar'));
    page('/admin/logout', () => window.location.href = '/admin/logout');
    // Catch-all route for the admin panel
    page('/admin/*', () => fetchAndRenderContent('/admin/api/dashboard'));

// Initialize the router
    page();

});
