package com.datacenter.workingpermit.service;

import com.datacenter.workingpermit.model.User;
import com.datacenter.workingpermit.model.WorkingPermit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.File;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@datacenter.com}")
    private String fromEmail;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;

    /**
     * Send OTP code via email
     */
    @Async
    public void sendOTPEmail(User recipient, String otpCode, WorkingPermit permit) {
        if (!emailEnabled) {
            log.info("Email disabled. OTP for {}: {}", recipient.getEmail(), otpCode);
            return;
        }

        String subject = "Kode OTP - Working Permit " + permit.getPermitNumber();
        String htmlContent = buildOTPEmailTemplate(recipient, otpCode, permit);

        try {
            sendHtmlEmail(recipient.getEmail(), subject, htmlContent, null);
            log.info("OTP email sent successfully to: {}", recipient.getEmail());
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", recipient.getEmail(), e.getMessage());
        }
    }

    /**
     * Send permit approved email with QR code and OTP
     */
    @Async
    public void sendPermitApprovedEmail(User recipient, WorkingPermit permit, String otpCode) {
        if (!emailEnabled) {
            log.info("Email disabled. Would send approval email to: {}", recipient.getEmail());
            return;
        }

        String subject = "Working Permit Approved - " + permit.getPermitNumber();
        String htmlContent = buildApprovedEmailTemplate(recipient, permit, otpCode);

        try {
            sendHtmlEmail(recipient.getEmail(), subject, htmlContent, permit.getQrCodeImagePath());
            log.info("Permit approved email sent to: {}", recipient.getEmail());
        } catch (Exception e) {
            log.error("Failed to send permit approved email to {}: {}", recipient.getEmail(), e.getMessage());
        }
    }

    /**
     * Send generic HTML email
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent, String attachmentPath)
            throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        if (attachmentPath != null && !attachmentPath.isEmpty()) {
            File file = new File(attachmentPath);
            if (file.exists()) {
                helper.addAttachment(file.getName(), file);
            }
        }

        mailSender.send(mimeMessage);
    }

    /**
     * Build OTP email template
     */
    private String buildOTPEmailTemplate(User recipient, String otpCode, WorkingPermit permit) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea; }
                        .info { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Kode OTP Anda</h1>
                        </div>
                        <div class="content">
                            <p>Halo <strong>%s</strong>,</p>
                            <p>Berikut adalah kode OTP untuk Working Permit Anda:</p>

                            <div class="otp-box">
                                <div class="otp-code">%s</div>
                                <p style="margin-top: 10px; color: #666;">Berlaku selama 5 menit</p>
                            </div>

                            <div class="info">
                                <strong>📋 Detail Permit:</strong><br>
                                Nomor Permit: %s<br>
                                Data Center: %s<br>
                                Jadwal: %s
                            </div>

                            <p>Gunakan kode ini saat check-in di Data Center bersama dengan QR Code Anda.</p>

                            <p><strong>⚠️ Penting:</strong> Jangan bagikan kode OTP ini kepada siapapun.</p>
                        </div>
                        <div class="footer">
                            <p>Data Center Working Permit System</p>
                            <p>Email ini dikirim secara otomatis, mohon tidak membalas.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        recipient.getFullName(),
                        otpCode,
                        permit.getPermitNumber(),
                        permit.getDataCenter().getDisplayName(),
                        permit.getScheduledStartTime());
    }

    /**
     * Build approved email template
     */
    private String buildApprovedEmailTemplate(User recipient, WorkingPermit permit, String otpCode) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .otp-box { background: white; border: 2px dashed #28a745; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #28a745; }
                        .info { background: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .steps { background: white; padding: 20px; border-radius: 10px; margin: 15px 0; }
                        .step { display: flex; align-items: center; margin: 10px 0; }
                        .step-num { background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%%; text-align: center; line-height: 30px; margin-right: 15px; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Permit Disetujui!</h1>
                        </div>
                        <div class="content">
                            <p>Halo <strong>%s</strong>,</p>
                            <p>Selamat! Working Permit Anda telah <strong>DISETUJUI</strong>.</p>

                            <div class="info">
                                <strong>📋 Detail Permit:</strong><br>
                                Nomor Permit: <strong>%s</strong><br>
                                Data Center: %s<br>
                                Tujuan: %s<br>
                                Jadwal: %s s/d %s
                            </div>

                            <div class="otp-box">
                                <p><strong>Kode OTP Anda:</strong></p>
                                <div class="otp-code">%s</div>
                                <p style="margin-top: 10px; color: #666;">Berlaku selama 5 menit</p>
                            </div>

                            <div class="steps">
                                <h3>📝 Langkah Check-in:</h3>
                                <div class="step"><span class="step-num">1</span> Tunjukkan QR Code (terlampir) kepada Security</div>
                                <div class="step"><span class="step-num">2</span> Masukkan kode OTP di atas</div>
                                <div class="step"><span class="step-num">3</span> Verifikasi wajah dengan kamera</div>
                                <div class="step"><span class="step-num">4</span> Terima ID Card sementara</div>
                            </div>

                            <p><strong>⚠️ Catatan Penting:</strong></p>
                            <ul>
                                <li>Simpan email ini dan tunjukkan saat check-in</li>
                                <li>QR Code terlampir dalam email ini</li>
                                <li>Jika OTP expired, minta regenerate di sistem</li>
                            </ul>
                        </div>
                        <div class="footer">
                            <p>Data Center Working Permit System</p>
                            <p>Hubungi PIC Anda jika ada pertanyaan.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        recipient.getFullName(),
                        permit.getPermitNumber(),
                        permit.getDataCenter().getDisplayName(),
                        permit.getVisitPurpose(),
                        permit.getScheduledStartTime(),
                        permit.getScheduledEndTime(),
                        otpCode);
    }
}
