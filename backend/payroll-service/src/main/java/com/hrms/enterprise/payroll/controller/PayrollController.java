package com.hrms.enterprise.payroll.controller;

import com.hrms.enterprise.payroll.dto.*;
import com.hrms.enterprise.payroll.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payroll")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<PayrollResponse>> process(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @Valid @RequestBody PayrollProcessRequest request) {
        PayrollResponse response = payrollService.processPayroll(request, Long.valueOf(tenantId), actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Payroll calculation processed successfully", response));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Page<PayrollResponse>>> getAll(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PayrollResponse> responses = payrollService.getAllPayrolls(Long.valueOf(tenantId), status, page, size);
        
        ApiResponse.PaginationMetadata pagination = ApiResponse.PaginationMetadata.builder()
                .page(responses.getNumber())
                .size(responses.getSize())
                .totalElements(responses.getTotalElements())
                .totalPages(responses.getTotalPages())
                .isLast(responses.isLast())
                .build();
                
        return ResponseEntity.ok(ApiResponse.success("Payrolls retrieved successfully", responses, pagination));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<PayrollResponse>>> getMy(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PayrollResponse> responses = payrollService.getMyPayrolls(Long.valueOf(tenantId), actorEmail, page, size);
        
        ApiResponse.PaginationMetadata pagination = ApiResponse.PaginationMetadata.builder()
                .page(responses.getNumber())
                .size(responses.getSize())
                .totalElements(responses.getTotalElements())
                .totalPages(responses.getTotalPages())
                .isLast(responses.isLast())
                .build();
                
        return ResponseEntity.ok(ApiResponse.success("Your payslips retrieved successfully", responses, pagination));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PayrollResponse>> getById(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable Long id) {
        PayrollResponse response = payrollService.getPayrollById(id, Long.valueOf(tenantId));
        return ResponseEntity.ok(ApiResponse.success("Payroll detail retrieved successfully", response));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PayrollResponse>> approve(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @PathVariable Long id) {
        PayrollResponse response = payrollService.approvePayroll(id, Long.valueOf(tenantId), actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Payroll approved successfully", response));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<PayrollResponse>> pay(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @PathVariable Long id) {
        PayrollResponse response = payrollService.markPayrollPaid(id, Long.valueOf(tenantId), actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Payroll marked as paid successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @PathVariable Long id) {
        payrollService.deletePayroll(id, Long.valueOf(tenantId), actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Payroll draft deleted successfully"));
    }
}
