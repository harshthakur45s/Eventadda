package com.eventadda.service;

import com.eventadda.model.Event;
import com.eventadda.model.User;
import com.eventadda.model.Registration;
import com.eventadda.model.Wishlist;
import com.eventadda.model.Review;
import com.eventadda.repository.EventRepository;
import com.eventadda.repository.RegistrationRepository;
import com.eventadda.repository.WishlistRepository;
import com.eventadda.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private NotificationService notificationService;

    private void updateEventStatus(Event event) {
        LocalDateTime now = LocalDateTime.now();
        if (event.getDate().isBefore(now)) {
            // Check if it's within a reasonable window, e.g. 4 hours
            if (event.getDate().plusHours(4).isAfter(now)) {
                event.setStatus("ONGOING");
            } else {
                event.setStatus("COMPLETED");
            }
        } else {
            event.setStatus("UPCOMING");
        }
    }

    private void updateEventStatuses(List<Event> events) {
        for (Event event : events) {
            updateEventStatus(event);
        }
        eventRepository.saveAll(events);
    }

    public List<Event> getAllEvents(String search, String category) {
        List<Event> events;
        if (search != null && !search.isEmpty()) {
            events = eventRepository.findByTitleContainingIgnoreCaseOrVenueContainingIgnoreCaseOrCategoryContainingIgnoreCase(search, search, search);
        } else if (category != null && !category.isEmpty()) {
            events = eventRepository.findByCategory(category);
        } else {
            events = eventRepository.findAll();
        }
        updateEventStatuses(events);
        return events;
    }

    public Optional<Event> getEventById(Long id) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        eventOpt.ifPresent(event -> {
            updateEventStatus(event);
            eventRepository.save(event);
        });
        return eventOpt;
    }

    public List<Event> getOrganizerEvents(Long organizerId) {
        List<Event> events = eventRepository.findByOrganizerId(organizerId);
        updateEventStatuses(events);
        return events;
    }

    @Transactional
    public Event createEvent(Event event, User organizer) {
        event.setOrganizer(organizer);
        event.setAvailableSeats(event.getMaxSeats());
        event.setStatus("UPCOMING");
        return eventRepository.save(event);
    }

    @Transactional
    public Event updateEvent(Long eventId, Event updatedEvent, Long organizerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizer().getId().equals(organizerId)) {
            throw new RuntimeException("Unauthorized: You do not own this event.");
        }

        event.setTitle(updatedEvent.getTitle());
        event.setDescription(updatedEvent.getDescription());
        event.setVenue(updatedEvent.getVenue());
        event.setDate(updatedEvent.getDate());
        event.setCategory(updatedEvent.getCategory());
        
        if (updatedEvent.getMaxSeats() != null) {
            int difference = updatedEvent.getMaxSeats() - event.getMaxSeats();
            event.setMaxSeats(updatedEvent.getMaxSeats());
            event.setAvailableSeats(event.getAvailableSeats() + difference);
        }

        if (updatedEvent.getBannerImage() != null) {
            event.setBannerImage(updatedEvent.getBannerImage());
        }

        updateEventStatus(event);
        return eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long eventId, Long organizerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizer().getId().equals(organizerId)) {
            throw new RuntimeException("Unauthorized: You do not own this event.");
        }

        // 1. Get all registrations for this event
        List<Registration> registrations = registrationRepository.findByEventId(eventId);
        
        // 2. Notify all registered participants that the event has been cancelled
        for (Registration reg : registrations) {
            notificationService.createNotification(
                reg.getUser(),
                "The event '" + event.getTitle() + "' has been cancelled by the organizer."
            );
        }

        // 3. Delete all related records in child tables to prevent foreign key constraint violations
        registrationRepository.deleteAll(registrations);

        List<Wishlist> wishlists = wishlistRepository.findByEventId(eventId);
        wishlistRepository.deleteAll(wishlists);

        List<Review> reviews = reviewRepository.findByEventId(eventId);
        reviewRepository.deleteAll(reviews);

        // 4. Finally delete the parent event record
        eventRepository.delete(event);
    }
}
