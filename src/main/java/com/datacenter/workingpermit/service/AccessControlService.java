package com.datacenter.workingpermit.service;

import com.datacenter.workingpermit.dto.CheckInRequest;
import com.datacenter.workingpermit.model.AccessLog;
import com.datacenter.workingpermit.model.TempIdCard;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.AccessLogRepository;
import com.datacenter.workingpermit.repository.TempIdCardRepository;
import com.datacenter.workingpermit.repository.WorkingPermitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccessControlService {

    private final WorkingPermitRepository permitRepository;
    private final AccessLogRepository accessLogRepository;
    private final TempIdCardRepository idCardRepository;
    private final QRCodeService qrCodeService;
    private final OTPService otpService;
    private final WorkingPermitService workingPermitService;
    private final TempIdCardService idCardService;

    /**
     * Check-in visitor with QR code and OTP
     */
    @Transactional
    public TempIdCard checkIn(CheckInRequest request) {
        // Validate QR code
        if (!qrCodeService.isValidQRCodeData(request.getQrCodeData())) {
            throw new RuntimeException("Invalid QR code");
        }

        // Find permit by QR code
        WorkingPermit permit = permitRepository.findByQrCodeData(request.getQrCodeData())
                .orElseThrow(() -> new RuntimeException("Permit not found for this QR code"));

        // Verify permit status
        if (permit.getStatus() != WorkingPermit.PermitStatus.APPROVED) {
            throw new RuntimeException("Permit is not approved. Status: " + permit.getStatus());
        }

        // Verify OTP
        if (!otpService.verifyOTP(permit.getId(), request.getOtpCode())) {
            // Log failed access
            logAccess(
                    permit,
                    AccessLog.AccessType.DENIED,
                    request.getLocation(),
                    AccessLog.AccessStatus.FAILED,
                    "Invalid OTP code");
            throw new RuntimeException("Invalid or expired OTP code");
        }

        // Check if already checked in
        if (permit.getActualCheckInTime() != null) {
            throw new RuntimeException("Already checked in");
        }

        // Check schedule
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(permit.getScheduledStartTime().minusHours(1))) {
            throw new RuntimeException("Too early for check-in");
        }

        // Issue temporary ID card
        TempIdCard idCard = idCardService.issueIdCard(permit);

        // Update permit status to ACTIVE
        workingPermitService.activatePermit(permit.getId());

        // Log successful check-in
        logAccess(
                permit,
                AccessLog.AccessType.CHECK_IN,
                request.getLocation(),
                AccessLog.AccessStatus.SUCCESS,
                "Check-in successful. ID Card issued: " + idCard.getCardNumber());

        return idCard;
    }

    /**
     * Check-out visitor
     */
    @Transactional
    public void checkOut(Long permitId, String location) {
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        // Verify status
        if (permit.getStatus() != WorkingPermit.PermitStatus.ACTIVE) {
            throw new RuntimeException("Permit is not active");
        }

        // Deactivate ID card
        TempIdCard idCard = idCardRepository.findByWorkingPermit(permit)
                .orElseThrow(() -> new RuntimeException("ID card not found"));
        idCardService.deactivateIdCard(idCard.getId(), "Visit completed");

        // Complete permit
        workingPermitService.completePermit(permitId);

        // Log check-out
        logAccess(
                permit,
                AccessLog.AccessType.CHECK_OUT,
                location,
                AccessLog.AccessStatus.SUCCESS,
                "Check-out successful");
    }

    /**
     * Verify RFID access for door entry/exit
     */
    @Transactional
    public boolean verifyRFIDAccess(String rfidTag, String location) {
        // Find active ID card by RFID
        TempIdCard idCard = idCardRepository.findByRfidTagAndIsActive(rfidTag, true)
                .orElse(null);

        if (idCard == null) {
            log.warn("Access denied - Invalid or inactive RFID: {}", rfidTag);
            return false;
        }

        WorkingPermit permit = idCard.getWorkingPermit();

        // Check if permit is active
        if (permit.getStatus() != WorkingPermit.PermitStatus.ACTIVE) {
            log.warn("Access denied - Permit not active: {}", permit.getPermitNumber());
            logAccess(
                    permit,
                    AccessLog.AccessType.DENIED,
                    location,
                    AccessLog.AccessStatus.UNAUTHORIZED,
                    "Permit not active");
            return false;
        }

        // Check if ID card is expired
        if (LocalDateTime.now().isAfter(idCard.getExpiresAt())) {
            log.warn("Access denied - ID card expired: {}", idCard.getCardNumber());
            logAccess(
                    permit,
                    AccessLog.AccessType.DENIED,
                    location,
                    AccessLog.AccessStatus.UNAUTHORIZED,
                    "ID card expired");
            return false;
        }

        // Grant access
        logAccess(
                permit,
                AccessLog.AccessType.ENTRY,
                location,
                AccessLog.AccessStatus.SUCCESS,
                "Access granted via RFID: " + rfidTag);

        return true;
    }

    /**
     * Log access attempt
     */
    private void logAccess(
            WorkingPermit permit,
            AccessLog.AccessType accessType,
            String location,
            AccessLog.AccessStatus status,
            String remarks) {
        AccessLog log = AccessLog.builder()
                .workingPermit(permit)
                .user(permit.getVisitor())
                .accessType(accessType)
                .location(location)
                .status(status)
                .remarks(remarks)
                .build();

        accessLogRepository.save(log);
    }

    /**
     * Get access logs for a permit
     */
    public List<AccessLog> getAccessLogs(Long permitId) {
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));
        return accessLogRepository.findByWorkingPermitOrderByTimestampDesc(permit);
    }

    /**
     * Get all access logs for a date range
     */
    public List<AccessLog> getAccessLogsByDateRange(LocalDateTime startTime, LocalDateTime endTime) {
        return accessLogRepository.findByTimestampBetween(startTime, endTime);
    }

    /**
     * Get access logs by type and status
     */
    public List<AccessLog> getAccessLogsByTypeAndStatus(
            AccessLog.AccessType type,
            AccessLog.AccessStatus status) {
        return accessLogRepository.findByAccessTypeAndStatus(type, status);
    }

    /**
     * Get all access logs
     */
    public List<AccessLog> getAllAccessLogs() {
        return accessLogRepository.findAll();
    }

    /**
     * Verify QR code and OTP (for initial verification before check-in)
     */
    public WorkingPermit verifyQRCodeAndOTP(String qrCodeData, String otpCode) {
        // Validate QR code format
        if (!qrCodeService.isValidQRCodeData(qrCodeData)) {
            throw new RuntimeException("Invalid QR code format");
        }

        // Find permit by QR code
        WorkingPermit permit = permitRepository.findByQrCodeData(qrCodeData)
                .orElseThrow(() -> new RuntimeException("No permit found for this QR code"));

        // Verify OTP
        if (!otpService.verifyOTP(permit.getId(), otpCode)) {
            throw new RuntimeException("Invalid or expired OTP code");
        }

        return permit;
    }

    /**
     * Record door access
     */
    @Transactional
    public void recordDoorAccess(String rfidTag, String location, String accessType) {
        // Find ID card by RFID
        TempIdCard idCard = idCardRepository.findByRfidTagAndIsActive(rfidTag, true)
                .orElseThrow(() -> new RuntimeException("Invalid or inactive RFID tag"));

        WorkingPermit permit = idCard.getWorkingPermit();

        AccessLog.AccessType type = "ENTRY".equals(accessType)
                ? AccessLog.AccessType.ENTRY
                : AccessLog.AccessType.EXIT;

        logAccess(
                permit,
                type,
                location,
                AccessLog.AccessStatus.SUCCESS,
                "Door access via RFID: " + rfidTag);
    }

    /**
     * Get access logs by permit ID
     */
    public List<AccessLog> getAccessLogsByPermit(Long permitId) {
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));
        return accessLogRepository.findByWorkingPermitOrderByTimestampDesc(permit);
    }

    /**
     * Get access logs by location
     */
    public List<AccessLog> getAccessLogsByLocation(String location) {
        return accessLogRepository.findAll().stream()
                .filter(log -> location.equals(log.getLocation()))
                .toList();
    }
}
