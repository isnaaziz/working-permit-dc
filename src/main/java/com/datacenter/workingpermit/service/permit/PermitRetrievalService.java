package com.datacenter.workingpermit.service.permit;

import com.datacenter.workingpermit.model.User;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.WorkingPermitRepository;
import com.datacenter.workingpermit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermitRetrievalService {

    private final WorkingPermitRepository permitRepository;
    private final UserRepository userRepository;
    private final com.datacenter.workingpermit.service.QRCodeService qrCodeService;

    /**
     * Get permit by ID
     */
    public Optional<WorkingPermit> getPermitById(Long id) {
        if (id == null)
            return Optional.empty();

        Optional<WorkingPermit> permitOpt = permitRepository.findById(id);

        if (permitOpt.isPresent()) {
            WorkingPermit permit = permitOpt.get();
            // Populate Base64 QR Code if data exists
            if (permit.getQrCodeData() != null) {
                try {
                    String base64 = qrCodeService.generateQRCodeBase64(permit.getQrCodeData());
                    permit.setQrCodeBase64(base64);
                } catch (Exception e) {
                    log.error("Failed to generate QR code Base64 for permit {}: {}", id, e.getMessage());
                }
            }
            return Optional.of(permit);
        }

        return Optional.empty();
    }

    /**
     * Get permit by permit number
     */
    public Optional<WorkingPermit> getPermitByNumber(String permitNumber) {
        return permitRepository.findByPermitNumber(permitNumber);
    }

    /**
     * Get permit by QR code data
     */
    public Optional<WorkingPermit> getPermitByQRCode(String qrCodeData) {
        return permitRepository.findByQrCodeData(qrCodeData);
    }

    /**
     * Get all permits for a visitor
     */
    public List<WorkingPermit> getPermitsByVisitor(User visitor) {
        return permitRepository.findByVisitorOrderByCreatedAtDesc(visitor);
    }

    /**
     * Get all permits for a PIC
     */
    public List<WorkingPermit> getPermitsByPIC(User pic) {
        return permitRepository.findByPicOrderByCreatedAtDesc(pic);
    }

    /**
     * Get permits by status
     */
    public List<WorkingPermit> getPermitsByStatus(WorkingPermit.PermitStatus status) {
        // Use the query with FETCH to avoid lazy loading issues
        return permitRepository.findByStatusWithDetails(status);
    }

    /**
     * Get pending permits for PIC
     */
    public List<WorkingPermit> getPendingPermitsForPIC(User pic) {
        return permitRepository.findByPicAndStatusOrderByCreatedAtDesc(pic, WorkingPermit.PermitStatus.PENDING_PIC);
    }

    /**
     * Get pending permits for Manager approval
     */
    public List<WorkingPermit> getPendingPermitsForManager() {
        return permitRepository.findByStatusOrderByCreatedAtDesc(WorkingPermit.PermitStatus.PENDING_MANAGER);
    }

    /**
     * Get all permits
     */
    public List<WorkingPermit> getAllPermits() {
        return permitRepository.findAll(org.springframework.data.domain.Sort
                .by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
    }

    /**
     * Get permits by visitor ID
     */
    public List<WorkingPermit> getPermitsByVisitorId(Long visitorId) {
        if (visitorId == null)
            throw new IllegalArgumentException("Visitor ID cannot be null");
        User visitor = userRepository.findById(visitorId)
                .orElseThrow(() -> new RuntimeException("Visitor not found"));
        return permitRepository.findByVisitorOrderByCreatedAtDesc(visitor);
    }

    /**
     * Get permits by PIC ID
     */
    public List<WorkingPermit> getPermitsByPICId(Long picId) {
        if (picId == null)
            throw new IllegalArgumentException("PIC ID cannot be null");
        User pic = userRepository.findById(picId)
                .orElseThrow(() -> new RuntimeException("PIC not found"));
        return permitRepository.findByPicOrderByCreatedAtDesc(pic);
    }
}
