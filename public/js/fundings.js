export class FundingManager {
    constructor() {
        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Add button
        const addFundingBtn = document.querySelector('.button[onclick="location.href=\'/admin/fundings/add\'"]');
        if (addFundingBtn) {
            addFundingBtn.removeAttribute('onclick');
            addFundingBtn.addEventListener('click', this.handleAddClick.bind(this));
        }

        // Edit buttons
        const editButtons = document.querySelectorAll('.edit-funding-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleEditClick(e, button));
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-funding');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleDeleteClick(e, button));
        });

        // Forms
        const editForm = document.getElementById('editFundingForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleEditFormSubmission(e));
        }

        const addForm = document.getElementById('aufAddFundingForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.handleAddFormSubmission(e));
        }
    }

    handleAddClick(e) {
        e.preventDefault();
        page('/admin/fundings/add');
    }

    handleEditClick(e, button) {
        e.preventDefault();
        const fundingId = button.getAttribute('data-id');
        console.log('Edit clicked for funding:', fundingId);
        page(`/admin/fundings/edit/${fundingId}`);
    }

    handleDeleteClick(e, button) {
        e.preventDefault();
        const fundingId = button.getAttribute('data-id');
        console.log('Delete clicked for funding:', fundingId);
        showModal('Are you sure you want to delete this funding source?', false, true,
            () => this.deleteFunding(fundingId));
    }

    async deleteFunding(fundingId) {
        try {
            const response = await fetch(`/admin/api/fundings/${fundingId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();

            if (data.message === 'Funding deleted successfully') {
                const fundingRow = document.querySelector(`tr[data-id="${fundingId}"]`);
                if (fundingRow) {
                    fundingRow.remove();
                }
                showModal('Funding source deleted successfully');
            } else {
                throw new Error(data.error || 'Error deleting funding source');
            }
        } catch (error) {
            console.error('Error:', error);
            showModal('Error deleting funding source', true);
        }
    }

    async handleEditFormSubmission(event) {
        event.preventDefault();
        const fundingId = document.getElementById('fundingId').textContent;
        const formData = new FormData(event.target);

        try {
            const response = await fetch(`/admin/api/fundings/${fundingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fName: formData.get('fName')
                })
            });
            const data = await response.json();

            if (response.ok) {
                showModal('Funding updated successfully');
                page('/admin/fundings');
            } else {
                throw new Error(data.error || 'Error updating funding source');
            }
        } catch (error) {
            console.error('Error:', error);
            showModal('Error updating funding source', true);
        }
    }

    async handleAddFormSubmission(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            const response = await fetch('/admin/api/fundings/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fName: formData.get('fName')
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            showModal('Funding source added successfully!', false);
            page('/admin/fundings');
        } catch (error) {
            console.error('Error:', error);
            showModal('Error adding funding source', true);
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
document.addEventListener('DOMContentLoaded', () => {
    new FundingManager();
});