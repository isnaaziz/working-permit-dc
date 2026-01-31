package com.datacenter.workingpermit.service.permit;

import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.WorkingPermitRepository;
import com.datacenter.workingpermit.service.notification.NotificationEventService;
import com.datacenter.workingpermit.service.CameraSyncService;
import com.datacenter.workingpermit.service.EmailService;
import com.datacenter.workingpermit.service.OTPService;
import com.datacenter.workingpermit.service.QRCodeService;
import com.google.zxing.WriterException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermitActionService {

    private final WorkingPermitRepository permitRepository;
    private final QRCodeService qrCodeService;
    private final OTPService otpService;
    private final NotificationEventService notificationService;
    private final EmailService emailService;
    private final CameraSyncService cameraSyncService;

    @org.springframework.beans.factory.annotation.Value("${app.upload.path:uploads/permits}")
    private String uploadPath;

    /**
     * Approve permit and generate QR code + OTP
     */
    @Transactional
    public void approvePermit(Long permitId) throws WriterException, IOException {
        if (permitId == null)
            throw new IllegalArgumentException("Permit ID cannot be null");
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        // Generate OTP first
        String otp = otpService.generateAndStoreOTP(permitId);
        permit.setOtpCode(otp);
        permit.setOtpExpiryTime(otpService.getOTPExpiryTime(permitId));

        // Generate QR Code with OTP included for gate scanning
        String qrCodeData = qrCodeService.generateQRCodeDataWithOTP(permit.getPermitNumber(), otp);
        permit.setQrCodeData(qrCodeData);

        // Save QR Code image
        String qrCodeImagePath = qrCodeService.saveQRCodeToFile(
                qrCodeData,
                "permit-" + permitId);
        permit.setQrCodeImagePath(qrCodeImagePath);

        // Update status
        permit.setStatus(WorkingPermit.PermitStatus.APPROVED);

        permitRepository.save(permit);

        // Send notification to visitor with QR code and OTP
        notificationService.notifyPermitApproved(permit, qrCodeData, otp);

        // Send dedicated OTP email
        emailService.sendOTPEmail(permit.getVisitor(), otp, permit);

        // Sync OTP with scanner system
        cameraSyncService.syncVisitorOTPWithScanner(permit);

        log.info("Permit {} approved with OTP sent to {}", permitId, permit.getVisitor().getEmail());
    }

    /**
     * Reject permit
     */
    @Transactional
    public void rejectPermit(Long permitId, String reason) {
        if (permitId == null)
            throw new IllegalArgumentException("Permit ID cannot be null");
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        permit.setStatus(WorkingPermit.PermitStatus.REJECTED);
        permit.setRejectionReason(reason);

        permitRepository.save(permit);

        // Send notification
        notificationService.notifyPermitRejected(permit, reason);
    }

    /**
     * Cancel permit
     */
    @Transactional
    public void cancelPermit(Long permitId, String reason) {
        if (permitId == null)
            throw new IllegalArgumentException("Permit ID cannot be null");
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        permit.setStatus(WorkingPermit.PermitStatus.CANCELLED);
        if (reason != null && !reason.isBlank()) {
            permit.setRejectionReason(reason);
        }
        permitRepository.save(permit);
    }

    /**
     * Update permit to ACTIVE status (after check-in)
     */
    @Transactional
    public void activatePermit(Long permitId) {
        log.info("Activating permit with ID: {}", permitId);
        if (permitId == null)
            throw new IllegalArgumentException("Permit ID cannot be null");
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        permit.setStatus(WorkingPermit.PermitStatus.ACTIVE);
        permit.setActualCheckInTime(LocalDateTime.now());
        permitRepository.save(permit);
        log.info("Permit {} status updated to ACTIVE", permitId);

        // Notify PIC
        notificationService.notifyCheckInSuccess(permit);
    }

    /**
     * Complete permit (after check-out)
     */
    @Transactional
    public void completePermit(Long permitId) {
        if (permitId == null)
            throw new IllegalArgumentException("Permit ID cannot be null");
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        permit.setStatus(WorkingPermit.PermitStatus.COMPLETED);
        permit.setActualCheckOutTime(LocalDateTime.now());
        permitRepository.save(permit);

        // Notify visitor and PIC
        notificationService.notifyCheckOutSuccess(permit);

        // Remove from scanner system
        cameraSyncService.removeVisitorFromScannerSystem(permit);
    }

    /**
     * Regenerate OTP for permit
     */
    @Transactional
    public String regenerateOTP(Long permitId) {
        if (permitId == null)
            throw new IllegalArgumentException("Permit ID cannot be null");
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        if (permit.getStatus() != WorkingPermit.PermitStatus.APPROVED) {
            throw new RuntimeException("Can only regenerate OTP for approved permits");
        }

        String newOtp = otpService.generateAndStoreOTP(permitId);
        permit.setOtpCode(newOtp);
        permit.setOtpExpiryTime(otpService.getOTPExpiryTime(permitId));

        permitRepository.save(permit);

        return newOtp;
    }

    /**
     * Regenerate OTP and send via email
     */
    @Transactional
    public String regenerateAndSendOTP(Long permitId) {
        String newOtp = regenerateOTP(permitId);
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        // Send new OTP via email
        emailService.sendOTPEmail(permit.getVisitor(), newOtp, permit);
        log.info("OTP regenerated and sent to {}", permit.getVisitor().getEmail());

        return newOtp;
    }

    /**
     * Upload supporting document
     */
    @Transactional
    public String uploadDocument(Long permitId, org.springframework.web.multipart.MultipartFile file)
            throws IOException {
        if (permitId == null)
            throw new IllegalArgumentException("Permit ID cannot be null");

        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        // Ensure directory exists
        java.nio.file.Path uploadDir = java.nio.file.Paths.get(uploadPath);
        if (!java.nio.file.Files.exists(uploadDir)) {
            java.nio.file.Files.createDirectories(uploadDir);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".pdf";
        String filename = "permit-" + permit.getPermitNumber() + "-" + java.util.UUID.randomUUID() + extension;

        java.nio.file.Path filePath = uploadDir.resolve(filename);
        java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

        permit.setWorkOrderDocument(filePath.toString());
        permitRepository.save(permit);

        return filePath.toString();
    }
}
