package com.datacenter.workingpermit.service.accesscontrol;

import com.datacenter.workingpermit.model.AccessLog;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.AccessLogRepository;
import com.datacenter.workingpermit.repository.WorkingPermitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public AccessLog logAccess(
            WorkingPermit permit,
            AccessLog.AccessType accessType,
            String location,
            AccessLog.AccessStatus status,
            String remarks) {

        log.info("📝 Logging access: Type={}, Permit={}, User={}, Location={}",
                accessType, permit.getPermitNumber(), permit.getVisitor().getFullName(), location);

        AccessLog logEntry = AccessLog.builder()
                .workingPermit(permit)
                .user(permit.getVisitor())
                .accessType(accessType)
                .location(location)
                .status(status)
                .remarks(remarks)
                .timestamp(LocalDateTime.now())
                .build();

        AccessLog savedLog = accessLogRepository.save(logEntry);
        log.info("✅ Access log saved: ID={}, Type={}", savedLog.getId(), accessType);
        return savedLog;
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
     * Get all access logs (ordered by timestamp desc)
     */
    public List<AccessLog> getAllAccessLogs() {
        return accessLogRepository.findAllByOrderByTimestampDesc();
    }

    /**
     * Get access logs by location
     */
    public List<AccessLog> getAccessLogsByLocation(String location) {
        return accessLogRepository.findAll().stream()
                .filter(log -> location.equals(log.getLocation()))
                .toList();
    }

    /**
     * Get today's check-in logs
     */
    public List<AccessLog> getTodayCheckIns() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return accessLogRepository.findTodayCheckIns(startOfDay);
    }

    /**
     * Get today's check-out logs
     */
    public List<AccessLog> getTodayCheckOuts() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return accessLogRepository.findTodayCheckOuts(startOfDay);
    }

    /**
     * Get access logs by user ID
     */
    public List<AccessLog> getAccessLogsByUserId(Long userId) {
        return accessLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    /**
     * Get access log statistics for today
     */
    public Map<String, Object> getTodayStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        Long checkIns = accessLogRepository.countTodayCheckIns(startOfDay);
        Long checkOuts = accessLogRepository.countTodayCheckOuts(startOfDay);

        // Get currently active visitors (checked in but not checked out)
        List<WorkingPermit> activePermits = permitRepository
                .findByStatusOrderByCreatedAtDesc(WorkingPermit.PermitStatus.ACTIVE);

        Map<String, Object> stats = new HashMap<>();
        stats.put("todayCheckIns", checkIns != null ? checkIns : 0);
        stats.put("todayCheckOuts", checkOuts != null ? checkOuts : 0);
        stats.put("activeVisitors", activePermits.size());
        stats.put("date", LocalDate.now().toString());

        return stats;
    }

    /**
     * Get checked-in visitors (currently active in data center)
     */
    public List<WorkingPermit> getCheckedInVisitors() {
        return permitRepository.findByStatusOrderByCreatedAtDesc(WorkingPermit.PermitStatus.ACTIVE);
    }

    /**
     * Get logs by access type
     */
    public List<AccessLog> getLogsByAccessType(AccessLog.AccessType accessType) {
        return accessLogRepository.findByAccessTypeOrderByTimestampDesc(accessType);
    }
}
