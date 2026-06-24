// Modern Dashboard JavaScript
class Dashboard {
    constructor() {
        this.bills = [];
        this.events = [];
        this.notifications = [];
        this.currentDate = new Date();
        this.currentFilter = 'all';

        this.BILL_API = "http://localhost:8080/api/bills";
        this.EVENT_API = "http://localhost:8080/api/events";

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadData();
        this.generateNotifications();
        this.renderSummary();
        this.renderNotifications();
        this.renderBills();
        this.renderEvents();
        this.renderCalendar();
        this.renderStats();
        this.startNotificationUpdates();
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn-dash').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Notification bell
        document.getElementById('notificationBell').addEventListener('click', () => {
            this.showAllNotifications();
        });

        // Tooltip functionality
        this.setupTooltips();
    }

    async loadData() {
        try {
            await Promise.all([this.loadBills(), this.loadEvents()]);
        } catch (error) {
            console.error('Error loading data:', error);
            // Use sample data if API fails
            this.loadSampleData();
        }
    }

    async loadBills() {
        try {
            const response = await fetch(this.BILL_API);
            if (response.ok) {
                this.bills = await response.json();
            } else {
                throw new Error('Failed to load bills');
            }
        } catch (error) {
            console.warn('Using sample bills data');
            this.bills = this.getSampleBills();
        }
    }

    async loadEvents() {
        try {
            const response = await fetch(this.EVENT_API);
            if (response.ok) {
                this.events = await response.json();
            } else {
                throw new Error('Failed to load events');
            }
        } catch (error) {
            console.warn('Using sample events data');
            this.events = this.getSampleEvents();
        }
    }

    getSampleBills() {
        return [
            {
                id: 1,
                name: "Electricity Bill",
                category: "Utilities",
                amount: 150.00,
                dueDate: "2025-10-05",
                status: "pending"
            },
            {
                id: 2,
                name: "Internet Bill",
                category: "Utilities",
                amount: 75.00,
                dueDate: "2025-09-30",
                status: "overdue"
            },
            {
                id: 3,
                name: "Water Bill",
                category: "Utilities",
                amount: 45.00,
                dueDate: "2025-10-15",
                status: "pending"
            },
            {
                id: 4,
                name: "Phone Bill",
                category: "Telecommunications",
                amount: 120.00,
                dueDate: "2025-10-01",
                status: "paid"
            },
            {
                id: 5,
                name: "Credit Card",
                category: "Finance",
                amount: 350.00,
                dueDate: "2025-10-10",
                status: "pending"
            }
        ];
    }

    getSampleEvents() {
        return [
            {
                id: 1,
                title: "Team Meeting",
                location: "Conference Room A",
                eventDateTime: "2025-10-02T14:00:00",
                description: "Weekly team sync meeting"
            },
            {
                id: 2,
                title: "Doctor Appointment",
                location: "Health Center",
                eventDateTime: "2025-10-05T10:30:00",
                description: "Annual checkup"
            },
            {
                id: 3,
                title: "Project Deadline",
                location: "Office",
                eventDateTime: "2025-10-08T17:00:00",
                description: "Submit quarterly report"
            },
            {
                id: 4,
                title: "Birthday Party",
                location: "Community Hall",
                eventDateTime: "2025-10-12T19:00:00",
                description: "Sarah's birthday celebration"
            },
            {
                id: 5,
                title: "Workshop",
                location: "Training Room",
                eventDateTime: "2025-10-15T09:00:00",
                description: "Professional development workshop"
            }
        ];
    }

    generateNotifications() {
        this.notifications = [];
        const now = new Date();
        const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));
        const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

        // Bill notifications
        this.bills.forEach(bill => {
            const dueDate = new Date(bill.dueDate);
            const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

            let urgency = 'normal';
            let message = '';

            if (daysUntilDue < 0) {
                urgency = 'urgent';
                message = `${bill.name} is ${Math.abs(daysUntilDue)} day(s) overdue`;
            } else if (daysUntilDue === 0) {
                urgency = 'urgent';
                message = `${bill.name} is due today`;
            } else if (daysUntilDue === 1) {
                urgency = 'urgent';
                message = `${bill.name} is due tomorrow`;
            } else if (daysUntilDue === 2) {
                message = `${bill.name} is due in 2 days`;
            } else if (daysUntilDue <= 7) {
                message = `${bill.name} is due in ${daysUntilDue} days`;
            }

            if (message) {
                this.notifications.push({
                    id: `bill_${bill.id}`,
                    type: 'bill',
                    title: bill.name,
                    message: message,
                    urgency: urgency,
                    time: this.getRelativeTime(daysUntilDue),
                    data: bill
                });
            }
        });

        // Event notifications
        this.events.forEach(event => {
            const eventDate = new Date(event.eventDateTime);
            const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

            let message = '';

            if (daysUntilEvent === 0) {
                message = `${event.title} is today`;
            } else if (daysUntilEvent === 1) {
                message = `${event.title} is tomorrow`;
            } else if (daysUntilEvent === 2) {
                message = `${event.title} is in 2 days`;
            } else if (daysUntilEvent <= 7) {
                message = `${event.title} is in ${daysUntilEvent} days`;
            }

            if (message) {
                this.notifications.push({
                    id: `event_${event.id}`,
                    type: 'event',
                    title: event.title,
                    message: message,
                    urgency: 'normal',
                    time: this.getRelativeTime(daysUntilEvent),
                    data: event
                });
            }
        });

        // Sort notifications by urgency and time
        this.notifications.sort((a, b) => {
            if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
            if (a.urgency !== 'urgent' && b.urgency === 'urgent') return 1;
            return 0;
        });
    }

    getRelativeTime(days) {
        if (days < 0) return `${Math.abs(days)}d ago`;
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        if (days === 2) return '2 days';
        return `${days}d`;
    }

    renderSummary() {
        const totalBills = this.bills.length;
        const overdueBills = this.bills.filter(bill => {
            const dueDate = new Date(bill.dueDate);
            const now = new Date();
            return dueDate < now && bill.status !== 'paid';
        }).length;

        const totalEvents = this.events.length;
        const monthlySpending = this.bills
            .filter(bill => bill.status === 'paid')
            .reduce((sum, bill) => sum + bill.amount, 0);

        document.getElementById('totalBills').textContent = totalBills;
        document.getElementById('overdueBills').textContent = overdueBills;
        document.getElementById('totalEvents').textContent = totalEvents;
        document.getElementById('monthlySpending').textContent = `$${monthlySpending.toFixed(2)}`;
        document.getElementById('notificationCount').textContent = this.notifications.length;
    }

    setFilter(filter) {
        this.currentFilter = filter;

        // Update active button
        document.querySelectorAll('.filter-btn-dash').forEach(btn => {
            btn.classList.remove('active-dash');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active-dash');
            }
        });

        this.renderNotifications();
    }

    renderNotifications() {
        const container = document.getElementById('notificationsList');
        let filteredNotifications = this.notifications;

        if (this.currentFilter !== 'all') {
            filteredNotifications = this.notifications.filter(n => n.type === this.currentFilter);
        }

        container.innerHTML = filteredNotifications.slice(0, 5).map(notification => `
            <div class="notification-item-dash ${notification.urgency === 'urgent' ? 'urgent-dash' : ''}" 
                 data-tooltip="${notification.message}">
                <div class="notification-icon-dash ${notification.type}-dash">
                    <i class="fas ${notification.type === 'bill' ? 'fa-file-invoice-dollar' : 'fa-calendar'}"></i>
                </div>
                <div class="notification-content-dash">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                </div>
                <div class="notification-time-dash">${notification.time}</div>
            </div>
        `).join('');
    }

    renderBills() {
        const container = document.getElementById('billsList');
        const recentBills = this.bills
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 3);

        container.innerHTML = recentBills.map(bill => `
            <div class="bill-item-dash" onclick="viewBillDetails(${bill.id})" 
                 data-tooltip="Click to view full details">
                <div class="item-icon-dash">
                    <i class="fas fa-file-invoice-dollar"></i>
                </div>
                <div class="item-content-dash">
                    <div class="item-title-dash">${bill.name}</div>
                    <div class="item-details-dash">${bill.category} • Due ${this.formatDate(bill.dueDate)}</div>
                </div>
                <div class="item-amount-dash">$${bill.amount.toFixed(2)}</div>
                <div class="item-status-dash status-${bill.status}-dash">${bill.status}</div>
            </div>
        `).join('');
    }

    renderEvents() {
        const container = document.getElementById('eventsList');
        const upcomingEvents = this.events
            .filter(event => new Date(event.eventDateTime) >= new Date())
            .sort((a, b) => new Date(a.eventDateTime) - new Date(b.eventDateTime))
            .slice(0, 3);

        container.innerHTML = upcomingEvents.map(event => `
            <div class="event-item-dash" onclick="viewEventDetails(${event.id})" 
                 data-tooltip="Click to view full details">
                <div class="item-icon-dash">
                    <i class="fas fa-calendar"></i>
                </div>
                <div class="item-content-dash">
                    <div class="item-title-dash">${event.title}</div>
                    <div class="item-details-dash">${event.location} • ${this.formatDateTime(event.eventDateTime)}</div>
                </div>
            </div>
        `).join('');
    }

    renderCalendar() {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();

        document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;

        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';

        const today = new Date();
        const billDates = this.bills.map(bill => bill.dueDate);
        const eventDates = this.events.map(event => event.eventDateTime.split('T')[0]);

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day-dash';
            dayElement.textContent = currentDate.getDate();

            const dateString = currentDate.toISOString().split('T')[0];

            // Check if it's today
            if (currentDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today-dash');
            }

            // Check if it's in current month
            if (currentDate.getMonth() !== currentMonth) {
                dayElement.classList.add('other-month-dash');
            }

            // Add indicators for bills and events
            const hasBill = billDates.includes(dateString);
            const hasEvent = eventDates.includes(dateString);

            if (hasBill && hasEvent) {
                const indicator = document.createElement('div');
                indicator.className = 'day-indicator-dash both-indicator-dash';
                dayElement.appendChild(indicator);
            } else if (hasBill) {
                const indicator = document.createElement('div');
                indicator.className = 'day-indicator-dash bill-indicator-dash';
                dayElement.appendChild(indicator);
            } else if (hasEvent) {
                const indicator = document.createElement('div');
                indicator.className = 'day-indicator-dash event-indicator-dash';
                dayElement.appendChild(indicator);
            }

            // Add hover tooltip
            if (hasBill || hasEvent) {
                const items = [];
                if (hasBill) {
                    const bills = this.bills.filter(bill => bill.dueDate === dateString);
                    items.push(...bills.map(bill => `${bill.name} - $${bill.amount}`));
                }
                if (hasEvent) {
                    const events = this.events.filter(event => event.eventDateTime.startsWith(dateString));
                    items.push(...events.map(event => `${event.title} at ${event.location}`));
                }
                dayElement.setAttribute('data-tooltip', items.join('\n'));
            }

            calendarDays.appendChild(dayElement);
        }
    }

    renderStats() {
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
        const twoWeeksFromNow = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000));

        // This week bills
        const thisWeekBills = this.bills.filter(bill => {
            const dueDate = new Date(bill.dueDate);
            return dueDate >= now && dueDate <= oneWeekFromNow;
        }).length;

        // Next week events
        const nextWeekEvents = this.events.filter(event => {
            const eventDate = new Date(event.eventDateTime);
            return eventDate >= oneWeekFromNow && eventDate <= twoWeeksFromNow;
        }).length;

        // Completion percentage (paid bills / total bills)
        const paidBills = this.bills.filter(bill => bill.status === 'paid').length;
        const completionPercentage = this.bills.length > 0 ? Math.round((paidBills / this.bills.length) * 100) : 0;

        document.getElementById('thisWeekBills').textContent = `${thisWeekBills} bills`;
        document.getElementById('nextWeekEvents').textContent = `${nextWeekEvents} events`;
        document.getElementById('completionProgress').style.width = `${completionPercentage}%`;
        document.getElementById('completionText').textContent = `${completionPercentage}%`;
    }

    setupTooltips() {
        const tooltip = document.getElementById('tooltip');

        document.addEventListener('mouseover', (e) => {
            if (e.target.hasAttribute('data-tooltip')) {
                const tooltipText = e.target.getAttribute('data-tooltip');
                tooltip.textContent = tooltipText;
                tooltip.classList.add('show-dash');

                const updateTooltipPosition = (event) => {
                    tooltip.style.left = event.pageX + 10 + 'px';
                    tooltip.style.top = event.pageY + 10 + 'px';
                };

                updateTooltipPosition(e);
                e.target.addEventListener('mousemove', updateTooltipPosition);

                e.target.addEventListener('mouseleave', () => {
                    tooltip.classList.remove('show-dash');
                    e.target.removeEventListener('mousemove', updateTooltipPosition);
                }, { once: true });
            }
        });
    }

    startNotificationUpdates() {
        // Update notifications every minute
        setInterval(() => {
            this.generateNotifications();
            this.renderSummary();
            this.renderNotifications();
        }, 60000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        const options = {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        return date.toLocaleDateString('en-US', options);
    }

    showAllNotifications() {
        // This could open a modal or navigate to a notifications page
        console.log('Show all notifications:', this.notifications);
        alert(`You have ${this.notifications.length} notifications. Check the notifications panel for details.`);
    }
}

// Navigation Functions
function openAddBill() {
    window.location.href = "../../html/bill/billAdd.html";
}

function openAddEvent() {
    window.location.href = "../../html/event/eventAdd.html";
}

function openFeedback() {
    window.location.href = "../../html/dashboard/feedbackDashboard.html";
}

function viewAllBills() {
    window.location.href = "../../html/bill/billDashboard.html";
}

function viewAllEvents() {
    window.location.href = "../../html/event/eventDashboard.html";
}

function viewBillDetails(billId) {
    window.location.href = `./bill/billDetails.html?id=${billId}`;
}

function viewEventDetails(eventId) {
    window.location.href = `./event/eventDetails.html?id=${eventId}`;
}

function exportData() {
    // Export functionality
    const data = {
        bills: dashboard.bills,
        events: dashboard.events,
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `dashboard_export_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Initialize Dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
});

// Additional utility functions
function refreshDashboard() {
    dashboard.init();
}

function addQuickBill(name, amount, dueDate) {
    // Quick add functionality
    const newBill = {
        id: Date.now(),
        name: name,
        category: "Quick Add",
        amount: parseFloat(amount),
        dueDate: dueDate,
        status: "pending"
    };

    dashboard.bills.push(newBill);
    dashboard.generateNotifications();
    dashboard.renderSummary();
    dashboard.renderNotifications();
    dashboard.renderBills();
    dashboard.renderCalendar();
}

function addQuickEvent(title, dateTime, location = "TBD") {
    // Quick add functionality
    const newEvent = {
        id: Date.now(),
        title: title,
        location: location,
        eventDateTime: dateTime,
        description: "Quick added event"
    };

    dashboard.events.push(newEvent);
    dashboard.generateNotifications();
    dashboard.renderSummary();
    dashboard.renderNotifications();
    dashboard.renderEvents();
    dashboard.renderCalendar();
}