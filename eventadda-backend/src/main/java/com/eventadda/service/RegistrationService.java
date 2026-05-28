package com.eventadda.service;

import com.eventadda.model.Event;
import com.eventadda.model.Registration;
import com.eventadda.model.User;
import com.eventadda.repository.EventRepository;
import com.eventadda.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
public class RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Registration requestToJoin(User user, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (registrationRepository.existsByUserIdAndEventId(user.getId(), eventId)) {
            Registration existing = registrationRepository.findByUserIdAndEventId(user.getId(), eventId).orElse(null);
            if (existing != null && existing.getStatus().equals("CANCELLED")) {
                existing.setStatus("PENDING");
                existing.setOtp(null);
                return registrationRepository.save(existing);
            }
            throw new RuntimeException("You have already requested to join or have joined this event.");
        }

        if (event.getAvailableSeats() <= 0) {
            throw new RuntimeException("No seats available for this event.");
        }

        Registration registration = new Registration(user, event);
        Registration saved = registrationRepository.save(registration);

        // Notify the organizer
        notificationService.createNotification(
                event.getOrganizer(), 
                user.getName() + " requested to join your event: " + event.getTitle()
        );

        return saved;
    }

    @Transactional
    public Registration approveRegistration(Long registrationId, Long organizerId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration request not found"));

        Event event = registration.getEvent();

        if (!event.getOrganizer().getId().equals(organizerId)) {
            throw new RuntimeException("Unauthorized: You do not organize this event.");
        }

        if (!registration.getStatus().equals("PENDING")) {
            throw new RuntimeException("This request has already been processed.");
        }

        if (event.getAvailableSeats() <= 0) {
            throw new RuntimeException("No seats left to approve this request.");
        }

        // Generate 6-digit random OTP
        String randomOtp = String.format("%06d", new Random().nextInt(1000000));
        
        registration.setStatus("ACCEPTED");
        registration.setOtp(randomOtp);
        
        // Decrement available seats
        event.setAvailableSeats(event.getAvailableSeats() - 1);
        eventRepository.save(event);

        Registration saved = registrationRepository.save(registration);

        // Notify participant
        notificationService.createNotification(
                registration.getUser(),
                "You successfully join event. Your OTP for join is " + randomOtp
        );

        // Broadcast new seat count via WebSockets
        try {
            messagingTemplate.convertAndSend("/topic/events/" + event.getId() + "/seats", event.getAvailableSeats());
        } catch (Exception e) {
            // Log WebSocket broker issues
        }

        return saved;
    }

    @Transactional
    public Registration rejectRegistration(Long registrationId, Long organizerId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration request not found"));

        Event event = registration.getEvent();

        if (!event.getOrganizer().getId().equals(organizerId)) {
            throw new RuntimeException("Unauthorized: You do not organize this event.");
        }

        if (!registration.getStatus().equals("PENDING")) {
            throw new RuntimeException("This request has already been processed.");
        }

        registration.setStatus("REJECTED");
        Registration saved = registrationRepository.save(registration);

        // Notify participant
        notificationService.createNotification(
                registration.getUser(),
                "Your request to join " + event.getTitle() + " has been rejected by the organizer."
        );

        return saved;
    }

    @Transactional
    public Registration cancelBooking(Long registrationId, Long userId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        if (!registration.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: This booking does not belong to you.");
        }

        String oldStatus = registration.getStatus();
        registration.setStatus("CANCELLED");
        
        // If it was already approved, increment available seats back
        if (oldStatus.equals("ACCEPTED")) {
            Event event = registration.getEvent();
            event.setAvailableSeats(event.getAvailableSeats() + 1);
            eventRepository.save(event);

            // Notify organizer of cancellation
            notificationService.createNotification(
                    event.getOrganizer(),
                    registration.getUser().getName() + " cancelled their registration for: " + event.getTitle()
            );

            // Broadcast new seat count
            try {
                messagingTemplate.convertAndSend("/topic/events/" + event.getId() + "/seats", event.getAvailableSeats());
            } catch (Exception e) {
                // Log WebSocket errors
            }
        }

        return registrationRepository.save(registration);
    }

    public List<Registration> getParticipantRegistrations(Long userId) {
        return registrationRepository.findByUserId(userId);
    }

    public List<Registration> getOrganizerPendingRequests(Long organizerId) {
        return registrationRepository.findByEventOrganizerId(organizerId);
    }
}
