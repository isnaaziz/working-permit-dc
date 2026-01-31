package com.datacenter.workingpermit.controller;

import com.datacenter.workingpermit.dto.AccessLogResponse;
import com.datacenter.workingpermit.dto.CheckInRequest;
import com.datacenter.workingpermit.model.AccessLog;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.model.TempIdCard;
import com.datacenter.workingpermit.service.CameraSyncService;
import com.datacenter.workingpermit.service.accesscontrol.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Access Control Controller
 * Handles visitor check-in, check-out, and access verification
 */
@RestController
@RequestMapping("/api/access")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AccessControlController {

    private final CheckInService checkInService;
    private final CheckOutService checkOutService;
    private final DoorAccessService doorAccessService;
    private final AccessLogService accessLogService;
    private final CameraSyncService cameraSyncService;

    /**
     * Scan barcode/QR OTP and verify
     * POST /api/access/scan-otp
     */
    @PostMapping("/scan-otp")
    public ResponseEntity<Map<String, Object>> scanOTPBarcode(@RequestBody Map<String, String> request) {
        String scannedCode = request.get("scannedCode");

        if (scannedCode == null || scannedCode.trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Kode barcode tidak boleh kosong");
            return ResponseEntity.badRequest().body(response);
        }

        CameraSyncService.OTPScanResult result = cameraSyncService.scanOTPBarcode(scannedCode.trim());

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.isSuccess());
        response.put("message", result.getMessage());

        if (result.isSuccess()) {
            response.put("permitId", result.getPermitId());
            response.put("permitNumber", result.getPermitNumber());
            response.put("visitorName", result.getVisitorName());
            response.put("company", result.getCompany());
            response.put("dataCenter", result.getDataCenter());
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Perform check-in after OTP scan verification
     * POST /api/access/scan-checkin
     */
    @PostMapping("/scan-checkin")
    public ResponseEntity<Map<String, Object>> scanCheckIn(@RequestBody Map<String, Object> request) {
        Long permitId = Long.valueOf(request.get("permitId").toString());
        String notes = request.get("notes") != null ? request.get("notes").toString() : "";

        CameraSyncService.OTPScanResult result = cameraSyncService.performCheckIn(permitId, notes);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.isSuccess());
        response.put("message", result.getMessage());

        if (result.isSuccess()) {
            response.put("permitId", result.getPermitId());
            response.put("permitNumber", result.getPermitNumber());
            response.put("visitorName", result.getVisitorName());
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Perform check-out via scan
     * POST /api/access/scan-checkout
     */
    @PostMapping("/scan-checkout")
    public ResponseEntity<Map<String, Object>> scanCheckOut(@RequestBody Map<String, Object> request) {
        Long permitId = Long.valueOf(request.get("permitId").toString());
        String notes = request.get("notes") != null ? request.get("notes").toString() : "";

        CameraSyncService.OTPScanResult result = cameraSyncService.performCheckOut(permitId, notes);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.isSuccess());
        response.put("message", result.getMessage());

        if (result.isSuccess()) {
            response.put("permitNumber", result.getPermitNumber());
            response.put("visitorName", result.getVisitorName());
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Get scanner status
     * GET /api/access/scanner-status
     */
    @GetMapping("/scanner-status")
    public ResponseEntity<Map<String, Object>> getScannerStatus() {
        return ResponseEntity.ok(cameraSyncService.getCameraStatus());
    }

    /**
     * Verify access with QR Code and OTP
     * POST /api/access/verify
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyAccess(@Valid @RequestBody CheckInRequest request) {
        WorkingPermit permit = checkInService.verifyQRCodeAndOTP(
                request.getQrCodeData(),
                request.getOtpCode());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Access granted");
        response.put("permitNumber", permit.getPermitNumber());
        response.put("visitor", permit.getVisitor().getFullName());

        return ResponseEntity.ok(response);
    }

    /**
     * Check-in visitor at security gate
     * POST /api/access/check-in
     */
    @PostMapping("/check-in")
    public ResponseEntity<Map<String, Object>> checkIn(@Valid @RequestBody CheckInRequest request) {
        TempIdCard idCard = checkInService.checkIn(request);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Check-in successful");
        response.put("idCardNumber", idCard.getCardNumber());
        response.put("rfidTag", idCard.getRfidTag());
        response.put("expiresAt", idCard.getExpiresAt());
        response.put("permitNumber", idCard.getWorkingPermit().getPermitNumber());

        return ResponseEntity.ok(response);
    }

    /**
     * Check-out visitor at security gate
     * POST /api/access/check-out
     */
    @PostMapping("/check-out")
    public ResponseEntity<Map<String, Object>> checkOut(
            @RequestParam Long permitId,
            @RequestParam(required = false, defaultValue = "Main Gate") String location) {

        checkOutService.checkOut(permitId, location);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Check-out successful");

        return ResponseEntity.ok(response);
    }

    /**
     * Record door access with RFID
     * POST /api/access/door
     */
    @PostMapping("/door")
    public ResponseEntity<Map<String, Object>> recordDoorAccess(
            @RequestParam String rfidTag,
            @RequestParam String location,
            @RequestParam(defaultValue = "ENTRY") String accessType) {

        doorAccessService.recordDoorAccess(rfidTag, location, accessType);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Access logged successfully");

        return ResponseEntity.ok(response);
    }

    /**
     * Get access logs for a permit
     * GET /api/access/logs/permit/{permitId}
     */
    @GetMapping("/logs/permit/{permitId}")
    public ResponseEntity<List<AccessLogResponse>> getPermitAccessLogs(@PathVariable Long permitId) {
        List<AccessLog> logs = accessLogService.getAccessLogsByPermit(permitId);
        List<AccessLogResponse> response = logs.stream()
                .map(AccessLogResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(response);
    }

    /**
     * Get access logs by location
     * GET /api/access/logs/location/{location}
     */
    @GetMapping("/logs/location/{location}")
    public ResponseEntity<List<AccessLogResponse>> getLocationAccessLogs(@PathVariable String location) {
        List<AccessLog> logs = accessLogService.getAccessLogsByLocation(location);
        List<AccessLogResponse> response = logs.stream()
                .map(AccessLogResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(response);
    }

    /**
     * Get all access logs
     * GET /api/access/logs
     */
    @GetMapping("/logs")
    public ResponseEntity<List<AccessLogResponse>> getAllAccessLogs() {
        List<AccessLog> logs = accessLogService.getAllAccessLogs();
        List<AccessLogResponse> response = logs.stream()
                .map(AccessLogResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(response);
    }

    /**
     * Get today's check-in logs
     * GET /api/access/logs/today/checkins
     */
    @GetMapping("/logs/today/checkins")
    public ResponseEntity<List<AccessLogResponse>> getTodayCheckIns() {
        List<AccessLog> logs = accessLogService.getTodayCheckIns();
        List<AccessLogResponse> response = logs.stream()
                .map(AccessLogResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(response);
    }

    /**
     * Get today's check-out logs
     * GET /api/access/logs/today/checkouts
     */
    @GetMapping("/logs/today/checkouts")
    public ResponseEntity<List<AccessLogResponse>> getTodayCheckOuts() {
        List<AccessLog> logs = accessLogService.getTodayCheckOuts();
        List<AccessLogResponse> response = logs.stream()
                .map(AccessLogResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(response);
    }

    /**
     * Get access log statistics for today
     * GET /api/access/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAccessStats() {
        Map<String, Object> stats = accessLogService.getTodayStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get currently checked-in visitors (active in data center)
     * GET /api/access/checked-in
     */
    @GetMapping("/checked-in")
    public ResponseEntity<List<Map<String, Object>>> getCheckedInVisitors() {
        List<WorkingPermit> activePermits = accessLogService.getCheckedInVisitors();

        List<Map<String, Object>> checkedInList = activePermits.stream()
                .map(permit -> {
                    Map<String, Object> visitor = new HashMap<>();
                    visitor.put("permitId", permit.getId());
                    visitor.put("permitNumber", permit.getPermitNumber());
                    visitor.put("visitorName",
                            permit.getVisitor() != null ? permit.getVisitor().getFullName() : "Unknown");
                    visitor.put("visitorEmail", permit.getVisitor() != null ? permit.getVisitor().getEmail() : null);
                    visitor.put("company", permit.getVisitor() != null ? permit.getVisitor().getCompany() : null);
                    visitor.put("dataCenter", permit.getDataCenter() != null ? permit.getDataCenter().name() : null);
                    visitor.put("checkInTime", permit.getActualCheckInTime());
                    visitor.put("scheduledEndTime", permit.getScheduledEndTime());
                    visitor.put("purpose", permit.getVisitPurpose());
                    visitor.put("status", permit.getStatus().name());
                    return visitor;
                })
                .toList();

        return ResponseEntity.ok(checkedInList);
    }

    /**
     * Debug endpoint: Get all permits with OTP codes
     * GET /api/access/debug/otp-permits
     */
    @GetMapping("/debug/otp-permits")
    public ResponseEntity<Map<String, Object>> getOtpPermits() {
        try {
            List<WorkingPermit> permits = cameraSyncService.getAllPermitsWithOtp();

            List<Map<String, Object>> permitData = permits.stream()
                    .map(p -> {
                        Map<String, Object> data = new HashMap<>();
                        data.put("permitNumber", p.getPermitNumber());
                        data.put("otpCode", p.getOtpCode());
                        data.put("otpExpiry", p.getOtpExpiryTime());
                        data.put("status", p.getStatus());
                        data.put("visitorName", p.getVisitor() != null ? p.getVisitor().getFullName() : "N/A");
                        return data;
                    })
                    .toList();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", permitData.size());
            response.put("permits", permitData);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}
