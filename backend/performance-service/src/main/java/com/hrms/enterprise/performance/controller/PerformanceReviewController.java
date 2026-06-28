package com.hrms.enterprise.performance.controller;

import com.hrms.enterprise.performance.dto.ApiResponse;
import com.hrms.enterprise.performance.dto.PerformanceReviewPayload;
import com.hrms.enterprise.performance.dto.PerformanceReviewResponse;
import com.hrms.enterprise.performance.service.PerformanceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/performance")
public class PerformanceReviewController {

    private final PerformanceService performanceService;

    public PerformanceReviewController(PerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    @PostMapping("/draft")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> saveDraft(
            @Valid @RequestBody PerformanceReviewPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        PerformanceReviewResponse data = performanceService.saveDraft(payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Performance review draft saved", data));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> submitReview(
            @Valid @RequestBody PerformanceReviewPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        PerformanceReviewResponse data = performanceService.submitReview(payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Performance review submitted for approval", data));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> approveReview(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        PerformanceReviewResponse data = performanceService.approveReview(id, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Performance review approved and finalized", data));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Page<PerformanceReviewResponse>>> getReviews(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PerformanceReviewResponse> data = performanceService.getReviews(tenantId, status, employeeId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Performance reviews retrieved", data));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<PerformanceReviewResponse>>> getMyReviews(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PerformanceReviewResponse> data = performanceService.getMyReviews(tenantId, actorEmail, page, size);
        return ResponseEntity.ok(ApiResponse.success("My performance reviews retrieved", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> getReviewDetail(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        PerformanceReviewResponse data = performanceService.getReviewDetail(id, tenantId);
        return ResponseEntity.ok(ApiResponse.success("Performance review details retrieved", data));
    }
}
