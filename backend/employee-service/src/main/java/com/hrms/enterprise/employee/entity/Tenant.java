package com.hrms.enterprise.employee.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;

/**
 * Entitas Tenant memetakan tabel 'tenants' untuk menyimpan data penyewa SaaS,
 * status langganan, kuota pegawai, dan kontak pengelola (admin utama).
 */
@Entity
@Table(name = "tenants")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@SuperBuilder
public class Tenant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nama resmi perusahaan penyewa
    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    // Prefiks subdomain unik (contoh: 'teknologi-nusantara')
    @Column(nullable = false, length = 50, unique = true)
    private String subdomain;

    // Nama lengkap admin utama/pemilik tenant
    @Column(name = "owner_name", nullable = false, length = 100)
    private String ownerName;

    // Email kontak utama / login admin utama
    @Column(name = "owner_email", nullable = false, length = 100)
    private String ownerEmail;

    // Plan langganan: TRIAL, PROFESSIONAL, ENTERPRISE
    @Builder.Default
    @Column(nullable = false, length = 20)
    private String plan = "TRIAL";

    // Tanggal kedaluwarsa langganan
    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    // Kuota maksimum karyawan aktif yang diperbolehkan di sistem
    @Builder.Default
    @Column(name = "max_employees", nullable = false)
    private Integer maxEmployees = 50;

    // Token verifikasi email registrasi
    @Column(name = "verification_token", length = 100)
    private String verificationToken;

    // Status apakah email telah diverifikasi
    @Builder.Default
    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;
}
