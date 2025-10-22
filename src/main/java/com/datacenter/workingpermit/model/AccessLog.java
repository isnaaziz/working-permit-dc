package com.datacenter.workingpermit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "access_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permit_id", nullable = false)
    private WorkingPermit workingPermit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Visitor yang melakukan akses

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessType accessType;

    @Column(nullable = false)
    private String location; // Lokasi akses (misal: "Main Entrance", "Server Room A")

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessStatus status;

    private String remarks; // Catatan tambahan

    private String deviceId; // ID perangkat akses kontrol

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }

    public enum AccessType {
        CHECK_IN, // Check-in di lobby
        ENTRY, // Masuk ke area tertentu
        EXIT, // Keluar dari area tertentu
        CHECK_OUT, // Check-out final
        DENIED // Akses ditolak
    }

    public enum AccessStatus {
        SUCCESS, // Akses berhasil
        FAILED, // Akses gagal
        UNAUTHORIZED // Tidak terautori
    }
}
