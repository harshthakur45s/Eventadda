package com.eventadda.service;

import com.eventadda.model.Event;
import com.eventadda.model.Review;
import com.eventadda.model.User;
import com.eventadda.repository.EventRepository;
import com.eventadda.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private EventRepository eventRepository;

    @Transactional
    public Review addReview(User user, Long eventId, Integer rating, String comment) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (reviewRepository.existsByUserIdAndEventId(user.getId(), eventId)) {
            throw new RuntimeException("You have already reviewed this event.");
        }

        Review review = new Review();
        review.setUser(user);
        review.setEvent(event);
        review.setRating(rating);
        review.setComment(comment);

        return reviewRepository.save(review);
    }

    public List<Review> getReviewsForEvent(Long eventId) {
        return reviewRepository.findByEventId(eventId);
    }
}
