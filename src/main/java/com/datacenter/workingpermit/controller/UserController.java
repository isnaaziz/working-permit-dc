package com.datacenter.workingpermit.controller;

import com.datacenter.workingpermit.model.User;
import com.datacenter.workingpermit.service.user.UserActionService;
import com.datacenter.workingpermit.service.user.UserRetrievalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User Controller
 * Handles user management operations
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRetrievalService userRetrievalService;
    private final UserActionService userActionService;

    /**
     * Get user by ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userRetrievalService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Get user by username
     * GET /api/users/username/{username}
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userRetrievalService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    /**
     * Get users by role
     * GET /api/users/role/{role}
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
        List<User> users = userRetrievalService.getUsersByRole(userRole);
        return ResponseEntity.ok(users);
    }

    /**
     * Get all users
     * GET /api/users
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRetrievalService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Update user profile
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> updates) {

        User user = userRetrievalService.getUserById(id);

        if (updates.containsKey("fullName")) {
            user.setFullName(updates.get("fullName"));
        }
        if (updates.containsKey("email")) {
            user.setEmail(updates.get("email"));
        }
        if (updates.containsKey("phoneNumber")) {
            user.setPhoneNumber(updates.get("phoneNumber"));
        }
        if (updates.containsKey("company")) {
            user.setCompany(updates.get("company"));
        }

        userActionService.updateUser(id, user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User updated successfully");

        return ResponseEntity.ok(response);
    }
}
