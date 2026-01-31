package com.datacenter.workingpermit.service.accesscontrol;

import com.datacenter.workingpermit.model.AccessLog;
import com.datacenter.workingpermit.model.TempIdCard;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.TempIdCardRepository;
import com.datacenter.workingpermit.repository.WorkingPermitRepository;
import com.datacenter.workingpermit.service.TempIdCardService;
import com.datacenter.workingpermit.service.permit.PermitActionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckOutService {

    private final WorkingPermitRepository permitRepository;
    private final TempIdCardRepository idCardRepository;
    private final PermitActionService permitActionService;
    private final TempIdCardService idCardService;
    private final AccessLogService accessLogService;

    /**
     * Check-out visitor
     */
    @Transactional
    public void checkOut(Long permitId, String location) {
        if (permitId == null) {
            throw new IllegalArgumentException("Permit ID cannot be null");
        }

        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));

        // Verify status
        if (permit.getStatus() != WorkingPermit.PermitStatus.ACTIVE) {
            throw new RuntimeException("Permit is not active. Current status: " + permit.getStatus());
        }

        // Try to deactivate ID card if exists (optional - not all check-ins issue ID
        // cards)
        Optional<TempIdCard> idCardOpt = idCardRepository.findByWorkingPermit(permit);
        if (idCardOpt.isPresent()) {
            TempIdCard idCard = idCardOpt.get();
            try {
                idCardService.deactivateIdCard(idCard.getId(), "Visit completed");
                log.info("ID card deactivated for permit: {}", permit.getPermitNumber());
            } catch (Exception e) {
                log.warn("Failed to deactivate ID card for permit {}: {}", permit.getPermitNumber(), e.getMessage());
            }
        } else {
            log.info("No ID card found for permit: {} - proceeding with checkout", permit.getPermitNumber());
        }

        // Complete permit
        permitActionService.completePermit(permitId);

        // Log check-out
        accessLogService.logAccess(
                permit,
                AccessLog.AccessType.CHECK_OUT,
                location != null ? location : "Main Gate",
                AccessLog.AccessStatus.SUCCESS,
                "Check-out successful");

        log.info("✅ Check-out completed for permit: {} - Visitor: {}",
                permit.getPermitNumber(), permit.getVisitor().getFullName());
    }
}
