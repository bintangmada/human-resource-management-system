package com.hrms.enterprise.auth.service.impl;

import com.hrms.enterprise.auth.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;

/**
 * Implementasi EmailService:
 * Mengirim email menggunakan JavaMailSender jika dikonfigurasi.
 * Jika tidak dikonfigurasi (e.g. dalam mode pengembangan lokal), sistem otomatis
 * menggunakan fallback simulasi dengan mencetak log ke console/stdout agar server tetap berjalan lancar.
 */
@Service
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:8020}")
    private String baseUrl;

    @Override
    public void sendVerificationEmail(String toEmail, String ownerName, String subdomain, String token,
                                      String adminPassword, String hrPassword, String financePassword) {
        // Menggunakan baseUrl yang dinamis untuk lingkungan lokal maupun production
        String verificationUrl = baseUrl + "/api/v1/tenants/confirm?subdomain=" + subdomain + "&token=" + token;
        
        StringBuilder creds = new StringBuilder();
        creds.append("\nKredensial Akun Sementara Anda:\n");
        creds.append(String.format("- Akun Utama / Super Admin:\n  Email: %s\n  Password Sementara: %s\n", toEmail, adminPassword));
        
        if (hrPassword != null && !hrPassword.isEmpty()) {
            creds.append(String.format("- Akun HR Manager:\n  Password Sementara: %s\n", hrPassword));
        }
        if (financePassword != null && !financePassword.isEmpty()) {
            creds.append(String.format("- Akun Finance Manager:\n  Password Sementara: %s\n", financePassword));
        }

        String subject = "Verifikasi Registrasi HRMS Enterprise - " + subdomain;
        String messageBody = String.format(
                "Yth. %s,\n\n" +
                "Terima kasih telah mendaftarkan perusahaan Anda di HRMS Enterprise.\n" +
                "Silakan klik tautan di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan ruang kerja (workspace) Anda:\n\n" +
                "%s\n\n" +
                "%s\n" +
                "Salam,\n" +
                "Tim HRMS Enterprise",
                ownerName, verificationUrl, creds.toString()
        );

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(messageBody);
                mailSender.send(message);
                System.out.println(">>> [EMAIL] Real email sent successfully to: " + toEmail);
                return;
            } catch (Exception e) {
                System.err.println(">>> [EMAIL] Failed to send real email: " + e.getMessage());
            }
        }

        // Fallback simulasi cetak di console untuk mempermudah testing lokal
        System.out.println("==========================================================================");
        System.out.println(">>> [SIMULASI EMAIL VERIFIKASI] LOG EMAIL DIKIRIM:");
        System.out.println(">>> Penerima: " + toEmail);
        System.out.println(">>> Subjek: " + subject);
        System.out.println(">>> Isi Pesan:\n" + messageBody);
        System.out.println("==========================================================================");
    }
}
