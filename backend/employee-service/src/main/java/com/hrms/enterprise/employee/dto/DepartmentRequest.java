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

    // Validasi memastikan nama tidak kosong atau berisi spasi saja
    @NotBlank(message = "Nama departemen tidak boleh kosong")
    @Size(max = 100, message = "Nama departemen maksimal 100 karakter")
    private String name;

    // Kode singkatan unik (e.g. "HRD", "ENG")
    @NotBlank(message = "Kode departemen tidak boleh kosong")
    @Size(max = 20, message = "Kode departemen maksimal 20 karakter")
    private String code;
}
