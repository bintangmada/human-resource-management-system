package com.hrms.enterprise.employee.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDate;

/**
 * Entitas Employee memetakan tabel 'employees' untuk menyimpan biodata inti karyawan.
 * Mewarisi BaseEntity untuk audit trail dan soft delete otomatis.
 *
 * Catatan Desain Modul Terdistribusi:
 * Kita TIDAK menggunakan relasi JPA seperti @ManyToOne ke Department atau Job.
 * Sebagai gantinya, kita menyimpan id departemen (departmentId) dan id posisi jabatan (jobId)
 * secara manual bertipe data Long. Hal ini penting untuk memastikan domain bisnis employee-service
 * terisolasi penuh dan dapat di-refactor secara mandiri tanpa memicu cascading/loading database melingkar.
 */
@Entity
@Table(name = "employees")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@SuperBuilder
public class Employee extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // SaaS Tenant ID pengunci data per klien perusahaan
    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    // Nomor Induk Karyawan (NIK) yang unik untuk identifikasi bisnis resmi
    @Column(name = "employee_number", nullable = false, length = 50, unique = true)
    private String employeeNumber;

    // Nama lengkap karyawan
    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    // Email resmi karyawan (digunakan juga untuk login SSO Keycloak)
    @Column(nullable = false, length = 100)
    private String email;

    // Nomor telepon aktif
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    // Kunci Asing Manual (Foreign Key) ke tabel departments.
    // Menunjukkan divisi tempat karyawan ditugaskan.
    @Column(name = "department_id")
    private Long departmentId;

    // Kunci Asing Manual (Foreign Key) ke tabel jobs.
    // Menunjukkan jabatan resmi karyawan saat ini.
    @Column(name = "job_id")
    private Long jobId;

    // Tanggal pertama kali karyawan resmi bergabung di perusahaan
    @Column(name = "joined_at", nullable = false)
    private LocalDate joinedAt;
}
