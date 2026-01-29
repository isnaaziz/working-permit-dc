package com.datacenter.workingpermit.repository;

import com.datacenter.workingpermit.model.AccessLog;
import com.datacenter.workingpermit.model.WorkingPermit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {

    List<AccessLog> findByWorkingPermit(WorkingPermit workingPermit);

    List<AccessLog> findByWorkingPermitOrderByTimestampDesc(WorkingPermit workingPermit);

    List<AccessLog> findByUserIdAndTimestampBetween(
            Long userId,
            LocalDateTime startTime,
            LocalDateTime endTime);

    List<AccessLog> findByAccessTypeAndStatus(
            AccessLog.AccessType accessType,
            AccessLog.AccessStatus status);

    List<AccessLog> findByTimestampBetween(
            LocalDateTime startTime,
            LocalDateTime endTime);
}
