package com.hrms.enterprise.payroll.controller;

import com.hrms.enterprise.payroll.dto.*;
import com.hrms.enterprise.payroll.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payroll/settings")
public class EmployeeSalarySettingController {

    private final PayrollService payrollService;

    public EmployeeSalarySettingController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SalarySettingResponse>> saveSetting(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @Valid @RequestBody SalarySettingRequest request) {
        SalarySettingResponse response = payrollService.saveSalarySetting(request, Long.valueOf(tenantId), actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Salary settings saved successfully", response));
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<ApiResponse<SalarySettingResponse>> getSetting(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable Long employeeId) {
        SalarySettingResponse response = payrollService.getSalarySetting(employeeId, Long.valueOf(tenantId));
        return ResponseEntity.ok(ApiResponse.success("Salary setting retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SalarySettingResponse>>> getAllSettings(
            @RequestHeader("X-Tenant-ID") String tenantId) {
        List<SalarySettingResponse> response = payrollService.getAllSalarySettings(Long.valueOf(tenantId));
        return ResponseEntity.ok(ApiResponse.success("All salary settings retrieved successfully", response));
    }
}
