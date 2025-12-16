package com.datacenter.workingpermit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "temp_id_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TempIdCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permit_id", nullable = false, unique = true)
    private WorkingPermit workingPermit;

    @Column(nullable = false, unique = true)
    private String cardNumber; // Nomor kartu sementara

    @Column(nullable = false, unique = true)
    private String rfidTag; // Tag RFID untuk akses kontrol

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    private LocalDateTime deactivatedAt;

    private String deactivationReason;

    @PrePersist
    protected void onCreate() {
        issuedAt = LocalDateTime.now();
    }
}
