let bills = [];
const API_URL = "http://localhost:8080/api/bills";

const tableBody = document.getElementById("billTableBody");
const totalBillsEl = document.getElementById("totalBills");
const paidBillsEl = document.getElementById("paidBills");
const unpaidBillsEl = document.getElementById("unpaidBills");
const messageBox = document.getElementById("messageBox");

function showMessage(text, type = "success") {
    messageBox.textContent = text;
    messageBox.className = `message-box ${type}`;
    setTimeout(() => { messageBox.textContent = ""; }, 3000);
}

function fetchBills() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            bills = data;
            renderBills(
                document.getElementById("dateFilter").value,
                document.getElementById("categoryFilter").value
            );
            renderReminderCards(parseInt(document.getElementById("reminderDays").value));
        })
        .catch(err => console.error("Error fetching bills:", err));
}

function renderBills(filterDate = "all", filterCategory = "all") {
    tableBody.innerHTML = "";
    let today = new Date();

    let filtered = bills.filter(bill => {
        let due = new Date(bill.dueDate);
        let diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

        if (filterDate === "3days" && diffDays > 3) return false;
        if (filterDate === "7days" && diffDays > 7) return false;
        if (filterDate === "1month" && diffDays > 30) return false;
        if (filterCategory !== "all" && bill.category !== filterCategory) return false;

        return true;
    });

    filtered.forEach(bill => {
        let row = document.createElement("tr");

        let reminderText = bill.reminderDate
            ? formatDate(bill.reminderDate) + (isReminderDue(bill.reminderDate) ? " ⚠️" : "")
            : "—";

        row.innerHTML = `
            <td>${bill.name}</td>
            <td>${bill.category}</td>
            <td>$${bill.amount.toFixed(2)}</td>
            <td class="${isUrgent(bill.dueDate) ? 'blink-Bill' : ''}">${formatDate(bill.dueDate)}</td>
            <td>
              <select onchange="changeStatus(${bill.id}, this.value)" class="status-dropdown">
                <option value="paid" ${bill.status === "paid" ? "selected" : ""}>Paid</option>
                <option value="unpaid" ${bill.status === "unpaid" ? "selected" : ""}>Unpaid</option>
              </select>
            </td>
            <td>${reminderText}</td>
            <td>
              <button class="btn-Bill edit-btn-Bill" onclick="editBill(${bill.id})">✏️ Edit</button>
              <button class="btn-Bill delete-btn-Bill" onclick="deleteBill(${bill.id})">🗑️ Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updateSummary();
}

function updateSummary() {
    totalBillsEl.textContent = bills.length;
    paidBillsEl.textContent = bills.filter(b => b.status === "paid").length;
    unpaidBillsEl.textContent = bills.filter(b => b.status === "unpaid").length;
}

function deleteBill(id) {
    if (confirm("Are you sure you want to delete this bill?")) {
        fetch(`${API_URL}/${id}`, { method: "DELETE" })
            .then(() => {
                showMessage("Bill deleted!", "error");
                fetchBills();
            });
    }
}

function editBill(id) {
    window.location.href = `billEdit.html?id=${id}`;
}

async function changeStatus(id, newStatus) {
    try {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newStatus)
        });

        if (response.ok) {
            showMessage(`Bill marked as ${newStatus}`, "success");
            fetchBills();
        } else {
            showMessage("Failed to update status.", "error");
        }
    } catch (err) {
        console.error(err);
        showMessage("Server error while updating status.", "error");
    }
}

function isUrgent(dueDate) {
    let today = new Date();
    let due = new Date(dueDate);
    let diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3;
}

function isReminderDue(reminderDate) {
    let today = new Date();
    let reminder = new Date(reminderDate);
    return reminder.toDateString() === today.toDateString();
}

function formatDate(dateString) {
    let d = new Date(dateString);
    return d.toLocaleDateString();
}

// Event Listeners for filters
document.getElementById("dateFilter").addEventListener("change", e => {
    renderBills(e.target.value, document.getElementById("categoryFilter").value);
});
document.getElementById("categoryFilter").addEventListener("change", e => {
    renderBills(document.getElementById("dateFilter").value, e.target.value);
});

window.onload = fetchBills;

const reminderCardsContainer = document.getElementById("reminderCardsContainer");

function renderReminderCards(days = 3) {
    reminderCardsContainer.innerHTML = "";
    let today = new Date();

    let upcomingBills = bills.filter(bill => {
        let due = new Date(bill.dueDate);
        let diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= days;
    });

    if (upcomingBills.length === 0) {
        reminderCardsContainer.innerHTML = "<p style='text-align: center; color: #64748b; font-style: italic; padding: 20px;'>No upcoming bills.</p>";
        return;
    }

    upcomingBills.forEach(bill => {
        let diffDays = Math.ceil((new Date(bill.dueDate) - today) / (1000 * 60 * 60 * 24));
        let cardClass = diffDays <= 3 ? "reminder-card blink-Bill" : "reminder-card";

        let card = document.createElement("div");
        card.className = cardClass;
        card.innerHTML = `
            <h4>${bill.name}</h4>
            <p><b>Category:</b> ${bill.category}</p>
            <p><b>Amount:</b> ${bill.amount.toFixed(2)}</p>
            <p class="due-date"><b>Due:</b> ${formatDate(bill.dueDate)} (${diffDays} day(s) left)</p>
            <p><b>Reminder:</b> ${bill.reminderDate ? formatDate(bill.reminderDate) : "—"}</p>
            <p><b>Status:</b> ${bill.status}</p>
        `;
        reminderCardsContainer.appendChild(card);
    });
}

// Event listener for changing reminder filter
document.getElementById("reminderDays").addEventListener("change", e => {
    renderReminderCards(parseInt(e.target.value));
});