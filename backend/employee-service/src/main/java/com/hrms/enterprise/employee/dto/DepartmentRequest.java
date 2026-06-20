package com.hrms.enterprise.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Data Transfer Object (DTO) untuk menangkap payload (data input)
 * dari client saat membuat atau memperbarui departemen/divisi.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DepartmentRequest {

    @NotBlank(message = "{validation.department.name.required}")
    @Size(max = 100, message = "{validation.department.name.size}")
    private String name;

    // Kode singkatan unik (e.g. "HRD", "ENG")
    @NotBlank(message = "{validation.department.code.required}")
    @Size(max = 20, message = "{validation.department.code.size}")
    private String code;

    private Integer status;
}
