package com.datacenter.workingpermit.service.notification;

import com.datacenter.workingpermit.model.Notification;
import com.datacenter.workingpermit.model.User;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationSenderService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@datacenter.com}")
    private String fromEmail;

    @Value("${app.sms.enabled:false}")
    private boolean smsEnabled;

    /**
     * Send notification
     */
    @org.springframework.scheduling.annotation.Async
    @Transactional

    public void sendNotification(
            User recipient,
            WorkingPermit permit,
            Notification.NotificationType type,
            String subject,
            String message,
            Notification.DeliveryChannel channel) {
        sendNotification(recipient, permit, type, subject, message, channel, null);
    }

    /**
     * Send notification with attachment
     */
    @org.springframework.scheduling.annotation.Async
    @Transactional

    public void sendNotification(
            User recipient,
            WorkingPermit permit,
            Notification.NotificationType type,
            String subject,
            String message,
            Notification.DeliveryChannel channel,
            String attachmentPath) {

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
                    sendEmail(recipient.getEmail(), subject, message, attachmentPath);
                    break;
                case SMS:
                    sendSMS(recipient.getPhoneNumber(), message);
                    break;
                case ALL:
                    sendEmail(recipient.getEmail(), subject, message, attachmentPath);
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
    private void sendEmail(String to, String subject, String message, String attachmentPath) {
        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(message);

            if (attachmentPath != null && !attachmentPath.isEmpty()) {
                java.io.File file = new java.io.File(attachmentPath);
                if (file.exists()) {
                    helper.addAttachment(file.getName(), file);
                } else {
                    log.warn("Attachment file not found: {}", attachmentPath);
                }
            }

            mailSender.send(mimeMessage);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
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
            log.info("SMS sent to: {}", phoneNumber);
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage());
            throw e;
        }
    }
}
