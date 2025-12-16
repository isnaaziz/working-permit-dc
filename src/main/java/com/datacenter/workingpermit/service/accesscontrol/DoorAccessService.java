package com.datacenter.workingpermit.service.accesscontrol;

import com.datacenter.workingpermit.model.AccessLog;
import com.datacenter.workingpermit.model.TempIdCard;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.TempIdCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoorAccessService {

    private final TempIdCardRepository idCardRepository;
    private final AccessLogService accessLogService;

    /**
     * Verify RFID access for door entry/exit
     */
    @Transactional
    public boolean verifyRFIDAccess(String rfidTag, String location) {
        // Find active ID card by RFID
        TempIdCard idCard = idCardRepository.findByRfidTagAndIsActive(rfidTag, true)
                .orElse(null);

        if (idCard == null) {
            log.warn("Access denied - Invalid or inactive RFID: {}", rfidTag);
            return false;
        }

        WorkingPermit permit = idCard.getWorkingPermit();

        // Check if permit is active
        if (permit.getStatus() != WorkingPermit.PermitStatus.ACTIVE) {
            log.warn("Access denied - Permit not active: {}", permit.getPermitNumber());
            accessLogService.logAccess(
                    permit,
                    AccessLog.AccessType.DENIED,
                    location,
                    AccessLog.AccessStatus.UNAUTHORIZED,
                    "Permit not active");
            return false;
        }

        // Check if ID card is expired
        if (LocalDateTime.now().isAfter(idCard.getExpiresAt())) {
            log.warn("Access denied - ID card expired: {}", idCard.getCardNumber());
            accessLogService.logAccess(
                    permit,
                    AccessLog.AccessType.DENIED,
                    location,
                    AccessLog.AccessStatus.UNAUTHORIZED,
                    "ID card expired");
            return false;
        }

        // Grant access
        accessLogService.logAccess(
                permit,
                AccessLog.AccessType.ENTRY,
                location,
                AccessLog.AccessStatus.SUCCESS,
                "Access granted via RFID: " + rfidTag);

        return true;
    }

    /**
     * Record door access
     */
    @Transactional
    public void recordDoorAccess(String rfidTag, String location, String accessType) {
        // Find ID card by RFID
        TempIdCard idCard = idCardRepository.findByRfidTagAndIsActive(rfidTag, true)
                .orElseThrow(() -> new RuntimeException("Invalid or inactive RFID tag"));

        WorkingPermit permit = idCard.getWorkingPermit();

        AccessLog.AccessType type = "ENTRY".equals(accessType)
                ? AccessLog.AccessType.ENTRY
                : AccessLog.AccessType.EXIT;

        accessLogService.logAccess(
                permit,
                type,
                location,
                AccessLog.AccessStatus.SUCCESS,
                "Door access via RFID: " + rfidTag);
    }
}
