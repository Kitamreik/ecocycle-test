import { showModal } from './utils.js';

export class SchoolManager {
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
        const addSchoolBtn = document.querySelector('.button[onclick="location.href=\'/admin/schools/add\'"]');
        if (addSchoolBtn) {
            addSchoolBtn.removeAttribute('onclick');
            const addHandler = this.handleAddClick.bind(this);
            addSchoolBtn.addEventListener('click', addHandler);
            this.#eventListeners.set(addSchoolBtn, { type: 'click', handler: addHandler });
        }

        // Edit buttons
        const editButtons = document.querySelectorAll('.edit-school-btn');
        editButtons.forEach(button => {
            const editHandler = (e) => this.handleEditClick(e, button);
            button.addEventListener('click', editHandler);
            this.#eventListeners.set(button, { type: 'click', handler: editHandler });
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-school');
        deleteButtons.forEach(button => {
            const deleteHandler = (e) => this.handleDeleteClick(e, button);
            button.addEventListener('click', deleteHandler);
            this.#eventListeners.set(button, { type: 'click', handler: deleteHandler });
        });

        // Forms
        const editForm = document.getElementById('aufEditSchoolForm');
        if (editForm) {
            const editSubmitHandler = (e) => this.handleEditFormSubmission(e);
            editForm.addEventListener('submit', editSubmitHandler);
            this.#eventListeners.set(editForm, { type: 'submit', handler: editSubmitHandler });
        }

        const addForm = document.getElementById('aufAddSchoolForm');
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

    validateSchoolData(formData) {
        const errors = [];

        if (!formData.get('sname')) {
            errors.push('School name is required');
        }
        if (!formData.get('sstreetaddress')) {
            errors.push('Street address is required');
        }
        if (!formData.get('scityid')) {
            errors.push('City is required');
        }
        if (!formData.get('sdistrictid')) {
            errors.push('District is required');
        }
        if (!formData.get('slanguageid')) {
            errors.push('Language is required');
        }

        return errors;
    }

    handleAddClick(e) {
        e.preventDefault();
        page('/admin/schools/add');
    }

    handleEditClick(e, button) {
        e.preventDefault();
        const schoolId = button.getAttribute('data-id');
        page(`/admin/schools/edit/${schoolId}`);
    }

    handleDeleteClick(e, button) {
        e.preventDefault();
        const schoolId = button.getAttribute('data-id');
        showModal('Are you sure you want to delete this school?', false, true,
            () => this.deleteSchool(schoolId));
    }

    async deleteSchool(schoolId) {
        try {
            const response = await fetch(`/admin/api/schools/${schoolId}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error deleting school');
            }

            const schoolRow = document.querySelector(`tr[data-id="${schoolId}"]`);
            if (schoolRow) {
                schoolRow.remove();
            }
            showModal('School deleted successfully');
        } catch (error) {
            console.error('Error:', error);
            showModal('Error deleting school', true);
        }
    }

    async handleEditFormSubmission(event) {
        event.preventDefault();
        const schoolId = document.getElementById('aufSchoolId')?.textContent;
        if (!schoolId) {
            showModal('Error: School ID not found', true);
            return;
        }

        const formData = new FormData(event.target);
        const validationErrors = this.validateSchoolData(formData);

        if (validationErrors.length > 0) {
            showModal(`Please fix the following errors:\n${validationErrors.join('\n')}`, true);
            return;
        }

        const sgssChecked = formData.has('sgss');
        const stitle1Checked = formData.has('stitle1');

        try {
            const response = await fetch(`/admin/api/schools/${schoolId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    sname: formData.get('sname'),
                    sstreetaddress: formData.get('sstreetaddress'),
                    scityid: formData.get('scityid'),
                    sdistrictid: formData.get('sdistrictid'),
                    slanguageid: formData.get('slanguageid'),
                    sgss: sgssChecked,
                    stitle1: stitle1Checked
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error updating school');
            }

            showModal('School updated successfully');
            setTimeout(() => {
                page('/admin/schools');
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error updating school', true);
        }
    }

    async handleAddFormSubmission(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const validationErrors = this.validateSchoolData(formData);

        if (validationErrors.length > 0) {
            showModal(`Please fix the following errors:\n${validationErrors.join('\n')}`, true);
            return;
        }

        const sgssChecked = formData.has('sgss');
        const stitle1Checked = formData.has('stitle1');

        try {
            const response = await fetch('/admin/api/schools/add', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    sname: formData.get('sname'),
                    sstreetaddress: formData.get('sstreetaddress'),
                    scityid: formData.get('scityid'),
                    sdistrictid: formData.get('sdistrictid'),
                    slanguageid: formData.get('slanguageid'),
                    sgss: sgssChecked,
                    stitle1: stitle1Checked
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error adding school');
            }

            showModal('School added successfully!', false);
            setTimeout(() => {
                page('/admin/schools');
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error adding school', true);
        }
    }
}