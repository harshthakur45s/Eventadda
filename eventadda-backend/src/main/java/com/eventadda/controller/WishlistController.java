package com.eventadda.controller;

import com.eventadda.model.Event;
import com.eventadda.model.User;
import com.eventadda.service.UserService;
import com.eventadda.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/participant/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private UserService userService;

    @PostMapping("/{eventId}")
    public ResponseEntity<?> toggleWishlist(@PathVariable Long eventId, Principal principal) {
        try {
            User user = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User profile not found"));
            boolean added = wishlistService.toggleWishlist(user, eventId);
            Map<String, Object> resp = new HashMap<>();
            resp.put("wishlisted", added);
            resp.put("message", added ? "Event added to wishlist" : "Event removed from wishlist");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping
    public ResponseEntity<?> getWishlist(Principal principal) {
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User profile not found"));
        List<Event> events = wishlistService.getUserWishlistEvents(user.getId());
        return ResponseEntity.ok(events);
    }

    @GetMapping("/check/{eventId}")
    public ResponseEntity<?> checkWishlist(@PathVariable Long eventId, Principal principal) {
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User profile not found"));
        boolean wishlisted = wishlistService.isWishlisted(user.getId(), eventId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("wishlisted", wishlisted);
        return ResponseEntity.ok(resp);
    }
}
