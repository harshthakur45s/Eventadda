package com.eventadda.controller;

import com.eventadda.model.Event;
import com.eventadda.model.User;
import com.eventadda.service.RecommendationService;
import com.eventadda.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/participant/recommendations")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getRecommendations(Principal principal) {
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User profile not found"));
        List<Event> recommendations = recommendationService.getRecommendations(user.getId());
        return ResponseEntity.ok(recommendations);
    }
}
