package com.datacenter.workingpermit.controller;

import com.datacenter.workingpermit.dto.WorkingPermitRequest;
import com.datacenter.workingpermit.exception.ResourceNotFoundException;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.service.permit.PermitActionService;
import com.datacenter.workingpermit.service.permit.PermitCreationService;
import com.datacenter.workingpermit.service.permit.PermitRetrievalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for Working Permit management
 */
@RestController
@RequestMapping("/api/permits")
@RequiredArgsConstructor
public class WorkingPermitController {

    private final PermitCreationService permitCreationService;
    private final PermitRetrievalService permitRetrievalService;
    private final PermitActionService permitActionService;

    /**
     * Create new working permit
     * POST /api/permits?visitorId={id}
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createPermit(
            @Valid @RequestBody WorkingPermitRequest request,
            @RequestParam Long visitorId) {

        WorkingPermit permit = permitCreationService.createPermit(visitorId, request);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Working permit created successfully");
        response.put("permitId", permit.getId());
        response.put("permitNumber", permit.getPermitNumber());
        response.put("status", permit.getStatus().name());

        return ResponseEntity.ok(response);
    }

    /**
     * Get permit by ID
     * GET /api/permits/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<WorkingPermit> getPermit(@PathVariable Long id) {
        WorkingPermit permit = permitRetrievalService.getPermitById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permit not found"));
        return ResponseEntity.ok(permit);
    }

    /**
     * Get permit by permit number
     * GET /api/permits/number/{permitNumber}
     */
    @GetMapping("/number/{permitNumber}")
    public ResponseEntity<WorkingPermit> getPermitByNumber(@PathVariable String permitNumber) {
        WorkingPermit permit = permitRetrievalService.getPermitByNumber(permitNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Permit not found"));
        return ResponseEntity.ok(permit);
    }

    /**
     * Get permits by visitor
     * GET /api/permits/visitor/{visitorId}
     */
    @GetMapping("/visitor/{visitorId}")
    public ResponseEntity<List<WorkingPermit>> getPermitsByVisitor(@PathVariable Long visitorId) {
        List<WorkingPermit> permits = permitRetrievalService.getPermitsByVisitorId(visitorId);
        return ResponseEntity.ok(permits);
    }

    /**
     * Get permits by PIC
     * GET /api/permits/pic/{picId}
     */
    @GetMapping("/pic/{picId}")
    public ResponseEntity<List<WorkingPermit>> getPermitsByPIC(@PathVariable Long picId) {
        List<WorkingPermit> permits = permitRetrievalService.getPermitsByPICId(picId);
        return ResponseEntity.ok(permits);
    }

    /**
     * Get permits by status
     * GET /api/permits/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<WorkingPermit>> getPermitsByStatus(@PathVariable String status) {
        WorkingPermit.PermitStatus permitStatus = WorkingPermit.PermitStatus.valueOf(status);
        List<WorkingPermit> permits = permitRetrievalService.getPermitsByStatus(permitStatus);
        return ResponseEntity.ok(permits);
    }

    /**
     * Get all permits
     * GET /api/permits
     */
    @GetMapping
    public ResponseEntity<List<WorkingPermit>> getAllPermits() {
        List<WorkingPermit> permits = permitRetrievalService.getAllPermits();
        return ResponseEntity.ok(permits);
    }

    /**
     * Update permit
     * PUT /api/permits/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updatePermit(
            @PathVariable Long id,
            @Valid @RequestBody WorkingPermitRequest request) {

        WorkingPermit permit = permitCreationService.updatePermit(id, request);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Working permit updated successfully");
        response.put("permit", permit);

        return ResponseEntity.ok(response);
    }

    /**
     * Cancel permit
     * POST /api/permits/{id}/cancel
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelPermit(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {

        permitActionService.cancelPermit(id, reason);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Working permit cancelled");

        return ResponseEntity.ok(response);
    }

    /**
     * Activate permit (after check-in)
     * POST /api/permits/{id}/activate
     */
    @PostMapping("/{id}/activate")
    public ResponseEntity<Map<String, Object>> activatePermit(@PathVariable Long id) {
        permitActionService.activatePermit(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Working permit activated");

        return ResponseEntity.ok(response);
    }

    /**
     * Regenerate OTP
     * POST /api/permits/{id}/regenerate-otp
     */
    @PostMapping("/{id}/regenerate-otp")
    public ResponseEntity<Map<String, Object>> regenerateOTP(@PathVariable Long id) {
        String newOtp = permitActionService.regenerateOTP(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "OTP regenerated successfully");
        response.put("otp", newOtp);

        return ResponseEntity.ok(response);
    }
}
