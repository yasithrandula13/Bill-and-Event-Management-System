package com.billevent.eventbillreminder.repository;

import com.billevent.eventbillreminder.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
}
