package com.datacenter.workingpermit.controller;

import com.datacenter.workingpermit.model.Notification;
import com.datacenter.workingpermit.service.notification.NotificationRetrievalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Notification Controller
 * Handles notification retrieval and management
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationRetrievalService notificationRetrievalService;

    /**
     * Get notifications for a user
     * GET /api/notifications/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationRetrievalService.getNotificationsByUser(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notifications for a user
     * GET /api/notifications/user/{userId}/unread
     */
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationRetrievalService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Mark notification as read
     * POST /api/notifications/{id}/read
     */
    @PostMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id) {
        notificationRetrievalService.markAsRead(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notification marked as read");

        return ResponseEntity.ok(response);
    }

    /**
     * Mark all notifications as read for a user
     * POST /api/notifications/user/{userId}/read-all
     */
    @PostMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(@PathVariable Long userId) {
        List<Notification> notifications = notificationRetrievalService.getUnreadNotifications(userId);
        notifications.forEach(n -> notificationRetrievalService.markAsRead(n.getId()));

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "All notifications marked as read");

        return ResponseEntity.ok(response);
    }

    /**
     * Get notification by ID
     * GET /api/notifications/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotification(@PathVariable Long id) {
        Notification notification = notificationRetrievalService.getNotificationById(id);
        return ResponseEntity.ok(notification);
    }
}
