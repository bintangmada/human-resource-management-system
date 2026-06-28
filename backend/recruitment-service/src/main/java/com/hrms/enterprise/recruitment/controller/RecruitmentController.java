package com.hrms.enterprise.recruitment.controller;

import com.hrms.enterprise.recruitment.dto.*;
import com.hrms.enterprise.recruitment.entity.JobApplication;
import com.hrms.enterprise.recruitment.entity.JobPosting;
import com.hrms.enterprise.recruitment.service.RecruitmentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recruitment")
public class RecruitmentController {

    private final RecruitmentService recruitmentService;

    public RecruitmentController(RecruitmentService recruitmentService) {
        this.recruitmentService = recruitmentService;
    }

    // --- Job Posting Endpoints ---

    @PostMapping("/jobs")
    public ResponseEntity<ApiResponse<JobPosting>> createJobPosting(
            @Valid @RequestBody JobPostingPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        JobPosting posting = recruitmentService.createJobPosting(payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Job posting created successfully", posting));
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<JobPosting>> updateJobPosting(
            @PathVariable Long id,
            @Valid @RequestBody JobPostingPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        JobPosting posting = recruitmentService.updateJobPosting(id, payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Job posting updated successfully", posting));
    }

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<Page<JobPosting>>> getJobPostings(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<JobPosting> data = recruitmentService.getJobPostings(tenantId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Job postings retrieved", data));
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<JobPosting>> getJobPostingDetail(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        JobPosting data = recruitmentService.getJobPostingDetail(id, tenantId);
        return ResponseEntity.ok(ApiResponse.success("Job posting details retrieved", data));
    }

    // --- Job Application Endpoints ---

    @PostMapping("/applications/submit")
    public ResponseEntity<ApiResponse<JobApplication>> applyJob(
            @Valid @RequestBody JobApplicationPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        JobApplication application = recruitmentService.applyJob(payload, tenantId);
        return ResponseEntity.ok(ApiResponse.success("Job application submitted successfully", application));
    }

    @PutMapping("/applications/{id}/stage")
    public ResponseEntity<ApiResponse<JobApplication>> updateRecruitmentStage(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStagePayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        JobApplication application = recruitmentService.updateRecruitmentStage(id, payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Recruitment stage updated successfully", application));
    }

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<Page<JobApplication>>> getJobApplications(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(required = false) Long jobPostingId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<JobApplication> data = recruitmentService.getJobApplications(tenantId, jobPostingId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Job applications retrieved", data));
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<ApiResponse<JobApplication>> getJobApplicationDetail(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        JobApplication data = recruitmentService.getJobApplicationDetail(id, tenantId);
        return ResponseEntity.ok(ApiResponse.success("Job application details retrieved", data));
    }
}
