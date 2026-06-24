package com.billevent.eventbillreminder.service;

import com.billevent.eventbillreminder.model.Feedback;
import com.billevent.eventbillreminder.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository repository;

    public FeedbackService(FeedbackRepository repository) {
        this.repository = repository;
    }

    public Feedback saveFeedback(Feedback feedback) {
        return repository.save(feedback);
    }

    public List<Feedback> getAllFeedback() {
        return repository.findAll();
    }

    public Feedback getFeedbackById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void deleteFeedback(Long id) {
        repository.deleteById(id);
    }
}
