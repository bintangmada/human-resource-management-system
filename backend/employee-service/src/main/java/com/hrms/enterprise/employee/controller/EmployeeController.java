package com.hrms.enterprise.employee.controller;

import com.hrms.enterprise.employee.dto.ApiResponse;
import com.hrms.enterprise.employee.dto.EmployeeRequest;
import com.hrms.enterprise.employee.dto.EmployeeResponse;
import com.hrms.enterprise.employee.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;

/**
 * REST Controller untuk mengelola data Karyawan (Employee).
 * Menyediakan standardisasi multi-tenancy, i18n, paginasi, dan standarisasi
 * output ApiResponse.
 */
@RestController
@RequestMapping("/api/v1/employees")
@Validated
public class EmployeeController {

    private final EmployeeService employeeService;
    private final MessageSource messageSource;

    public EmployeeController(EmployeeService employeeService, MessageSource messageSource) {
        this.employeeService = employeeService;
        this.messageSource = messageSource;
    }

    /**
     * Mendaftarkan Karyawan Baru.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody EmployeeRequest request,
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId,
            @RequestHeader(value = "X-User-Email", defaultValue = "system@hrms.com") String actor,
            Locale locale) {

        EmployeeResponse response = employeeService.createEmployee(request, tenantId, actor);
        String message = messageSource.getMessage("employee.created", null, locale);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(message, response));
    }

    /**
     * Memperbarui Biodata Karyawan.
     */
    @PostMapping("/{id}/update")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request,
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId,
            @RequestHeader(value = "X-User-Email", defaultValue = "system@hrms.com") String actor,
            Locale locale) {

        EmployeeResponse response = employeeService.updateEmployee(id, request, tenantId, actor);
        String message = messageSource.getMessage("employee.updated", null, locale);
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    /**
     * Menarik Semua Karyawan dengan Paginasi dan Filter Kolom (Nama, NIK, & Email).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<EmployeeResponse>>> getAllEmployees(
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "employeeNumber", required = false) String employeeNumber,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<EmployeeResponse> pageResult = employeeService.getAllEmployees(tenantId, fullName, employeeNumber, email,
                pageable);

        ApiResponse.PaginationMetadata pagination = ApiResponse.PaginationMetadata.builder()
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .isLast(pageResult.isLast())
                .build();

        return ResponseEntity.ok(ApiResponse.success("success", pageResult.getContent(), pagination));
    }

    /**
     * Mengambil Detail Karyawan Berdasarkan ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId) {

        EmployeeResponse response = employeeService.getEmployeeById(id, tenantId);
        return ResponseEntity.ok(ApiResponse.success("success", response));
    }

    /**
     * Melakukan Soft Delete pada Karyawan Berdasarkan ID.
     */
    @PostMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(
            @PathVariable Long id,
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId,
            @RequestHeader(value = "X-User-Email", defaultValue = "system@hrms.com") String actor,
            Locale locale) {

        employeeService.deleteEmployee(id, tenantId, actor);
        String message = messageSource.getMessage("employee.deleted", null, locale);
        return ResponseEntity.ok(ApiResponse.success(message));
    }
}
