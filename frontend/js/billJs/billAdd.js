const API_URL = "http://localhost:8080/api/bills";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".bill-form-Bill");
    const progressSteps = document.querySelectorAll(".step-Bill");
    let currentStep = 0;
    let allBills = [];

    // Initialize form interactions
    initializeFloatingLabels();
    initializeFormValidation();
    initializeFilterButtons();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Add loading state
        const saveBtn = document.querySelector(".save-btn-Bill");
        const originalContent = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Saving...</span>';
        saveBtn.disabled = true;

        const billName = document.getElementById("billName").value.trim();
        const category = document.getElementById("category").value;
        const amount = parseFloat(document.getElementById("amount").value);
        const dueDate = document.getElementById("dueDate").value;
        const status = document.querySelector("input[name='status']:checked").value;
        const reminderDate = document.getElementById("reminderDate").value;

        const today = new Date();
        const due = new Date(dueDate);

        // Validation: due date cannot be in past
        if (due < today.setHours(0, 0, 0, 0)) {
            showNotification("Due date cannot be in the past!", "error");
            resetSaveButton(saveBtn, originalContent);
            return;
        }

        // Validation: reminder date
        if (reminderDate) {
            const reminder = new Date(reminderDate);
            if (reminder >= due) {
                showNotification("Reminder date must be before the due date!", "error");
                resetSaveButton(saveBtn, originalContent);
                return;
            }
            if (reminder < today) {
                showNotification("Reminder date cannot be in the past!", "error");
                resetSaveButton(saveBtn, originalContent);
                return;
            }
        }

        const billData = {
            name: billName,
            category: category,
            amount: amount,
            dueDate: dueDate,
            status: status,
            reminderDate: reminderDate || null
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(billData)
            });

            if (response.ok) {
                showNotification("Bill saved successfully!", "success");
                form.reset();
                resetFloatingLabels();
                updateProgressSteps(2); // Complete step
                setTimeout(() => updateProgressSteps(0), 2000); // Reset after 2s
                loadBills();
            } else {
                const errorText = await response.text();
                console.error("Save failed:", errorText);
                showNotification("Failed to save bill. Please try again.", "error");
            }
        } catch (err) {
            console.error("Server error:", err);
            showNotification("Server error. Please check your connection.", "error");
        } finally {
            resetSaveButton(saveBtn, originalContent);
        }
    });

    // Form field interactions for progress
    const formFields = ['billName', 'category', 'amount', 'dueDate'];
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.addEventListener('input', updateFormProgress);
        field.addEventListener('change', updateFormProgress);
    });

    // Initialize floating labels
    function initializeFloatingLabels() {
        const floatingInputs = document.querySelectorAll('.floating-label-Bill input, .floating-label-Bill select');

        floatingInputs.forEach(input => {
            // Handle initial state
            checkFloatingLabel(input);

            // Handle focus/blur events
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
                checkFloatingLabel(input);
            });

            input.addEventListener('input', () => {
                checkFloatingLabel(input);
            });
        });
    }

    function checkFloatingLabel(input) {
        const hasValue = input.value.trim() !== '';
        const label = input.nextElementSibling;

        if (hasValue) {
            label.style.transform = 'translateY(-28px) scale(0.85)';
            label.style.color = '#667eea';
        } else {
            label.style.transform = 'translateY(-50%)';
            label.style.color = '#6c757d';
        }
    }

    function resetFloatingLabels() {
        const floatingInputs = document.querySelectorAll('.floating-label-Bill input, .floating-label-Bill select');
        floatingInputs.forEach(input => {
            checkFloatingLabel(input);
        });
    }

    // Form validation with visual feedback
    function initializeFormValidation() {
        const inputs = document.querySelectorAll('input[required], select[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', validateField);
        });
    }

    function validateField(e) {
        const field = e.target;
        const formGroup = field.closest('.form-group-Bill');

        if (field.checkValidity()) {
            formGroup.classList.remove('error');
            formGroup.classList.add('valid');
        } else {
            formGroup.classList.remove('valid');
            formGroup.classList.add('error');
        }
    }

    // Progress steps update
    function updateProgressSteps(step) {
        currentStep = step;
        progressSteps.forEach((stepEl, index) => {
            if (index <= step) {
                stepEl.classList.add('active-step-Bill');
            } else {
                stepEl.classList.remove('active-step-Bill');
            }
        });
    }

    function updateFormProgress() {
        const billName = document.getElementById('billName').value.trim();
        const category = document.getElementById('category').value;
        const amount = document.getElementById('amount').value;
        const dueDate = document.getElementById('dueDate').value;

        if (billName && category) {
            updateProgressSteps(1);
        } else {
            updateProgressSteps(0);
        }
    }

    // Enhanced notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification-Bill');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification-Bill notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    function getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    function resetSaveButton(button, originalContent) {
        button.innerHTML = originalContent;
        button.disabled = false;
    }

    // Filter functionality
    function initializeFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn-Bill');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active-filter-Bill'));
                // Add active class to clicked button
                btn.classList.add('active-filter-Bill');

                const filter = btn.dataset.filter;
                filterBills(filter);
            });
        });
    }

    function filterBills(filter) {
        const billItems = document.querySelectorAll('.bill-item-Bill');

        billItems.forEach(item => {
            const status = item.dataset.status;

            if (filter === 'all' || status === filter) {
                item.style.display = 'block';
                item.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Enhanced bill loading with better UI
    async function loadBills() {
        const billList = document.getElementById("billList");
        if (!billList) return;

        try {
            // Show loading state
            billList.innerHTML = `
                <div class="loading-Bill">
                    <div class="loading-spinner-Bill">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <p>Loading your bills...</p>
                </div>
            `;

            const res = await fetch(API_URL);
            const bills = await res.json();
            allBills = bills;

            billList.innerHTML = "";

            if (bills.length === 0) {
                billList.innerHTML = `
                    <div class="empty-state-Bill">
                        <div class="empty-icon-Bill">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <h3>No bills added yet</h3>
                        <p>Start by adding your first bill using the form above.</p>
                    </div>
                `;
                return;
            }

            bills.forEach((bill, index) => {
                const billItem = createBillItem(bill, index);
                billList.appendChild(billItem);
            });
        } catch (err) {
            console.error("Error loading bills:", err);
            billList.innerHTML = `
                <div class="error-state-Bill">
                    <div class="error-icon-Bill">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Failed to load bills</h3>
                    <p>Please check your connection and try again.</p>
                    <button onclick="loadBills()" class="retry-btn-Bill">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    function createBillItem(bill, index) {
        const billDiv = document.createElement("div");
        billDiv.className = "bill-item-Bill";
        billDiv.dataset.status = bill.status;
        billDiv.style.animationDelay = `${index * 0.1}s`;

        const categoryIcons = {
            electricity: 'fa-bolt',
            water: 'fa-tint',
            rent: 'fa-home',
            internet: 'fa-wifi',
            other: 'fa-file-alt'
        };

        const categoryIcon = categoryIcons[bill.category] || categoryIcons.other;
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(bill.amount);

        const dueDate = new Date(bill.dueDate);
        const formattedDueDate = dueDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const reminderText = bill.reminderDate ?
            new Date(bill.reminderDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }) : 'No reminder';

        billDiv.innerHTML = `
            <div class="bill-header-Bill">
                <h4 class="bill-name-Bill">
                    <i class="fas ${categoryIcon}"></i>
                    ${bill.name}
                </h4>
                <span class="bill-status-Bill ${bill.status}">
                    ${bill.status}
                </span>
            </div>
            <div class="bill-details-Bill">
                <div class="bill-detail-Bill">
                    <i class="fas fa-tags"></i>
                    <span>${bill.category.charAt(0).toUpperCase() + bill.category.slice(1)}</span>
                </div>
                <div class="bill-detail-Bill bill-amount-Bill">
                    <i class="fas fa-dollar-sign"></i>
                    <span>${formattedAmount}</span>
                </div>
                <div class="bill-detail-Bill">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Due: ${formattedDueDate}</span>
                </div>
                <div class="bill-detail-Bill">
                    <i class="fas fa-bell"></i>
                    <span>${reminderText}</span>
                </div>
            </div>
        `;

        return billDiv;
    }

    // Add notification styles dynamically
    const notificationStyles = `
        .notification-Bill {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            animation: slideInRight 0.3s ease;
        }
        
        .notification-content {
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            color: white;
            font-weight: 500;
        }
        
        .notification-success { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
        .notification-error { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
        .notification-warning { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); }
        .notification-info { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            margin-left: auto;
            padding: 4px;
            border-radius: 4px;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        
        .notification-close:hover { opacity: 1; }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .loading-Bill, .empty-state-Bill, .error-state-Bill {
            text-align: center;
            padding: 60px 20px;
            color: #6c757d;
        }
        
        .loading-spinner-Bill i {
            font-size: 2rem;
            color: #667eea;
            margin-bottom: 16px;
        }
        
        .empty-icon-Bill i, .error-icon-Bill i {
            font-size: 3rem;
            color: #dee2e6;
            margin-bottom: 20px;
            display: block;
        }
        
        .retry-btn-Bill {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            margin-top: 16px;
            transition: all 0.3s ease;
        }
        
        .retry-btn-Bill:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .form-group-Bill.error input,
        .form-group-Bill.error select {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
        }
        
        .form-group-Bill.valid input,
        .form-group-Bill.valid select {
            border-color: #28a745 !important;
        }
    `;

    // Inject notification styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);

    // Initial load
    loadBills();
});