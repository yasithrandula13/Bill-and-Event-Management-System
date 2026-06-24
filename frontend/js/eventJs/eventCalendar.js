document.addEventListener("DOMContentLoaded", async function() {
    const API_URL = "http://localhost:8080/api/events";
    const res = await fetch(API_URL);
    const events = await res.json();

    const calendarEl = document.getElementById("calendar");
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        events: events.map(ev => ({
            title: ev.title,
            start: ev.eventDateTime,
            url: `eventEdit.html?id=${ev.id}`
        }))
    });

    calendar.render();
});
