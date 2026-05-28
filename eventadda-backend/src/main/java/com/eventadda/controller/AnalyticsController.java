package com.eventadda.controller;

import com.eventadda.model.Event;
import com.eventadda.model.Registration;
import com.eventadda.model.User;
import com.eventadda.repository.RegistrationRepository;
import com.eventadda.service.EventService;
import com.eventadda.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/organizer/analytics")
public class AnalyticsController {

    @Autowired
    private EventService eventService;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getOrganizerAnalytics(Principal principal) {
        User organizer = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Organizer profile not found"));

        List<Event> events = eventService.getOrganizerEvents(organizer.getId());
        List<Registration> registrations = registrationRepository.findByEventOrganizerId(organizer.getId());

        int totalEvents = events.size();
        long totalRegistrations = registrations.size();
        long acceptedCount = registrations.stream().filter(r -> r.getStatus().equals("ACCEPTED")).count();
        long pendingCount = registrations.stream().filter(r -> r.getStatus().equals("PENDING")).count();
        long rejectedCount = registrations.stream().filter(r -> r.getStatus().equals("REJECTED")).count();

        int totalCapacity = events.stream().mapToInt(Event::getMaxSeats).sum();
        double occupancyRate = totalCapacity > 0 ? ((double) acceptedCount / totalCapacity) * 100.0 : 0.0;

        List<Map<String, Object>> eventBreakdown = new ArrayList<>();
        for (Event event : events) {
            Map<String, Object> details = new HashMap<>();
            details.put("eventId", event.getId());
            details.put("title", event.getTitle());
            details.put("category", event.getCategory());
            details.put("maxSeats", event.getMaxSeats());
            details.put("availableSeats", event.getAvailableSeats());
            
            long eventAccepted = registrations.stream()
                    .filter(r -> r.getEvent().getId().equals(event.getId()) && r.getStatus().equals("ACCEPTED"))
                    .count();
            details.put("joinedCount", eventAccepted);
            eventBreakdown.add(details);
        }

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalEvents", totalEvents);
        analytics.put("totalRegistrations", totalRegistrations);
        analytics.put("acceptedCount", acceptedCount);
        analytics.put("pendingCount", pendingCount);
        analytics.put("rejectedCount", rejectedCount);
        analytics.put("occupancyRate", Math.round(occupancyRate * 100.0) / 100.0);
        analytics.put("eventsList", eventBreakdown);

        return ResponseEntity.ok(analytics);
    }
}
