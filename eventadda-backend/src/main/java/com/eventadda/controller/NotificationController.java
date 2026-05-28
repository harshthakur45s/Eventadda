package com.eventadda.controller;

import com.eventadda.model.Notification;
import com.eventadda.model.User;
import com.eventadda.service.NotificationService;
import com.eventadda.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getUserNotifications(Principal principal) {
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User profile not found"));
        List<Notification> notifications = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Principal principal) {
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User profile not found"));
        notificationService.markAllAsRead(user.getId());
        Map<String, String> resp = new HashMap<>();
        resp.put("message", "All notifications marked as read");
        return ResponseEntity.ok(resp);
    }
}
