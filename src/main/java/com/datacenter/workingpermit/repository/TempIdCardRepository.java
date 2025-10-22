package com.datacenter.workingpermit.repository;

import com.datacenter.workingpermit.model.TempIdCard;
import com.datacenter.workingpermit.model.WorkingPermit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TempIdCardRepository extends JpaRepository<TempIdCard, Long> {

    Optional<TempIdCard> findByWorkingPermit(WorkingPermit workingPermit);

    Optional<TempIdCard> findByCardNumber(String cardNumber);

    Optional<TempIdCard> findByRfidTag(String rfidTag);

    Optional<TempIdCard> findByCardNumberAndIsActive(String cardNumber, Boolean isActive);

    Optional<TempIdCard> findByRfidTagAndIsActive(String rfidTag, Boolean isActive);
}
