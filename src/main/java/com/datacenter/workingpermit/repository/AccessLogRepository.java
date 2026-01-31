package com.datacenter.workingpermit.repository;

import com.datacenter.workingpermit.model.AccessLog;
import com.datacenter.workingpermit.model.WorkingPermit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

        // Find all check-in logs for today
        @Query("SELECT a FROM AccessLog a WHERE a.accessType = 'CHECK_IN' AND a.timestamp >= :startOfDay ORDER BY a.timestamp DESC")
        List<AccessLog> findTodayCheckIns(@Param("startOfDay") LocalDateTime startOfDay);

        // Find all check-out logs for today
        @Query("SELECT a FROM AccessLog a WHERE a.accessType = 'CHECK_OUT' AND a.timestamp >= :startOfDay ORDER BY a.timestamp DESC")
        List<AccessLog> findTodayCheckOuts(@Param("startOfDay") LocalDateTime startOfDay);

        // Find all logs by access type ordered by timestamp
        List<AccessLog> findByAccessTypeOrderByTimestampDesc(AccessLog.AccessType accessType);

        // Find logs by user ID ordered by timestamp
        List<AccessLog> findByUserIdOrderByTimestampDesc(Long userId);

        // Find the latest log for a permit
        @Query("SELECT a FROM AccessLog a WHERE a.workingPermit.id = :permitId ORDER BY a.timestamp DESC")
        List<AccessLog> findLatestByPermitId(@Param("permitId") Long permitId);

        // Count check-ins today
        @Query("SELECT COUNT(a) FROM AccessLog a WHERE a.accessType = 'CHECK_IN' AND a.timestamp >= :startOfDay")
        Long countTodayCheckIns(@Param("startOfDay") LocalDateTime startOfDay);

        // Count check-outs today
        @Query("SELECT COUNT(a) FROM AccessLog a WHERE a.accessType = 'CHECK_OUT' AND a.timestamp >= :startOfDay")
        Long countTodayCheckOuts(@Param("startOfDay") LocalDateTime startOfDay);

        // Find logs ordered by timestamp (most recent first)
        List<AccessLog> findAllByOrderByTimestampDesc();
}
