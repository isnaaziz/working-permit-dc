package com.datacenter.workingpermit.service.notification;

import com.datacenter.workingpermit.model.Notification;
import com.datacenter.workingpermit.model.User;
import com.datacenter.workingpermit.model.WorkingPermit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationEventService {

    private final NotificationSenderService notificationSenderService;

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

        notificationSenderService.sendNotification(
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

        notificationSenderService.sendNotification(
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

        notificationSenderService.sendNotification(
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

        notificationSenderService.sendNotification(
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
        notificationSenderService.sendNotification(
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
        notificationSenderService.sendNotification(
                permit.getVisitor(),
                permit,
                Notification.NotificationType.CHECK_OUT_SUCCESS,
                subject,
                message,
                Notification.DeliveryChannel.EMAIL);

        notificationSenderService.sendNotification(
                permit.getPic(),
                permit,
                Notification.NotificationType.CHECK_OUT_SUCCESS,
                subject,
                message,
                Notification.DeliveryChannel.EMAIL);
    }
}
