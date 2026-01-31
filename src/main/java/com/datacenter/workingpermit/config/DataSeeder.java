package com.datacenter.workingpermit.config;

import com.datacenter.workingpermit.model.*;
import com.datacenter.workingpermit.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

        private final UserRepository userRepository;
        private final WorkingPermitRepository permitRepository;
        private final ApprovalRepository approvalRepository;
        private final TempIdCardRepository idCardRepository;
        private final PasswordEncoder passwordEncoder;

        private final AtomicInteger permitCounter = new AtomicInteger(1);

        @Override
        @Transactional
        public void run(String... args) throws Exception {
                // Check if data already exists
                if (userRepository.count() > 0) {
                        log.info("Database already contains data. Skipping seeding.");
                        return;
                }

                log.info("Starting database seeding...");

                // Create Users
                User visitor1 = createUser("visitor1", "Visitor One", "visitor1@example.com",
                                "081234567890", "PT Visitor Corp", "3201234567890123", User.UserRole.VISITOR, null);

                User visitor2 = createUser("puspaaaa", "Puspa Indah", "puspa@example.com",
                                "081234567891", "PT Digital Solutions", "3201234567890124", User.UserRole.VISITOR, null);

                User pic1 = createUser("pic1", "John Doe (PIC)", "pic1@datacenter.com",
                                "081234567892", "Data Center Corp", "3201234567890125", User.UserRole.PIC, User.Team.TIM_ODC);

                User pic2 = createUser("pic2", "Jane Smith (PIC)", "pic2@datacenter.com",
                                "081234567893", "Data Center Corp", "3201234567890126", User.UserRole.PIC, User.Team.TIM_INFRA);

                User picNetwork = createUser("pic3", "Ahmad Network (PIC)", "pic3@datacenter.com",
                                "081234567897", "Data Center Corp", "3201234567890130", User.UserRole.PIC, User.Team.TIM_NETWORK);

                User manager1 = createUser("manager1", "Manager One", "manager1@datacenter.com",
                                "081234567894", "Data Center Corp", "3201234567890127", User.UserRole.MANAGER, null);

                // Create additional permits for picNetwork
                createPermitsForVisitor(visitor1, picNetwork, manager1);

                createUser("security1", "Security Guard", "security1@datacenter.com",
                                "081234567895", "Data Center Corp", "3201234567890128", User.UserRole.SECURITY, User.Team.TIM_SECURITY);

                createUser("admin", "System Admin", "admin@datacenter.com",
                                "081234567896", "Data Center Corp", "3201234567890129", User.UserRole.ADMIN, null);

                // Create Administrator roles for each team
                createUser("admin_odc", "Administrator ODC", "admin_odc@datacenter.com",
                                "081234567901", "Data Center Corp", "3201234567890131", User.UserRole.ADMINISTRATOR_ODC, User.Team.TIM_ODC);

                createUser("admin_infra", "Administrator INFRA", "admin_infra@datacenter.com",
                                "081234567902", "Data Center Corp", "3201234567890132", User.UserRole.ADMINISTRATOR_INFRA, User.Team.TIM_INFRA);

                createUser("admin_network", "Administrator Network", "admin_network@datacenter.com",
                                "081234567903", "Data Center Corp", "3201234567890133", User.UserRole.ADMINISTRATOR_NETWORK, User.Team.TIM_NETWORK);

                log.info("Created {} users", userRepository.count());

                // Create Working Permits for puspaaaa (visitor2)
                createPermitsForVisitor(visitor2, pic1, manager1);

                // Create Working Permits for visitor1
                createPermitsForVisitor(visitor1, pic2, manager1);

                log.info("Created {} working permits", permitRepository.count());
                log.info("Database seeding completed successfully!");

                // Print test credentials
                printTestCredentials();
        }

        private User createUser(String username, String fullName, String email, String phone,
                        String company, String idCardNumber, User.UserRole role, User.Team team) {
                User user = User.builder()
                                .username(username)
                                .password(passwordEncoder.encode("password123"))
                                .fullName(fullName)
                                .email(email)
                                .phoneNumber(phone)
                                .company(company)
                                .idCardNumber(idCardNumber)
                                .role(role)
                                .team(team)
                                .enabled(true)
                                .accountNonExpired(true)
                                .accountNonLocked(true)
                                .credentialsNonExpired(true)
                                .build();

                return userRepository.save(user);
        }

        private String generatePermitNumber() {
                String today = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
                return String.format("WP-%s-%04d", today, permitCounter.getAndIncrement());
        }

        private void createPermitsForVisitor(User visitor, User pic, User manager) {
                // Permit 1: PENDING_PIC - Baru diajukan
                WorkingPermit permit1 = WorkingPermit.builder()
                                .permitNumber(generatePermitNumber())
                                .visitor(visitor)
                                .pic(pic)
                                .visitPurpose("Server Maintenance")
                                .visitType(WorkingPermit.VisitType.PREVENTIVE_MAINTENANCE)
                                .dataCenter(WorkingPermit.DataCenter.DC1)
                                .scheduledStartTime(LocalDateTime.now().plusDays(2))
                                .scheduledEndTime(LocalDateTime.now().plusDays(2).plusHours(4))
                                .equipmentList(Arrays.asList("Laptop", "Toolkit", "Multimeter"))
                                .status(WorkingPermit.PermitStatus.PENDING_PIC)
                                .build();
                permitRepository.save(permit1);

                // Permit 2: PENDING_MANAGER - Sudah di-approve PIC
                WorkingPermit permit2 = WorkingPermit.builder()
                                .permitNumber(generatePermitNumber())
                                .visitor(visitor)
                                .pic(pic)
                                .visitPurpose("Network Cable Installation")
                                .visitType(WorkingPermit.VisitType.CABLE_PULLING)
                                .dataCenter(WorkingPermit.DataCenter.DC2)
                                .scheduledStartTime(LocalDateTime.now().plusDays(3))
                                .scheduledEndTime(LocalDateTime.now().plusDays(3).plusHours(6))
                                .equipmentList(Arrays.asList("Cable Tester", "Cable Crimper", "Network Cables"))
                                .status(WorkingPermit.PermitStatus.PENDING_MANAGER)
                                .build();
                permitRepository.save(permit2);

                // Create PIC approval (approved)
                Approval picApproval = Approval.builder()
                                .workingPermit(permit2)
                                .approver(pic)
                                .level(Approval.ApprovalLevel.PIC_REVIEW)
                                .status(Approval.ApprovalStatus.APPROVED)
                                .comments("Approved for network installation")
                                .reviewedAt(LocalDateTime.now().minusHours(2))
                                .build();
                approvalRepository.save(picApproval);

                // Create Manager approval (pending)
                Approval managerApproval = Approval.builder()
                                .workingPermit(permit2)
                                .approver(manager)
                                .level(Approval.ApprovalLevel.MANAGER_APPROVAL)
                                .status(Approval.ApprovalStatus.PENDING)
                                .build();
                approvalRepository.save(managerApproval);

                // Permit 3: APPROVED - Siap untuk check-in
                WorkingPermit permit3 = WorkingPermit.builder()
                                .permitNumber(generatePermitNumber())
                                .visitor(visitor)
                                .pic(pic)
                                .visitPurpose("Security Audit Assessment")
                                .visitType(WorkingPermit.VisitType.AUDIT)
                                .dataCenter(WorkingPermit.DataCenter.DC1)
                                .scheduledStartTime(LocalDateTime.now().plusDays(1))
                                .scheduledEndTime(LocalDateTime.now().plusDays(1).plusHours(3))
                                .equipmentList(Arrays.asList("Laptop", "Scanner", "Camera"))
                                .status(WorkingPermit.PermitStatus.APPROVED)
                                .qrCodeData("QR-AUDIT-" + System.currentTimeMillis())
                                .otpCode("123456")
                                .otpExpiryTime(LocalDateTime.now().plusDays(1).plusMinutes(5))
                                .build();
                permitRepository.save(permit3);

                // Permit 4: ACTIVE - Sedang berlangsung
                WorkingPermit permit4 = WorkingPermit.builder()
                                .permitNumber(generatePermitNumber())
                                .visitor(visitor)
                                .pic(pic)
                                .visitPurpose("Equipment Installation")
                                .visitType(WorkingPermit.VisitType.INSTALLATION)
                                .dataCenter(WorkingPermit.DataCenter.DC1)
                                .scheduledStartTime(LocalDateTime.now().minusHours(1))
                                .scheduledEndTime(LocalDateTime.now().plusHours(3))
                                .equipmentList(Arrays.asList("Server Rack", "UPS", "Tools"))
                                .status(WorkingPermit.PermitStatus.ACTIVE)
                                .qrCodeData("QR-INSTALL-" + System.currentTimeMillis())
                                .actualCheckInTime(LocalDateTime.now().minusHours(1))
                                .build();
                permitRepository.save(permit4);

                // Create TempIdCard for Active Permit to prevent "ID card not found" error
                // during checkout
                TempIdCard idCard4 = TempIdCard.builder()
                                .workingPermit(permit4)
                                .cardNumber("TMP-" + System.currentTimeMillis())
                                .rfidTag("RF-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                .issuedAt(LocalDateTime.now().minusHours(1))
                                .expiresAt(permit4.getScheduledEndTime())
                                .isActive(true)
                                .build();
                idCardRepository.save(idCard4);

                // Permit 5: COMPLETED - Sudah selesai
                WorkingPermit permit5 = WorkingPermit.builder()
                                .permitNumber(generatePermitNumber())
                                .visitor(visitor)
                                .pic(pic)
                                .visitPurpose("Router Replacement")
                                .visitType(WorkingPermit.VisitType.PREVENTIVE_MAINTENANCE)
                                .dataCenter(WorkingPermit.DataCenter.DC2)
                                .scheduledStartTime(LocalDateTime.now().minusDays(1))
                                .scheduledEndTime(LocalDateTime.now().minusDays(1).plusHours(2))
                                .equipmentList(Arrays.asList("Router", "Cables", "Tools"))
                                .status(WorkingPermit.PermitStatus.COMPLETED)
                                .qrCodeData("QR-REPLACE-" + System.currentTimeMillis())
                                .actualCheckInTime(LocalDateTime.now().minusDays(1))
                                .actualCheckOutTime(LocalDateTime.now().minusDays(1).plusHours(2))
                                .build();
                permitRepository.save(permit5);

                // Permit 6: REJECTED - Ditolak
                WorkingPermit permit6 = WorkingPermit.builder()
                                .permitNumber(generatePermitNumber())
                                .visitor(visitor)
                                .pic(pic)
                                .visitPurpose("Unauthorized Access Test")
                                .visitType(WorkingPermit.VisitType.AUDIT)
                                .dataCenter(WorkingPermit.DataCenter.DC1)
                                .scheduledStartTime(LocalDateTime.now().plusDays(5))
                                .scheduledEndTime(LocalDateTime.now().plusDays(5).plusHours(2))
                                .equipmentList(Arrays.asList("Testing Tools"))
                                .status(WorkingPermit.PermitStatus.REJECTED)
                                .rejectionReason("Unauthorized test not allowed")
                                .build();
                permitRepository.save(permit6);

                // Create rejection approval
                Approval rejection = Approval.builder()
                                .workingPermit(permit6)
                                .approver(pic)
                                .level(Approval.ApprovalLevel.PIC_REVIEW)
                                .status(Approval.ApprovalStatus.REJECTED)
                                .comments("Unauthorized test not allowed")
                                .reviewedAt(LocalDateTime.now().minusHours(1))
                                .build();
                approvalRepository.save(rejection);
        }

        private void printTestCredentials() {
                System.out.println("\n" + "=".repeat(80));
                System.out.println("TEST CREDENTIALS - All passwords: password123");
                System.out.println("=".repeat(80));
                System.out.println(String.format("%-15s | %-25s | %-20s | %-12s", "USERNAME", "FULL NAME", "ROLE", "TEAM"));
                System.out.println("-".repeat(80));
                System.out.println(String.format("%-15s | %-25s | %-20s | %-12s", "visitor1", "Visitor One", "VISITOR", "-"));
                System.out.println(String.format("%-15s | %-25s | %-20s | %-12s", "puspaaaa", "Puspa Indah", "VISITOR", "-"));
                System.out.println(String.format("%-15s | %-25s | %-20s | %-12s", "pic1", "John Doe (PIC)", "PIC", "Tim ODC"));
                System.out.println(String.format("%-15s | %-25s | %-20s | %-12s", "pic2", "Jane Smith (PIC)", "PIC", "Tim INFRA"));
                System.out.println(String.format("%-15s | %-25s | %-20s | %-12s", "pic3", "Ahmad Network (PIC)", "PIC", "Tim Network"));
                System.out.println(String.format("%-15s | %-25s | %-20s | %-12s", "manager1", "Manager One", "MANAGER", "-"));
                System.out.println(String.format("%-15s | %-25s | %-20s | %-12s", "security1", "Security Guard", "SECURITY", "Tim Security"));
                System.out.println(String.format("%-15s | %-25s | %-20s | %-12s", "admin", "System Admin", "ADMIN", "-"));
                System.out.println(String.format("%-15s | %-25s | %-20s | %-12s", "admin_odc", "Administrator ODC", "ADMINISTRATOR_ODC", "Tim ODC"));
                System.out.println(String.format("%-15s | %-25s | %-20s | %-12s", "admin_infra", "Administrator INFRA", "ADMINISTRATOR_INFRA", "Tim INFRA"));
                System.out.println(String.format("%-15s | %-25s | %-20s | %-12s", "admin_network", "Administrator Network", "ADMINISTRATOR_NETWORK", "Tim Network"));
                System.out.println("=".repeat(80));
                System.out.println("Frontend URL: http://localhost:8080");
                System.out.println("Each visitor has 6 permits with different statuses for testing");
                System.out.println("=".repeat(80) + "\n");
        }
}
