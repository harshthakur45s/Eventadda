package com.eventadda.service;

import com.eventadda.model.Notification;
import com.eventadda.model.User;
import com.eventadda.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Notification createNotification(User user, String message) {
        Notification notification = new Notification(user, message);
        Notification saved = notificationRepository.save(notification);
        
        // Push in real-time over WebSocket topic specific to the user
        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), saved);
        } catch (Exception e) {
            // Log WebSocket error but do not disrupt main transaction
        }
        
        return saved;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }
}
