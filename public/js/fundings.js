export function attachFundingEventListeners() {
    const addFundingBtn = document.querySelector('.button[onclick="location.href=\'/admin/fundings/add\'"]');
    if (addFundingBtn) {
        addFundingBtn.removeAttribute('onclick');
        addFundingBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Hi there");
            console.log("Attempting to navigate to:", '/admin/fundings/add'); 
            try {
                page('/admin/fundings/add');
            } catch (error) {
                console.error("Navigation error:", error);
            }
        });
    }

    // Attach event listeners to edit buttons
    const editButtons = document.querySelectorAll('.edit-funding-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const fundingId = this.dataset.fundingId;
            page(`/admin/fundings/edit/${fundingId}`);
        });
    });

    // Attach event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-funding');
    console.log('Found delete buttons:', deleteButtons.length); // Debug log
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const fundingId = this.getAttribute('data-id');
            console.log('Delete clicked for funding:', fundingId); // Debug log
            showModal('Are you sure you want to delete this funding source?', false, true, () => deleteFunding(fundingId));
        });
    });

    const editForm = document.getElementById('aufEditFundingForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditFormSubmission);
    }

    // Attach event listener to add funding form
    const addFundingForm = document.getElementById('aufAddFundingForm');
    if (addFundingForm) {
        addFundingForm.addEventListener('submit', handleAddFundingForm);
    }
}

function handleDeleteFunding(event) {
    event.preventDefault();
    const fundingId = this.getAttribute('data-id');
    showModal('Are you sure you want to delete this funding source?', false, true, () => deleteFunding(fundingId));
}

function deleteFunding(fundingId) {
    fetch(`/admin/api/fundings/${fundingId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Funding deleted successfully') {
                const fundingRow = document.querySelector(`tr[data-id="${fundingId}"]`);
                if (fundingRow) {
                    fundingRow.remove();
                }
                showModal('Funding source deleted successfully');
            } else {
                showModal('Error deleting funding source', true);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            showModal('Error deleting funding source', true);
        });
}

function handleEditFormSubmission(event) {
    event.preventDefault();
    const form = event.target;
    const fundingId = document.getElementById('aufFundingId').textContent;
    const formData = new FormData(form);
    const fundingData = Object.fromEntries(formData);

    fetch(`/api/fundings/${fundingId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(fundingData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Funding updated successfully') {
                page('/admin/fundings');
            } else {
                showModal('Error updating funding source', true);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            showModal('Error updating funding source', true);
        });
}

function handleAddFundingForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const fundingData = Object.fromEntries(formData);
    console.log("fundingData:", fundingData);

    fetch('/admin/api/fundings/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(fundingData)
    }) 
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            showModal('Funding source added successfully!', false);
            page('/admin/fundings');
        })
        .catch(error => {
            console.error('Error:', error);
            showModal('Error adding funding source', true);
        });
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