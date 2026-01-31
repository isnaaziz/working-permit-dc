package com.datacenter.workingpermit.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
public class MutasiBarang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomor;
    private String tanggal;
    private String nama;
    private String jabatan;
    private String email;
    private String telepon;

    // Data Center location (like permit)
    @Enumerated(EnumType.STRING)
    private WorkingPermit.DataCenter lokasi;

    private String tandaTanganDC;
    private String tandaTanganPersonel;

    // File attachment path
    private String documentPath;

    // Who created this record
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User createdBy;

    // Team pendamping (Tim ODC/Tim INFRA/Tim Network)
    @Enumerated(EnumType.STRING)
    private User.Team teamPendamping;

    // === APPROVAL FLOW (like permit) ===
    @Enumerated(EnumType.STRING)
    @Column(name = "status_mutasi")
    private MutasiStatus status = MutasiStatus.PENDING_PIC;

    // PIC who will approve (based on team)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pic_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User pic;

    // Manager who approved
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_manager_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User approvedByManager;

    // PIC approval details
    private LocalDateTime picApprovedAt;
    private String picNotes;

    // Manager approval details
    private LocalDateTime managerApprovedAt;
    private String managerNotes;

    // Rejection details
    private String rejectionReason;
    private LocalDateTime rejectedAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rejected_by_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User rejectedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = MutasiStatus.PENDING_PIC;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "mutasi_barang_id")
    private List<KeteranganPerangkat> keterangan;

    // Status enum for approval flow
    public enum MutasiStatus {
        PENDING_PIC, // Menunggu approval PIC
        PENDING_MANAGER, // Menunggu approval Manager
        APPROVED, // Disetujui
        REJECTED, // Ditolak
        COMPLETED, // Mutasi selesai dilakukan
        CANCELLED // Dibatalkan
    }
}
