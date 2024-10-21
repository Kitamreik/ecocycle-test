export function attachRequestEventListeners() {
    const addRequestBtn = document.querySelector('.button[onclick="location.href=\'/admin/requests/add\'"]');
    if (addRequestBtn) {
        addRequestBtn.removeAttribute('onclick');
        addRequestBtn.addEventListener('click', function(e) {
            e.preventDefault();
            page('/admin/requests/add');
        });
    }

    // Attach event listeners to edit buttons
    const editButtons = document.querySelectorAll('.edit-request-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const requestId = this.dataset.requestId;
            page(`/admin/requests/edit/${requestId}`);
        });
    });

    // Attach event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-request');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDeleteRequest);
    });

    const editForm = document.getElementById('erfEditRequestForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditFormSubmission);
    }

    // Attach event listener to add request form
    const addRequestForm = document.getElementById('arfAddRequestForm');
    if (addRequestForm) {
        addRequestForm.addEventListener('submit', handleAddRequestForm);
    }
}

function handleDeleteRequest(event) {
    event.preventDefault();
    const requestId = this.getAttribute('data-id');
    showModal('Are you sure you want to delete this request?', false, true, () => deleteRequest(requestId));
}

function deleteRequest(requestId) {
    fetch(`/admin/api/requests/${requestId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Request deleted successfully') {
                const requestRow = document.querySelector(`tr[data-id="${requestId}"]`);
                if (requestRow) {
                    requestRow.remove();
                }
                showModal('Request deleted successfully');
            } else {
                showModal('Error deleting request', true);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            showModal('Error deleting request', true);
        });
}

function handleEditFormSubmission(event) {
    event.preventDefault();
    const form = event.target;
    const requestId = document.getElementById('erfRequestId').textContent;
    const formData = new FormData(form);
    const requestData = Object.fromEntries(formData);

    fetch(`/admin/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Request updated successfully') {
                page('/admin/requests');
            } else {
                showModal('Error updating request', true);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            showModal('Error updating request', true);
        });
}

function handleAddRequestForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const requestData = Object.fromEntries(formData);

    fetch('/admin/api/requests/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            showModal('Request added successfully!', false);
            page('/admin/requests');
        })
        .catch(error => {
            console.error('Error:', error);
            showModal('Error adding request', true);
        });
}

// Reuse the showModal function from users.js
import { showModal } from './users.js';