package com.hrms.enterprise.employee.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "departments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId; // Lock database records per SaaS Tenant (Company)

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20, unique = true)
    private String code; // Unique short identifier (e.g., "HRD", "ENG", "FIN")

    @Column(nullable = false, length = 20)
    private String status; // Status of the department (e.g., "ACTIVE", "INACTIVE")
}
