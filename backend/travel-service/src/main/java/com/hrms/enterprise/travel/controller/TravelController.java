package com.hrms.enterprise.travel.controller;

import com.hrms.enterprise.travel.dto.*;
import com.hrms.enterprise.travel.entity.TravelExpense;
import com.hrms.enterprise.travel.entity.TravelRequest;
import com.hrms.enterprise.travel.service.TravelService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/travel")
public class TravelController {

    private final TravelService travelService;

    public TravelController(TravelService travelService) {
        this.travelService = travelService;
    }

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<TravelRequest>> submit(
            @Valid @RequestBody TravelRequestPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        TravelRequest data = travelService.submitRequest(payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Travel request submitted successfully", data));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<Page<TravelRequest>>> list(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<TravelRequest> data = travelService.getRequests(tenantId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Travel requests retrieved", data));
    }

    @GetMapping("/requests/my")
    public ResponseEntity<ApiResponse<List<TravelRequest>>> my(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        List<TravelRequest> data = travelService.getMyRequests(tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("My travel requests retrieved", data));
    }

    @PutMapping("/requests/{id}/process")
    public ResponseEntity<ApiResponse<TravelRequest>> process(
            @PathVariable Long id,
            @Valid @RequestBody ProcessTravelPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        TravelRequest data = travelService.processRequest(id, payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Travel request processed successfully", data));
    }

    @PostMapping("/requests/{id}/expenses")
    public ResponseEntity<ApiResponse<TravelExpense>> submitExpense(
            @PathVariable Long id,
            @Valid @RequestBody TravelExpensePayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        TravelExpense data = travelService.submitExpense(id, payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Travel expense receipt added successfully", data));
    }

    @PutMapping("/requests/{requestId}/expenses/{expenseId}/process")
    public ResponseEntity<ApiResponse<TravelExpense>> processExpense(
            @PathVariable Long requestId,
            @PathVariable Long expenseId,
            @Valid @RequestBody ProcessExpensePayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        TravelExpense data = travelService.processExpense(requestId, expenseId, payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Travel expense processed successfully", data));
    }
}
