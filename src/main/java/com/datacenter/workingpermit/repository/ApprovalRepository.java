package com.datacenter.workingpermit.repository;

import com.datacenter.workingpermit.model.Approval;
import com.datacenter.workingpermit.model.WorkingPermit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {

    List<Approval> findByWorkingPermit(WorkingPermit workingPermit);

    Optional<Approval> findByWorkingPermitAndLevel(
            WorkingPermit workingPermit,
            Approval.ApprovalLevel level);

    List<Approval> findByApproverIdAndStatus(
            Long approverId,
            Approval.ApprovalStatus status);

    List<Approval> findByStatus(Approval.ApprovalStatus status);
}
