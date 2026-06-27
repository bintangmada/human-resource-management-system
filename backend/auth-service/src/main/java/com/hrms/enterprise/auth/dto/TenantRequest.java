package com.hrms.enterprise.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO TenantRequest memetakan payload request JSON untuk proses pendaftaran tenant baru.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class TenantRequest {
    private String companyName;
    private String subdomain;
    private String ownerName;
    private String ownerEmail;
    private String hrName;
    private String hrEmail;
    private String financeName;
    private String financeEmail;
    private String plan;
}
