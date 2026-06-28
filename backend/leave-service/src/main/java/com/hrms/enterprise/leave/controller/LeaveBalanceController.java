package com.hrms.enterprise.leave.controller;

import com.hrms.enterprise.leave.dto.ApiResponse;
import com.hrms.enterprise.leave.dto.LeaveBalanceResponse;
import com.hrms.enterprise.leave.service.LeaveBalanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leave/balances")
public class LeaveBalanceController {

    private final LeaveBalanceService leaveBalanceService;

    public LeaveBalanceController(LeaveBalanceService leaveBalanceService) {
        this.leaveBalanceService = leaveBalanceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> getEmployeeBalances(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam Long employeeId,
            @RequestParam(required = false) Integer year) {

        List<LeaveBalanceResponse> responseData = leaveBalanceService.getEmployeeBalances(tenantId, employeeId, year);
        return ResponseEntity.ok(ApiResponse.success("Success", responseData));
    }

    @PostMapping("/allocate")
    public ResponseEntity<ApiResponse<LeaveBalanceResponse>> allocateBalance(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @RequestParam Long employeeId,
            @RequestParam Long leaveTypeId,
            @RequestParam Integer entitlement,
            @RequestParam(required = false) Integer year) {

        LeaveBalanceResponse responseData = leaveBalanceService.allocateBalance(tenantId, employeeId, leaveTypeId, year, entitlement, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Balance allocated successfully", responseData));
    }

    @PostMapping("/initialize")
    public ResponseEntity<ApiResponse<Void>> initializeBalances(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @RequestParam Long employeeId,
            @RequestParam(required = false) Integer year) {

        int targetYear = year != null ? year : java.time.LocalDate.now().getYear();
        leaveBalanceService.initializeBalancesForEmployee(tenantId, employeeId, targetYear, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Balances initialized successfully"));
    }
}
