package com.hrms.enterprise.employee.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entitas ini memetakan tabel 'jobs' untuk menyimpan posisi/jabatan karyawan (misal: Software Engineer, HR Manager).
 * Di sini kita juga menyimpan grade (golongan) untuk menentukan struktur karir dan base salary range nantinya.
 */
@Entity
@Table(name = "jobs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Setiap entitas dalam arsitektur SaaS wajib mengunci tenantId.
    // Kolom ini memastikan query pencarian posisi jabatan selalu dibatasi per perusahaan/penyewa.
    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    // Nama jabatan (e.g. "Senior Backend Developer", "Product Manager")
    @Column(nullable = false, length = 100)
    private String title;

    // Grade atau golongan pangkat. Berguna untuk standarisasi tunjangan dan matriks gaji.
    @Column(length = 50)
    private String grade;

    // Menandai apakah lowongan jabatan ini masih aktif atau sudah tidak digunakan (e.g. "ACTIVE", "INACTIVE")
    @Column(nullable = false, length = 20)
    private String status;
}
