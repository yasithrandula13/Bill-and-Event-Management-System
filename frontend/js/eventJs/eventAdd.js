document.addEventListener("DOMContentLoaded", () => {
    const eventForm = document.getElementById("eventForm");
    const messageBox = document.getElementById("eventMessageBox");
    const enableReminderCheckbox = document.getElementById("enableReminder");
    const reminderFields = document.getElementById("reminderFields");

    // Preview elements
    const previewTitle = document.getElementById("previewTitle");
    const previewDate = document.getElementById("previewDate");
    const previewTime = document.getElementById("previewTime");
    const previewLocation = document.getElementById("previewLocation");
    const previewLocationDiv = document.getElementById("previewLocationDiv");
    const previewDescription = document.getElementById("previewDescription");
    const previewDescriptionDiv = document.getElementById("previewDescriptionDiv");
    const previewReminder = document.getElementById("previewReminder");
    const previewReminderDiv = document.getElementById("previewReminderDiv");

    // Form input elements
    const eventName = document.getElementById("eventName");
    const eventDate = document.getElementById("eventDate");
    const eventTime = document.getElementById("eventTime");
    const eventLocation = document.getElementById("eventLocation");
    const eventDescription = document.getElementById("eventDescription");
    const reminderEmail = document.getElementById("reminderEmail");
    const reminderDay = document.getElementById("reminderDay");
    const reminderTime = document.getElementById("reminderTime");

    const API_URL = "http://localhost:8080/api/events";

    // ✅ Prevent selecting past dates
    const today = new Date().toISOString().split("T")[0];
    eventDate.setAttribute("min", today);

    // Initialize reminder fields state
    toggleReminderFields();

    // Event listeners for real-time preview updates
    eventName.addEventListener("input", updatePreviewTitle);
    eventDate.addEventListener("change", updatePreviewDate);
    eventTime.addEventListener("change", updatePreviewTime);
    eventLocation.addEventListener("input", updatePreviewLocation);
    eventDescription.addEventListener("input", updatePreviewDescription);
    enableReminderCheckbox.addEventListener("change", () => {
        toggleReminderFields();
        updatePreviewReminder();
    });
    reminderEmail.addEventListener("input", updatePreviewReminder);
    reminderDay.addEventListener("change", updatePreviewReminder);
    reminderTime.addEventListener("change", updatePreviewReminder);

    function showMessage(text, type = "success") {
        messageBox.textContent = text;
        messageBox.className = `event-message-box ${type}`;
        setTimeout(() => {
            messageBox.textContent = "";
            messageBox.className = "event-message-box";
        }, 4000);
    }

    function toggleReminderFields() {
        const isEnabled = enableReminderCheckbox.checked;
        if (isEnabled) {
            reminderFields.classList.remove("disabled");
        } else {
            reminderFields.classList.add("disabled");
        }
    }

    function updatePreviewTitle() {
        const title = eventName.value.trim() || "Event Name";
        previewTitle.textContent = title;
        previewTitle.style.animation = "fadeIn 0.3s ease";
    }

    function updatePreviewDate() {
        if (eventDate.value) {
            const date = new Date(eventDate.value);
            const options = {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            previewDate.textContent = date.toLocaleDateString('en-US', options);
        } else {
            previewDate.textContent = "Select Date";
        }
        showPreviewDetail(previewDate.parentElement);
    }

    function updatePreviewTime() {
        if (eventTime.value) {
            const time = new Date(`2000-01-01T${eventTime.value}`);
            previewTime.textContent = time.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } else {
            previewTime.textContent = "Select Time";
        }
        showPreviewDetail(previewTime.parentElement);
    }

    function updatePreviewLocation() {
        const location = eventLocation.value.trim();
        if (location) {
            previewLocation.textContent = location;
            showPreviewDetail(previewLocationDiv);
        } else {
            hidePreviewDetail(previewLocationDiv);
        }
    }

    function updatePreviewDescription() {
        const description = eventDescription.value.trim();
        if (description) {
            previewDescription.textContent = description.length > 80
                ? description.substring(0, 80) + "..."
                : description;
            showPreviewDetail(previewDescriptionDiv);
        } else {
            hidePreviewDetail(previewDescriptionDiv);
        }
    }

    function updatePreviewReminder() {
        if (enableReminderCheckbox.checked && reminderEmail.value.trim()) {
            const dayText = reminderDay.value === "0" ? "same day" :
                reminderDay.value === "1" ? "1 day before" :
                    `${reminderDay.value} days before`;

            const timeText = reminderTime.value ?
                new Date(`2000-01-01T${reminderTime.value}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }) : "default time";

            previewReminder.textContent = `Email reminder ${dayText} at ${timeText}`;
            showPreviewDetail(previewReminderDiv);
        } else {
            hidePreviewDetail(previewReminderDiv);
        }
    }

    function showPreviewDetail(element) {
        element.style.display = "flex";
        setTimeout(() => {
            element.classList.add("show");
        }, 10);
    }

    function hidePreviewDetail(element) {
        element.classList.remove("show");
        setTimeout(() => {
            element.style.display = "none";
        }, 300);
    }

    // Initialize preview with default values
    setTimeout(() => {
        showPreviewDetail(previewDate.parentElement);
        showPreviewDetail(previewTime.parentElement);
    }, 100);

    eventForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const submitBtn = eventForm.querySelector(".event-add-submit-btn");
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="btn-icon">⏳</span>Creating...';
        submitBtn.disabled = true;

        const eventDateValue = eventDate.value;
        const eventTimeValue = eventTime.value;

        if (!eventDateValue || !eventTimeValue) {
            showMessage("Please fill in both date and time.", "error");
            resetBtn();
            return;
        }

        // ✅ Check if event date is in the past
        const selectedDateTime = new Date(`${eventDateValue}T${eventTimeValue}`);
        const now = new Date();
        if (selectedDateTime < now) {
            showMessage("Event date & time cannot be in the past.", "error");
            resetBtn();
            return;
        }

        const reminderEnabled = enableReminderCheckbox.checked;
        const eventData = {
            title: eventName.value.trim(),
            eventDateTime: `${eventDateValue}T${eventTimeValue}`,
            location: eventLocation.value.trim(),
            description: eventDescription.value.trim(),
            reminderDaysBefore: parseInt(reminderDay.value) || 0,
            reminderTime: reminderTime.value || "",
            reminderEnabled: reminderEnabled,
            reminderEmail: reminderEnabled ? reminderEmail.value.trim() : ""
        };

        if (reminderEnabled && !eventData.reminderEmail) {
            showMessage("Please enter a reminder email.", "error");
            resetBtn();
            return;
        }

        if (reminderEnabled && eventData.reminderEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(eventData.reminderEmail)) {
                showMessage("Please enter a valid email address.", "error");
                resetBtn();
                return;
            }
        }

        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventData)
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to add event. Status: " + res.status);
                return res.json();
            })
            .then(data => {
                showMessage("🎉 Event created successfully!", "success");
                eventForm.reset();
                previewTitle.textContent = "Event Name";
                previewDate.textContent = "Select Date";
                previewTime.textContent = "Select Time";
                hidePreviewDetail(previewLocationDiv);
                hidePreviewDetail(previewDescriptionDiv);
                hidePreviewDetail(previewReminderDiv);
                enableReminderCheckbox.checked = true;
                reminderDay.value = "1";
                reminderTime.value = "09:00";
                toggleReminderFields();
                setTimeout(() => {
                    showPreviewDetail(previewDate.parentElement);
                    showPreviewDetail(previewTime.parentElement);
                }, 100);
            })
            .catch(err => {
                console.error(err);
                showMessage("❌ Error creating event: " + err.message, "error");
            })
            .finally(() => {
                resetBtn();
            });

        function resetBtn() {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.style.transform = 'translateY(-1px)';
        });
        input.addEventListener('blur', function () {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });

    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});
