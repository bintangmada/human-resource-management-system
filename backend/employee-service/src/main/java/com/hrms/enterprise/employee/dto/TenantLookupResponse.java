package com.hrms.enterprise.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO TenantLookupResponse digunakan oleh frontend untuk mengecek apakah subdomain valid,
 * dan mengambil metadata dasar (seperti nama perusahaan) untuk kustomisasi branding login screen.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TenantLookupResponse {
    private Long id;
    private String companyName;
    private String subdomain;
    private String status; // e.g. ACTIVE, TRIAL, EXPIRED, SUSPENDED
}
