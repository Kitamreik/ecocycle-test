export function attachUserEventListeners() {
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
            page(`/admin/users/edit/${userId}`);
        });
    });

    // Attach event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-user');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDeleteUser);
    });

    const editForm = document.getElementById('eufEditUserForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditFormSubmission);
    }

    // Attach event listener to add user form
    const addUserForm = document.getElementById('aufAddUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUserForm);
    }
}

function handleDeleteUser(event) {
    event.preventDefault();
    const userId = this.getAttribute('data-id');
    showModal('Are you sure you want to delete this user?', false, true, () => deleteUser(userId));
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
                const userRow = document.querySelector(`tr[data-id="${userId}"]`);
                if (userRow) {
                    userRow.remove();
                }
                showModal('User deleted successfully');
            } else {
                showModal('Error deleting user', true);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            showModal('Error deleting user', true);
        });
}

function handleEditFormSubmission(event) {
    event.preventDefault();
    const form = event.target;
    const userId = document.getElementById('eufUserId').textContent;
    const formData = new FormData(form);
    const userData = Object.fromEntries(formData);

    fetch(`/admin/api/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'User updated successfully') {
                page('/admin/users');
            } else {
                showModal('Error updating user', true);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            showModal('Error updating user', true);
        });
}

function handleAddUserForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData);

    fetch('/admin/api/users/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            showModal('User added successfully!', false);
            page('/admin/users');
        })
        .catch(error => {
            console.error('Error:', error);
            showModal('Error adding user', true);
        });
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