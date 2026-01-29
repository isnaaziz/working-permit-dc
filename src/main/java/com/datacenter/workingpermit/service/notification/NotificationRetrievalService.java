package com.datacenter.workingpermit.service.notification;

import com.datacenter.workingpermit.model.Notification;
import com.datacenter.workingpermit.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationRetrievalService {

    private final NotificationRepository notificationRepository;

    /**
     * Get unread notifications for user
     */
    public List<Notification> getUnreadNotifications(Long userId) {
        if (userId == null)
            throw new IllegalArgumentException("User ID cannot be null");
        return notificationRepository.findByRecipientIdAndIsReadOrderByCreatedAtDesc(userId, false);
    }

    /**
     * Get all notifications for user
     */
    public List<Notification> getAllNotifications(Long userId) {
        if (userId == null)
            throw new IllegalArgumentException("User ID cannot be null");
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        if (notificationId == null)
            throw new IllegalArgumentException("Notification ID cannot be null");
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        });
    }

    /**
     * Get unread count
     */
    public long getUnreadCount(Long userId) {
        if (userId == null)
            throw new IllegalArgumentException("User ID cannot be null");
        return notificationRepository.countByRecipientIdAndIsRead(userId, false);
    }

    /**
     * Get notifications by user ID
     */
    public List<Notification> getNotificationsByUser(Long userId) {
        return getAllNotifications(userId);
    }

    /**
     * Get notification by ID
     */
    public Notification getNotificationById(Long notificationId) {
        if (notificationId == null)
            throw new IllegalArgumentException("Notification ID cannot be null");
        return notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
    }
}
