package com.hrms.enterprise.employee.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

/**
 * Data Transfer Object (DTO) untuk menangkap payload data input
 * saat melakukan pembuatan atau pembaruan biodata karyawan.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EmployeeRequest {

    @NotBlank(message = "Nomor Induk Karyawan tidak boleh kosong")
    @Size(max = 50, message = "Nomor Induk Karyawan maksimal 50 karakter")
    private String employeeNumber;

    @NotBlank(message = "Nama lengkap karyawan tidak boleh kosong")
    @Size(max = 150, message = "Nama lengkap maksimal 150 karakter")
    private String fullName;

    @NotBlank(message = "Email tidak boleh kosong")
    @Email(message = "Format email tidak valid")
    @Size(max = 100, message = "Email maksimal 100 karakter")
    private String email;

    @Size(max = 20, message = "Nomor telepon maksimal 20 karakter")
    private String phoneNumber;

    @NotNull(message = "ID departemen tidak boleh kosong")
    private Long departmentId;

    @NotNull(message = "ID posisi jabatan tidak boleh kosong")
    private Long jobId;

    @NotNull(message = "Tanggal bergabung tidak boleh kosong")
    private LocalDate joinedAt;
}
