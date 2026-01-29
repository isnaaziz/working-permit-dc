package com.datacenter.workingpermit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckInRequest {

    @NotBlank(message = "QR code data is required")
    private String qrCodeData;

    @NotBlank(message = "OTP code is required")
    private String otpCode;

    private String location; // Lokasi check-in
}
