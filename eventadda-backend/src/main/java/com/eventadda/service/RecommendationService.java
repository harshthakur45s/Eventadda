package com.eventadda.service;

import com.eventadda.model.Event;
import com.eventadda.model.Registration;
import com.eventadda.repository.EventRepository;
import com.eventadda.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    public List<Event> getRecommendations(Long userId) {
        // Fetch all active/accepted registrations of this user
        List<Registration> userRegistrations = registrationRepository.findByUserId(userId);
        
        // Extract set of event IDs the user is already registered for
        Set<Long> registeredEventIds = userRegistrations.stream()
                .map(reg -> reg.getEvent().getId())
                .collect(Collectors.toSet());

        // Get category frequencies
        Map<String, Integer> categoryFrequency = new HashMap<>();
        for (Registration reg : userRegistrations) {
            String category = reg.getEvent().getCategory();
            if (category != null) {
                categoryFrequency.put(category, categoryFrequency.getOrDefault(category, 0) + 1);
            }
        }

        // Fetch all upcoming events
        List<Event> allEvents = eventRepository.findAll();
        List<Event> upcomingEvents = allEvents.stream()
                .filter(event -> event.getDate().isAfter(LocalDateTime.now()))
                .filter(event -> !registeredEventIds.contains(event.getId())) // Filter out already registered events
                .collect(Collectors.toList());

        // If user has no registration history, suggest top upcoming events (fallback)
        if (categoryFrequency.isEmpty()) {
            return upcomingEvents.stream()
                    .limit(6)
                    .collect(Collectors.toList());
        }

        // Score each upcoming event based on category match frequency
        // We will sort them: high score first. If scores are equal, sort by date.
        upcomingEvents.sort((e1, e2) -> {
            int score1 = categoryFrequency.getOrDefault(e1.getCategory(), 0);
            int score2 = categoryFrequency.getOrDefault(e2.getCategory(), 0);
            if (score1 != score2) {
                return Integer.compare(score2, score1); // Descending score
            }
            return e1.getDate().compareTo(e2.getDate()); // Ascending date (closest first)
        });

        // Return top 6 recommendations
        return upcomingEvents.stream()
                .limit(6)
                .collect(Collectors.toList());
    }
}
