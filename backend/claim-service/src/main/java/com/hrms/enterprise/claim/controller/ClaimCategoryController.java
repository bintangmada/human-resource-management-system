package com.hrms.enterprise.claim.controller;

import com.hrms.enterprise.claim.dto.ApiResponse;
import com.hrms.enterprise.claim.dto.ClaimCategoryRequest;
import com.hrms.enterprise.claim.dto.ClaimCategoryResponse;
import com.hrms.enterprise.claim.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/claims/categories")
public class ClaimCategoryController {

    private final ClaimService claimService;

    public ClaimCategoryController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClaimCategoryResponse>> create(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @Valid @RequestBody ClaimCategoryRequest request) {
        ClaimCategoryResponse response = claimService.createCategory(request, Long.valueOf(tenantId), actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Claim category created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClaimCategoryResponse>>> getAll(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        List<ClaimCategoryResponse> response = claimService.getCategories(Long.valueOf(tenantId), activeOnly);
        return ResponseEntity.ok(ApiResponse.success("Claim categories retrieved successfully", response));
    }
}
