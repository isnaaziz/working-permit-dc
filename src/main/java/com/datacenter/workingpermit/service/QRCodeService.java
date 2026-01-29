package com.datacenter.workingpermit.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.util.Base64;
import java.util.UUID;

@Service
public class QRCodeService {

    @Value("${app.qrcode.width:300}")
    private int qrCodeWidth;

    @Value("${app.qrcode.height:300}")
    private int qrCodeHeight;

    /**
     * Generate QR Code data string (unique identifier)
     */
    public String generateQRCodeData(Long permitId) {
        return String.format("PERMIT-%d-%s", permitId, UUID.randomUUID().toString());
    }

    /**
     * Generate QR Code image as byte array
     */
    public byte[] generateQRCodeImage(String qrCodeData) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(
                qrCodeData,
                BarcodeFormat.QR_CODE,
                qrCodeWidth,
                qrCodeHeight);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        return outputStream.toByteArray();
    }

    /**
     * Generate QR Code as Base64 string for embedding in HTML
     */
    public String generateQRCodeBase64(String qrCodeData) throws WriterException, IOException {
        byte[] imageBytes = generateQRCodeImage(qrCodeData);
        return Base64.getEncoder().encodeToString(imageBytes);
    }

    /**
     * Save QR Code to file and return file path
     */
    public String saveQRCodeToFile(String qrCodeData, String fileName) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(
                qrCodeData,
                BarcodeFormat.QR_CODE,
                qrCodeWidth,
                qrCodeHeight);

        String filePath = "uploads/qrcodes/" + fileName + ".png";
        Path path = FileSystems.getDefault().getPath(filePath);
        if (path.getParent() != null) {
            java.nio.file.Files.createDirectories(path.getParent());
        }
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", path);

        return filePath;
    }

    /**
     * Validate QR Code format
     */
    public boolean isValidQRCodeData(String qrCodeData) {
        return qrCodeData != null && qrCodeData.startsWith("PERMIT-");
    }

    /**
     * Extract permit ID from QR code data
     */
    public Long extractPermitId(String qrCodeData) {
        if (!isValidQRCodeData(qrCodeData)) {
            return null;
        }

        try {
            String[] parts = qrCodeData.split("-");
            if (parts.length >= 2) {
                return Long.parseLong(parts[1]);
            }
        } catch (NumberFormatException e) {
            return null;
        }

        return null;
    }
}
