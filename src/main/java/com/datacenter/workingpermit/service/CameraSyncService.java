package com.datacenter.workingpermit.service;

import com.datacenter.workingpermit.model.AccessLog;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.AccessLogRepository;
import com.datacenter.workingpermit.repository.WorkingPermitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Camera Sync Service
 * Handles barcode/QR code OTP scanning for security check-in/check-out
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CameraSyncService {

    private final AccessLogRepository accessLogRepository;
    private final WorkingPermitRepository workingPermitRepository;

    @Value("${app.camera.enabled:true}")
    private boolean cameraEnabled;

    @Value("${app.camera.api-url:http://localhost:9000/api/camera}")
    private String cameraApiUrl;

    /**
     * Scan and verify OTP barcode/QR code for check-in
     */
    public OTPScanResult scanOTPBarcode(String scannedCode) {
        if (!cameraEnabled) {
            log.info("Camera/Scanner disabled. Manual verification required.");
            return OTPScanResult.failure("Scanner tidak aktif. Gunakan verifikasi manual.");
        }

        try {
            log.info("=== OTP SCAN DEBUG START ===");
            log.info("Raw scanned code: '{}' (length: {}, bytes: {})", scannedCode, scannedCode.length(),
                    java.util.Arrays.toString(scannedCode.getBytes()));

            // Parse the scanned code - format: PERMIT-{permitNumber}-OTP-{otpCode}
            // or just the OTP code directly
            String otpCode = extractOTPFromScan(scannedCode);

            log.info("Extracted OTP code: '{}' (length: {}, bytes: {})", otpCode,
                    otpCode != null ? otpCode.length() : 0,
                    otpCode != null ? java.util.Arrays.toString(otpCode.getBytes()) : "null");

            if (otpCode == null || otpCode.isEmpty()) {
                log.error("OTP extraction failed - code is null or empty");
                return OTPScanResult.failure("Format input tidak valid. Gunakan kode OTP 6 digit, bukan QR Code.");
            }

            log.info("Looking for permit with OTP code: '{}' (length: {})", otpCode, otpCode.length());

            // Try exact match first
            Optional<WorkingPermit> permitOpt = workingPermitRepository.findByOtpCode(otpCode);

            log.info("Exact match result: {}", permitOpt.isPresent() ? "FOUND" : "NOT FOUND");

            // If not found, try case-insensitive search for H2 database compatibility
            if (permitOpt.isEmpty()) {
                log.warn("Exact OTP match not found, trying case-insensitive search for: {}", otpCode);
                permitOpt = workingPermitRepository.findByOtpCodeIgnoreCase(otpCode);
                log.info("Case-insensitive match result: {}", permitOpt.isPresent() ? "FOUND" : "NOT FOUND");
            }

            // Debug: Log all permits with OTP codes in database
            if (permitOpt.isEmpty()) {
                List<WorkingPermit> allWithOtp = workingPermitRepository.findAllWithOtpCode();
                log.warn("No permit found for OTP: '{}'. Total permits with OTP in DB: {}", otpCode, allWithOtp.size());
                if (!allWithOtp.isEmpty() && allWithOtp.size() <= 10) {
                    allWithOtp.forEach(p -> {
                        log.info("DB OTP: '{}' (length: {}, bytes: {}) for permit: {}",
                                p.getOtpCode(),
                                p.getOtpCode() != null ? p.getOtpCode().length() : 0,
                                p.getOtpCode() != null ? java.util.Arrays.toString(p.getOtpCode().getBytes()) : "null",
                                p.getPermitNumber());
                        log.info("Comparison: scanned='{}' vs db='{}', equals={}",
                                otpCode, p.getOtpCode(), otpCode.equals(p.getOtpCode()));
                    });
                }
                log.info("=== OTP SCAN DEBUG END (FAILED) ===");
                return OTPScanResult
                        .failure("Kode OTP tidak ditemukan. Pastikan permit sudah disetujui dan OTP masih valid.");
            }

            WorkingPermit permit = permitOpt.get();
            log.info("=== OTP SCAN DEBUG END (SUCCESS) - Permit: {} ===", permit.getPermitNumber());

            // Validate OTP expiry
            if (permit.getOtpExpiryTime() != null && permit.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
                log.warn("OTP expired for permit: {}", permit.getPermitNumber());
                return OTPScanResult.failure("Kode OTP sudah kadaluarsa");
            }

            // Check permit status
            if (permit.getStatus() != WorkingPermit.PermitStatus.APPROVED) {
                return OTPScanResult.failure("Permit belum disetujui. Status: " + permit.getStatus());
            }

            log.info("OTP barcode verified successfully for permit: {}", permit.getPermitNumber());

            return OTPScanResult.success(
                    "Verifikasi berhasil",
                    permit.getId(),
                    permit.getPermitNumber(),
                    permit.getVisitor().getFullName(),
                    permit.getVisitor().getCompany(),
                    permit.getDataCenter().name());

        } catch (Exception e) {
            log.error("OTP barcode scan failed: {}", e.getMessage());
            return OTPScanResult.failure("Gagal memproses barcode: " + e.getMessage());
        }
    }

    /**
     * Perform check-in after OTP verification
     */
    public OTPScanResult performCheckIn(Long permitId, String securityNotes) {
        try {
            Optional<WorkingPermit> permitOpt = workingPermitRepository.findById(permitId);

            if (permitOpt.isEmpty()) {
                return OTPScanResult.failure("Permit tidak ditemukan");
            }

            WorkingPermit permit = permitOpt.get();

            log.info("=== CHECK-IN START ===");
            log.info("Permit ID: {}, Number: {}, Current Status: {}",
                    permit.getId(), permit.getPermitNumber(), permit.getStatus());

            // Update permit status
            permit.setStatus(WorkingPermit.PermitStatus.ACTIVE);
            permit.setActualCheckInTime(LocalDateTime.now());
            WorkingPermit savedPermit = workingPermitRepository.save(permit);

            log.info("✅ Permit updated - New Status: {}, CheckIn Time: {}",
                    savedPermit.getStatus(), savedPermit.getActualCheckInTime());

            // Log the access
            logCameraEvent(savedPermit, "CHECK_IN", "GATE_CAMERA_01");

            log.info("Check-in successful for permit: {} - Visitor: {}",
                    savedPermit.getPermitNumber(), savedPermit.getVisitor().getFullName());
            log.info("=== CHECK-IN END ===");

            return OTPScanResult.success(
                    "Check-in berhasil",
                    savedPermit.getId(),
                    savedPermit.getPermitNumber(),
                    savedPermit.getVisitor().getFullName(),
                    savedPermit.getVisitor().getCompany(),
                    savedPermit.getDataCenter().name());

        } catch (Exception e) {
            log.error("Check-in failed: {}", e.getMessage());
            return OTPScanResult.failure("Gagal melakukan check-in: " + e.getMessage());
        }
    }

    /**
     * Perform check-out
     */
    public OTPScanResult performCheckOut(Long permitId, String securityNotes) {
        try {
            Optional<WorkingPermit> permitOpt = workingPermitRepository.findById(permitId);

            if (permitOpt.isEmpty()) {
                return OTPScanResult.failure("Permit tidak ditemukan");
            }

            WorkingPermit permit = permitOpt.get();

            // Update permit status
            permit.setStatus(WorkingPermit.PermitStatus.COMPLETED);
            permit.setActualCheckOutTime(LocalDateTime.now());
            workingPermitRepository.save(permit);

            // Log the access
            logCameraEvent(permit, "CHECK_OUT", "GATE_CAMERA_01");

            log.info("Check-out successful for permit: {} - Visitor: {}",
                    permit.getPermitNumber(), permit.getVisitor().getFullName());

            return OTPScanResult.success(
                    "Check-out berhasil",
                    permit.getId(),
                    permit.getPermitNumber(),
                    permit.getVisitor().getFullName(),
                    permit.getVisitor().getCompany(),
                    permit.getDataCenter().name());

        } catch (Exception e) {
            log.error("Check-out failed: {}", e.getMessage());
            return OTPScanResult.failure("Gagal melakukan check-out: " + e.getMessage());
        }
    }

    /**
     * Extract OTP code from scanned barcode
     * Supports formats:
     * - Direct OTP: "123456"
     * - Permit format: "PERMIT-WP-2024-001-OTP-123456"
     * - QR format: "otp:123456"
     * 
     * IMPORTANT: QR Code (PERMIT-XX-UUID) is NOT an OTP code!
     */
    private String extractOTPFromScan(String scannedCode) {
        if (scannedCode == null || scannedCode.isEmpty()) {
            return null;
        }

        // Clean and trim the input - remove all whitespaces
        scannedCode = scannedCode.trim().replaceAll("\\s+", "");

        log.debug("Extracting OTP from: '{}'", scannedCode);

        // Check if this is a QR Code format - NOT an OTP!
        // QR Code formats:
        // - QR-{visitType}-{timestamp} (e.g., QR-AUDIT-1769700507200)
        // - PERMIT-XX-UUID (e.g., PERMIT-12-a1b2c3d4-...)
        if (scannedCode.matches("QR-[A-Z_]+-\\d+") ||
                scannedCode.matches("PERMIT-\\d+-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}")) {
            log.warn("Detected QR Code format ({}), not OTP code. Use QR code scan endpoint instead.", scannedCode);
            return null; // QR code is NOT OTP
        }

        // Format: otp:123456
        if (scannedCode.toLowerCase().startsWith("otp:")) {
            String extracted = scannedCode.substring(4).trim();
            log.debug("Extracted from 'otp:' format: '{}'", extracted);
            return extracted;
        }

        // Format: PERMIT-xxx-OTP-123456 (explicit OTP in the string)
        if (scannedCode.toUpperCase().contains("-OTP-")) {
            int otpIndex = scannedCode.toUpperCase().indexOf("-OTP-");
            String extracted = scannedCode.substring(otpIndex + 5).trim();
            log.debug("Extracted from 'PERMIT-xxx-OTP-' format: '{}'", extracted);
            return extracted;
        }

        // Assume direct OTP code (6 digits ONLY)
        if (scannedCode.matches("^\\d{6}$")) {
            log.debug("Direct 6-digit OTP: '{}'", scannedCode);
            return scannedCode;
        }

        // If input is all digits but not 6 digits
        if (scannedCode.matches("^\\d+$")) {
            log.warn("Input is numeric but not 6 digits: '{}' (length: {})", scannedCode, scannedCode.length());
            return null;
        }

        log.warn("Could not extract valid OTP from: '{}'", scannedCode);
        return null; // Return null if no valid OTP pattern found
    }

    /**
     * Register scanner event for access log
     */
    public void logCameraEvent(WorkingPermit permit, String eventType, String scannerId) {
        String remarks = eventType.equals("CHECK_IN")
                ? "Check-in via OTP scan at " + scannerId
                : eventType.equals("CHECK_OUT")
                        ? "Check-out via scan at " + scannerId
                        : "Access event at " + scannerId;

        AccessLog accessLog = AccessLog.builder()
                .workingPermit(permit)
                .user(permit.getVisitor())
                .accessType(AccessLog.AccessType.valueOf(eventType))
                .status(AccessLog.AccessStatus.SUCCESS)
                .location(scannerId)
                .timestamp(LocalDateTime.now())
                .remarks(remarks)
                .build();

        AccessLog savedLog = accessLogRepository.save(accessLog);
        log.info("📝 Access log saved: ID={}, Type={}, Permit={}, User={}",
                savedLog.getId(), eventType, permit.getPermitNumber(), permit.getVisitor().getFullName());
    }

    /**
     * Get scanner/camera status
     */
    public Map<String, Object> getCameraStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("enabled", cameraEnabled);
        status.put("apiUrl", cameraApiUrl);
        status.put("status", cameraEnabled ? "ONLINE" : "DISABLED");
        status.put("scannerType", "BARCODE_QR");
        return status;
    }

    /**
     * Sync visitor OTP with scanner system
     */
    public boolean syncVisitorOTPWithScanner(WorkingPermit permit) {
        if (!cameraEnabled) {
            log.info("Scanner sync disabled. Skipping sync for permit: {}", permit.getPermitNumber());
            return true;
        }

        try {
            // In production, this would register the OTP with the barcode scanner system
            Map<String, Object> syncData = new HashMap<>();
            syncData.put("permitId", permit.getId());
            syncData.put("permitNumber", permit.getPermitNumber());
            syncData.put("otpCode", permit.getOtpCode());
            syncData.put("visitorName", permit.getVisitor().getFullName());
            syncData.put("validFrom", permit.getScheduledStartTime());
            syncData.put("validTo", permit.getScheduledEndTime());
            syncData.put("dataCenter", permit.getDataCenter().name());

            log.info("Syncing OTP with scanner system for permit: {}", permit.getPermitNumber());

            return true;
        } catch (Exception e) {
            log.error("Failed to sync OTP with scanner system: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Remove visitor OTP access after checkout
     */
    public boolean removeVisitorFromScannerSystem(WorkingPermit permit) {
        if (!cameraEnabled) {
            return true;
        }

        try {
            log.info("Removing OTP access from scanner system for permit: {}", permit.getPermitNumber());
            return true;
        } catch (Exception e) {
            log.error("Failed to remove OTP from scanner system: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get all permits with OTP codes (for debugging)
     */
    public List<WorkingPermit> getAllPermitsWithOtp() {
        return workingPermitRepository.findAllWithOtpCode();
    }

    // Inner classes

    public static class OTPScanResult {
        private final boolean success;
        private final String message;
        private final Long permitId;
        private final String permitNumber;
        private final String visitorName;
        private final String company;
        private final String dataCenter;

        private OTPScanResult(boolean success, String message, Long permitId,
                String permitNumber, String visitorName,
                String company, String dataCenter) {
            this.success = success;
            this.message = message;
            this.permitId = permitId;
            this.permitNumber = permitNumber;
            this.visitorName = visitorName;
            this.company = company;
            this.dataCenter = dataCenter;
        }

        public static OTPScanResult success(String message, Long permitId, String permitNumber,
                String visitorName, String company, String dataCenter) {
            return new OTPScanResult(true, message, permitId, permitNumber, visitorName, company, dataCenter);
        }

        public static OTPScanResult failure(String message) {
            return new OTPScanResult(false, message, null, null, null, null, null);
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }

        public Long getPermitId() {
            return permitId;
        }

        public String getPermitNumber() {
            return permitNumber;
        }

        public String getVisitorName() {
            return visitorName;
        }

        public String getCompany() {
            return company;
        }

        public String getDataCenter() {
            return dataCenter;
        }
    }
}
