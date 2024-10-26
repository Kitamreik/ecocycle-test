import { showModal } from './utils.js';

export class FundingManager {
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
        const addFundingBtn = document.querySelector('.button[onclick="location.href=\'/admin/fundings/add\'"]');
        if (addFundingBtn) {
            addFundingBtn.removeAttribute('onclick');
            const addHandler = this.handleAddClick.bind(this);
            addFundingBtn.addEventListener('click', addHandler);
            this.#eventListeners.set(addFundingBtn, { type: 'click', handler: addHandler });
        }

        // Edit buttons
        const editButtons = document.querySelectorAll('.edit-funding-btn');
        editButtons.forEach(button => {
            const editHandler = (e) => this.handleEditClick(e, button);
            button.addEventListener('click', editHandler);
            this.#eventListeners.set(button, { type: 'click', handler: editHandler });
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-funding');
        deleteButtons.forEach(button => {
            const deleteHandler = (e) => this.handleDeleteClick(e, button);
            button.addEventListener('click', deleteHandler);
            this.#eventListeners.set(button, { type: 'click', handler: deleteHandler });
        });

        // Forms
        const editForm = document.getElementById('editFundingForm');
        if (editForm) {
            const editSubmitHandler = (e) => this.handleEditFormSubmission(e);
            editForm.addEventListener('submit', editSubmitHandler);
            this.#eventListeners.set(editForm, { type: 'submit', handler: editSubmitHandler });
        }

        const addForm = document.getElementById('aufAddFundingForm');
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
        page('/admin/fundings/add');
    }

    handleEditClick(e, button) {
        e.preventDefault();
        const fundingId = button.getAttribute('data-id');
        page(`/admin/fundings/edit/${fundingId}`);
    }

    handleDeleteClick(e, button) {
        e.preventDefault();
        const fundingId = button.getAttribute('data-id');
        showModal('Are you sure you want to delete this funding source?', false, true,
            () => this.deleteFunding(fundingId));
    }

    async deleteFunding(fundingId) {
        try {
            const response = await fetch(`/admin/api/fundings/${fundingId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error deleting funding source');
            }

            const fundingRow = document.querySelector(`tr[data-id="${fundingId}"]`);
            if (fundingRow) {
                fundingRow.remove();
            }
            showModal('Funding source deleted successfully');
        } catch (error) {
            console.error('Error:', error);
            showModal('Error deleting funding source', true);
        }
    }

    async handleEditFormSubmission(event) {
        event.preventDefault();
        const fundingId = document.getElementById('fundingId')?.textContent;
        if (!fundingId) {
            showModal('Error: Funding ID not found', true);
            return;
        }

        const formData = new FormData(event.target);
        const fName = formData.get('fName');
        if (!fName) {
            showModal('Error: Funding name is required', true);
            return;
        }

        try {
            const response = await fetch(`/admin/api/fundings/${fundingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fName })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error updating funding source');
            }

            showModal('Funding updated successfully');
            setTimeout(() => {
                page('/admin/fundings');
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error updating funding source', true);
        }
    }

    async handleAddFormSubmission(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const fName = formData.get('fName');

        if (!fName) {
            showModal('Error: Funding name is required', true);
            return;
        }

        try {
            const response = await fetch('/admin/api/fundings/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fName })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error adding funding source');
            }

            showModal('Funding source added successfully!', false);
            setTimeout(() => {
                page('/admin/fundings');
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error adding funding source', true);
        }
    }
}