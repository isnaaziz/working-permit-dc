package com.datacenter.workingpermit.service.accesscontrol;

import com.datacenter.workingpermit.model.AccessLog;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.AccessLogRepository;
import com.datacenter.workingpermit.repository.WorkingPermitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccessLogService {

    private final AccessLogRepository accessLogRepository;
    private final WorkingPermitRepository permitRepository;

    /**
     * Log access attempt
     */
    @Transactional

    public void logAccess(
            WorkingPermit permit,
            AccessLog.AccessType accessType,
            String location,
            AccessLog.AccessStatus status,
            String remarks) {
        AccessLog logEntry = AccessLog.builder()
                .workingPermit(permit)
                .user(permit.getVisitor())
                .accessType(accessType)
                .location(location)
                .status(status)
                .remarks(remarks)
                .build();

        accessLogRepository.save(logEntry);
    }

    /**
     * Get access logs for a permit
     */
    public List<AccessLog> getAccessLogsByPermit(Long permitId) {
        if (permitId == null) {
            throw new IllegalArgumentException("Permit ID cannot be null");
        }
        WorkingPermit permit = permitRepository.findById(permitId)
                .orElseThrow(() -> new RuntimeException("Permit not found"));
        return accessLogRepository.findByWorkingPermitOrderByTimestampDesc(permit);
    }

    /**
     * Get all access logs for a date range
     */
    public List<AccessLog> getAccessLogsByDateRange(LocalDateTime startTime, LocalDateTime endTime) {
        return accessLogRepository.findByTimestampBetween(startTime, endTime);
    }

    /**
     * Get access logs by type and status
     */
    public List<AccessLog> getAccessLogsByTypeAndStatus(
            AccessLog.AccessType type,
            AccessLog.AccessStatus status) {
        return accessLogRepository.findByAccessTypeAndStatus(type, status);
    }

    /**
     * Get all access logs
     */
    public List<AccessLog> getAllAccessLogs() {
        return accessLogRepository.findAll();
    }

    /**
     * Get access logs by location
     */
    public List<AccessLog> getAccessLogsByLocation(String location) {
        return accessLogRepository.findAll().stream()
                .filter(log -> location.equals(log.getLocation()))
                .toList();
    }
}
