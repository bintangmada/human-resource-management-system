package com.hrms.enterprise.employee.controller;

import com.hrms.enterprise.employee.dto.ApiResponse;
import com.hrms.enterprise.employee.dto.AuthResponse;
import com.hrms.enterprise.employee.dto.LoginRequest;
import com.hrms.enterprise.employee.entity.Employee;
import com.hrms.enterprise.employee.exception.BadRequestException;
import com.hrms.enterprise.employee.exception.ResourceNotFoundException;
import com.hrms.enterprise.employee.repository.EmployeeRepository;
import com.hrms.enterprise.employee.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Locale;

import com.hrms.enterprise.employee.entity.Tenant;
import com.hrms.enterprise.employee.repository.TenantRepository;

/**
 * AuthController:
 * Menyediakan endpoint autentikasi terpusat (/api/v1/auth/login)
 * untuk karyawan multi-tenant maupun Master Admin (SaaS Owner).
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final MessageSource messageSource;
    private final TenantRepository tenantRepository;

    public AuthController(EmployeeRepository employeeRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider jwtTokenProvider,
                          MessageSource messageSource,
                          TenantRepository tenantRepository) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.messageSource = messageSource;
        this.tenantRepository = tenantRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            Locale locale) {
        String email = request.getEmail().trim().toLowerCase();
        String password = request.getPassword();

        // 1. Cek jika email adalah SaaS Owner / Master Admin
        if ("admin@hrms.com".equalsIgnoreCase(email)) {
            if ("admin123".equals(password) || "superadmin".equals(password)) {
                List<String> roles = Collections.singletonList("ROLE_SAAS_OWNER");
                String token = jwtTokenProvider.generateToken(email, 0L, roles);

                AuthResponse response = AuthResponse.builder()
                        .token(token)
                        .email(email)
                        .tenantId(0L)
                        .fullName("SaaS Owner")
                        .roles(roles)
                        .build();

                return ResponseEntity.ok(ApiResponse.success("Master Admin login successful", response));
            } else {
                String errMsg = messageSource.getMessage("auth.invalid.credentials", null, locale);
                throw new BadRequestException("auth.invalid.credentials", errMsg);
            }
        }

        // 2. Cari karyawan secara global berdasarkan email
        Employee employee = employeeRepository.findByEmailAndDeletedStatus(email, 0)
                .orElseThrow(() -> {
                    String errMsg = messageSource.getMessage("employee.email.not.registered", new Object[]{email}, locale);
                    return new ResourceNotFoundException("employee.email.not.registered", errMsg);
                });

        // 3. Verifikasi password hash
        if (employee.getPassword() == null || !passwordEncoder.matches(password, employee.getPassword())) {
            String errMsg = messageSource.getMessage("auth.invalid.credentials", null, locale);
            throw new BadRequestException("auth.invalid.credentials", errMsg);
        }

        // 4. Verifikasi status Tenant (harus aktif/sudah diverifikasi email)
        Tenant tenant = tenantRepository.findById(employee.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("tenant.not.found", "Tenant tidak ditemukan."));
        if (tenant.getStatus() == null || tenant.getStatus() != 1) {
            String errMsg = messageSource.getMessage("tenant.inactive", null, "Tenant perusahaan Anda belum aktif. Silakan verifikasi email Anda terlebih dahulu.", locale);
            throw new BadRequestException("tenant.inactive", errMsg);
        }

        // 5. Generate token JWT
        List<String> roles = Collections.singletonList("ROLE_EMPLOYEE");
        String token = jwtTokenProvider.generateToken(email, employee.getTenantId(), roles);

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .email(email)
                .tenantId(employee.getTenantId())
                .fullName(employee.getFullName())
                .roles(roles)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
