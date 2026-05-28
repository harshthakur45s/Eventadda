package com.eventadda.controller;

import com.eventadda.model.Registration;
import com.eventadda.model.User;
import com.eventadda.service.RegistrationService;
import com.eventadda.service.UserService;
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
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private UserService userService;

    // Participant API: Send a join request
    @PostMapping("/participant/registrations/join/{eventId}")
    public ResponseEntity<?> joinEvent(@PathVariable Long eventId, Principal principal) {
        try {
            User user = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User profile not found"));
            Registration registration = registrationService.requestToJoin(user, eventId);
            return new ResponseEntity<>(registration, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    // Participant API: View list of joined/requested events
    @GetMapping("/participant/registrations")
    public ResponseEntity<?> getParticipantRegistrations(Principal principal) {
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User profile not found"));
        List<Registration> registrations = registrationService.getParticipantRegistrations(user.getId());
        return ResponseEntity.ok(registrations);
    }

    // Participant API: Cancel a request/booking
    @DeleteMapping("/participant/registrations/{registrationId}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long registrationId, Principal principal) {
        try {
            User user = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User profile not found"));
            Registration registration = registrationService.cancelBooking(registrationId, user.getId());
            return ResponseEntity.ok(registration);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    // Organizer API: View all requests for own events
    @GetMapping("/organizer/registrations/requests")
    public ResponseEntity<?> getOrganizerPendingRequests(Principal principal) {
        User organizer = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Organizer profile not found"));
        List<Registration> pendingRequests = registrationService.getOrganizerPendingRequests(organizer.getId());
        return ResponseEntity.ok(pendingRequests);
    }

    // Organizer API: Accept and generate OTP
    @PostMapping("/organizer/registrations/{registrationId}/accept")
    public ResponseEntity<?> acceptRegistration(@PathVariable Long registrationId, Principal principal) {
        try {
            User organizer = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Organizer profile not found"));
            Registration approved = registrationService.approveRegistration(registrationId, organizer.getId());
            return ResponseEntity.ok(approved);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    // Organizer API: Reject
    @PostMapping("/organizer/registrations/{registrationId}/reject")
    public ResponseEntity<?> rejectRegistration(@PathVariable Long registrationId, Principal principal) {
        try {
            User organizer = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Organizer profile not found"));
            Registration rejected = registrationService.rejectRegistration(registrationId, organizer.getId());
            return ResponseEntity.ok(rejected);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }
}
