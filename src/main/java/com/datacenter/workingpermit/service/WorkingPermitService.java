package com.datacenter.workingpermit.service;

import com.datacenter.workingpermit.dto.WorkingPermitRequest;
import com.datacenter.workingpermit.model.Approval;
import com.datacenter.workingpermit.model.User;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.ApprovalRepository;
import com.datacenter.workingpermit.repository.UserRepository;
import com.datacenter.workingpermit.repository.WorkingPermitRepository;
import com.google.zxing.WriterException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkingPermitService {

    private final WorkingPermitRepository permitRepository;
    private final UserRepository userRepository;
    private final ApprovalRepository approvalRepository;
    private final QRCodeService qrCodeService;
    private final OTPService otpService;
    private final NotificationService notificationService;

    /**
     * Create new working permit request
     */
    @Transactional
    public WorkingPermit createPermit(Long visitorId, WorkingPermitRequest request) {
        // Get visitor
        User visitor = userRepository.findById(visitorId)
                .orElseThrow(() -> new RuntimeException("Visitor not found"));

        // Get PIC
        User pic = userRepository.findById(request.getPicId())
                .orElseThrow(() -> new RuntimeException("PIC not found"));

        // Generate permit number
        String permitNumber = generatePermitNumber();

        // Create permit
        WorkingPermit permit = WorkingPermit.builder()
                .permitNumber(permitNumber)
                .visitor(visitor)
                .pic(pic)
                .visitPurpose(request.getVisitPurpose())
                .visitType(WorkingPermit.VisitType.valueOf(request.getVisitType()))
                .dataCenter(WorkingPermit.DataCenter.valueOf(request.getDataCenter()))
                .scheduledStartTime(request.getScheduledStartTime())
                .scheduledEndTime(request.getScheduledEndTime())
                .equipmentList(request.getEquipmentList())
                .workOrderDocument(request.getWorkOrderDocument())
                .status(WorkingPermit.PermitStatus.PENDING_PIC)
                .build();

        permit = permitRepository.save(permit);

        // Create PIC review approval
        Approval picApproval = Approval.builder()
                .workingPermit(permit)
                .approver(pic)
                .level(Approval.ApprovalLevel.PIC_REVIEW)
                .status(Approval.ApprovalStatus.PENDING)
                .build();
        approvalRepository.save(picApproval);

        // Send notification to PIC
        notificationService.notifyPermitSubmitted(permit);

        return permit;
    }

    /**
     * Generate unique permit number
     */
    private String generatePermitNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "WP-" + timestamp;
    }

    /**
     * Get permit by ID
     */
    public Optional<WorkingPermit> getPermitById(Long id) {
        return permitRepository.findById(id);
    }

    /**
     * Get permit by permit number
     */
    public Optional<WorkingPermit> getPermitByNumber(String permitNumber) {
        return permitRepository.findByPermitNumber(permitNumber);
    }

    /**
     * Get permit by QR code data
     */
    public Optional<WorkingPermit> getPermitByQRCode(String qrCodeData) {
        return permitRepository.findByQrCodeData(qrCodeData);
    }

    /**
     * Get all permits for a visitor
     */
    public List<WorkingPermit> getPermitsByVisitor(User visitor) {
        return permitRepository.findByVisitor(visitor);
    }

    /**
     * Get all permits for a PIC
     */
    public List<WorkingPermit> getPermitsByPIC(User pic) {
        return permitRepository.findByPic(pic);
    }

    /**
     * Get permits by status
     */
    public List<WorkingPermit> getPermitsByStatus(WorkingPermit.PermitStatus status) {
        return permitRepository.findByStatus(status);
    }

    /**
     * Get pending permits for PIC
     */
    public List<WorkingPermit> getPendingPermitsForPIC(User pic) {
        return permitRepository.findByPicAndStatus(pic, WorkingPermit.PermitStatus.PENDING_PIC);
    }

    /**
     * Get pending permits for Manager approval
     */
    public List<WorkingPermit> getPendingPermitsForManager() {
        return permitRepository.findByStatus(WorkingPermit.PermitStatus.PENDING_MANAGER);
    }

    /**
     * Approve permit and generate QR code + OTP
     */
    @Transactional
    public void approvePermit(Long permitId) throws WriterException, IOException {
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        // Generate QR Code
        String qrCodeData = qrCodeService.generateQRCodeData(permitId);
        permit.setQrCodeData(qrCodeData);

        // Save QR Code image
        String qrCodeImagePath = qrCodeService.saveQRCodeToFile(
                qrCodeData,
                "permit-" + permitId);
        permit.setQrCodeImagePath(qrCodeImagePath);

        // Generate OTP
        String otp = otpService.generateAndStoreOTP(permitId);
        permit.setOtpCode(otp);
        permit.setOtpExpiryTime(otpService.getOTPExpiryTime(permitId));

        // Update status
        permit.setStatus(WorkingPermit.PermitStatus.APPROVED);

        permitRepository.save(permit);

        // Send notification to visitor with QR code and OTP
        notificationService.notifyPermitApproved(permit, qrCodeData, otp);
    }

    /**
     * Reject permit
     */
    @Transactional
    public void rejectPermit(Long permitId, String reason) {
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
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        permit.setStatus(WorkingPermit.PermitStatus.ACTIVE);
        permit.setActualCheckInTime(LocalDateTime.now());
        permitRepository.save(permit);

        // Notify PIC
        notificationService.notifyCheckInSuccess(permit);
    }

    /**
     * Complete permit (after check-out)
     */
    @Transactional
    public void completePermit(Long permitId) {
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        permit.setStatus(WorkingPermit.PermitStatus.COMPLETED);
        permit.setActualCheckOutTime(LocalDateTime.now());
        permitRepository.save(permit);

        // Notify visitor and PIC
        notificationService.notifyCheckOutSuccess(permit);
    }

    /**
     * Get all permits
     */
    public List<WorkingPermit> getAllPermits() {
        return permitRepository.findAll();
    }

    /**
     * Update permit
     */
    @Transactional
    public WorkingPermit updatePermit(Long permitId, WorkingPermitRequest request) {
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        // Only allow updates for DRAFT or PENDING status
        if (permit.getStatus() != WorkingPermit.PermitStatus.DRAFT &&
                permit.getStatus() != WorkingPermit.PermitStatus.PENDING_PIC) {
            throw new RuntimeException("Cannot update permit in current status");
        }

        permit.setVisitPurpose(request.getVisitPurpose());
        permit.setVisitType(WorkingPermit.VisitType.valueOf(request.getVisitType()));
        permit.setDataCenter(WorkingPermit.DataCenter.valueOf(request.getDataCenter()));
        permit.setScheduledStartTime(request.getScheduledStartTime());
        permit.setScheduledEndTime(request.getScheduledEndTime());
        permit.setEquipmentList(request.getEquipmentList());

        return permitRepository.save(permit);
    }

    /**
     * Regenerate OTP for permit
     */
    @Transactional
    public String regenerateOTP(Long permitId) {
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
     * Get permits by visitor ID
     */
    public List<WorkingPermit> getPermitsByVisitorId(Long visitorId) {
        User visitor = userRepository.findById(visitorId)
                .orElseThrow(() -> new RuntimeException("Visitor not found"));
        return permitRepository.findByVisitor(visitor);
    }

    /**
     * Get permits by PIC ID
     */
    public List<WorkingPermit> getPermitsByPICId(Long picId) {
        User pic = userRepository.findById(picId)
                .orElseThrow(() -> new RuntimeException("PIC not found"));
        return permitRepository.findByPic(pic);
    }
}
