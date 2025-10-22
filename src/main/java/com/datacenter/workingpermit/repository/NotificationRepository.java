package com.datacenter.workingpermit.repository;

import com.datacenter.workingpermit.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    List<Notification> findByRecipientIdAndIsReadOrderByCreatedAtDesc(
            Long recipientId,
            Boolean isRead);

    List<Notification> findByStatus(Notification.DeliveryStatus status);

    List<Notification> findByTypeAndStatus(
            Notification.NotificationType type,
            Notification.DeliveryStatus status);

    long countByRecipientIdAndIsRead(Long recipientId, Boolean isRead);
}
