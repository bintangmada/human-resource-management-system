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

    @NotBlank(message = "Nama jabatan tidak boleh kosong")
    @Size(max = 100, message = "Nama jabatan maksimal 100 karakter")
    private String title;

    @Size(max = 50, message = "Grade golongan maksimal 50 karakter")
    private String grade;
}
