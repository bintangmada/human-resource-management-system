package com.hrms.enterprise.employee.service;

/**
 * Interface EmailService:
 * Layanan utilitas untuk mengirimkan email pemberitahuan sistem (misal: verifikasi registrasi tenant).
 */
public interface EmailService {
    void sendVerificationEmail(String toEmail, String ownerName, String subdomain, String token,
                               String adminPassword, String hrPassword, String financePassword);
}
