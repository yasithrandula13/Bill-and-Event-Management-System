package com.billevent.eventbillreminder.service;

import com.billevent.eventbillreminder.model.Event;
import com.billevent.eventbillreminder.repository.EventRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EventService {

    private final EventRepository repository;

    public EventService(EventRepository repository) {
        this.repository = repository;
    }

    public Event saveEvent(Event event) {
        return repository.save(event);
    }

    public List<Event> getAllEvents() {
        return repository.findAll();
    }

    public Event getEvent(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void deleteEvent(Long id) {
        repository.deleteById(id);
    }
}
