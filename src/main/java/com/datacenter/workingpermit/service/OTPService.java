package com.datacenter.workingpermit.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OTPService {

    @Value("${app.otp.length:6}")
    private int otpLength;

    @Value("${app.otp.expiration:300000}") // 5 minutes in milliseconds
    private long otpExpirationTime;

    private final Map<String, OTPData> otpStore = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    /**
     * Generate OTP code
     */
    public String generateOTP() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    /**
     * Generate and store OTP for a permit
     */
    public String generateAndStoreOTP(Long permitId) {
        String otp = generateOTP();
        LocalDateTime expiryTime = LocalDateTime.now().plusSeconds(otpExpirationTime / 1000);

        String key = "PERMIT-" + permitId;
        otpStore.put(key, new OTPData(otp, expiryTime));

        return otp;
    }

    /**
     * Verify OTP code
     */
    public boolean verifyOTP(Long permitId, String otpCode) {
        String key = "PERMIT-" + permitId;
        OTPData otpData = otpStore.get(key);

        if (otpData == null) {
            return false;
        }

        // Check if expired
        if (LocalDateTime.now().isAfter(otpData.expiryTime)) {
            otpStore.remove(key);
            return false;
        }

        // Check if code matches
        if (otpData.code.equals(otpCode)) {
            otpStore.remove(key); // Remove after successful verification
            return true;
        }

        return false;
    }

    /**
     * Verify OTP code against WorkingPermit entity (Persistent verification)
     */
    public boolean verifyOTP(com.datacenter.workingpermit.model.WorkingPermit permit, String otpCode) {
        if (permit.getOtpCode() == null || permit.getOtpExpiryTime() == null) {
            return false;
        }

        // Check if expired
        if (LocalDateTime.now().isAfter(permit.getOtpExpiryTime())) {
            return false;
        }

        // Check if code matches
        return permit.getOtpCode().equals(otpCode);
    }

    /**
     * Check if OTP is expired
     */
    public boolean isOTPExpired(Long permitId) {
        String key = "PERMIT-" + permitId;
        OTPData otpData = otpStore.get(key);

        if (otpData == null) {
            return true;
        }

        return LocalDateTime.now().isAfter(otpData.expiryTime);
    }

    /**
     * Invalidate OTP
     */
    public void invalidateOTP(Long permitId) {
        String key = "PERMIT-" + permitId;
        otpStore.remove(key);
    }

    /**
     * Get OTP expiry time
     */
    public LocalDateTime getOTPExpiryTime(Long permitId) {
        String key = "PERMIT-" + permitId;
        OTPData otpData = otpStore.get(key);

        return otpData != null ? otpData.expiryTime : null;
    }

    /**
     * Clean up expired OTPs (should be called periodically)
     */
    public void cleanupExpiredOTPs() {
        LocalDateTime now = LocalDateTime.now();
        otpStore.entrySet().removeIf(entry -> now.isAfter(entry.getValue().expiryTime));
    }

    // Inner class to store OTP data
    private static class OTPData {
        private final String code;
        private final LocalDateTime expiryTime;

        public OTPData(String code, LocalDateTime expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }
    }
}
