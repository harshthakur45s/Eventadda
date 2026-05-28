package com.eventadda.service;

import com.eventadda.model.Event;
import com.eventadda.model.User;
import com.eventadda.model.Wishlist;
import com.eventadda.repository.EventRepository;
import com.eventadda.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private EventRepository eventRepository;

    @Transactional
    public boolean toggleWishlist(User user, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Optional<Wishlist> wishlistOpt = wishlistRepository.findByUserIdAndEventId(user.getId(), eventId);
        
        if (wishlistOpt.isPresent()) {
            wishlistRepository.delete(wishlistOpt.get());
            return false; // Removed
        } else {
            Wishlist wishlist = new Wishlist(user, event);
            wishlistRepository.save(wishlist);
            return true; // Added
        }
    }

    public List<Event> getUserWishlistEvents(Long userId) {
        List<Wishlist> wishlist = wishlistRepository.findByUserId(userId);
        return wishlist.stream().map(Wishlist::getEvent).collect(Collectors.toList());
    }

    public boolean isWishlisted(Long userId, Long eventId) {
        return wishlistRepository.existsByUserIdAndEventId(userId, eventId);
    }
}
