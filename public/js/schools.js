export class SchoolManager {
    constructor() {
        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Add button
        const addSchoolBtn = document.querySelector('.button[onclick="location.href=\'/admin/schools/add\'"]');
        if (addSchoolBtn) {
            addSchoolBtn.removeAttribute('onclick');
            addSchoolBtn.addEventListener('click', this.handleAddClick.bind(this));
        }

        // Edit buttons
        const editButtons = document.querySelectorAll('.edit-school-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleEditClick(e, button));
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-school');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleDeleteClick(e, button));
        });

        // Forms
        const editForm = document.getElementById('aufEditSchoolForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleEditFormSubmission(e));
        }

        const addForm = document.getElementById('aufAddSchoolForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.handleAddFormSubmission(e));
        }
    }

    handleAddClick(e) {
        e.preventDefault();
        page('/admin/schools/add');
    }

    handleEditClick(e, button) {
        e.preventDefault();
        const schoolId = button.getAttribute('data-id');
        console.log('Edit clicked for school:', schoolId);
        page(`/admin/schools/edit/${schoolId}`);
    }

    handleDeleteClick(e, button) {
        e.preventDefault();
        const schoolId = button.getAttribute('data-id');
        console.log('Delete clicked for school:', schoolId);
        showModal('Are you sure you want to delete this school?', false, true,
            () => this.deleteSchool(schoolId));
    }

    async deleteSchool(schoolId) {
        try {
            const response = await fetch(`/admin/api/schools/${schoolId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();

            if (response.ok) {
                const schoolRow = document.querySelector(`tr[data-id="${schoolId}"]`);
                if (schoolRow) {
                    schoolRow.remove();
                }
                showModal('School deleted successfully');
            } else {
                throw new Error(data.error || 'Error deleting school');
            }
        } catch (error) {
            console.error('Error:', error);
            showModal('Error deleting school', true);
        }
    }

    async handleEditFormSubmission(event) {
        event.preventDefault();
        const schoolId = document.getElementById('aufSchoolId').textContent;
        const formData = new FormData(event.target);

        try {
            const response = await fetch(`/admin/api/schools/${schoolId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sname: formData.get('sname'),
                    sstreetaddress: formData.get('sstreetaddress'),
                    scityid: formData.get('scityid'),
                    sdistrictid: formData.get('sdistrictid'),
                    slanguageid: formData.get('slanguageid'),
                    sgss: formData.get('sgss') !== null,
                    stitle1: formData.get('stitle1') !== null
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error updating school');
            }

            const data = await response.json();
            showModal('School updated successfully');
            page('/admin/schools');
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error updating school', true);
        }
    }

    async handleAddFormSubmission(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            const response = await fetch('/admin/api/schools/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sname: formData.get('sname'),
                    sstreetaddress: formData.get('sstreetaddress'),
                    scityid: formData.get('scityid'),
                    sdistrictid: formData.get('sdistrictid'),
                    slanguageid: formData.get('slanguageid'),
                    sgss: formData.get('sgss') === 'on',
                    stitle1: formData.get('stitle1') === 'on'
                })
            }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error adding school');
            }
    
            const data = await response.json();
            console.log("this is the data", data);
            showModal('School added successfully!', false);
            page('/admin/schools');
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error adding school', true);
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
    new SchoolManager();
});