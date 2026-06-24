const API_URL = "http://localhost:8080/api/events";
const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

// Load event data into form
async function loadEvent() {
    try {
        const res = await fetch(`${API_URL}/${eventId}`);
        if (!res.ok) throw new Error("Event not found");

        const event = await res.json();

        document.getElementById("eventName").value = event.title || "";
        document.getElementById("eventDate").value = event.eventDateTime ? event.eventDateTime.split("T")[0] : "";
        document.getElementById("eventTime").value = event.eventDateTime ? event.eventDateTime.split("T")[1].slice(0, 5) : "";
        document.getElementById("eventLocation").value = event.location || "";
        document.getElementById("eventDescription").value = event.description || "";
        document.getElementById("reminderDay").value = event.reminderDaysBefore || 0;
        document.getElementById("reminderTime").value = event.reminderTime || "";
        document.getElementById("reminderEmail").value = event.reminderEmail || "";
        document.getElementById("enableReminder").checked = event.reminderEnabled ?? true;
    } catch (error) {
        alert("Error loading event: " + error.message);
    }
}

// Update event
async function updateEvent(e) {
    e.preventDefault();

    const eventDate = document.getElementById("eventDate").value;
    const eventTime = document.getElementById("eventTime").value;

    if (!eventDate || !eventTime) {
        alert("Please fill in date and time!");
        return;
    }

    const reminderEnabled = document.getElementById("enableReminder").checked;

    const updatedEvent = {
        title: document.getElementById("eventName").value.trim(),
        eventDateTime: `${eventDate}T${eventTime}`,
        location: document.getElementById("eventLocation").value.trim(),
        description: document.getElementById("eventDescription").value.trim(),
        reminderDaysBefore: parseInt(document.getElementById("reminderDay").value) || 0,
        reminderTime: document.getElementById("reminderTime").value || "",
        reminderEnabled: reminderEnabled,
        reminderEmail: reminderEnabled ? document.getElementById("reminderEmail").value.trim() : ""
    };

    if (reminderEnabled && !updatedEvent.reminderEmail) {
        alert("Please provide a reminder email.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${eventId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedEvent)
        });

        if (!res.ok) throw new Error("Failed to update event");

        alert("✅ Event updated successfully!");
        window.location.href = "eventDashboard.html";
    } catch (error) {
        alert("Error updating event: " + error.message);
    }
}

document.getElementById("editEventForm").addEventListener("submit", updateEvent);
window.onload = loadEvent;
