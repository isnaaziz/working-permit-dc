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
}
