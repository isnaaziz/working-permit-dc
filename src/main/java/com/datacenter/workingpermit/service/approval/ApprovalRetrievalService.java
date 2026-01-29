package com.datacenter.workingpermit.service.approval;

import com.datacenter.workingpermit.model.Approval;
import com.datacenter.workingpermit.model.User;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.ApprovalRepository;
import com.datacenter.workingpermit.repository.WorkingPermitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalRetrievalService {

    private final ApprovalRepository approvalRepository;
    private final WorkingPermitRepository permitRepository;

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
        if (permitId == null)
            throw new IllegalArgumentException("Permit ID cannot be null");
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
        if (picId == null)
            throw new IllegalArgumentException("PIC ID cannot be null");
        return approvalRepository.findByApproverIdAndStatus(picId, Approval.ApprovalStatus.PENDING)
                .stream()
                .filter(a -> a.getLevel() == Approval.ApprovalLevel.PIC_REVIEW)
                .toList();
    }

    /**
     * Get pending Manager approvals
     */
    public List<Approval> getPendingManagerApprovals(Long managerId) {
        if (managerId == null)
            throw new IllegalArgumentException("Manager ID cannot be null");
        return approvalRepository.findByApproverIdAndStatus(managerId, Approval.ApprovalStatus.PENDING)
                .stream()
                .filter(a -> a.getLevel() == Approval.ApprovalLevel.MANAGER_APPROVAL)
                .toList();
    }

    /**
     * Get approvals by permit ID
     */
    public List<Approval> getApprovalsByPermit(Long permitId) {
        if (permitId == null)
            throw new IllegalArgumentException("Permit ID cannot be null");
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));
        return approvalRepository.findByWorkingPermit(permit);
    }

    /**
     * Get approval by ID
     */
    public Approval getApprovalById(Long approvalId) {
        if (approvalId == null)
            throw new IllegalArgumentException("Approval ID cannot be null");
        return approvalRepository.findById(approvalId)
                .orElseThrow(() -> new RuntimeException("Approval not found with id: " + approvalId));
    }
}
