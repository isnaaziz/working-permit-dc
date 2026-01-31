package com.datacenter.workingpermit.repository;

import com.datacenter.workingpermit.model.MutasiBarang;
import com.datacenter.workingpermit.model.MutasiBarang.MutasiStatus;
import com.datacenter.workingpermit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MutasiBarangRepository extends JpaRepository<MutasiBarang, Long> {

    // Find by status
    List<MutasiBarang> findByStatus(MutasiStatus status);

    List<MutasiBarang> findByStatusIn(List<MutasiStatus> statuses);

    // Find by status and PIC
    List<MutasiBarang> findByStatusAndPic(MutasiStatus status, User pic);

    // Count by status
    long countByStatus(MutasiStatus status);

    // Count by status in list
    long countByStatusIn(List<MutasiStatus> statuses);

    // Count by status and PIC
    long countByStatusAndPic(MutasiStatus status, User pic);

    // Count by PIC and statuses
    long countByPicAndStatusIn(User pic, List<MutasiStatus> statuses);

    // Count by created by
    long countByCreatedBy(User user);

    long countByCreatedByAndStatus(User user, MutasiStatus status);

    long countByCreatedByAndStatusIn(User user, List<MutasiStatus> statuses);

    // Find by created by
    List<MutasiBarang> findByCreatedBy(User user);

    List<MutasiBarang> findByCreatedByAndStatus(User user, MutasiStatus status);
}
