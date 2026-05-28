package com.eventadda.controller;

import com.eventadda.model.Review;
import com.eventadda.model.User;
import com.eventadda.service.ReviewService;
import com.eventadda.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService userService;

    // Public API: Fetch reviews for a specific event
    @GetMapping("/events/{eventId}/reviews")
    public ResponseEntity<List<Review>> getReviewsForEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(reviewService.getReviewsForEvent(eventId));
    }

    // Participant API: Submit new event rating/review
    @PostMapping("/participant/reviews")
    public ResponseEntity<?> addReview(@Valid @RequestBody ReviewRequest reviewRequest, Principal principal) {
        try {
            User user = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User profile not found"));
            
            Review created = reviewService.addReview(
                    user, 
                    reviewRequest.getEventId(), 
                    reviewRequest.getRating(), 
                    reviewRequest.getComment()
            );
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    // Static Request DTO for reviews
    public static class ReviewRequest {
        @NotNull
        private Long eventId;

        @NotNull
        @Min(1)
        @Max(5)
        private Integer rating;

        private String comment;

        public ReviewRequest() {}

        public Long getEventId() { return eventId; }
        public void setEventId(Long eventId) { this.eventId = eventId; }

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }
}
