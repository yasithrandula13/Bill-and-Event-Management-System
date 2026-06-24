// Enhanced Feedback Dashboard JavaScript - Complete File
class FeedbackDashboard {
    constructor() {
        this.API_URL = "http://localhost:8080/api/feedback";
        this.feedbacks = [];
        this.currentFilter = { category: '', rating: '' };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFeedback();
        this.setupFormValidation();
        this.setupStarRating();
        this.setupCharacterCounter();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById("feedbackForm").addEventListener("submit", (e) => {
            this.handleFormSubmit(e);
        });

        // Filter controls
        document.getElementById("categoryFilter").addEventListener("change", (e) => {
            this.currentFilter.category = e.target.value;
            this.filterFeedbacks();
        });

        document.getElementById("ratingFilter").addEventListener("change", (e) => {
            this.currentFilter.rating = e.target.value;
            this.filterFeedbacks();
        });
    }

    setupFormValidation() {
        const inputs = document.querySelectorAll('.feedback-dash-input');
        inputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });

            input.addEventListener('input', (e) => {
                this.clearFieldError(e.target);
            });
        });
    }

    setupStarRating() {
        const ratingInputs = document.querySelectorAll('input[name="rating"]');
        const ratingText = document.getElementById('ratingText');

        const ratingTexts = {
            '1': 'Poor - Needs significant improvement',
            '2': 'Fair - Some issues need addressing',
            '3': 'Good - Meets expectations',
            '4': 'Very Good - Exceeds expectations',
            '5': 'Excellent - Outstanding experience'
        };

        ratingInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const value = e.target.value;
                ratingText.textContent = ratingTexts[value];
                ratingText.style.color = '#667eea';
                ratingText.style.fontWeight = '600';
            });
        });
    }

    setupCharacterCounter() {
        const messageInput = document.getElementById('message');
        const charCount = document.getElementById('charCount');
        const maxLength = 500;

        messageInput.addEventListener('input', (e) => {
            const currentLength = e.target.value.length;
            charCount.textContent = currentLength;

            if (currentLength > maxLength * 0.8) {
                charCount.style.color = '#e53e3e';
            } else if (currentLength > maxLength * 0.6) {
                charCount.style.color = '#dd6b20';
            } else {
                charCount.style.color = '#a0aec0';
            }
        });

        messageInput.setAttribute('maxlength', maxLength);
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        this.clearFieldError(field);

        switch (field.id) {
            case 'username':
            case 'editUsername':
                if (!value) {
                    errorMessage = 'Name is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Name must be at least 2 characters';
                    isValid = false;
                }
                break;
            case 'category':
            case 'editCategory':
                if (!value) {
                    errorMessage = 'Please select a category';
                    isValid = false;
                }
                break;
            case 'message':
            case 'editMessage':
                if (!value) {
                    errorMessage = 'Feedback message is required';
                    isValid = false;
                } else if (value.length < 10) {
                    errorMessage = 'Please provide more detailed feedback (at least 10 characters)';
                    isValid = false;
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.style.borderColor = '#e53e3e';
        field.style.boxShadow = '0 0 0 3px rgba(229, 62, 62, 0.1)';

        const existingError = field.parentNode.querySelector('.error-message-dash');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message-dash';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;

        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '#e2e8f0';
        field.style.boxShadow = 'none';

        const errorMessage = field.parentNode.querySelector('.error-message-dash');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const username = document.getElementById('username');
        const category = document.getElementById('category');
        const message = document.getElementById('message');
        const rating = document.querySelector('input[name="rating"]:checked');

        let isFormValid = true;

        if (!this.validateField(username)) isFormValid = false;
        if (!this.validateField(category)) isFormValid = false;
        if (!this.validateField(message)) isFormValid = false;

        if (!rating) {
            this.showRatingError();
            isFormValid = false;
        }

        if (!isFormValid) {
            this.showFormError('Please correct the errors above');
            return;
        }

        this.setSubmitButtonLoading(true);

        const feedback = {
            username: username.value.trim(),
            category: category.value,
            message: message.value.trim(),
            rating: parseInt(rating.value),
            createdAt: new Date().toISOString()
        };

        try {
            const response = await fetch(this.API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(feedback)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.showSuccessMessage();
            form.reset();
            this.clearAllErrors();
            document.getElementById('ratingText').textContent = 'Click to rate';
            document.getElementById('charCount').textContent = '0';

            await this.loadFeedback();

            setTimeout(() => {
                this.goBackHome();
            }, 3000);

        } catch (error) {
            console.error("Error submitting feedback:", error);
            this.showFormError('Failed to submit feedback. Please try again.');
        } finally {
            this.setSubmitButtonLoading(false);
        }
    }

    showRatingError() {
        const ratingContainer = document.querySelector('.feedback-dash-rating');
        const existingError = ratingContainer.querySelector('.error-message-dash');

        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message-dash';
        errorDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please select a rating';

        ratingContainer.appendChild(errorDiv);
    }

    showFormError(message) {
        const existingError = document.querySelector('.form-error-dash');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-dash';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

        const formActions = document.querySelector('.form-actions-dash');
        formActions.parentNode.insertBefore(errorDiv, formActions);
    }

    clearAllErrors() {
        document.querySelectorAll('.error-message-dash, .form-error-dash').forEach(error => {
            error.remove();
        });

        document.querySelectorAll('.feedback-dash-input').forEach(input => {
            this.clearFieldError(input);
        });
    }

    showSuccessMessage() {
        const form = document.getElementById('feedbackForm');
        const successMessage = document.getElementById('successMessage');

        form.style.display = 'none';
        successMessage.style.display = 'block';
    }

    setSubmitButtonLoading(isLoading) {
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('span');
        const btnIcon = submitBtn.querySelector('i');

        if (isLoading) {
            submitBtn.classList.add('loading-dash');
            btnText.textContent = 'Submitting...';
            btnIcon.className = 'fas fa-spinner';
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('loading-dash');
            btnText.textContent = 'Submit Feedback';
            btnIcon.className = 'fas fa-paper-plane';
            submitBtn.disabled = false;
        }
    }

    async loadFeedback() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        const noFeedbackMessage = document.getElementById('noFeedback');

        loadingSpinner.style.display = 'flex';
        noFeedbackMessage.style.display = 'none';

        try {
            const response = await fetch(this.API_URL);

            if (!response.ok) {
                throw new Error('Failed to fetch feedback');
            }

            this.feedbacks = await response.json();
            this.feedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            this.renderFeedback(this.feedbacks);
            this.updateAnalytics();

        } catch (error) {
            console.error("Error loading feedback:", error);
            this.feedbacks = this.getSampleFeedback();
            this.renderFeedback(this.feedbacks);
            this.updateAnalytics();
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    getSampleFeedback() {
        return [
            {
                id: 1,
                username: "John Doe",
                category: "Dashboard",
                message: "The new dashboard looks amazing! The analytics section is particularly helpful.",
                rating: 5,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                username: "Sarah Wilson",
                category: "Bills",
                message: "Bill management is great, but it would be nice to have automatic categorization.",
                rating: 4,
                createdAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
    }

    filterFeedbacks() {
        let filtered = [...this.feedbacks];

        if (this.currentFilter.category) {
            filtered = filtered.filter(fb => fb.category === this.currentFilter.category);
        }

        if (this.currentFilter.rating) {
            const minRating = parseInt(this.currentFilter.rating);
            filtered = filtered.filter(fb => fb.rating >= minRating);
        }

        this.renderFeedback(filtered);
    }

    renderFeedback(feedbacks) {
        const list = document.getElementById("feedbackList");
        const noFeedbackMessage = document.getElementById('noFeedback');

        if (feedbacks.length === 0) {
            list.innerHTML = '';
            noFeedbackMessage.style.display = 'block';
            return;
        }

        noFeedbackMessage.style.display = 'none';

        list.innerHTML = feedbacks.map((fb, index) => {
            return `
                <div class="feedback-dash-card" style="animation-delay: ${index * 0.1}s">
                    <div class="feedback-dash-card-header">
                        <span class="feedback-dash-user">${this.escapeHtml(fb.username)}</span>
                        <span class="feedback-dash-category">${fb.category}</span>
                    </div>
                    <p class="feedback-dash-message">${this.escapeHtml(fb.message)}</p>
                    <div class="feedback-dash-rating-stars">${"⭐".repeat(fb.rating)}</div>
                    <div class="feedback-dash-time">${this.formatDate(fb.createdAt)}</div>
                    <div class="feedback-dash-actions">
                        <button class="action-btn-dash edit-btn-dash" onclick="openEditPopup(${fb.id})">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="action-btn-dash delete-btn-dash" onclick="openDeletePopup(${fb.id})">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async deleteFeedback(id) {
        try {
            const response = await fetch(`${this.API_URL}/${id}`, {
                method: "DELETE",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (response.ok) {
                this.feedbacks = this.feedbacks.filter(fb => fb.id !== id);
                this.renderFeedback(this.feedbacks);
                this.updateAnalytics();
                this.showNotification('Feedback deleted successfully', 'success');
            } else {
                throw new Error('Failed to delete feedback');
            }
        } catch (error) {
            console.error("Error deleting feedback:", error);
            this.showNotification('Failed to delete feedback', 'error');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification-dash notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateAnalytics() {
        const totalFeedbacks = this.feedbacks.length;
        const avgRating = totalFeedbacks > 0
            ? (this.feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / totalFeedbacks).toFixed(1)
            : '0.0';

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const thisWeekFeedbacks = this.feedbacks.filter(fb =>
            new Date(fb.createdAt) >= oneWeekAgo
        ).length;

        const categoryCount = {};
        this.feedbacks.forEach(fb => {
            categoryCount[fb.category] = (categoryCount[fb.category] || 0) + 1;
        });

        const topCategory = Object.keys(categoryCount).length > 0
            ? Object.keys(categoryCount).reduce((a, b) =>
                categoryCount[a] > categoryCount[b] ? a : b
            )
            : '-';

        document.getElementById('totalFeedbacks').textContent = totalFeedbacks;
        document.getElementById('avgRating').textContent = avgRating;
        document.getElementById('thisWeekFeedbacks').textContent = thisWeekFeedbacks;
        document.getElementById('topCategory').textContent = topCategory;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    goBackHome() {
        window.location.href = "../../html/dashboard/dashboard.html";
    }
}

// Global Variables
let dashboard;
let deleteTargetId = null;

// Global Functions
function goBackHome() {
    if (typeof dashboard !== 'undefined') {
        dashboard.goBackHome();
    } else {
        window.location.href = "../../html/dashboard/dashboard.html";
    }
}

function clearForm() {
    const form = document.getElementById('feedbackForm');
    const successMessage = document.getElementById('successMessage');

    if (form) {
        form.reset();
        form.style.display = 'flex';
    }

    if (successMessage) {
        successMessage.style.display = 'none';
    }

    const ratingText = document.getElementById('ratingText');
    const charCount = document.getElementById('charCount');

    if (ratingText) {
        ratingText.textContent = 'Click to rate';
    }

    if (charCount) {
        charCount.textContent = '0';
    }

    if (typeof dashboard !== 'undefined') {
        dashboard.clearAllErrors();
    }
}

function openEditPopup(id) {
    const feedback = dashboard.feedbacks.find(f => f.id === id);
    if (!feedback) return;

    document.getElementById("editFeedbackId").value = feedback.id;
    document.getElementById("editUsername").value = feedback.username;
    document.getElementById("editCategory").value = feedback.category;
    document.getElementById("editMessage").value = feedback.message;
    document.getElementById("editRating").value = feedback.rating;

    document.getElementById("editFeedbackModal").style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeEditPopup() {
    document.getElementById("editFeedbackModal").style.display = "none";
    document.body.style.overflow = "auto";
}

function openDeletePopup(id) {
    deleteTargetId = id;
    document.getElementById("deleteFeedbackModal").style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeDeletePopup() {
    deleteTargetId = null;
    document.getElementById("deleteFeedbackModal").style.display = "none";
    document.body.style.overflow = "auto";
}

async function confirmDeleteFeedback() {
    if (deleteTargetId === null) return;

    await dashboard.deleteFeedback(deleteTargetId);
    closeDeletePopup();
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new FeedbackDashboard();

    // Setup Edit Form Handler
    document.getElementById("editFeedbackForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("editFeedbackId").value;
        const updatedFeedback = {
            username: document.getElementById("editUsername").value,
            category: document.getElementById("editCategory").value,
            message: document.getElementById("editMessage").value,
            rating: parseInt(document.getElementById("editRating").value),
            createdAt: new Date().toISOString()
        };

        try {
            const response = await fetch(`${dashboard.API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(updatedFeedback)
            });

            if (response.ok) {
                closeEditPopup();
                await dashboard.loadFeedback();
                dashboard.showNotification('Feedback updated successfully', 'success');
            } else {
                throw new Error('Failed to update feedback');
            }
        } catch (error) {
            console.error(error);
            dashboard.showNotification('Failed to update feedback', 'error');
        }
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-modal-dash')) {
            closeEditPopup();
        }
        if (e.target.classList.contains('delete-modal-dash')) {
            closeDeletePopup();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.click();
            }
        }

        if (e.key === 'Escape') {
            const editModal = document.getElementById('editFeedbackModal');
            const deleteModal = document.getElementById('deleteFeedbackModal');

            if (editModal.style.display === 'flex') {
                closeEditPopup();
            } else if (deleteModal.style.display === 'flex') {
                closeDeletePopup();
            } else {
                const form = document.getElementById('feedbackForm');
                if (form && form.style.display !== 'none') {
                    clearForm();
                }
            }
        }
    });
});