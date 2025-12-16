package com.datacenter.workingpermit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "approvals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Approval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permit_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private WorkingPermit workingPermit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User approver; // PIC atau Manager yang melakukan approval

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalLevel level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status;

    @Column(length = 1000)
    private String comments; // Komentar atau alasan

    private LocalDateTime reviewedAt; // Waktu melakukan review

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum ApprovalLevel {
        PIC_REVIEW, // Review oleh PIC
        MANAGER_APPROVAL // Final approval oleh Manager
    }

    public enum ApprovalStatus {
        PENDING, // Menunggu review
        APPROVED, // Disetujui
        REJECTED // Ditolak
    }
}
