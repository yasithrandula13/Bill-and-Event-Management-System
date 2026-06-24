// Enhanced Event Dashboard JavaScript
let events = [];
const API_URL = "http://localhost:8080/api/events";
const dashboardCards = document.getElementById("dashboardCards");
let currentDate = new Date();
let reminderCollapsed = false;

// Initialize the dashboard
window.onload = function() {
    initializeDashboard();
};

// Initialize all dashboard components
function initializeDashboard() {
    fetchEvents();
    initializeCalendar();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Search and filter
    document.getElementById("searchBox").addEventListener("input", renderEvents);
    document.getElementById("statusFilter").addEventListener("change", renderEvents);

    // Calendar navigation
    document.getElementById("prevMonth").addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById("nextMonth").addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Reminder section controls
    document.getElementById("reminderDaysFilter").addEventListener("change", renderReminders);
    document.getElementById("toggleReminders").addEventListener("click", toggleReminderSection);
}

// Fetch events from backend
function fetchEvents() {
    fetch(API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            events = data || [];
            renderEvents();
            renderCalendar();
            renderReminders();
            updateStats();
        })
        .catch(err => {
            console.error("Error fetching events:", err);
            showErrorMessage("Failed to load events. Please try again later.");
            events = [];
            renderEvents();
            renderReminders();
            updateStats();
        });
}

// Toggle reminder section visibility
function toggleReminderSection() {
    const reminderContent = document.getElementById("reminderContent");
    const toggleIcon = document.getElementById("toggleIcon");
    const toggleText = document.getElementById("toggleText");

    reminderCollapsed = !reminderCollapsed;

    if (reminderCollapsed) {
        reminderContent.classList.add("collapsed-event");
        toggleIcon.textContent = "🔼";
        toggleText.textContent = "Show";
    } else {
        reminderContent.classList.remove("collapsed-event");
        toggleIcon.textContent = "🔽";
        toggleText.textContent = "Hide";
    }
}

// Render reminder section
function renderReminders() {
    const reminderCards = document.getElementById("reminderCards");
    const reminderNoEvents = document.getElementById("reminderNoEvents");
    const daysFilter = parseInt(document.getElementById("reminderDaysFilter").value);

    reminderCards.innerHTML = "";

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // midnight today
    const filterDate = new Date(startOfToday.getTime() + daysFilter * 24 * 60 * 60 * 1000); // add N days

    const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.eventDateTime);
        return eventDate >= startOfToday && eventDate <= filterDate;
    });

    upcomingEvents.sort((a, b) => new Date(a.eventDateTime) - new Date(b.eventDateTime));

    if (upcomingEvents.length === 0) {
        reminderCards.style.display = "none";
        reminderNoEvents.style.display = "block";
        return;
    }

    reminderCards.style.display = "grid";
    reminderNoEvents.style.display = "none";

    upcomingEvents.forEach((event, index) => {
        const card = createReminderCard(event, index === 0);
        reminderCards.appendChild(card);
    });
}


// Create reminder card
function createReminderCard(event, isNearest = false) {
    const card = document.createElement("div");
    const eventDate = new Date(event.eventDateTime);
    const now = new Date();

    // Calculate time difference
    const timeDiff = eventDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const hoursDiff = Math.ceil(timeDiff / (1000 * 3600));

    // Determine priority and styling
    let priority = "soon-event";
    let priorityText = "Soon";
    let countdownText = "";

    if (daysDiff <= 0) {
        if (hoursDiff <= 2) {
            priority = "urgent-event";
            priorityText = "NOW";
            countdownText = hoursDiff <= 0 ? "Starting now!" : `In ${hoursDiff} hour${hoursDiff > 1 ? 's' : ''}`;
        } else {
            priority = "today-event";
            priorityText = "Today";
            countdownText = `In ${hoursDiff} hours`;
        }
    } else if (daysDiff === 1) {
        priority = "today-event";
        priorityText = "Tomorrow";
        countdownText = `In ${daysDiff} day`;
    } else if (daysDiff <= 3) {
        priority = "urgent-event";
        priorityText = "Urgent";
        countdownText = `In ${daysDiff} days`;
    } else {
        countdownText = `In ${daysDiff} days`;
    }

    card.className = `reminder-card-event ${priority}`;

    card.innerHTML = `
        <div class="reminder-card-header-event">
            <div class="reminder-priority-event ${priority}">${priorityText}</div>
        </div>
        
        <h4 class="reminder-event-title-event">${event.title || "Untitled Event"}</h4>
        
        <div class="reminder-event-datetime-event">
            <span>📅</span>
            <span>${formatDate(event.eventDateTime)} at ${formatTime(event.eventDateTime)}</span>
        </div>
        
        ${event.location ? `
            <div class="reminder-event-location-event">
                <span>📍</span>
                <span>${event.location}</span>
            </div>
        ` : ''}
        
        <div class="reminder-countdown-event ${priority}">
            ${countdownText}
        </div>
    `;

    // Add click handler to view event details
    card.addEventListener("click", () => {
        showEventDetails(event);
    });

    return card;
}

// Show event details (you can customize this)
function showEventDetails(event) {
    const details = `
Event: ${event.title}
Date: ${formatDate(event.eventDateTime)}
Time: ${formatTime(event.eventDateTime)}
${event.location ? `Location: ${event.location}` : ''}
${event.description ? `\nDescription: ${event.description}` : ''}
    `.trim();

    if (confirm(`${details}\n\nWould you like to edit this event?`)) {
        editEvent(event.id);
    }
}

// Update statistics cards
function updateStats() {
    const today = new Date();
    const totalEvents = events.length;
    const upcomingEvents = events.filter(event => new Date(event.eventDateTime) >= today).length;
    const pastEvents = totalEvents - upcomingEvents;

    // Animate counter updates
    animateCounter(document.getElementById("totalEvents"), totalEvents);
    animateCounter(document.getElementById("upcomingEvents"), upcomingEvents);
    animateCounter(document.getElementById("pastEvents"), pastEvents);
}

// Animate counter with easing
function animateCounter(element, targetValue, duration = 1000) {
    const startValue = parseInt(element.textContent) || 0;
    const startTime = Date.now();

    function updateCounter() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeOut);

        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }

    requestAnimationFrame(updateCounter);
}

// Initialize calendar
function initializeCalendar() {
    renderCalendar();
}

// Render calendar
function renderCalendar() {
    const monthYear = document.getElementById("monthYear");
    const calendarGrid = document.getElementById("calendarGrid");

    // Update month/year display
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    monthYear.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    // Clear previous calendar
    calendarGrid.innerHTML = "";

    // Get first day of month and number of days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const today = new Date();

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
        const dayCell = createCalendarDay("", true);
        calendarGrid.appendChild(dayCell);
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const isToday = isSameDate(cellDate, today);
        const dayEvents = getEventsForDate(cellDate);

        const dayCell = createCalendarDay(day, false, isToday, dayEvents);
        calendarGrid.appendChild(dayCell);
    }
}

// Create calendar day cell
function createCalendarDay(day, isOtherMonth = false, isToday = false, dayEvents = []) {
    const dayCell = document.createElement("div");
    dayCell.className = "calendar-day-event";
    dayCell.textContent = day;

    if (isOtherMonth) {
        dayCell.classList.add("other-month-event");
    }

    if (isToday) {
        dayCell.classList.add("today-event");
    }

    if (dayEvents.length > 0) {
        dayCell.classList.add("has-events-event");
        setupCalendarTooltip(dayCell, day, dayEvents);
    }

    return dayCell;
}

// Setup calendar tooltip
function setupCalendarTooltip(dayCell, day, dayEvents) {
    const tooltip = document.getElementById("calendarTooltip");
    const tooltipDate = document.getElementById("tooltipDate");
    const tooltipEvents = document.getElementById("tooltipEvents");

    dayCell.addEventListener("mouseenter", (e) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        tooltipDate.textContent = formatDateForTooltip(date);

        tooltipEvents.innerHTML = "";
        dayEvents.slice(0, 3).forEach(event => {
            const eventItem = document.createElement("div");
            eventItem.className = "tooltip-event-item-event";
            eventItem.innerHTML = `
                <strong>${event.title}</strong><br>
                <small>${formatTime(event.eventDateTime)}</small>
            `;
            tooltipEvents.appendChild(eventItem);
        });

        if (dayEvents.length > 3) {
            const moreItem = document.createElement("div");
            moreItem.className = "tooltip-event-item-event";
            moreItem.innerHTML = `<small>+${dayEvents.length - 3} more events</small>`;
            tooltipEvents.appendChild(moreItem);
        }

        // Position tooltip
        const rect = dayCell.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
        tooltip.classList.add("show-event");
    });

    dayCell.addEventListener("mouseleave", () => {
        tooltip.classList.remove("show-event");
    });
}

// Get events for a specific date
function getEventsForDate(date) {
    return events.filter(event => {
        const eventDate = new Date(event.eventDateTime);
        return isSameDate(eventDate, date);
    });
}

// Check if two dates are the same day
function isSameDate(date1, date2) {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
}

// Format date for tooltip
function formatDateForTooltip(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString(undefined, options);
}

// Render events list
function renderEvents() {
    dashboardCards.innerHTML = "";

    const search = document.getElementById("searchBox").value.toLowerCase();
    const statusFilter = document.getElementById("statusFilter").value;
    const today = new Date();

    const filtered = events.filter(event => {
        // Search filter
        if (search && !event.title.toLowerCase().includes(search)) return false;

        // Status filter
        const eventDate = new Date(event.eventDateTime);
        if (statusFilter === "upcoming" && eventDate < today) return false;
        if (statusFilter === "past" && eventDate >= today) return false;

        return true;
    });

    if (filtered.length === 0) {
        showNoEventsMessage();
        return;
    }

    // Sort events by date
    filtered.sort((a, b) => new Date(a.eventDateTime) - new Date(b.eventDateTime));

    filtered.forEach(event => {
        const card = createEventCard(event);
        dashboardCards.appendChild(card);
    });
}

// Create event card
function createEventCard(event) {
    const card = document.createElement("div");
    card.className = "dashboard-card";

    const eventDate = new Date(event.eventDateTime);
    const isUpcoming = eventDate >= new Date();

    card.innerHTML = `
        <h4 class="card-title-event">${event.title || "Untitled Event"}</h4>
        <div class="card-content-event">
            <div class="card-row-event">
                <span class="card-label-event">Date</span>
                <span class="card-value-event">${formatDate(event.eventDateTime)}</span>
            </div>
            <div class="card-row-event">
                <span class="card-label-event">Time</span>
                <span class="card-value-event">${formatTime(event.eventDateTime)}</span>
            </div>
            <div class="card-row-event">
                <span class="card-label-event">Location</span>
                <span class="card-value-event">${event.location || "Not specified"}</span>
            </div>
            <div class="card-row-event">
                <span class="card-label-event">Status</span>
                <span class="card-value-event">${isUpcoming ? "Upcoming" : "Past"}</span>
            </div>
            ${event.description ? `
                <div class="card-row-event card-description-event">
                    <span class="card-label-event">Description</span>
                    <span class="card-value-event">${truncateText(event.description, 100)}</span>
                </div>
            ` : ''}
            ${event.reminderDaysBefore !== null && event.reminderDaysBefore !== undefined ? `
                <div class="card-row-event">
                    <span class="card-label-event">Reminder</span>
                    <span class="card-value-event">${event.reminderDaysBefore} days before</span>
                </div>
            ` : ''}
        </div>
        <div class="card-actions-event">
            <button class="btn-event edit-btn-event" onclick="editEvent(${event.id})">
                ✏️ Edit
            </button>
            <button class="btn-event delete-btn-event" onclick="deleteEvent(${event.id})">
                🗑️ Delete
            </button>
        </div>
    `;

    return card;
}

// Show no events message
function showNoEventsMessage() {
    dashboardCards.innerHTML = `
        <div class="no-events">
            <h3>No events found</h3>
            <p>Try adjusting your search or filter criteria, or add a new event to get started.</p>
        </div>
    `;
}

// Show error message
function showErrorMessage(message) {
    dashboardCards.innerHTML = `
        <div class="no-events">
            <h3>Error</h3>
            <p>${message}</p>
            <button class="btn-event" onclick="fetchEvents()" style="background: var(--primary-blue); color: white; margin-top: 1rem;">
                Retry
            </button>
        </div>
    `;
}

// Utility function to truncate text
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
}

// Format date nicely
function formatDate(dateString) {
    if (!dateString) return "Invalid Date";
    try {
        const d = new Date(dateString);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    } catch (error) {
        return "Invalid Date";
    }
}

// Format time nicely
function formatTime(dateString) {
    if (!dateString) return "Invalid Time";
    try {
        const d = new Date(dateString);
        return d.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    } catch (error) {
        return "Invalid Time";
    }
}

// Delete event with confirmation
function deleteEvent(id) {
    const event = events.find(e => e.id === id);
    const eventTitle = event ? event.title : "this event";

    if (confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
        // Show loading state
        const deleteBtn = document.querySelector(`button[onclick="deleteEvent(${id})"]`);
        if (deleteBtn) {
            deleteBtn.textContent = "Deleting...";
            deleteBtn.disabled = true;
        }

        fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                showSuccessMessage("Event deleted successfully!");
                fetchEvents();
            })
            .catch(err => {
                console.error("Error deleting:", err);
                showErrorMessage("Failed to delete event. Please try again.");

                // Reset button state
                if (deleteBtn) {
                    deleteBtn.textContent = "🗑️ Delete";
                    deleteBtn.disabled = false;
                }
            });
    }
}

// Edit event - redirect to edit page
function editEvent(id) {
    window.location.href = `eventEdit.html?id=${id}`;
}

// Show success message (you can customize this)
function showSuccessMessage(message) {
    // Simple alert for now - you can replace with a toast notification
    alert(message);
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to search
const debouncedSearch = debounce(renderEvents, 300);
document.addEventListener('DOMContentLoaded', function() {
    const searchBox = document.getElementById("searchBox");
    if (searchBox) {
        searchBox.removeEventListener("input", renderEvents);
        searchBox.addEventListener("input", debouncedSearch);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById("searchBox").focus();
    }

    // Escape to clear search
    if (e.key === 'Escape') {
        const searchBox = document.getElementById("searchBox");
        if (document.activeElement === searchBox) {
            searchBox.value = '';
            renderEvents();
            searchBox.blur();
        }
    }

    // Toggle reminders with R key
    if (e.key === 'r' || e.key === 'R') {
        if (document.activeElement.tagName !== 'INPUT') {
            toggleReminderSection();
        }
    }
});

// Handle window resize for responsive calendar and reminders
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        renderCalendar();
        renderReminders();
    }, 250);
});

// Auto-refresh reminders every minute to keep countdown updated
setInterval(() => {
    renderReminders();
}, 60000);

// Show notification for very urgent events (optional enhancement)
function checkForUrgentEvents() {
    const now = new Date();
    const urgentEvents = events.filter(event => {
        const eventDate = new Date(event.eventDateTime);
        const timeDiff = eventDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);
        return hoursDiff <= 1 && hoursDiff > 0;
    });

    urgentEvents.forEach(event => {
        // You can implement browser notifications here if needed
        console.log(`Urgent: ${event.title} is starting soon!`);
    });
}

// Check for urgent events every 5 minutes
setInterval(checkForUrgentEvents, 5 * 60 * 1000);