package com.hrms.enterprise.employee.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Data Transfer Object (DTO) untuk menyajikan data informasi departemen ke client.
 * DTO ini memisahkan representasi database fisik (JPA Entity) dari output API
 * agar struktur internal database dapat dimodifikasi bebas tanpa merusak integrasi dengan UI.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DepartmentResponse {
    private Long id;
    private Long tenantId;
    private String name;
    private String code;
    private Integer status;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;
}
