package com.datacenter.workingpermit.controller;

import com.datacenter.workingpermit.model.MutasiBarang;
import com.datacenter.workingpermit.model.User;
import com.datacenter.workingpermit.repository.UserRepository;
import com.datacenter.workingpermit.service.MutasiBarangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mutasi-barang")
public class MutasiBarangController {

    @Autowired
    private MutasiBarangService mutasiBarangService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createMutasiBarang(@RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            User user = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            MutasiBarang saved = mutasiBarangService.createMutasi(request, user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllMutasiBarang(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        }

        List<MutasiBarang> allData = mutasiBarangService.getAllMutasi(user);
        return ResponseEntity.ok(allData);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMutasiBarangById(@PathVariable Long id, Authentication authentication) {
        try {
            User user = null;
            if (authentication != null) {
                user = userRepository.findByUsername(authentication.getName()).orElse(null);
            }
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            return mutasiBarangService.getById(id, user)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMutasiBarang(@PathVariable Long id, @RequestBody MutasiBarang mutasiBarang) {
        try {
            MutasiBarang updated = mutasiBarangService.updateMutasi(id, mutasiBarang);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMutasiBarang(@PathVariable Long id) {
        try {
            mutasiBarangService.deleteMutasi(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingApprovals(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        }

        List<MutasiBarang> pending = mutasiBarangService.getPendingApprovals(user);
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/{id}/approve/pic")
    public ResponseEntity<?> approvePIC(@PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            User user = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            String notes = request != null ? request.get("notes") : null;
            mutasiBarangService.approvePIC(id, notes, user);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Mutasi barang approved by PIC, waiting for Manager approval"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve/manager")
    public ResponseEntity<?> approveManager(@PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            User user = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            String notes = request != null ? request.get("notes") : null;
            mutasiBarangService.approveManager(id, notes, user);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Mutasi barang fully approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            User user = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rejection reason is required"));
            }

            mutasiBarangService.reject(id, reason, user);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Mutasi barang rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            mutasiBarangService.complete(id);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Mutasi barang marked as completed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        }

        Map<String, Object> stats = mutasiBarangService.getStats(user);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<?> uploadDocument(@PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            String filePath = mutasiBarangService.uploadDocument(id, file);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "filePath", filePath,
                    "message", "File uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/document")
    public ResponseEntity<?> getDocument(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            User user = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            byte[] fileContent = mutasiBarangService.getDocument(id, user);

            String contentType = "application/pdf"; // Default
            // Detect type based on file signature or extension if needed, but PDF/Image is
            // likely.
            // For now, let browser detect or default to PDF (since we mostly upload PDF).
            // Better: Check file content or similar.
            // Let's rely on browser sniffing or set generic binary if unsure, but PDF is
            // safe default for viewers.

            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .body(fileContent);

        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/diagnose-data")
    public ResponseEntity<?> diagnoseAndFixData() {
        try {
            Map<String, Object> result = mutasiBarangService.diagnoseAndFixData();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/teams")
    public ResponseEntity<?> getTeams() {
        List<Map<String, String>> teams = List.of(
                Map.of("id", "TIM_ODC", "name", "Tim ODC"),
                Map.of("id", "TIM_INFRA", "name", "Tim INFRA"),
                Map.of("id", "TIM_NETWORK", "name", "Tim Network"),
                Map.of("id", "TIM_SECURITY", "name", "Tim Security"));
        return ResponseEntity.ok(teams);
    }
}
