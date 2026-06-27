package com.hrms.enterprise.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * AuthResponse:
 * Data Transfer Object untuk payload response login yang sukses, berisi token JWT
 * dan metadata user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private Long tenantId;
    private String fullName;
    private List<String> roles;
}
