import { showModal } from './utils.js';

export class RequestManager {
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
        const addRequestBtn = document.querySelector('.button[onclick="location.href=\'/admin/requests/add\'"]');
        if (addRequestBtn) {
            addRequestBtn.removeAttribute('onclick');
            const addHandler = this.handleAddClick.bind(this);
            addRequestBtn.addEventListener('click', addHandler);
            this.#eventListeners.set(addRequestBtn, { type: 'click', handler: addHandler });
        }

        // Edit buttons
        const editButtons = document.querySelectorAll('.edit-request-btn');
        editButtons.forEach(button => {
            const editHandler = (e) => this.handleEditClick(e, button);
            button.addEventListener('click', editHandler);
            this.#eventListeners.set(button, { type: 'click', handler: editHandler });
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-request');
        deleteButtons.forEach(button => {
            const deleteHandler = (e) => this.handleDeleteClick(e, button);
            button.addEventListener('click', deleteHandler);
            this.#eventListeners.set(button, { type: 'click', handler: deleteHandler });
        });

        // Forms
        const editForm = document.getElementById('aufEditRequestForm');
        if (editForm) {
            const editSubmitHandler = (e) => this.handleEditFormSubmission(e);
            editForm.addEventListener('submit', editSubmitHandler);
            this.#eventListeners.set(editForm, { type: 'submit', handler: editSubmitHandler });
        }

        const addForm = document.getElementById('aufAddRequestForm');
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

    handleAddClick(e) {
        e.preventDefault();
        page('/admin/requests/add');
    }

    handleEditClick(e, button) {
        e.preventDefault();
        const requestId = button.getAttribute('data-id');
        page(`/admin/requests/edit/${requestId}`);
    }

    handleDeleteClick(e, button) {
        e.preventDefault();
        const requestId = button.getAttribute('data-id');
        showModal('Are you sure you want to delete this request?', false, true,
            () => this.deleteRequest(requestId));
    }

    async deleteRequest(requestId) {
        try {
            const response = await fetch(`/admin/api/requests/${requestId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error deleting request');
            }

            const requestRow = document.querySelector(`tr[data-id="${requestId}"]`);
            if (requestRow) {
                requestRow.remove();
            }
            showModal('Request deleted successfully');
        } catch (error) {
            console.error('Error:', error);
            showModal('Error deleting request', true);
        }
    }

    validateRequestData(formData) {
        const errors = [];

        if (!formData.get('rsid')) {
            errors.push('School is required');
        }
        if (!formData.get('rcontactname')) {
            errors.push('Contact name is required');
        }
        if (!formData.get('rcontactemail')) {
            errors.push('Contact email is required');
        }
        if (!formData.get('rstatusid')) {
            errors.push('Status is required');
        }

        // Email validation
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
        const email = formData.get('rcontactemail');
        if (email && !emailRegex.test(email)) {
            errors.push('Invalid email format');
        }

        // Phone validation if provided
        const phone = formData.get('rcontactphone');
        if (phone && !/^\d{10}$/.test(phone)) {
            errors.push('Phone number must be 10 digits');
        }

        return errors;
    }

    async handleEditFormSubmission(event) {
        event.preventDefault();
        const requestId = document.getElementById('aufRequestId')?.textContent;
        if (!requestId) {
            showModal('Error: Request ID not found', true);
            return;
        }

        const formData = new FormData(event.target);
        const validationErrors = this.validateRequestData(formData);

        if (validationErrors.length > 0) {
            showModal(`Please fix the following errors:\n${validationErrors.join('\n')}`, true);
            return;
        }

        try {
            const response = await fetch(`/admin/api/requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rsid: formData.get('rsid'),
                    rcontactname: formData.get('rcontactname'),
                    rcontactemail: formData.get('rcontactemail'),
                    rcontactphone: formData.get('rcontactphone'),
                    rcontactptype: formData.get('rcontactptype'),
                    rcontactbesttimes: formData.get('rcontactbesttimes'),
                    rstatusid: formData.get('rstatusid'),
                    rcommunication: formData.get('rcommunication'),
                    rnotes: formData.get('rnotes')
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error updating request');
            }

            showModal('Request updated successfully');
            setTimeout(() => {
                page('/admin/requests');
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error updating request', true);
        }
    }

    async handleAddFormSubmission(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const validationErrors = this.validateRequestData(formData);

        if (validationErrors.length > 0) {
            showModal(`Please fix the following errors:\n${validationErrors.join('\n')}`, true);
            return;
        }

        try {
            const response = await fetch('/admin/api/requests/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rsid: formData.get('rsid'),
                    rcontactname: formData.get('rcontactname'),
                    rcontactemail: formData.get('rcontactemail'),
                    rcontactphone: formData.get('rcontactphone'),
                    rcontactptype: formData.get('rcontactptype'),
                    rcontactbesttimes: formData.get('rcontactbesttimes'),
                    rstatusid: formData.get('rstatusid'),
                    rcommunication: formData.get('rcommunication'),
                    rnotes: formData.get('rnotes')
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error adding request');
            }

            showModal('Request added successfully!', false);
            setTimeout(() => {
                page('/admin/requests');
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error adding request', true);
        }
    }
}