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
            throw new RuntimeException("Permit is not active");
        }

        // Deactivate ID card
        TempIdCard idCard = idCardRepository.findByWorkingPermit(permit)
                .orElseThrow(() -> new RuntimeException("ID card not found"));
        idCardService.deactivateIdCard(idCard.getId(), "Visit completed");

        // Complete permit
        permitActionService.completePermit(permitId);

        // Log check-out
        accessLogService.logAccess(
                permit,
                AccessLog.AccessType.CHECK_OUT,
                location,
                AccessLog.AccessStatus.SUCCESS,
                "Check-out successful");
    }
}
