package com.hrms.enterprise.offboarding.controller;

import com.hrms.enterprise.offboarding.dto.ApiResponse;
import com.hrms.enterprise.offboarding.dto.ClearanceChecklistPayload;
import com.hrms.enterprise.offboarding.dto.OffboardingPayload;
import com.hrms.enterprise.offboarding.dto.ProcessOffboardingPayload;
import com.hrms.enterprise.offboarding.entity.ClearanceChecklist;
import com.hrms.enterprise.offboarding.entity.OffboardingRequest;
import com.hrms.enterprise.offboarding.service.OffboardingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/offboarding")
public class OffboardingController {

    private final OffboardingService offboardingService;

    public OffboardingController(OffboardingService offboardingService) {
        this.offboardingService = offboardingService;
    }

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<OffboardingRequest>> submit(
            @Valid @RequestBody OffboardingPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        OffboardingRequest data = offboardingService.submitRequest(payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Offboarding request submitted successfully", data));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<Page<OffboardingRequest>>> list(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<OffboardingRequest> data = offboardingService.getRequests(tenantId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Offboarding requests retrieved", data));
    }

    @GetMapping("/requests/my")
    public ResponseEntity<ApiResponse<List<OffboardingRequest>>> my(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        List<OffboardingRequest> data = offboardingService.getMyRequests(tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("My offboarding requests retrieved", data));
    }

    @PutMapping("/requests/{id}/process")
    public ResponseEntity<ApiResponse<OffboardingRequest>> process(
            @PathVariable Long id,
            @Valid @RequestBody ProcessOffboardingPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        OffboardingRequest data = offboardingService.processRequest(id, payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Offboarding request processed successfully", data));
    }

    @PutMapping("/requests/{requestId}/items/{itemId}")
    public ResponseEntity<ApiResponse<ClearanceChecklist>> updateItem(
            @PathVariable Long requestId,
            @PathVariable Long itemId,
            @Valid @RequestBody ClearanceChecklistPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        ClearanceChecklist data = offboardingService.updateClearanceItem(requestId, itemId, payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Clearance checklist item updated successfully", data));
    }
}
