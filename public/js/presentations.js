import { showModal } from './utils.js';

export class PresentationManager {
    #eventListeners = new Map(); // Private field to track event listeners

    constructor() {
        this.init();
    }

    init() {
        // Only attach event listeners, don't run any other initialization
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Clean up existing event listeners
        this.removeEventListeners();

        // Add button
        const addPresentationBtn = document.querySelector('.button[onclick="location.href=\'/admin/presentations/add\'"]');
        if (addPresentationBtn) {
            addPresentationBtn.removeAttribute('onclick');
            const addHandler = this.handleAddClick.bind(this);
            addPresentationBtn.addEventListener('click', addHandler);
            this.#eventListeners.set(addPresentationBtn, { type: 'click', handler: addHandler });
        }

        // Edit buttons
        const editButtons = document.querySelectorAll('.edit-presentation-btn');
        editButtons.forEach(button => {
            const editHandler = (e) => this.handleEditClick(e, button);
            button.addEventListener('click', editHandler);
            this.#eventListeners.set(button, { type: 'click', handler: editHandler });
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-presentation');
        deleteButtons.forEach(button => {
            const deleteHandler = (e) => this.handleDeleteClick(e, button);
            button.addEventListener('click', deleteHandler);
            this.#eventListeners.set(button, { type: 'click', handler: deleteHandler });
        });

        // Forms
        const editForm = document.getElementById('aufEditPresentationForm');
        if (editForm) {
            const editSubmitHandler = (e) => this.handleEditFormSubmission(e);
            editForm.addEventListener('submit', editSubmitHandler);
            this.#eventListeners.set(editForm, { type: 'submit', handler: editSubmitHandler });
        }

        const addForm = document.getElementById('aufAddPresentationForm');
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
        page('/admin/presentations/add');
    }

    handleEditClick(e, button) {
        e.preventDefault();
        const presentationId = button.getAttribute('data-id');
        page(`/admin/presentations/edit/${presentationId}`);
    }

    handleDeleteClick(e, button) {
        e.preventDefault();
        const presentationId = button.getAttribute('data-id');
        showModal('Are you sure you want to delete this presentation?', false, true,
            () => this.deletePresentation(presentationId));
    }

    async deletePresentation(presentationId) {
        try {
            const response = await fetch(`/admin/api/presentations/${presentationId}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error deleting presentation');
            }

            const presentationRow = document.querySelector(`tr[data-id="${presentationId}"]`);
            if (presentationRow) {
                presentationRow.remove();
            }
            showModal('Presentation deleted successfully');
        } catch (error) {
            console.error('Error:', error);
            showModal('Error deleting presentation', true);
        }
    }

    async handleEditFormSubmission(event) {
        event.preventDefault();
        const presentationId = document.getElementById('aufPresentationId')?.textContent;
        if (!presentationId) {
            showModal('Error: Presentation ID not found', true);
            return;
        }

        const formData = new FormData(event.target);

        try {
            const response = await fetch(`/admin/api/presentations/${presentationId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    pname: formData.get('pname'),
                    pcategoryid: formData.get('pcategoryid')
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error updating presentation');
            }

            showModal('Presentation updated successfully');
            setTimeout(() => {
                page('/admin/presentations');
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error updating presentation', true);
        }
    }

    async handleAddFormSubmission(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            const response = await fetch('/admin/api/presentations/add', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    pname: formData.get('pname'),
                    pcategoryid: formData.get('pcategoryid')
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error adding presentation');
            }

            showModal('Presentation added successfully!', false);
            setTimeout(() => {
                page('/admin/presentations');
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error adding presentation', true);
        }
    }
}