package com.hrms.enterprise.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Entitas ini memetakan tabel 'jobs' untuk menyimpan posisi/jabatan karyawan (misal: Software Engineer, HR Manager).
 * Bagian ini juga menyimpan grade (golongan) untuk menentukan struktur karir dan base salary range nantinya.
 * Mewarisi BaseEntity untuk audit trail & soft delete otomatis.
 */
@Entity
@Table(name = "jobs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@SuperBuilder
public class Job extends BaseEntity {

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
}
