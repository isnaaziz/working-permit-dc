package com.datacenter.workingpermit.service;

import com.datacenter.workingpermit.dto.ApprovalRequest;
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
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final WorkingPermitRepository permitRepository;
    private final UserRepository userRepository;
    private final WorkingPermitService workingPermitService;
    private final NotificationService notificationService;

    /**
     * PIC Review - First level approval
     */
    @Transactional
    public void picReview(Long permitId, User pic, ApprovalRequest request) {
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        // Verify PIC is the assigned PIC
        if (!permit.getPic().getId().equals(pic.getId())) {
            throw new RuntimeException("You are not the assigned PIC for this permit");
        }

        // Get PIC approval record
        Approval approval = approvalRepository.findByWorkingPermitAndLevel(
                permit,
                Approval.ApprovalLevel.PIC_REVIEW).orElseThrow(() -> new RuntimeException("Approval record not found"));

        approval.setReviewedAt(LocalDateTime.now());
        approval.setComments(request.getComments());

        if (request.getApproved()) {
            // Approve - move to manager approval
            approval.setStatus(Approval.ApprovalStatus.APPROVED);
            permit.setStatus(WorkingPermit.PermitStatus.PENDING_MANAGER);

            // Create manager approval record
            List<User> managers = userRepository.findByRole(User.UserRole.MANAGER);
            if (!managers.isEmpty()) {
                User manager = managers.get(0); // Assign to first available manager

                Approval managerApproval = Approval.builder()
                        .workingPermit(permit)
                        .approver(manager)
                        .level(Approval.ApprovalLevel.MANAGER_APPROVAL)
                        .status(Approval.ApprovalStatus.PENDING)
                        .build();
                approvalRepository.save(managerApproval);

                // Notify manager
                notificationService.notifyApprovalRequired(permit, manager);
            }
        } else {
            // Reject
            approval.setStatus(Approval.ApprovalStatus.REJECTED);
            permit.setStatus(WorkingPermit.PermitStatus.REJECTED);
            permit.setRejectionReason(request.getComments());

            // Notify visitor
            notificationService.notifyPermitRejected(permit, request.getComments());
        }

        approvalRepository.save(approval);
        permitRepository.save(permit);
    }

    /**
     * Manager Approval - Final approval
     */
    @Transactional
    public void managerApproval(Long permitId, User manager, ApprovalRequest request)
            throws WriterException, IOException {
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        // Verify status
        if (permit.getStatus() != WorkingPermit.PermitStatus.PENDING_MANAGER) {
            throw new RuntimeException("Permit is not pending manager approval");
        }

        // Get manager approval record
        Approval approval = approvalRepository.findByWorkingPermitAndLevel(
                permit,
                Approval.ApprovalLevel.MANAGER_APPROVAL)
                .orElseThrow(() -> new RuntimeException("Approval record not found"));

        approval.setReviewedAt(LocalDateTime.now());
        approval.setComments(request.getComments());

        if (request.getApproved()) {
            // Final approval - generate QR code and OTP
            approval.setStatus(Approval.ApprovalStatus.APPROVED);
            approvalRepository.save(approval);

            // Approve permit (will generate QR and OTP)
            workingPermitService.approvePermit(permitId);
        } else {
            // Reject
            approval.setStatus(Approval.ApprovalStatus.REJECTED);
            permit.setStatus(WorkingPermit.PermitStatus.REJECTED);
            permit.setRejectionReason(request.getComments());

            approvalRepository.save(approval);
            permitRepository.save(permit);

            // Notify visitor
            notificationService.notifyPermitRejected(permit, request.getComments());
        }
    }

    /**
     * Get pending approvals for PIC
     */
    public List<Approval> getPendingApprovalsForPIC(User pic) {
        return approvalRepository.findByApproverIdAndStatus(
                pic.getId(),
                Approval.ApprovalStatus.PENDING);
    }

    /**
     * Get pending approvals for Manager
     */
    public List<Approval> getPendingApprovalsForManager(User manager) {
        return approvalRepository.findByApproverIdAndStatus(
                manager.getId(),
                Approval.ApprovalStatus.PENDING);
    }

    /**
     * Get all approvals for a permit
     */
    public List<Approval> getApprovalsForPermit(Long permitId) {
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));
        return approvalRepository.findByWorkingPermit(permit);
    }

    /**
     * Get all pending approvals
     */
    public List<Approval> getAllPendingApprovals() {
        return approvalRepository.findByStatus(Approval.ApprovalStatus.PENDING);
    }

    /**
     * Get pending PIC approvals
     */
    public List<Approval> getPendingPICApprovals(Long picId) {
        return approvalRepository.findByApproverIdAndStatus(picId, Approval.ApprovalStatus.PENDING)
                .stream()
                .filter(a -> a.getLevel() == Approval.ApprovalLevel.PIC_REVIEW)
                .toList();
    }

    /**
     * Get pending Manager approvals
     */
    public List<Approval> getPendingManagerApprovals(Long managerId) {
        return approvalRepository.findByApproverIdAndStatus(managerId, Approval.ApprovalStatus.PENDING)
                .stream()
                .filter(a -> a.getLevel() == Approval.ApprovalLevel.MANAGER_APPROVAL)
                .toList();
    }

    /**
     * Get approvals by permit ID
     */
    public List<Approval> getApprovalsByPermit(Long permitId) {
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));
        return approvalRepository.findByWorkingPermit(permit);
    }

    /**
     * Get approval by ID
     */
    public Approval getApprovalById(Long approvalId) {
        return approvalRepository.findById(approvalId)
                .orElseThrow(() -> new RuntimeException("Approval not found with id: " + approvalId));
    }
}
