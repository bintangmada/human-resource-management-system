package com.hrms.enterprise.employee.controller;

import com.hrms.enterprise.employee.dto.ApiResponse;
import com.hrms.enterprise.employee.dto.JobRequest;
import com.hrms.enterprise.employee.dto.JobResponse;
import com.hrms.enterprise.employee.service.JobService;
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
 * REST Controller untuk mengelola data Posisi Jabatan (Job).
 * Menyediakan standardisasi multi-tenancy, i18n, paginasi, dan standarisasi
 * output ApiResponse.
 */
@RestController
@RequestMapping("/api/v1/jobs")
@Validated
public class JobController {

    private final JobService jobService;
    private final MessageSource messageSource;

    public JobController(JobService jobService, MessageSource messageSource) {
        this.jobService = jobService;
        this.messageSource = messageSource;
    }

    /**
     * Membuat Posisi Jabatan Baru.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<JobResponse>> createJob(
            @Valid @RequestBody JobRequest request,
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId,
            @RequestHeader(value = "X-User-Email", defaultValue = "system@hrms.com") String actor,
            Locale locale) {

        JobResponse response = jobService.createJob(request, tenantId, actor);
        String message = messageSource.getMessage("job.created", null, locale);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(message, response));
    }

    /**
     * Memperbarui Data Posisi Jabatan.
     */
    @PostMapping("/{id}/update")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobRequest request,
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId,
            @RequestHeader(value = "X-User-Email", defaultValue = "system@hrms.com") String actor,
            Locale locale) {

        JobResponse response = jobService.updateJob(id, request, tenantId, actor);
        String message = messageSource.getMessage("job.updated", null, locale);
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    /**
     * Menarik Semua Posisi Jabatan dengan Paginasi dan Filter Kolom (Nama Jabatan &
     * Golongan).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<JobResponse>>> getAllJobs(
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId,
            @RequestParam(value = "id", required = false) String id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "grade", required = false) String grade,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<JobResponse> pageResult = jobService.getAllJobs(tenantId, id, title, grade, pageable);

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
     * Mengambil Detail Posisi Jabatan Berdasarkan ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getJobById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId) {

        JobResponse response = jobService.getJobById(id, tenantId);
        return ResponseEntity.ok(ApiResponse.success("success", response));
    }

    /**
     * Melakukan Soft Delete pada Posisi Jabatan Berdasarkan ID.
     */
    @PostMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @PathVariable Long id,
            @RequestHeader(value = "X-Tenant-ID", defaultValue = "1") Long tenantId,
            @RequestHeader(value = "X-User-Email", defaultValue = "system@hrms.com") String actor,
            Locale locale) {

        jobService.deleteJob(id, tenantId, actor);
        String message = messageSource.getMessage("job.deleted", null, locale);
        return ResponseEntity.ok(ApiResponse.success(message));
    }
}
