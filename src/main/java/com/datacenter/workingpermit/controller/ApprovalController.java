package com.datacenter.workingpermit.controller;

import com.datacenter.workingpermit.dto.ApprovalRequest;
import com.datacenter.workingpermit.model.Approval;
import com.datacenter.workingpermit.model.User;
import com.datacenter.workingpermit.service.approval.ApprovalActionService;
import com.datacenter.workingpermit.service.approval.ApprovalRetrievalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Approval Controller
 * Handles PIC review and Manager approval workflows
 */
@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ApprovalController {

    private final ApprovalActionService approvalActionService;
    private final ApprovalRetrievalService approvalRetrievalService;

    /**
     * PIC Review - Approve or reject permit
     * POST /api/approvals/pic/review
     */
    @PostMapping("/pic/review")
    public ResponseEntity<Map<String, Object>> picReview(
            @Valid @RequestBody ApprovalRequest request,
            @RequestParam Long picId) {

        User pic = new User(); // Mock - in real implementation get from authentication
        pic.setId(picId);

        approvalActionService.picReview(request.getPermitId(), pic, request);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", request.getApproved()
                ? "Permit approved by PIC and forwarded to Manager"
                : "Permit rejected by PIC");

        return ResponseEntity.ok(response);
    }

    /**
     * Manager Approval - Final approval or rejection
     * POST /api/approvals/manager/approve
     */
    @PostMapping("/manager/approve")
    public ResponseEntity<Map<String, Object>> managerApproval(
            @Valid @RequestBody ApprovalRequest request,
            @RequestParam Long managerId) throws Exception {

        User manager = new User(); // Mock - in real implementation get from authentication
        manager.setId(managerId);

        approvalActionService.managerApproval(request.getPermitId(), manager, request);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", request.getApproved()
                ? "Permit approved by Manager. QR Code and OTP will be generated."
                : "Permit rejected by Manager");

        return ResponseEntity.ok(response);
    }

    /**
     * Get pending approvals for PIC
     * GET /api/approvals/pic/{picId}/pending
     */
    @GetMapping("/pic/{picId}/pending")
    public ResponseEntity<List<Approval>> getPICPendingApprovals(@PathVariable Long picId) {
        List<Approval> approvals = approvalRetrievalService.getPendingPICApprovals(picId);
        return ResponseEntity.ok(approvals);
    }

    /**
     * Get pending approvals for Manager
     * GET /api/approvals/manager/{managerId}/pending
     */
    @GetMapping("/manager/{managerId}/pending")
    public ResponseEntity<List<Approval>> getManagerPendingApprovals(@PathVariable Long managerId) {
        List<Approval> approvals = approvalRetrievalService.getPendingManagerApprovals(managerId);
        return ResponseEntity.ok(approvals);
    }

    /**
     * Get all approvals for a permit
     * GET /api/approvals/permit/{permitId}
     */
    @GetMapping("/permit/{permitId}")
    public ResponseEntity<List<Approval>> getPermitApprovals(@PathVariable Long permitId) {
        List<Approval> approvals = approvalRetrievalService.getApprovalsByPermit(permitId);
        return ResponseEntity.ok(approvals);
    }

    /**
     * Get approval by ID
     * GET /api/approvals/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Approval> getApproval(@PathVariable Long id) {
        Approval approval = approvalRetrievalService.getApprovalById(id);
        return ResponseEntity.ok(approval);
    }
}
