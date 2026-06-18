package com.hrms.enterprise.employee.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Entitas Department memetakan tabel 'departments' untuk struktur organisasi.
 * Mewarisi BaseEntity untuk mendukung fitur audit trail dan soft delete otomatis.
 */
@Entity
@Table(name = "departments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@SuperBuilder
public class Department extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Menghubungkan departemen ke SaaS Tenant tertentu
    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    // Nama departemen (e.g. "Human Resource", "Engineering")
    @Column(nullable = false, length = 100)
    private String name;

    // Kode singkatan unik departemen (e.g. "HRD", "ENG")
    @Column(nullable = false, length = 20, unique = true)
    private String code;
}
