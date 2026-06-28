package com.hrms.enterprise.claim.controller;

import com.hrms.enterprise.claim.dto.ApiResponse;
import com.hrms.enterprise.claim.dto.ClaimBalanceRequest;
import com.hrms.enterprise.claim.dto.ClaimBalanceResponse;
import com.hrms.enterprise.claim.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/claims/balances")
public class ClaimBalanceController {

    private final ClaimService claimService;

    public ClaimBalanceController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClaimBalanceResponse>> allocate(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @Valid @RequestBody ClaimBalanceRequest request) {
        ClaimBalanceResponse response = claimService.allocateBalance(request, Long.valueOf(tenantId), actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Quota allocated successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClaimBalanceResponse>>> get(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Integer year) {
        List<ClaimBalanceResponse> response = claimService.getBalances(Long.valueOf(tenantId), employeeId, year);
        return ResponseEntity.ok(ApiResponse.success("Claim balances retrieved successfully", response));
    }
}
