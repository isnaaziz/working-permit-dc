package com.datacenter.workingpermit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient; // Penerima notifikasi

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permit_id")
    private WorkingPermit workingPermit; // Izin terkait (optional)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String subject;

    @Column(length = 2000, nullable = false)
    private String message;

    @Column(nullable = false)
    private Boolean isRead = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryChannel channel;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;

    private LocalDateTime sentAt;

    private LocalDateTime readAt;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum NotificationType {
        PERMIT_SUBMITTED, // Permohonan izin diajukan
        PERMIT_APPROVED, // Izin disetujui
        PERMIT_REJECTED, // Izin ditolak
        APPROVAL_REQUIRED, // Memerlukan approval
        OTP_CODE, // Kode OTP
        QR_CODE_ISSUED, // QR Code diterbitkan
        CHECK_IN_SUCCESS, // Check-in berhasil
        CHECK_OUT_SUCCESS, // Check-out berhasil
        ACCESS_DENIED, // Akses ditolak
        PERMIT_EXPIRING, // Izin akan kadaluarsa
        VISIT_REMINDER // Pengingat kunjungan
    }

    public enum DeliveryChannel {
        EMAIL,
        SMS,
        IN_APP, // Notifikasi dalam aplikasi
        ALL // Semua channel
    }

    public enum DeliveryStatus {
        PENDING,
        SENT,
        FAILED,
        DELIVERED
    }
}
