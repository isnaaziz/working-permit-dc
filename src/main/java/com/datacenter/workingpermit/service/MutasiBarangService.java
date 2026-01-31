package com.datacenter.workingpermit.service;

import com.datacenter.workingpermit.model.MutasiBarang;
import com.datacenter.workingpermit.model.MutasiBarang.MutasiStatus;
import com.datacenter.workingpermit.model.User;
import com.datacenter.workingpermit.model.WorkingPermit;
import com.datacenter.workingpermit.repository.MutasiBarangRepository;
import com.datacenter.workingpermit.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MutasiBarangService {

    private final MutasiBarangRepository mutasiBarangRepository;
    private final UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Value("${app.upload.path:uploads/mutasi}")
    private String uploadPath;

    @Transactional
    public MutasiBarang createMutasi(Map<String, Object> request, User user) {
        if (user.getRole() != User.UserRole.VISITOR) {
            throw new RuntimeException("Only Visitors can create Mutasi Barang requests");
        }

        MutasiBarang mutasi = new MutasiBarang();

        mutasi.setNomor((String) request.get("nomor"));
        mutasi.setTanggal((String) request.get("tanggal"));
        mutasi.setNama((String) request.get("nama"));
        mutasi.setJabatan((String) request.get("jabatan"));
        mutasi.setEmail((String) request.get("email"));
        mutasi.setTelepon((String) request.get("telepon"));
        mutasi.setTandaTanganDC((String) request.get("tandaTanganDC"));
        mutasi.setTandaTanganPersonel((String) request.get("tandaTanganPersonel"));

        String lokasiStr = (String) request.get("lokasi");
        if (lokasiStr != null && !lokasiStr.isEmpty()) {
            mutasi.setLokasi(WorkingPermit.DataCenter.valueOf(lokasiStr));
        }

        String teamStr = (String) request.get("teamPendamping");
        if (teamStr != null && !teamStr.isEmpty()) {
            mutasi.setTeamPendamping(User.Team.valueOf(teamStr));
        }

        mutasi.setStatus(MutasiStatus.PENDING_PIC);
        mutasi.setCreatedBy(user);

        if (mutasi.getTeamPendamping() != null) {
            User pic = findPICByTeam(mutasi.getTeamPendamping());
            if (pic != null) {
                mutasi.setPic(pic);
            }
        }

        // Process Keterangan Perangkat
        if (request.containsKey("keterangan")) {
            @SuppressWarnings("unchecked")
            List<Map<String, String>> keteranganList = (List<Map<String, String>>) request.get("keterangan");
            if (keteranganList != null && !keteranganList.isEmpty()) {
                List<com.datacenter.workingpermit.model.KeteranganPerangkat> perangkatList = new ArrayList<>();

                for (Map<String, String> itemData : keteranganList) {
                    // Skip empty items if any
                    if (itemData.get("namaBarang") == null || itemData.get("namaBarang").trim().isEmpty()) {
                        continue;
                    }

                    com.datacenter.workingpermit.model.KeteranganPerangkat perangkat = new com.datacenter.workingpermit.model.KeteranganPerangkat();
                    perangkat.setNamaBarang(itemData.get("namaBarang"));
                    perangkat.setRakAsal(itemData.get("rakAsal"));
                    perangkat.setRakTujuan(itemData.get("rakTujuan"));
                    perangkat.setMerk(itemData.get("merk"));
                    perangkat.setTipe(itemData.get("tipe"));
                    perangkat.setSerialNumber(itemData.get("serialNumber"));

                    perangkatList.add(perangkat);
                }

                mutasi.setKeterangan(perangkatList);
            }
        }

        return mutasiBarangRepository.save(mutasi);
    }

    public List<MutasiBarang> getAllMutasi(User user) {
        List<MutasiBarang> allData;

        if (user.getRole() == User.UserRole.VISITOR) {
            allData = mutasiBarangRepository.findByCreatedBy(user);
        } else if (isPICRole(user.getRole())) {
            allData = mutasiBarangRepository.findAll();
            allData = filterByRole(allData, user);
        } else if (user.getRole() == User.UserRole.MANAGER) {
            allData = mutasiBarangRepository.findAll();
            allData = filterByRole(allData, user);
        } else if (user.getRole() == User.UserRole.ADMIN) {
            allData = mutasiBarangRepository.findAll();
        } else {
            allData = mutasiBarangRepository.findAll();
            allData = filterByRole(allData, user);
        }

        // Fix NULL statuses implicitly if encountered (though better to fix via DB
        // script)
        allData.forEach(m -> {
            if (m.getStatus() == null) {
                m.setStatus(MutasiStatus.PENDING_PIC);
                mutasiBarangRepository.save(m);
            }
        });

        return allData;
    }

    public Optional<MutasiBarang> getById(Long id, User user) {
        return mutasiBarangRepository.findById(id)
                .map(mutasi -> {
                    if (!canView(mutasi, user)) {
                        throw new RuntimeException("Access denied");
                    }
                    return mutasi;
                });
    }

    @Transactional
    public MutasiBarang updateMutasi(Long id, MutasiBarang mutasiUpdate) {
        return mutasiBarangRepository.findById(id)
                .map(existing -> {
                    mutasiUpdate.setId(id);
                    mutasiUpdate.setCreatedBy(existing.getCreatedBy());
                    mutasiUpdate.setCreatedAt(existing.getCreatedAt());
                    mutasiUpdate.setStatus(existing.getStatus());
                    mutasiUpdate.setPic(existing.getPic());
                    return mutasiBarangRepository.save(mutasiUpdate);
                })
                .orElseThrow(() -> new RuntimeException("MutasiBarang not found"));
    }

    @Transactional
    public void deleteMutasi(Long id) {
        if (!mutasiBarangRepository.existsById(id)) {
            throw new RuntimeException("MutasiBarang not found");
        }
        mutasiBarangRepository.deleteById(id);
    }

    public List<MutasiBarang> getPendingApprovals(User user) {
        if (isPICRole(user.getRole())) {
            return mutasiBarangRepository.findByStatusAndPic(MutasiStatus.PENDING_PIC, user);
        } else if (user.getRole() == User.UserRole.MANAGER) {
            return mutasiBarangRepository.findByStatus(MutasiStatus.PENDING_MANAGER);
        } else if (user.getRole() == User.UserRole.ADMIN) {
            return mutasiBarangRepository
                    .findByStatusIn(List.of(MutasiStatus.PENDING_PIC, MutasiStatus.PENDING_MANAGER));
        }
        return new ArrayList<>();
    }

    @Transactional
    public MutasiBarang approvePIC(Long id, String notes, User user) {
        if (!isPICRole(user.getRole())) {
            throw new RuntimeException("Only PIC can approve");
        }

        MutasiBarang mutasi = mutasiBarangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MutasiBarang not found"));

        if (mutasi.getStatus() != MutasiStatus.PENDING_PIC) {
            throw new RuntimeException("Invalid status for PIC approval");
        }

        mutasi.setStatus(MutasiStatus.PENDING_MANAGER);
        mutasi.setPicApprovedAt(LocalDateTime.now());
        mutasi.setPicNotes(notes);

        return mutasiBarangRepository.save(mutasi);
    }

    @Transactional
    public MutasiBarang approveManager(Long id, String notes, User user) {
        if (user.getRole() != User.UserRole.MANAGER) {
            throw new RuntimeException("Only Manager can approve");
        }

        MutasiBarang mutasi = mutasiBarangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MutasiBarang not found"));

        if (mutasi.getStatus() != MutasiStatus.PENDING_MANAGER) {
            throw new RuntimeException("Invalid status for Manager approval");
        }

        mutasi.setStatus(MutasiStatus.APPROVED);
        mutasi.setApprovedByManager(user);
        mutasi.setManagerApprovedAt(LocalDateTime.now());
        mutasi.setManagerNotes(notes);

        return mutasiBarangRepository.save(mutasi);
    }

    @Transactional
    public MutasiBarang reject(Long id, String reason, User user) {
        if (!isPICRole(user.getRole()) && user.getRole() != User.UserRole.MANAGER) {
            throw new RuntimeException("Not authorized to reject");
        }

        MutasiBarang mutasi = mutasiBarangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MutasiBarang not found"));

        if (mutasi.getStatus() != MutasiStatus.PENDING_PIC && mutasi.getStatus() != MutasiStatus.PENDING_MANAGER) {
            throw new RuntimeException("Cannot reject at current status");
        }

        mutasi.setStatus(MutasiStatus.REJECTED);
        mutasi.setRejectionReason(reason);
        mutasi.setRejectedAt(LocalDateTime.now());
        mutasi.setRejectedBy(user);

        return mutasiBarangRepository.save(mutasi);
    }

    @Transactional
    public MutasiBarang complete(Long id) {
        MutasiBarang mutasi = mutasiBarangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MutasiBarang not found"));

        if (mutasi.getStatus() != MutasiStatus.APPROVED) {
            throw new RuntimeException("Only approved mutasi can be completed");
        }

        mutasi.setStatus(MutasiStatus.COMPLETED);
        return mutasiBarangRepository.save(mutasi);
    }

    public Map<String, Object> getStats(User user) {
        Map<String, Object> stats = new HashMap<>();

        if (isPICRole(user.getRole())) {
            stats.put("pendingPIC", mutasiBarangRepository.countByStatus(MutasiStatus.PENDING_PIC));
            stats.put("approved", mutasiBarangRepository.countByStatusIn(
                    List.of(MutasiStatus.APPROVED, MutasiStatus.COMPLETED, MutasiStatus.PENDING_MANAGER)));
        } else if (user.getRole() == User.UserRole.MANAGER) {
            stats.put("pendingManager", mutasiBarangRepository.countByStatus(MutasiStatus.PENDING_MANAGER));
            stats.put("approved", mutasiBarangRepository.countByStatus(MutasiStatus.APPROVED));
            stats.put("completed", mutasiBarangRepository.countByStatus(MutasiStatus.COMPLETED));
        } else if (user.getRole() == User.UserRole.ADMIN) {
            stats.put("total", mutasiBarangRepository.count());
            stats.put("pendingPIC", mutasiBarangRepository.countByStatus(MutasiStatus.PENDING_PIC));
            stats.put("pendingManager", mutasiBarangRepository.countByStatus(MutasiStatus.PENDING_MANAGER));
            stats.put("approved", mutasiBarangRepository.countByStatus(MutasiStatus.APPROVED));
            stats.put("completed", mutasiBarangRepository.countByStatus(MutasiStatus.COMPLETED));
            stats.put("rejected", mutasiBarangRepository.countByStatus(MutasiStatus.REJECTED));
        } else {
            stats.put("myTotal", mutasiBarangRepository.countByCreatedBy(user));
            stats.put("myPending", mutasiBarangRepository.countByCreatedByAndStatusIn(user,
                    List.of(MutasiStatus.PENDING_PIC, MutasiStatus.PENDING_MANAGER)));
            stats.put("myApproved", mutasiBarangRepository.countByCreatedByAndStatus(user, MutasiStatus.APPROVED));
            stats.put("myRejected", mutasiBarangRepository.countByCreatedByAndStatus(user, MutasiStatus.REJECTED));
        }

        return stats;
    }

    @Transactional
    public String uploadDocument(Long id, MultipartFile file) throws IOException {
        MutasiBarang mutasi = mutasiBarangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MutasiBarang not found"));

        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".pdf";
        String filename = "mutasi-" + id + "-" + UUID.randomUUID() + extension;

        Path filePath = uploadDir.resolve(filename);
        Files.write(filePath, file.getBytes());

        mutasi.setDocumentPath(filePath.toString());
        mutasiBarangRepository.save(mutasi);

        return filePath.toString();
    }

    public byte[] getDocument(Long id, User user) throws IOException {
        MutasiBarang mutasi = mutasiBarangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MutasiBarang not found"));

        if (!canView(mutasi, user)) {
            throw new RuntimeException("Access denied");
        }

        if (mutasi.getDocumentPath() == null) {
            throw new RuntimeException("Document not found");
        }

        Path path = Paths.get(mutasi.getDocumentPath());
        if (!Files.exists(path)) {
            throw new RuntimeException("File not found on server");
        }

        return Files.readAllBytes(path);
    }

    @Transactional
    public Map<String, Object> diagnoseAndFixData() {
        // Fix invalid statuses
        int updatedDraft = entityManager
                .createNativeQuery(
                        "UPDATE mutasi_barang SET status_mutasi = 'PENDING_PIC' WHERE status_mutasi = 'Draft'")
                .executeUpdate();
        int updatedProses = entityManager
                .createNativeQuery(
                        "UPDATE mutasi_barang SET status_mutasi = 'PENDING_MANAGER' WHERE status_mutasi = 'Proses'")
                .executeUpdate();

        // Re-check
        jakarta.persistence.Query queryStatus = entityManager
                .createNativeQuery("SELECT DISTINCT status_mutasi FROM mutasi_barang");
        List<?> results = queryStatus.getResultList();
        List<String> statuses = results.stream()
                .map(obj -> Objects.toString(obj, null))
                .collect(Collectors.toList());

        return Map.of(
                "message", "Data fixed",
                "fixed_draft_count", updatedDraft,
                "fixed_proses_count", updatedProses,
                "current_statuses", statuses);
    }

    // Helper methods
    private User findPICByTeam(User.Team team) {
        User.UserRole picRole;
        switch (team) {
            case TIM_ODC:
                picRole = User.UserRole.ADMINISTRATOR_ODC;
                break;
            case TIM_INFRA:
                picRole = User.UserRole.ADMINISTRATOR_INFRA;
                break;
            case TIM_NETWORK:
                picRole = User.UserRole.ADMINISTRATOR_NETWORK;
                break;
            default:
                picRole = User.UserRole.PIC;
        }
        return userRepository.findByRole(picRole).stream().findFirst().orElse(null);
    }

    private boolean isPICRole(User.UserRole role) {
        return role == User.UserRole.PIC
                || role == User.UserRole.ADMINISTRATOR_ODC
                || role == User.UserRole.ADMINISTRATOR_INFRA
                || role == User.UserRole.ADMINISTRATOR_NETWORK;
    }

    private List<MutasiBarang> filterByRole(List<MutasiBarang> data, User user) {
        return data.stream()
                .filter(m -> canView(m, user))
                .collect(Collectors.toList());
    }

    private boolean canView(MutasiBarang mutasi, User user) {
        try {
            if (mutasi.getCreatedBy() != null && mutasi.getCreatedBy().getId() != null
                    && mutasi.getCreatedBy().getId().equals(user.getId())) {
                return true;
            }
        } catch (Exception e) {
            // Lazy loading issue
        }

        if (user.getRole() == User.UserRole.ADMIN)
            return true;
        if (user.getRole() == User.UserRole.VISITOR)
            return false;

        MutasiStatus status = mutasi.getStatus();
        if (status == null)
            status = MutasiStatus.PENDING_PIC;

        if (isPICRole(user.getRole())) {
            if (status == MutasiStatus.PENDING_PIC)
                return true;
            return status == MutasiStatus.PENDING_MANAGER
                    || status == MutasiStatus.APPROVED
                    || status == MutasiStatus.COMPLETED
                    || status == MutasiStatus.REJECTED;
        }

        if (user.getRole() == User.UserRole.MANAGER) {
            return status == MutasiStatus.PENDING_MANAGER
                    || status == MutasiStatus.APPROVED
                    || status == MutasiStatus.COMPLETED
                    || status == MutasiStatus.REJECTED;
        }

        if (user.getRole() == User.UserRole.SECURITY) {
            return status == MutasiStatus.APPROVED || status == MutasiStatus.COMPLETED;
        }
        return false;
    }
}
