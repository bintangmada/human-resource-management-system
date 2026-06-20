package com.hrms.enterprise.employee.controller;

import com.hrms.enterprise.employee.dto.ApiResponse;
import com.hrms.enterprise.employee.dto.DepartmentRequest;
import com.hrms.enterprise.employee.dto.DepartmentResponse;
import com.hrms.enterprise.employee.service.DepartmentService;
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
 * REST Controller untuk mengelola data Departemen.
 * Mendukung multi-tenancy via header 'X-Tenant-ID' dan lokalisasi pesan via header 'Accept-Language'.
 */
@RestController
@RequestMapping("/api/v1/departments")
@Validated
public class DepartmentController {

    private final DepartmentService departmentService;
    private final MessageSource messageSource;

    public DepartmentController(DepartmentService departmentService, MessageSource messageSource) {
        this.departmentService = departmentService;
        this.messageSource = messageSource;
    }

    /**
     * Membuat Departemen Baru.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(
            @Valid @RequestBody DepartmentRequest request,
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId,
            @RequestHeader(value = "X-User-Email", defaultValue = "system@hrms.com") String actor,
            Locale locale) {

        DepartmentResponse response = departmentService.createDepartment(request, tenantId, actor);
        String message = messageSource.getMessage("department.created", null, locale);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(message, response));
    }

    /**
     * Memperbarui Data Departemen.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest request,
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId,
            @RequestHeader(value = "X-User-Email", defaultValue = "system@hrms.com") String actor,
            Locale locale) {

        DepartmentResponse response = departmentService.updateDepartment(id, request, tenantId, actor);
        String message = messageSource.getMessage("department.updated", null, locale);
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    /**
     * Menarik Semua Departemen dengan Dukungan Paginasi dan Filter Kolom (Nama & Kode).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<DepartmentResponse>>> getAllDepartments(
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<DepartmentResponse> pageResult = departmentService.getAllDepartments(tenantId, name, code, pageable);

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
     * Mengambil Detail Departemen Berdasarkan ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getDepartmentById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId) {

        DepartmentResponse response = departmentService.getDepartmentById(id, tenantId);
        return ResponseEntity.ok(ApiResponse.success("success", response));
    }

    /**
     * Melakukan Soft Delete pada Departemen Berdasarkan ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(
            @PathVariable Long id,
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId,
            @RequestHeader(value = "X-User-Email", defaultValue = "system@hrms.com") String actor,
            Locale locale) {

        departmentService.deleteDepartment(id, tenantId, actor);
        String message = messageSource.getMessage("department.deleted", null, locale);
        return ResponseEntity.ok(ApiResponse.success(message));
    }
}
