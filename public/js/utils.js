export function showModal(message, isError = false, isConfirmation = false, onConfirm = null) {
    // Remove any existing modals
    const existingModals = document.querySelectorAll('.custom-modal');
    existingModals.forEach(modal => modal.remove());

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
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    };

    if (isConfirmation) {
        const confirmButton = modal.querySelector('.confirm-modal');
        const cancelButton = modal.querySelector('.cancel-modal');

        confirmButton?.addEventListener('click', () => {
            closeModal();
            if (onConfirm) onConfirm();
        });

        cancelButton?.addEventListener('click', closeModal);
    } else {
        const closeButton = modal.querySelector('.close-modal');
        closeButton?.addEventListener('click', closeModal);
        setTimeout(closeModal, 3000);
    }
}