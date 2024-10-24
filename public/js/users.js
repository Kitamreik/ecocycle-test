// users.js
export class UserManager {
    constructor() {
        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Add button
        const addUserBtn = document.querySelector('.button[onclick="location.href=\'/admin/users/add\'"]');
        if (addUserBtn) {
            addUserBtn.removeAttribute('onclick');
            addUserBtn.addEventListener('click', this.handleAddClick.bind(this));
        }

        // Edit buttons
        const editButtons = document.querySelectorAll('.edit-user-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', this.handleEditClick.bind(this));
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-user');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleDeleteClick(e, button));
        });

        // Forms
        const editForm = document.getElementById('eufEditUserForm');
        if (editForm) {
            editForm.addEventListener('submit', this.handleEditFormSubmission.bind(this));
        }

        const addForm = document.getElementById('aufAddUserForm');
        if (addForm) {
            addForm.addEventListener('submit', this.handleAddFormSubmission.bind(this));
        }
    }

    handleAddClick(e) {
        e.preventDefault();
        page('/admin/users/add');
    }

    handleEditClick(e) {
        e.preventDefault();
        const userId = this.dataset.userId;
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
            const data = await response.json();

            if (data.message === 'User deleted successfully') {
                const userRow = document.querySelector(`tr[data-id="${userId}"]`);
                if (userRow) userRow.remove();
                showModal('User deleted successfully');
            } else {
                throw new Error(data.error || 'Error deleting user');
            }
        } catch (error) {
            console.error('Error:', error);
            showModal('Error deleting user', true);
        }
    }

    async handleEditFormSubmission(event) {
        event.preventDefault();
        const userId = document.getElementById('eufUserId').textContent;
        const formData = new FormData(event.target);

        try {
            const response = await fetch(`/admin/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            const data = await response.json();

            if (data.message === 'User updated successfully') {
                page('/admin/users');
            } else {
                throw new Error(data.error || 'Error updating user');
            }
        } catch (error) {
            console.error('Error:', error);
            showModal('Error updating user', true);
        }
    }

    async handleAddFormSubmission(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            const response = await fetch('/admin/api/users/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            showModal('User added successfully!', false);
            page('/admin/users');
        } catch (error) {
            console.error('Error:', error);
            showModal('Error adding user', true);
        }
    }
}

export function showModal(message, isError = false, isConfirmation = false, onConfirm = null) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';

    let buttonHtml = isConfirmation
        ? '<button class="confirm-modal">Confirm</button><button class="cancel-modal">Cancel</button>'
        : '<button class="close-modal">Close</button>';

    modal.innerHTML = `
        <div class="modal-content ${isError ? 'error' : isConfirmation ? 'confirmation' : 'success'}">
            <p>${message}</p>
            ${buttonHtml}
        </div>
    `;
    document.body.appendChild(modal);

    const closeModal = () => {
        document.body.removeChild(modal);
    };

    if (isConfirmation) {
        const confirmButton = modal.querySelector('.confirm-modal');
        const cancelButton = modal.querySelector('.cancel-modal');

        confirmButton.addEventListener('click', () => {
            closeModal();
            if (onConfirm) onConfirm();
        });

        cancelButton.addEventListener('click', closeModal);
    } else {
        const closeButton = modal.querySelector('.close-modal');
        closeButton.addEventListener('click', closeModal);

        // Auto-close the modal after 3 seconds for non-confirmation modals
        setTimeout(closeModal, 3000);
    }
}