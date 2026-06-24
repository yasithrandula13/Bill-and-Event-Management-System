package com.billevent.eventbillreminder.controller;

import com.billevent.eventbillreminder.model.Feedback;
import com.billevent.eventbillreminder.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    private final FeedbackService service;

    public FeedbackController(FeedbackService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        return ResponseEntity.ok(service.getAllFeedback());
    }

    @PostMapping
    public ResponseEntity<Feedback> addFeedback(@RequestBody Feedback feedback) {
        return ResponseEntity.ok(service.saveFeedback(feedback));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedback(@PathVariable Long id) {
        Feedback feedback = service.getFeedbackById(id);
        return feedback != null ? ResponseEntity.ok(feedback) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        service.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Feedback> updateFeedback(@PathVariable Long id, @RequestBody Feedback updatedFeedback) {
        Feedback existing = service.getFeedbackById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        existing.setUsername(updatedFeedback.getUsername());
        existing.setCategory(updatedFeedback.getCategory());
        existing.setMessage(updatedFeedback.getMessage());
        existing.setRating(updatedFeedback.getRating());
        existing.setCreatedAt(updatedFeedback.getCreatedAt());

        Feedback saved = service.saveFeedback(existing);
        return ResponseEntity.ok(saved);
    }

}
