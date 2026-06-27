package com.hrms.enterprise.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * DTO TenantResponse digunakan untuk mengembalikan data profil tenant yang lengkap.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TenantResponse {
    private Long id;
    private String companyName;
    private String subdomain;
    private String ownerName;
    private String ownerEmail;
    private String plan;
    private Integer status; // 1 = ACTIVE, 0 = INACTIVE
    private LocalDateTime joinedAt;
    private LocalDateTime expiryDate;
    private Integer maxEmployees;
    private Long activeEmployeeCount; // Real employee count in PostgreSQL
    private Long adminCount;
    private Long hrCount;
    private Long financeCount;
    private Long staffCount;
}
