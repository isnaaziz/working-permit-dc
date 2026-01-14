package com.datacenter.workingpermit.service.accesscontrol;

import com.datacenter.workingpermit.dto.CheckInRequest;
import com.datacenter.workingpermit.model.AccessLog;
import com.datacenter.workingpermit.model.TempIdCard;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.WorkingPermitRepository;
import com.datacenter.workingpermit.service.OTPService;
import com.datacenter.workingpermit.service.QRCodeService;
import com.datacenter.workingpermit.service.TempIdCardService;
import com.datacenter.workingpermit.service.permit.PermitActionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckInService {

    private final WorkingPermitRepository permitRepository;
    private final QRCodeService qrCodeService;
    private final OTPService otpService;
    private final PermitActionService permitActionService;
    private final TempIdCardService idCardService;
    private final AccessLogService accessLogService;

    /**
     * Check-in visitor with QR code and OTP
     */
    /**
     * Check-in visitor with QR code and OTP
     */
    @Transactional
    public TempIdCard checkIn(CheckInRequest request) {
        WorkingPermit permit;
        String inputData = request.getQrCodeData();

        // Check if input is Permit Number (starts with WP-) or QR Code (starts with
        // PERMIT-)
        if (inputData != null && inputData.startsWith("WP-")) {
            permit = permitRepository.findByPermitNumber(inputData)
                    .orElseThrow(() -> new RuntimeException("Permit not found: " + inputData));
        } else if (qrCodeService.isValidQRCodeData(inputData)) {
            permit = permitRepository.findByQrCodeData(inputData)
                    .orElseThrow(() -> new RuntimeException("Permit not found for this QR code"));
        } else {
            throw new RuntimeException("Invalid QR code or Permit Number format");
        }

        // Verify permit status
        if (permit.getStatus() != WorkingPermit.PermitStatus.APPROVED) {
            throw new RuntimeException("Permit is not approved. Status: " + permit.getStatus());
        }

        // Verify OTP
        if (!otpService.verifyOTP(permit, request.getOtpCode())) {
            // Log failed access
            accessLogService.logAccess(
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
        log.info("Calling activatePermit for permit ID: {}", permit.getId());
        permitActionService.activatePermit(permit.getId());

        // Log successful check-in
        accessLogService.logAccess(
                permit,
                AccessLog.AccessType.CHECK_IN,
                request.getLocation(),
                AccessLog.AccessStatus.SUCCESS,
                "Check-in successful. ID Card issued: " + idCard.getCardNumber());

        return idCard;
    }

    /**
     * Verify QR code and OTP (for initial verification before check-in)
     */
    public WorkingPermit verifyQRCodeAndOTP(String qrCodeData, String otpCode) {
        WorkingPermit permit;

        // Check if input is Permit Number (starts with WP-) or QR Code (starts with
        // PERMIT-)
        if (qrCodeData != null && qrCodeData.startsWith("WP-")) {
            permit = permitRepository.findByPermitNumber(qrCodeData)
                    .orElseThrow(() -> new RuntimeException("Permit not found: " + qrCodeData));
        } else if (qrCodeService.isValidQRCodeData(qrCodeData)) {
            permit = permitRepository.findByQrCodeData(qrCodeData)
                    .orElseThrow(() -> new RuntimeException("No permit found for this QR code"));
        } else {
            throw new RuntimeException("Invalid QR code or Permit Number format");
        }

        // Verify OTP
        if (!otpService.verifyOTP(permit, otpCode)) {
            throw new RuntimeException("Invalid or expired OTP code");
        }

        return permit;
    }
}
