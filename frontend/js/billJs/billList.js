const API_URL = "http://localhost:8080/api/bills";

let allBills = [];
let filteredBills = [];
let billToDelete = null;

// DOM Elements
const searchBox = document.getElementById("searchBox");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");
const dateFilter = document.getElementById("dateFilter");
const clearFiltersBtn = document.getElementById("clearFilters");
const billTableBody = document.getElementById("billTableBody");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const deleteModal = document.getElementById("deleteModal");
const deleteBillName = document.getElementById("deleteBillName");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");
const toast = document.getElementById("toast");

// Category Icons
const categoryIcons = {
    electricity: 'fa-bolt',
    water: 'fa-tint',
    rent: 'fa-home',
    internet: 'fa-wifi',
    other: 'fa-file-alt'
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadBills();
    initializeFilters();
});

// Load Bills from API
async function loadBills() {
    showLoading(true);

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Failed to fetch bills');
        }

        allBills = await response.json();
        filteredBills = [...allBills];

        showLoading(false);
        renderBills();
        updateStats();

    } catch (error) {
        console.error("Error loading bills:", error);
        showLoading(false);
        showToast('Failed to load bills. Please try again.', 'error');
        showEmptyState(true);
    }
}

// Render Bills in Table
function renderBills() {
    billTableBody.innerHTML = "";

    if (filteredBills.length === 0) {
        showEmptyState(true);
        return;
    }

    showEmptyState(false);

    filteredBills.forEach((bill, index) => {
        const row = document.createElement("tr");
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';

        const categoryIcon = categoryIcons[bill.category] || categoryIcons.other;
        const formattedAmount = formatCurrency(bill.amount);
        const formattedDueDate = formatDate(bill.dueDate);
        const reminderText = bill.reminderDate ? formatDate(bill.reminderDate) : 'No reminder';

        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas ${categoryIcon}" style="color: #667eea; font-size: 18px;"></i>
                    <strong>${escapeHtml(bill.name)}</strong>
                </div>
            </td>
            <td>
                <span class="category-badge-bill-list">
                    <i class="fas ${categoryIcon}"></i>
                    ${capitalizeFirst(bill.category)}
                </span>
            </td>
            <td><span class="amount-cell-bill-list">${formattedAmount}</span></td>
            <td>${formattedDueDate}</td>
            <td>
                <span class="status-badge-bill-list ${bill.status === 'Paid' ? 'status-paid-bill-list' : 'status-pending-bill-list'}">
                    <i class="fas ${bill.status === 'Paid' ? 'fa-check-circle' : 'fa-clock'}"></i>
                    ${bill.status}
                </span>
            </td>
            <td>${reminderText}</td>
            <td>
                <div class="action-buttons-bill-list">
                    <a href="billEdit.html?id=${bill.id}" class="btn-action-bill-list btn-edit-bill-list">
                        <i class="fas fa-edit"></i>
                        Edit
                    </a>
                    <button onclick="openDeleteModal(${bill.id}, '${escapeHtml(bill.name)}')" class="btn-action-bill-list btn-delete-bill-list">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </td>
        `;

        billTableBody.appendChild(row);

        // Animate row
        setTimeout(() => {
            row.style.transition = 'all 0.5s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Initialize Filters
function initializeFilters() {
    searchBox.addEventListener("input", applyFilters);
    statusFilter.addEventListener("change", applyFilters);
    categoryFilter.addEventListener("change", applyFilters);
    dateFilter.addEventListener("change", applyFilters);
    clearFiltersBtn.addEventListener("click", clearFilters);
}

// Apply Filters
function applyFilters() {
    const searchTerm = searchBox.value.toLowerCase().trim();
    const status = statusFilter.value;
    const category = categoryFilter.value;
    const dateLimit = dateFilter.value ? new Date(dateFilter.value) : null;

    filteredBills = allBills.filter(bill => {
        // Search filter
        if (searchTerm && !bill.name.toLowerCase().includes(searchTerm)) {
            return false;
        }

        // Status filter
        if (status !== "all" && bill.status !== status) {
            return false;
        }

        // Category filter
        if (category !== "all" && bill.category !== category) {
            return false;
        }

        // Date filter
        if (dateLimit) {
            const dueDate = new Date(bill.dueDate);
            if (dueDate > dateLimit) {
                return false;
            }
        }

        return true;
    });

    renderBills();
    updateStats();
}

// Clear All Filters
function clearFilters() {
    searchBox.value = "";
    statusFilter.value = "all";
    categoryFilter.value = "all";
    dateFilter.value = "";

    filteredBills = [...allBills];
    renderBills();
    updateStats();

    showToast('Filters cleared', 'success');
}

// Update Statistics
function updateStats() {
    const totalBills = filteredBills.length;
    const pendingBills = filteredBills.filter(b => b.status === 'Pending').length;
    const paidBills = filteredBills.filter(b => b.status === 'Paid').length;
    const totalAmount = filteredBills.reduce((sum, b) => sum + (b.amount || 0), 0);

    document.getElementById('totalBills').textContent = totalBills;
    document.getElementById('pendingBills').textContent = pendingBills;
    document.getElementById('paidBills').textContent = paidBills;
    document.getElementById('totalAmount').textContent = formatCurrency(totalAmount);
}

// Open Delete Modal
function openDeleteModal(id, name) {
    billToDelete = id;
    deleteBillName.textContent = name;
    deleteModal.classList.add('show');
}

// Close Delete Modal
function closeDeleteModal() {
    deleteModal.classList.remove('show');
    billToDelete = null;
}

// Delete Bill
async function deleteBill() {
    if (!billToDelete) return;

    const deleteBtn = confirmDelete;
    const originalContent = deleteBtn.innerHTML;
    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
    deleteBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/${billToDelete}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Bill deleted successfully!', 'success');
            closeDeleteModal();

            // Remove from local array
            allBills = allBills.filter(b => b.id !== billToDelete);
            applyFilters();

        } else {
            throw new Error('Failed to delete bill');
        }

    } catch (error) {
        console.error("Error deleting bill:", error);
        showToast('Failed to delete bill. Please try again.', 'error');

    } finally {
        deleteBtn.innerHTML = originalContent;
        deleteBtn.disabled = false;
    }
}

// Show/Hide Loading State
function showLoading(show) {
    if (show) {
        loadingState.style.display = 'block';
        emptyState.style.display = 'none';
        billTableBody.parentElement.style.display = 'none';
    } else {
        loadingState.style.display = 'none';
        billTableBody.parentElement.style.display = 'table';
    }
}

// Show/Hide Empty State
function showEmptyState(show) {
    if (show) {
        emptyState.style.display = 'block';
        billTableBody.parentElement.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        billTableBody.parentElement.style.display = 'table';
    }
}

// Show Toast Notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast-bill-list ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount || 0);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners for Modal
cancelDelete.addEventListener('click', closeDeleteModal);
confirmDelete.addEventListener('click', deleteBill);

// Close modal when clicking outside
deleteModal.addEventListener('click', function(e) {
    if (e.target === deleteModal) {
        closeDeleteModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape to close modal
    if (e.key === 'Escape' && deleteModal.classList.contains('show')) {
        closeDeleteModal();
    }

    // Ctrl+F or Cmd+F to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchBox.focus();
    }
});

// Auto-refresh every 30 seconds
setInterval(() => {
    if (!deleteModal.classList.contains('show')) {
        loadBills();
    }
}, 30000);