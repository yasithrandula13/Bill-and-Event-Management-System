package com.billevent.eventbillreminder.controller;

import com.billevent.eventbillreminder.model.Event;
import com.billevent.eventbillreminder.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService service;

    public EventController(EventService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(service.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEvent(@PathVariable Long id) {
        Event event = service.getEvent(id);
        if (event == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(event);
    }

    @PostMapping
    public ResponseEntity<?> addEvent(@RequestBody Event event) {
        try {
            System.out.println("📥 Received Event: " + event.getTitle() + " at " + event.getEventDateTime());
            Event saved = service.saveEvent(event);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace(); // ✅ log the exact issue
            return ResponseEntity.internalServerError().body("Error saving event: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody Event updatedEvent) {
        Event existing = service.getEvent(id);
        if (existing == null) return ResponseEntity.notFound().build();

        existing.setTitle(updatedEvent.getTitle());
        existing.setDescription(updatedEvent.getDescription());
        existing.setLocation(updatedEvent.getLocation());
        existing.setEventDateTime(updatedEvent.getEventDateTime());
        existing.setReminderDaysBefore(updatedEvent.getReminderDaysBefore());
        existing.setReminderTime(updatedEvent.getReminderTime());
        existing.setReminderEnabled(updatedEvent.isReminderEnabled());
        existing.setReminderEmail(updatedEvent.getReminderEmail());

        try {
            Event saved = service.saveEvent(existing);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error updating event: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        service.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
