export class PresentationManager {
    constructor() {
        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Add button
        const addPresentationBtn = document.querySelector('.button[onclick="location.href=\'/admin/presentations/add\'"]');
        if (addPresentationBtn) {
            addPresentationBtn.removeAttribute('onclick');
            addPresentationBtn.addEventListener('click', this.handleAddClick.bind(this));
        }

        // Edit buttons
        const editButtons = document.querySelectorAll('.edit-presentation-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleEditClick(e, button));
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-presentation');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleDeleteClick(e, button));
        });

        // Forms
        const editForm = document.getElementById('aufEditPresentationForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleEditFormSubmission(e));
        }

        const addForm = document.getElementById('aufAddPresentationForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.handleAddFormSubmission(e));
        }
    }

    handleAddClick(e) {
        e.preventDefault();
        page('/admin/presentations/add');
    }

    handleEditClick(e, button) {
        e.preventDefault();
        const presentationId = button.getAttribute('data-id');
        console.log('Edit clicked for presentation:', presentationId);
        page(`/admin/presentations/edit/${presentationId}`);
    }

    handleDeleteClick(e, button) {
        e.preventDefault();
        const presentationId = button.getAttribute('data-id');
        console.log('Delete clicked for presentation:', presentationId);
        showModal('Are you sure you want to delete this presentation?', false, true,
            () => this.deletePresentation(presentationId));
    }

    async deletePresentation(presentationId) {
        try {
            const response = await fetch(`/admin/api/presentations/${presentationId}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });
            const data = await response.json();

            if (response.ok) {
                const presentationRow = document.querySelector(`tr[data-id="${presentationId}"]`);
                if (presentationRow) {
                    presentationRow.remove();
                }
                showModal('Presentation deleted successfully');
            } else {
                throw new Error(data.error || 'Error deleting presentation');
            }
        } catch (error) {
            console.error('Error:', error);
            showModal('Error deleting presentation', true);
        }
    }

    async handleEditFormSubmission(event) {
        event.preventDefault();
        const presentationId = document.getElementById('aufPresentationId').textContent;
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

            const data = await response.json();
            showModal('Presentation updated successfully');
            page('/admin/presentations');
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

            const data = await response.json();
            console.log('Response data:', data);
            showModal('Presentation added successfully!', false);
            page('/admin/presentations');
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error adding presentation', true);
        }
    }
}

// Reusing the existing showModal function
export { showModal } from './schools';

document.addEventListener('DOMContentLoaded', () => {
    new PresentationManager();
});