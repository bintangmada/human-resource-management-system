package com.hrms.enterprise.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Data Transfer Object (DTO) untuk menangkap payload data input
 * saat melakukan pembuatan atau pembaruan posisi/jabatan karyawan.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class JobRequest {

    @NotBlank(message = "{validation.job.title.required}")
    @Size(max = 100, message = "{validation.job.title.size}")
    private String title;

    @Size(max = 50, message = "{validation.job.grade.size}")
    private String grade;

    private Integer status;
}
