package com.hrms.enterprise.employee.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Data Transfer Object (DTO) untuk mengirimkan informasi detail posisi/jabatan ke client.
 * Memisahkan struktur entity JPA dari representasi JSON eksternal API.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class JobResponse {
    private Long id;
    private Long tenantId;
    private String title;
    private String grade;
    private Integer status;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;
}
