package com.hrms.enterprise.loan.controller;

import com.hrms.enterprise.loan.dto.ApiResponse;
import com.hrms.enterprise.loan.dto.LoanInstallmentResponse;
import com.hrms.enterprise.loan.dto.LoanRequestPayload;
import com.hrms.enterprise.loan.dto.LoanRequestResponse;
import com.hrms.enterprise.loan.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LoanRequestResponse>> applyLoan(
            @Valid @RequestBody LoanRequestPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        LoanRequestResponse data = loanService.applyLoan(payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Loan applied successfully", data));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Page<LoanRequestResponse>>> getLoans(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<LoanRequestResponse> data = loanService.getLoans(tenantId, status, employeeId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Loans retrieved successfully", data));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<LoanRequestResponse>>> getMyLoans(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<LoanRequestResponse> data = loanService.getMyLoans(tenantId, actorEmail, page, size);
        return ResponseEntity.ok(ApiResponse.success("My loans retrieved successfully", data));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<LoanRequestResponse>> approveLoan(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        LoanRequestResponse data = loanService.approveLoan(id, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Loan approved and amortization schedule generated", data));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<LoanRequestResponse>> rejectLoan(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "") String notes,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        LoanRequestResponse data = loanService.rejectLoan(id, notes, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Loan rejected successfully", data));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<LoanRequestResponse>> cancelLoan(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        LoanRequestResponse data = loanService.cancelLoan(id, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Loan cancelled successfully", data));
    }

    @GetMapping("/repayments")
    public ResponseEntity<ApiResponse<List<LoanInstallmentResponse>>> getPendingRepayments(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam Long employeeId,
            @RequestParam(required = false) String targetDate) {
        List<LoanInstallmentResponse> data = loanService.getPendingRepayments(tenantId, employeeId, targetDate);
        return ResponseEntity.ok(ApiResponse.success("Pending repayments retrieved successfully", data));
    }

    @PostMapping("/installments/{installmentId}/pay")
    public ResponseEntity<ApiResponse<LoanInstallmentResponse>> payInstallment(
            @PathVariable Long installmentId,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(required = false) Long payrollDeductionId) {
        LoanInstallmentResponse data = loanService.payInstallment(installmentId, tenantId, payrollDeductionId);
        return ResponseEntity.ok(ApiResponse.success("Amortization installment paid successfully", data));
    }
}
