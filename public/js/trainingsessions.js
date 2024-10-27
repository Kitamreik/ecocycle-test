import { showModal } from './utils.js';

export class TrainingSessionManager {
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
        const addSessionBtn = document.querySelector('.button[onclick="location.href=\'/admin/training-sessions/add\'"]');
        if (addSessionBtn) {
            addSessionBtn.removeAttribute('onclick');
            const addHandler = this.handleAddClick.bind(this);
            addSessionBtn.addEventListener('click', addHandler);
            this.#eventListeners.set(addSessionBtn, { type: 'click', handler: addHandler });
        }

        // Toggle details buttons
        const toggleButtons = document.querySelectorAll('.toggle-details');
        toggleButtons.forEach(button => {
            const toggleHandler = (e) => this.handleToggleDetails(e, button);
            button.addEventListener('click', toggleHandler);
            this.#eventListeners.set(button, { type: 'click', handler: toggleHandler });
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-session');
        deleteButtons.forEach(button => {
            const deleteHandler = (e) => this.handleDeleteClick(e, button);
            button.addEventListener('click', deleteHandler);
            this.#eventListeners.set(button, { type: 'click', handler: deleteHandler });
        });

        // Forms
        const editForm = document.getElementById('aufEditTrainingSessionForm');
        if (editForm) {
            const editSubmitHandler = (e) => this.handleEditFormSubmission(e);
            editForm.addEventListener('submit', editSubmitHandler);
            this.#eventListeners.set(editForm, { type: 'submit', handler: editSubmitHandler });
        }

        const addForm = document.getElementById('aufAddTrainingSessionForm');
        if (addForm) {
            const addSubmitHandler = (e) => this.handleAddFormSubmission(e);
            addForm.addEventListener('submit', addSubmitHandler);
            this.#eventListeners.set(addForm, { type: 'submit', handler: addSubmitHandler });
        }
    }

    removeEventListeners() {
        this.#eventListeners.forEach((config, element) => {
            element.removeEventListener(config.type, config.handler);
        });
        this.#eventListeners.clear();
    }

    handleToggleDetails(e, button) {
        e.preventDefault();
        const sessionId = button.dataset.id;
        const detailsRow = document.querySelector(`#details-${sessionId}`);
        if (detailsRow) {
            const isHidden = detailsRow.style.display === 'none';
            detailsRow.style.display = isHidden ? 'table-row' : 'none';
            button.querySelector('i').classList.toggle('fa-eye');
            button.querySelector('i').classList.toggle('fa-eye-slash');
        }
    }

    handleAddClick(e) {
        e.preventDefault();
        page('/admin/training-sessions/add');
    }

    handleDeleteClick(e, button) {
        e.preventDefault();
        const sessionId = button.getAttribute('data-id');
        showModal('Are you sure you want to delete this training session?', false, true,
            () => this.deleteSession(sessionId));
    }

    async deleteSession(sessionId) {
        try {
            const response = await fetch(`/admin/api/training-sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error deleting training session');
            }

            const sessionRow = document.querySelector(`tr[data-id="${sessionId}"]`);
            const detailsRow = document.querySelector(`#details-${sessionId}`);
            if (sessionRow) sessionRow.remove();
            if (detailsRow) detailsRow.remove();
            showModal('Training session deleted successfully');
        } catch (error) {
            console.error('Error:', error);
            showModal('Error deleting training session', true);
        }
    }

    validateSessionData(formData) {
        const errors = [];

        // Required field validation
        if (!formData.get('rid')) {
            errors.push('Request is required');
        }

        // Date validation
        const startTime = formData.get('tspreferreddatetimestart');
        const endTime = formData.get('tspreferreddatetimeend');
        if (startTime && endTime && new Date(startTime) > new Date(endTime)) {
            errors.push('Preferred start time must be before end time');
        }

        // Number validation
        const students = formData.get('tsstudents');
        const classrooms = formData.get('tsclassrooms');
        const adults = formData.get('tsadults');

        if (students && students < 0) errors.push('Number of students cannot be negative');
        if (classrooms && classrooms < 0) errors.push('Number of classrooms cannot be negative');
        if (adults && adults < 0) errors.push('Number of adults cannot be negative');

        return errors;
    }

    async handleEditFormSubmission(event) {
        event.preventDefault();
        const sessionId = document.getElementById('aufSessionId')?.textContent;
        if (!sessionId) {
            showModal('Error: Session ID not found', true);
            return;
        }

        const formData = new FormData(event.target);
        const validationErrors = this.validateSessionData(formData);

        if (validationErrors.length > 0) {
            showModal(`Please fix the following errors:\n${validationErrors.join('\n')}`, true);
            return;
        }

        try {
            const response = await fetch(`/admin/api/training-sessions/${sessionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rid: formData.get('rid'),
                    pid: formData.get('pid') || null,
                    fid: formData.get('fid') || null,
                    userid: formData.get('userid') || null,
                    tsgrades: formData.get('tsgrades'),
                    tsscheduleddatetime: formData.get('tsscheduleddatetime'),
                    tspreferreddatetimestart: formData.get('tspreferreddatetimestart'),
                    tspreferreddatetimeend: formData.get('tspreferreddatetimeend'),
                    tsstudents: formData.get('tsstudents') || 0,
                    tsclassrooms: formData.get('tsclassrooms') || 0,
                    tsadults: formData.get('tsadults') || 0,
                    tsstatusid: formData.get('tsstatusid')
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error updating training session');
            }

            showModal('Training session updated successfully');
            setTimeout(() => {
                page('/admin/training-sessions');
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error updating training session', true);
        }
    }

    async handleAddFormSubmission(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const validationErrors = this.validateSessionData(formData);

        if (validationErrors.length > 0) {
            showModal(`Please fix the following errors:\n${validationErrors.join('\n')}`, true);
            return;
        }

        try {
            const response = await fetch('/admin/api/training-sessions/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rid: formData.get('rid'),
                    pid: formData.get('pid') || null,
                    fid: formData.get('fid') || null,
                    userid: formData.get('userid') || null,
                    tsgrades: formData.get('tsgrades'),
                    tsscheduleddatetime: formData.get('tsscheduleddatetime'),
                    tspreferreddatetimestart: formData.get('tspreferreddatetimestart'),
                    tspreferreddatetimeend: formData.get('tspreferreddatetimeend'),
                    tsstudents: formData.get('tsstudents') || 0,
                    tsclassrooms: formData.get('tsclassrooms') || 0,
                    tsadults: formData.get('tsadults') || 0,
                    tsstatusid: formData.get('tsstatusid')
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error adding training session');
            }

            showModal('Training session added successfully!', false);
            setTimeout(() => {
                page('/admin/training-sessions');
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showModal(error.message || 'Error adding training session', true);
        }
    }
}