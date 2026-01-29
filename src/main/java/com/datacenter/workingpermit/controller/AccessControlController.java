package com.datacenter.workingpermit.controller;

import com.datacenter.workingpermit.dto.CheckInRequest;
import com.datacenter.workingpermit.model.AccessLog;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.model.TempIdCard;
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
    public ResponseEntity<List<AccessLog>> getPermitAccessLogs(@PathVariable Long permitId) {
        List<AccessLog> logs = accessLogService.getAccessLogsByPermit(permitId);
        return ResponseEntity.ok(logs);
    }

    /**
     * Get access logs by location
     * GET /api/access/logs/location/{location}
     */
    @GetMapping("/logs/location/{location}")
    public ResponseEntity<List<AccessLog>> getLocationAccessLogs(@PathVariable String location) {
        List<AccessLog> logs = accessLogService.getAccessLogsByLocation(location);
        return ResponseEntity.ok(logs);
    }

    /**
     * Get all access logs
     * GET /api/access/logs
     */
    @GetMapping("/logs")
    public ResponseEntity<List<AccessLog>> getAllAccessLogs() {
        List<AccessLog> logs = accessLogService.getAllAccessLogs();
        return ResponseEntity.ok(logs);
    }
}
