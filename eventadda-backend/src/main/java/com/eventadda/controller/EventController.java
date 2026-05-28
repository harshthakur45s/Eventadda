package com.eventadda.controller;

import com.eventadda.model.Event;
import com.eventadda.model.User;
import com.eventadda.service.EventService;
import com.eventadda.service.UserService;
import jakarta.validation.Valid;
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
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private UserService userService;

    // Public API: Browse & Search
    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAllEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(eventService.getAllEvents(search, category));
    }

    // Public API: View Single Event Detail
    @GetMapping("/events/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Organizer API: Create Event
    @PostMapping("/organizer/events")
    public ResponseEntity<?> createEvent(@Valid @RequestBody Event event, Principal principal) {
        try {
            User organizer = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Organizer profile not found"));
            Event created = eventService.createEvent(event, organizer);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    // Organizer API: List own events
    @GetMapping("/organizer/events")
    public ResponseEntity<?> getOrganizerEvents(Principal principal) {
        User organizer = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        return ResponseEntity.ok(eventService.getOrganizerEvents(organizer.getId()));
    }

    // Organizer API: Update Event
    @PutMapping("/organizer/events/{id}")
    public ResponseEntity<?> updateEvent(
            @PathVariable Long id, 
            @Valid @RequestBody Event updatedEvent, 
            Principal principal) {
        try {
            User organizer = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Organizer not found"));
            Event result = eventService.updateEvent(id, updatedEvent, organizer.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    // Organizer API: Delete Event
    @DeleteMapping("/organizer/events/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id, Principal principal) {
        try {
            User organizer = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Organizer not found"));
            eventService.deleteEvent(id, organizer.getId());
            Map<String, String> msg = new HashMap<>();
            msg.put("message", "Event deleted successfully");
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }
}
