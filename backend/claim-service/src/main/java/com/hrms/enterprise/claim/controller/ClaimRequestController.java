package com.hrms.enterprise.claim.controller;

import com.hrms.enterprise.claim.dto.ApiResponse;
import com.hrms.enterprise.claim.dto.ClaimRequestPayload;
import com.hrms.enterprise.claim.dto.ClaimRequestResponse;
import com.hrms.enterprise.claim.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/claims")
public class ClaimRequestController {

    private final ClaimService claimService;

    public ClaimRequestController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClaimRequestResponse>> create(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @Valid @RequestBody ClaimRequestPayload payload) {
        ClaimRequestResponse response = claimService.createClaimRequest(payload, Long.valueOf(tenantId), actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Claim request submitted successfully", response));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Page<ClaimRequestResponse>>> getAll(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ClaimRequestResponse> responses = claimService.getClaims(Long.valueOf(tenantId), status, null, page, size);
        
        ApiResponse.PaginationMetadata pagination = ApiResponse.PaginationMetadata.builder()
                .page(responses.getNumber())
                .size(responses.getSize())
                .totalElements(responses.getTotalElements())
                .totalPages(responses.getTotalPages())
                .isLast(responses.isLast())
                .build();
                
        return ResponseEntity.ok(ApiResponse.success("Claim requests retrieved successfully", responses, pagination));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<ClaimRequestResponse>>> getMy(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ClaimRequestResponse> responses = claimService.getMyClaims(Long.valueOf(tenantId), actorEmail, page, size);
        
        ApiResponse.PaginationMetadata pagination = ApiResponse.PaginationMetadata.builder()
                .page(responses.getNumber())
                .size(responses.getSize())
                .totalElements(responses.getTotalElements())
                .totalPages(responses.getTotalPages())
                .isLast(responses.isLast())
                .build();
                
        return ResponseEntity.ok(ApiResponse.success("Your claim requests retrieved successfully", responses, pagination));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ClaimRequestResponse>> approve(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @PathVariable Long id) {
        ClaimRequestResponse response = claimService.approveClaim(id, Long.valueOf(tenantId), actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Claim approved successfully", response));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ClaimRequestResponse>> reject(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @PathVariable Long id,
            @RequestParam String notes) {
        ClaimRequestResponse response = claimService.rejectClaim(id, notes, Long.valueOf(tenantId), actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Claim rejected successfully", response));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ClaimRequestResponse>> cancel(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @PathVariable Long id) {
        ClaimRequestResponse response = claimService.cancelClaim(id, Long.valueOf(tenantId), actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Claim cancelled successfully", response));
    }
}
