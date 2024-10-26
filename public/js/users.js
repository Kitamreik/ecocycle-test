import { showModal } from './utils.js';

export class UserManager {
    #eventListeners = new Map(); // Private field to track event listeners

    constructor() {
        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Clean up existing event listeners
        this.removeEventListeners();

        // Add button
        const addUserBtn = document.querySelector('.button[onclick="location.href=\'/admin/users/add\'"]');
        if (addUserBtn) {
            addUserBtn.removeAttribute('onclick');
            const addHandler = this.handleAddClick.bind(this);
            addUserBtn.addEventListener('click', addHandler);
            this.#eventListeners.set(addUserBtn, { type: 'click', handler: addHandler });
        }

        // Edit buttons
        const editButtons = document.querySelectorAll('.edit-user-btn');
        editButtons.forEach(button => {
            const editHandler = (e) => this.handleEditClick(e, button);
            button.addEventListener('click', editHandler);
            this.#eventListeners.set(button, { type: 'click', handler: editHandler });
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-user');
        deleteButtons.forEach(button => {
            const deleteHandler = (e) => this.handleDeleteClick(e, button);
            button.addEventListener('click', deleteHandler);
            this.#eventListeners.set(button, { type: 'click', handler: deleteHandler });
        });

        // Forms
        const editForm = document.getElementById('eufEditUserForm');
        if (editForm) {
            const editSubmitHandler = (e) => this.handleEditFormSubmission(e);
            editForm.addEventListener('submit', editSubmitHandler);
            this.#eventListeners.set(editForm, { type: 'submit', handler: editSubmitHandler });
        }

        const addForm = document.getElementById('aufAddUserForm');
        if (addForm) {
            const addSubmitHandler = (e) => this.handleAddFormSubmission(e);
            addForm.addEventListener('submit', addSubmitHandler);
            this.#eventListeners.set(addForm, { type: 'submit', handler: addSubmitHandler });
        }
    }

    removeEventListeners() {
        // Clean up old event listeners to prevent memory leaks
        this.#eventListeners.forEach((config, element) => {
            element.removeEventListener(config.type, config.handler);
        });
        this.#eventListeners.clear();
    }

    validateUserData(formData) {
        const errors = [];

        // Username validation
        const username = formData.get('username');
        if (!username) {
            errors.push('Username is required');
        } else if (username.length < 2 || username.length > 50) {
            errors.push('Username must be between 2 and 50 characters');
        }

        // Email validation
        const email = formData.get('useremail');
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
        if (!email) {
            errors.push('Email is required');
        } else if (!emailRegex.test(email)) {
            errors.push('Invalid email format');
        }

        // Phone validation if provided
        const phone = formData.get('userphone');
        if (phone && !/^\d{10}$/.test(phone)) {
            errors.push('Phone number must be 10 digits');
        }

        return errors;
    }

    handleAddClick(e) {
        e.preventDefault();
        page('/admin/users/add');
    }

    handleEditClick(e, button) {
        e.preventDefault();
        const userId = button.getAttribute('data-id');
        page(`/admin/users/edit/${userId}`);
    }

    handleDeleteClick(e, button) {
        e.preventDefault();
        const userId = button.getAttribute('data-id');
        showModal('Are you sure you want to delete this user?', false, true,
            () => this.deleteUser(userId));
    }

    async deleteUser(userId) {
        try {
            const response = await fetch(`/admin/api/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error deleting user');
            }

            const userRow = document.querySelector(`tr[data-id="${userId}"]`);
            if (userRow) {
                userRow.remove();
            }
            showModal('User deleted successfully');
        } catch (error) {
            console.error('Error:', error);
            showModal('Error deleting user', true);
        }
    }

    async handleEditFormSubmission(event) {
        event.preventDefault();
        const userId = document.getElementById('eufUserId')?.textContent;
        if (!userId) {
            showModal('Error: User ID not found', true);
            return;
        }

        const formData = new FormData(event.target);
        const validationErrors = this.validateUserData(formData);

        if (validationErrors.length > 0) {
            showModal(`Please fix the following errors:\n${validationErrors.join('\n')}`, true);
            return;
        }

        try {
            const response = await fetch(`/admin/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.get('username'),
                    useremail: formData.get('useremail'),
                    userphone: formData.get('userphone'),
                    isactive: formData.get('isactive') === 'true'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error updating user');
            }

            showModal('User updated successfully');
            setTimeout(() => {
                page('/admin/users');
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error updating user', true);
        }
    }

    async handleAddFormSubmission(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const validationErrors = this.validateUserData(formData);

        if (validationErrors.length > 0) {
            showModal(`Please fix the following errors:\n${validationErrors.join('\n')}`, true);
            return;
        }

        try {
            const response = await fetch('/admin/api/users/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.get('username'),
                    useremail: formData.get('useremail'),
                    userphone: formData.get('userphone'),
                    isactive: formData.get('isactive') === 'true'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error adding user');
            }

            showModal('User added successfully!', false);
            setTimeout(() => {
                page('/admin/users');
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error adding user', true);
        }
    }
}