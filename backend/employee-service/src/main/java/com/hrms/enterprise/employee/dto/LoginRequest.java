package com.hrms.enterprise.employee.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * LoginRequest:
 * Data Transfer Object untuk payload request autentikasi masuk.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "email.required")
    @Email(message = "email.invalid")
    private String email;

    @NotBlank(message = "password.required")
    private String password;
}
