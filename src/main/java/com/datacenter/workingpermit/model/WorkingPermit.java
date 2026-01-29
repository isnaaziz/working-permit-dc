package com.datacenter.workingpermit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "working_permits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkingPermit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String permitNumber; // Nomor izin unik

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visitor_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User visitor; // Pengunjung yang mengajukan

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pic_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User pic; // Person In Charge internal

    @Column(nullable = false)
    private String visitPurpose; // Tujuan kunjungan (Audit, Maintenance, dll)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisitType visitType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DataCenter dataCenter;

    @Column(nullable = false)
    private LocalDateTime scheduledStartTime;

    @Column(nullable = false)
    private LocalDateTime scheduledEndTime;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "permit_equipment", joinColumns = @JoinColumn(name = "permit_id"))
    @Column(name = "equipment")
    private List<String> equipmentList = new ArrayList<>(); // Daftar peralatan yang dibawa

    private String workOrderDocument; // Path ke file surat tugas

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PermitStatus status;

    private String qrCodeData; // Data unik untuk QR code

    @Transient
    private String qrCodeBase64; // Base64 image data for frontend display

    private String qrCodeImagePath; // Path ke file QR code image

    private String otpCode; // Kode 2FA sementara

    private LocalDateTime otpExpiryTime; // Waktu kadaluarsa OTP

    private LocalDateTime actualCheckInTime; // Waktu check-in aktual

    private LocalDateTime actualCheckOutTime; // Waktu check-out aktual

    private String rejectionReason; // Alasan jika ditolak

    @Builder.Default
    @OneToMany(mappedBy = "workingPermit", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Approval> approvals = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "workingPermit", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<AccessLog> accessLogs = new ArrayList<>();

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PermitStatus {
        DRAFT, // Masih draft
        PENDING_PIC, // Menunggu review PIC
        PENDING_MANAGER, // Menunggu approval Manager
        APPROVED, // Disetujui, QR code diterbitkan
        REJECTED, // Ditolak
        ACTIVE, // Visitor sudah check-in
        COMPLETED, // Kunjungan selesai, sudah check-out
        CANCELLED, // Dibatalkan
        EXPIRED // Kadaluarsa
    }

    public enum VisitType {
        PREVENTIVE_MAINTENANCE("Preventive Maintenance"),
        ASSESSMENT("Assessment"),
        TROUBLESHOOT("Troubleshoot"),
        CABLE_PULLING("Cable Pulling"),
        AUDIT("Audit"),
        INSTALLATION("Installation"),
        VISIT("Visit/Meeting");

        private final String displayName;

        VisitType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum DataCenter {
        DC1("Data Center 1"),
        DC2("Data Center 2"),
        DC3("Data Center 3");

        private final String displayName;

        DataCenter(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
