import { showModal } from './utils.js';

export class CalendarManager {
    #eventListeners = new Map();

    constructor() {
        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Clean up existing event listeners
        this.removeEventListeners();

        // Add session button (if exists in calendar view)
        const addSessionBtn = document.querySelector('.button[onclick="location.href=\'/admin/training-sessions/add\'"]');
        if (addSessionBtn) {
            addSessionBtn.removeAttribute('onclick');
            const addHandler = this.handleAddClick.bind(this);
            addSessionBtn.addEventListener('click', addHandler);
            this.#eventListeners.set(addSessionBtn, { type: 'click', handler: addHandler });
        }

        // Event Modal Close Button
        const closeBtn = document.querySelector('#eventModal .close');
        if (closeBtn) {
            const closeHandler = this.handleModalClose.bind(this);
            closeBtn.addEventListener('click', closeHandler);
            this.#eventListeners.set(closeBtn, { type: 'click', handler: closeHandler });
        }

        // Event Modal Edit Button
        const editBtn = document.querySelector('#eventModal #editEventBtn');
        if (editBtn) {
            const editHandler = this.handleEventEdit.bind(this);
            editBtn.addEventListener('click', editHandler);
            this.#eventListeners.set(editBtn, { type: 'click', handler: editHandler });
        }

        // Modal Window Click Handler
        const modal = document.getElementById('eventModal');
        if (modal) {
            const windowHandler = (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
            window.addEventListener('click', windowHandler);
            this.#eventListeners.set(window, { type: 'click', handler: windowHandler });
        }
    }

    removeEventListeners() {
        this.#eventListeners.forEach((config, element) => {
            element.removeEventListener(config.type, config.handler);
        });
        this.#eventListeners.clear();
    }

    handleAddClick(e) {
        e.preventDefault();
        page('/admin/training-sessions/add');
    }

    handleModalClose() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    handleEventEdit() {
        const eventId = this.currentEventId;
        if (eventId) {
            page(`/admin/training-sessions/edit/${eventId}`);
        }
    }

    // Method to store current event ID when showing event details
    setCurrentEventId(id) {
        this.currentEventId = id;
    }
}