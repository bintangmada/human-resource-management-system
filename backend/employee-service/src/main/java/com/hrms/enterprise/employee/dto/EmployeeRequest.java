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

    @NotBlank(message = "{validation.employee.number.required}")
    @Size(max = 50, message = "{validation.employee.number.size}")
    private String employeeNumber;

    @NotBlank(message = "{validation.employee.name.required}")
    @Size(max = 150, message = "{validation.employee.name.size}")
    private String fullName;

    @NotBlank(message = "{validation.employee.email.required}")
    @Email(message = "{validation.employee.email.invalid}")
    @Size(max = 100, message = "{validation.employee.email.size}")
    private String email;

    @Size(max = 20, message = "{validation.employee.phone.size}")
    private String phoneNumber;

    @NotNull(message = "{validation.employee.department.required}")
    private Long departmentId;

    @NotNull(message = "{validation.employee.job.required}")
    private Long jobId;

    @NotNull(message = "{validation.employee.joined.required}")
    private LocalDate joinedAt;
}
