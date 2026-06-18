package com.hrms.enterprise.employee.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object (DTO) untuk menyajikan informasi lengkap data karyawan ke client.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EmployeeResponse {
    private Long id;
    private Long tenantId;
    private String employeeNumber;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Long departmentId;
    private Long jobId;
    private LocalDate joinedAt;
    private Integer status;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;
}
