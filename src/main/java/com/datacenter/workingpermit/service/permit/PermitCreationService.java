package com.datacenter.workingpermit.service.permit;

import com.datacenter.workingpermit.dto.WorkingPermitRequest;
import com.datacenter.workingpermit.model.Approval;
import com.datacenter.workingpermit.model.User;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.ApprovalRepository;
import com.datacenter.workingpermit.repository.UserRepository;
import com.datacenter.workingpermit.repository.WorkingPermitRepository;
import com.datacenter.workingpermit.service.notification.NotificationEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermitCreationService {

    private final WorkingPermitRepository permitRepository;
    private final UserRepository userRepository;
    private final ApprovalRepository approvalRepository;
    private final NotificationEventService notificationService;

    /**
     * Create new working permit request
     */
    @Transactional
    @SuppressWarnings("null")
    public WorkingPermit createPermit(Long visitorId, WorkingPermitRequest request) {
        if (visitorId == null)
            throw new IllegalArgumentException("Visitor ID cannot be null");
        // Get visitor
        User visitor = userRepository.findById(visitorId)
                .orElseThrow(() -> new RuntimeException("Visitor not found"));

        if (request.getPicId() == null)
            throw new IllegalArgumentException("PIC ID cannot be null");
        // Get PIC
        User pic = userRepository.findById(request.getPicId())
                .orElseThrow(() -> new RuntimeException("PIC not found"));

        // Generate permit number
        String permitNumber = generatePermitNumber();

        // Create permit
        WorkingPermit permit = WorkingPermit.builder()
                .permitNumber(permitNumber)
                .visitor(visitor)
                .pic(pic)
                .visitPurpose(request.getVisitPurpose())
                .visitType(WorkingPermit.VisitType.valueOf(request.getVisitType()))
                .dataCenter(WorkingPermit.DataCenter.valueOf(request.getDataCenter()))
                .scheduledStartTime(request.getScheduledStartTime())
                .scheduledEndTime(request.getScheduledEndTime())
                .equipmentList(request.getEquipmentList())
                .workOrderDocument(request.getWorkOrderDocument())
                .status(WorkingPermit.PermitStatus.PENDING_PIC)
                .build();

        permit = permitRepository.save(permit);

        // Create PIC review approval
        Approval picApproval = Approval.builder()
                .workingPermit(permit)
                .approver(pic)
                .level(Approval.ApprovalLevel.PIC_REVIEW)
                .status(Approval.ApprovalStatus.PENDING)
                .build();
        approvalRepository.save(picApproval);

        // Send notification to PIC
        notificationService.notifyPermitSubmitted(permit);

        return permit;
    }

    /**
     * Update permit
     */
    @Transactional
    public WorkingPermit updatePermit(Long permitId, WorkingPermitRequest request) {
        if (permitId == null)
            throw new IllegalArgumentException("Permit ID cannot be null");
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        // Only allow updates for DRAFT or PENDING status
        if (permit.getStatus() != WorkingPermit.PermitStatus.DRAFT &&
                permit.getStatus() != WorkingPermit.PermitStatus.PENDING_PIC) {
            throw new RuntimeException("Cannot update permit in current status");
        }

        permit.setVisitPurpose(request.getVisitPurpose());
        permit.setVisitType(WorkingPermit.VisitType.valueOf(request.getVisitType()));
        permit.setDataCenter(WorkingPermit.DataCenter.valueOf(request.getDataCenter()));
        permit.setScheduledStartTime(request.getScheduledStartTime());
        permit.setScheduledEndTime(request.getScheduledEndTime());
        permit.setEquipmentList(request.getEquipmentList());

        return permitRepository.save(permit);
    }

    /**
     * Generate unique permit number
     */
    private String generatePermitNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "WP-" + timestamp;
    }
}
