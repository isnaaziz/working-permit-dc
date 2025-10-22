package com.datacenter.workingpermit.repository;

import com.datacenter.workingpermit.model.User;
import com.datacenter.workingpermit.model.WorkingPermit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkingPermitRepository extends JpaRepository<WorkingPermit, Long> {

    Optional<WorkingPermit> findByPermitNumber(String permitNumber);

    Optional<WorkingPermit> findByQrCodeData(String qrCodeData);

    List<WorkingPermit> findByVisitor(User visitor);

    List<WorkingPermit> findByPic(User pic);

    List<WorkingPermit> findByStatus(WorkingPermit.PermitStatus status);

    List<WorkingPermit> findByVisitorAndStatus(User visitor, WorkingPermit.PermitStatus status);

    List<WorkingPermit> findByPicAndStatus(User pic, WorkingPermit.PermitStatus status);

    @Query("SELECT wp FROM WorkingPermit wp WHERE wp.status = :status " +
            "AND wp.scheduledStartTime BETWEEN :startDate AND :endDate")
    List<WorkingPermit> findByStatusAndScheduledBetween(
            @Param("status") WorkingPermit.PermitStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT wp FROM WorkingPermit wp WHERE wp.status = 'APPROVED' " +
            "AND wp.otpExpiryTime < :now AND wp.actualCheckInTime IS NULL")
    List<WorkingPermit> findExpiredOtpPermits(@Param("now") LocalDateTime now);

    @Query("SELECT wp FROM WorkingPermit wp WHERE wp.status = 'ACTIVE' " +
            "AND wp.scheduledEndTime < :now")
    List<WorkingPermit> findOverdueActivePermits(@Param("now") LocalDateTime now);
}
