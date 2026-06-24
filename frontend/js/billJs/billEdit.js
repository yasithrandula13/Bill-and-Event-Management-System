const API_URL = "http://localhost:8080/api/bills";
const billId = new URLSearchParams(window.location.search).get("id");

// Utility functions
function showLoading(show = true) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.add('show');
    } else {
        spinner.classList.remove('show');
    }
}

function showMessage(message, type = 'success') {
    const container = document.getElementById('messageContainer');

    // Remove existing messages
    const existingMessages = container.querySelectorAll('.message-bill-edit');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bill-edit ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const icon = icons[type] || icons.info;
    messageDiv.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(messageDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideInRight-bill-edit 0.4s reverse';
            setTimeout(() => messageDiv.remove(), 400);
        }
    }, 5000);
}

function validateForm() {
    const name = document.getElementById("name").value.trim();
    const category = document.getElementById("category").value;
    const amount = document.getElementById("amount").value;
    const dueDate = document.getElementById("dueDate").value;
    const status = document.querySelector('input[name="status"]:checked');

    if (!name) {
        showMessage('Please enter a bill name', 'error');
        document.getElementById("name").focus();
        return false;
    }

    if (!category) {
        showMessage('Please select a category', 'error');
        document.getElementById("category").focus();
        return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
        showMessage('Please enter a valid amount greater than 0', 'error');
        document.getElementById("amount").focus();
        return false;
    }

    if (!dueDate) {
        showMessage('Please select a due date', 'error');
        document.getElementById("dueDate").focus();
        return false;
    }

    if (!status) {
        showMessage('Please select a status', 'error');
        return false;
    }

    // Validate reminder date if provided
    const reminderDate = document.getElementById("reminderDate").value;
    if (reminderDate && dueDate) {
        const reminder = new Date(reminderDate);
        const due = new Date(dueDate);

        if (reminder >= due) {
            showMessage('Reminder date must be before the due date', 'error');
            document.getElementById("reminderDate").focus();
            return false;
        }
    }

    return true;
}

// Load bill data
async function loadBill() {
    if (!billId) {
        showMessage('No bill ID provided', 'error');
        setTimeout(() => {
            window.location.href = "../../html/bill/billdashboard.html";
        }, 2000);
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`${API_URL}/${billId}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Bill not found');
            } else if (response.status >= 500) {
                throw new Error('Server error. Please try again later.');
            } else {
                throw new Error(`Failed to fetch bill: ${response.statusText}`);
            }
        }

        const bill = await response.json();

        // Populate form fields
        document.getElementById("name").value = bill.name || "";
        document.getElementById("category").value = bill.category || "";
        document.getElementById("amount").value = bill.amount || "";

        // Set due date
        if (bill.dueDate) {
            const dueDate = new Date(bill.dueDate);
            document.getElementById("dueDate").value = dueDate.toISOString().split("T")[0];
        }

        // Set reminder date directly from API
        if (bill.reminderDate) {
            const reminderDate = new Date(bill.reminderDate);
            document.getElementById("reminderDate").value = reminderDate.toISOString().split("T")[0];
        }

        // Set status radio button
        const statusRadios = document.querySelectorAll('input[name="status"]');
        statusRadios.forEach(radio => {
            if (radio.value === bill.status) {
                radio.checked = true;
            }
        });

        showLoading(false);
        showMessage('Bill loaded successfully', 'success');

    } catch (error) {
        console.error("Error loading bill:", error);
        showLoading(false);
        showMessage(error.message, 'error');

        // Redirect to dashboard after error
        setTimeout(() => {
            window.location.href = "../../html/bill/billdashboard.html";
        }, 3000);
    }
}

// Form submit handler
document.getElementById("billEditForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
        return;
    }

    const saveBtn = document.querySelector('.btn-update-bill-edit');
    const originalContent = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    saveBtn.disabled = true;

    const dueDate = document.getElementById("dueDate").value;
    const reminderDate = document.getElementById("reminderDate").value;
    const status = document.querySelector('input[name="status"]:checked').value;

    const updatedBill = {
        name: document.getElementById("name").value.trim(),
        category: document.getElementById("category").value,
        amount: parseFloat(document.getElementById("amount").value),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        status: status,
        reminderDate: reminderDate ? new Date(reminderDate).toISOString() : null,
    };

    try {
        const response = await fetch(`${API_URL}/${billId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(updatedBill),
        });

        if (response.ok) {
            showMessage('Bill updated successfully! Redirecting...', 'success');
            formChanged = false; // Reset form change flag

            setTimeout(() => {
                window.location.href = "../../html/bill/billdashboard.html";
            }, 1500);
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Failed to update bill: ${response.statusText}`;
            showMessage(errorMessage, 'error');
            saveBtn.innerHTML = originalContent;
            saveBtn.disabled = false;
        }
    } catch (error) {
        console.error("Error updating bill:", error);
        showMessage('Network error. Please check your connection and try again.', 'error');
        saveBtn.innerHTML = originalContent;
        saveBtn.disabled = false;
    }
});

// Input formatting
document.getElementById("amount").addEventListener("input", function(e) {
    let value = e.target.value;
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
        value = parseFloat(value).toFixed(2);
    }
    e.target.value = value;
});

// Due date change handler to update reminder date max
document.getElementById("dueDate").addEventListener("change", function() {
    const dueDate = this.value;
    const reminderDateInput = document.getElementById("reminderDate");

    if (dueDate) {
        // Set max date for reminder to be one day before due date
        const maxReminderDate = new Date(dueDate);
        maxReminderDate.setDate(maxReminderDate.getDate() - 1);
        reminderDateInput.setAttribute('max', maxReminderDate.toISOString().split('T')[0]);
    }
});

// Input validation with visual feedback
document.querySelectorAll('.input-bill-edit').forEach(input => {
    input.addEventListener('blur', function() {
        const formGroup = this.closest('.form-group-bill-edit');
        if (this.checkValidity() && this.value.trim() !== '') {
            formGroup.classList.remove('error');
            formGroup.classList.add('valid');
        } else if (this.value.trim() !== '') {
            formGroup.classList.remove('valid');
            formGroup.classList.add('error');
        }
    });

    input.addEventListener('input', function() {
        const formGroup = this.closest('.form-group-bill-edit');
        formGroup.classList.remove('error', 'valid');
    });
});

// Add input focus effects
document.querySelectorAll('.input-bill-edit').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.01)';
    });

    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Radio button change tracking
document.querySelectorAll('input[name="status"]').forEach(radio => {
    radio.addEventListener('change', () => {
        formChanged = true;
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        document.getElementById('billEditForm').dispatchEvent(new Event('submit'));
    }

    // Escape to cancel
    if (e.key === 'Escape') {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            window.location.href = "../../html/bill/billdashboard.html";
        }
    }
});

// Track form changes
let formChanged = false;

document.querySelectorAll('.input-bill-edit').forEach(input => {
    input.addEventListener('change', () => {
        formChanged = true;
    });
});

// Warn before leaving with unsaved changes
window.addEventListener('beforeunload', function(e) {
    if (formChanged) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
});

// Reset form changed flag on successful submission
document.getElementById("billEditForm").addEventListener("submit", () => {
    formChanged = false;
});

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadBill();

    // Add smooth transitions to form elements
    document.querySelectorAll('.form-group-bill-edit').forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';

        setTimeout(() => {
            group.style.transition = 'all 0.5s ease';
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Set minimum date to today for due date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dueDate').setAttribute('min', today);
    document.getElementById('reminderDate').setAttribute('min', today);
});

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Page hidden');
    } else {
        console.log('Page visible');
    }
});
