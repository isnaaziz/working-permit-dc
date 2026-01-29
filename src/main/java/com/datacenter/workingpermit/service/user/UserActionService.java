package com.datacenter.workingpermit.service.user;

import com.datacenter.workingpermit.dto.UserRegistrationRequest;
import com.datacenter.workingpermit.model.User;
import com.datacenter.workingpermit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserActionService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Register new user from DTO
     */
    @Transactional
    public User registerUser(UserRegistrationRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Convert DTO to User entity
        User user = User.builder()
                .username(request.getUsername())
                .password(request.getPassword()) // Will be encoded below
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .company(request.getCompany())
                .idCardNumber(request.getIdCardNumber())
                .role(User.UserRole.valueOf(request.getRole()))
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();

        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    /**
     * Register new user
     */
    @Transactional
    public User registerUser(User user) {
        // Check if username already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    /**
     * Update user profile
     */
    @Transactional
    public User updateUser(Long userId, User updatedUser) {
        if (userId == null)
            throw new IllegalArgumentException("User ID cannot be null");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(updatedUser.getFullName());
        user.setEmail(updatedUser.getEmail());
        user.setPhoneNumber(updatedUser.getPhoneNumber());
        user.setCompany(updatedUser.getCompany());

        return userRepository.save(user);
    }

    /**
     * Change password
     */
    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        if (userId == null)
            throw new IllegalArgumentException("User ID cannot be null");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Invalid old password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Enable/Disable user
     */
    @Transactional
    public void toggleUserStatus(Long userId, boolean enabled) {
        if (userId == null)
            throw new IllegalArgumentException("User ID cannot be null");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(enabled);
        userRepository.save(user);
    }

    /**
     * Delete user
     */
    @Transactional
    public void deleteUser(Long userId) {
        if (userId == null)
            throw new IllegalArgumentException("User ID cannot be null");
        userRepository.deleteById(userId);
    }
}
