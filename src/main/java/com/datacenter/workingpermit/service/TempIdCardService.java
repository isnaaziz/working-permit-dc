package com.datacenter.workingpermit.service;

import com.datacenter.workingpermit.model.TempIdCard;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.TempIdCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TempIdCardService {

    private final TempIdCardRepository idCardRepository;

    /**
     * Issue temporary ID card for a permit
     */
    @Transactional
    public TempIdCard issueIdCard(WorkingPermit permit) {
        // Check if ID card already exists
        Optional<TempIdCard> existing = idCardRepository.findByWorkingPermit(permit);
        if (existing.isPresent()) {
            TempIdCard existingCard = existing.get();
            if (existingCard.getIsActive()) {
                return existingCard; // Return existing active card
            }
        }

        // Generate card number and RFID tag
        String cardNumber = generateCardNumber();
        String rfidTag = generateRFIDTag();

        // Calculate expiry time (same as scheduled end time)
        LocalDateTime expiresAt = permit.getScheduledEndTime();

        // Create ID card
        TempIdCard idCard = TempIdCard.builder()
                .workingPermit(permit)
                .cardNumber(cardNumber)
                .rfidTag(rfidTag)
                .expiresAt(expiresAt)
                .isActive(true)
                .build();

        return idCardRepository.save(idCard);
    }

    /**
     * Generate unique card number
     */
    private String generateCardNumber() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        return "TMP-" + timestamp.substring(timestamp.length() - 8);
    }

    /**
     * Generate unique RFID tag
     */
    private String generateRFIDTag() {
        return "RF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Deactivate ID card
     */
    @Transactional
    public void deactivateIdCard(Long idCardId, String reason) {
        TempIdCard idCard = idCardRepository.findById(idCardId)
                .orElseThrow(() -> new RuntimeException("ID card not found"));

        idCard.setIsActive(false);
        idCard.setDeactivatedAt(LocalDateTime.now());
        idCard.setDeactivationReason(reason);

        idCardRepository.save(idCard);
    }

    /**
     * Find ID card by card number
     */
    public Optional<TempIdCard> findByCardNumber(String cardNumber) {
        return idCardRepository.findByCardNumber(cardNumber);
    }

    /**
     * Find ID card by RFID tag
     */
    public Optional<TempIdCard> findByRFIDTag(String rfidTag) {
        return idCardRepository.findByRfidTag(rfidTag);
    }

    /**
     * Find active ID card by RFID
     */
    public Optional<TempIdCard> findActiveByRFID(String rfidTag) {
        return idCardRepository.findByRfidTagAndIsActive(rfidTag, true);
    }

    /**
     * Check if ID card is valid and active
     */
    public boolean isValidAndActive(String rfidTag) {
        Optional<TempIdCard> idCard = findActiveByRFID(rfidTag);

        if (idCard.isEmpty()) {
            return false;
        }

        TempIdCard card = idCard.get();

        // Check if expired
        if (LocalDateTime.now().isAfter(card.getExpiresAt())) {
            // Auto-deactivate expired card
            deactivateIdCard(card.getId(), "Expired");
            return false;
        }

        return true;
    }

    /**
     * Get ID card for a permit
     */
    public Optional<TempIdCard> getIdCardForPermit(Long permitId) {
        return idCardRepository.findAll().stream()
                .filter(card -> card.getWorkingPermit().getId().equals(permitId))
                .findFirst();
    }

    /**
     * Reissue ID card (if lost or damaged)
     */
    @Transactional
    public TempIdCard reissueIdCard(Long oldCardId, String reason) {
        TempIdCard oldCard = idCardRepository.findById(oldCardId)
                .orElseThrow(() -> new RuntimeException("ID card not found"));

        // Deactivate old card
        deactivateIdCard(oldCardId, "Reissued: " + reason);

        // Issue new card with same permit
        return issueIdCard(oldCard.getWorkingPermit());
    }
}
