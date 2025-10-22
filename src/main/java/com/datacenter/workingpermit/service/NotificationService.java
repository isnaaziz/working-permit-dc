package com.datacenter.workingpermit.service;

import com.datacenter.workingpermit.model.Notification;
import com.datacenter.workingpermit.model.User;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@datacenter.com}")
    private String fromEmail;

    @Value("${app.sms.enabled:false}")
    private boolean smsEnabled;

    /**
     * Send notification
     */
    @Transactional
    public void sendNotification(
            User recipient,
            WorkingPermit permit,
            Notification.NotificationType type,
            String subject,
            String message,
            Notification.DeliveryChannel channel) {
        // Create notification record
        Notification notification = Notification.builder()
                .recipient(recipient)
                .workingPermit(permit)
                .type(type)
                .subject(subject)
                .message(message)
                .channel(channel)
                .status(Notification.DeliveryStatus.PENDING)
                .build();

        notificationRepository.save(notification);

        // Send via appropriate channel
        try {
            switch (channel) {
                case EMAIL:
                    sendEmail(recipient.getEmail(), subject, message);
                    break;
                case SMS:
                    sendSMS(recipient.getPhoneNumber(), message);
                    break;
                case ALL:
                    sendEmail(recipient.getEmail(), subject, message);
                    sendSMS(recipient.getPhoneNumber(), message);
                    break;
                case IN_APP:
                    // In-app notification already saved in database
                    break;
            }

            notification.setStatus(Notification.DeliveryStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.save(notification);

        } catch (Exception e) {
            log.error("Failed to send notification: {}", e.getMessage());
            notification.setStatus(Notification.DeliveryStatus.FAILED);
            notificationRepository.save(notification);
        }
    }

    /**
     * Send email
     */
    private void sendEmail(String to, String subject, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);

            mailSender.send(mailMessage);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw e;
        }
    }

    /**
     * Send SMS (placeholder - integrate with Twilio or other SMS provider)
     */
    private void sendSMS(String phoneNumber, String message) {
        if (!smsEnabled) {
            log.info("SMS disabled. Would send to {}: {}", phoneNumber, message);
            return;
        }

        try {
            // TODO: Integrate with Twilio or other SMS provider
            // Example Twilio integration:
            // Message smsMessage = Message.creator(
            // new PhoneNumber(phoneNumber),
            // new PhoneNumber(twilioFromNumber),
            // message
            // ).create();

            log.info("SMS sent to: {}", phoneNumber);
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage());
            throw e;
        }
    }

    /**
     * Send permit submitted notification
     */
    public void notifyPermitSubmitted(WorkingPermit permit) {
        String subject = "New Working Permit Request";
        String message = String.format(
                "A new working permit request has been submitted by %s.\n" +
                        "Permit Number: %s\n" +
                        "Visit Purpose: %s\n" +
                        "Scheduled: %s\n" +
                        "Please review the request.",
                permit.getVisitor().getFullName(),
                permit.getPermitNumber(),
                permit.getVisitPurpose(),
                permit.getScheduledStartTime());

        sendNotification(
                permit.getPic(),
                permit,
                Notification.NotificationType.PERMIT_SUBMITTED,
                subject,
                message,
                Notification.DeliveryChannel.ALL);
    }

    /**
     * Send permit approved notification
     */
    public void notifyPermitApproved(WorkingPermit permit, String qrCode, String otp) {
        String subject = "Working Permit Approved";
        String message = String.format(
                "Your working permit has been approved!\n\n" +
                        "Permit Number: %s\n" +
                        "Data Center: %s\n" +
                        "Scheduled: %s to %s\n\n" +
                        "Your OTP Code: %s\n" +
                        "Valid for 5 minutes\n\n" +
                        "Please bring your QR code and OTP when you arrive at the data center.",
                permit.getPermitNumber(),
                permit.getDataCenter().getDisplayName(),
                permit.getScheduledStartTime(),
                permit.getScheduledEndTime(),
                otp);

        sendNotification(
                permit.getVisitor(),
                permit,
                Notification.NotificationType.PERMIT_APPROVED,
                subject,
                message,
                Notification.DeliveryChannel.ALL);
    }

    /**
     * Send permit rejected notification
     */
    public void notifyPermitRejected(WorkingPermit permit, String reason) {
        String subject = "Working Permit Rejected";
        String message = String.format(
                "Your working permit request has been rejected.\n\n" +
                        "Permit Number: %s\n" +
                        "Reason: %s\n\n" +
                        "Please contact your PIC for more information.",
                permit.getPermitNumber(),
                reason);

        sendNotification(
                permit.getVisitor(),
                permit,
                Notification.NotificationType.PERMIT_REJECTED,
                subject,
                message,
                Notification.DeliveryChannel.ALL);
    }

    /**
     * Send approval required notification
     */
    public void notifyApprovalRequired(WorkingPermit permit, User approver) {
        String subject = "Working Permit Approval Required";
        String message = String.format(
                "A working permit requires your approval.\n\n" +
                        "Permit Number: %s\n" +
                        "Visitor: %s\n" +
                        "Company: %s\n" +
                        "Visit Purpose: %s\n" +
                        "Scheduled: %s\n\n" +
                        "Please review and approve/reject the request.",
                permit.getPermitNumber(),
                permit.getVisitor().getFullName(),
                permit.getVisitor().getCompany(),
                permit.getVisitPurpose(),
                permit.getScheduledStartTime());

        sendNotification(
                approver,
                permit,
                Notification.NotificationType.APPROVAL_REQUIRED,
                subject,
                message,
                Notification.DeliveryChannel.ALL);
    }

    /**
     * Send check-in success notification
     */
    public void notifyCheckInSuccess(WorkingPermit permit) {
        String subject = "Visitor Checked In";
        String message = String.format(
                "Visitor has successfully checked in.\n\n" +
                        "Visitor: %s\n" +
                        "Permit Number: %s\n" +
                        "Check-in Time: %s",
                permit.getVisitor().getFullName(),
                permit.getPermitNumber(),
                LocalDateTime.now());

        // Notify PIC
        sendNotification(
                permit.getPic(),
                permit,
                Notification.NotificationType.CHECK_IN_SUCCESS,
                subject,
                message,
                Notification.DeliveryChannel.EMAIL);
    }

    /**
     * Send check-out success notification
     */
    public void notifyCheckOutSuccess(WorkingPermit permit) {
        String subject = "Visit Completed";
        String message = String.format(
                "Visit has been completed.\n\n" +
                        "Visitor: %s\n" +
                        "Permit Number: %s\n" +
                        "Check-in: %s\n" +
                        "Check-out: %s",
                permit.getVisitor().getFullName(),
                permit.getPermitNumber(),
                permit.getActualCheckInTime(),
                permit.getActualCheckOutTime());

        // Notify visitor and PIC
        sendNotification(
                permit.getVisitor(),
                permit,
                Notification.NotificationType.CHECK_OUT_SUCCESS,
                subject,
                message,
                Notification.DeliveryChannel.EMAIL);

        sendNotification(
                permit.getPic(),
                permit,
                Notification.NotificationType.CHECK_OUT_SUCCESS,
                subject,
                message,
                Notification.DeliveryChannel.EMAIL);
    }

    /**
     * Get unread notifications for user
     */
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByRecipientIdAndIsReadOrderByCreatedAtDesc(userId, false);
    }

    /**
     * Get all notifications for user
     */
    public List<Notification> getAllNotifications(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(Long notificationId) {
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
        return notificationRepository.countByRecipientIdAndIsRead(userId, false);
    }

    /**
     * Get notifications by user ID
     */
    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get notification by ID
     */
    public Notification getNotificationById(Long notificationId) {
        return notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
    }
}
