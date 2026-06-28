package com.hrms.enterprise.payroll.service;

import com.hrms.enterprise.payroll.dto.*;
import org.springframework.data.domain.Page;

import java.util.List;

public interface PayrollService {

    // Salary Settings
    SalarySettingResponse saveSalarySetting(SalarySettingRequest request, Long tenantId, String actorEmail);
    SalarySettingResponse getSalarySetting(Long employeeId, Long tenantId);
    List<SalarySettingResponse> getAllSalarySettings(Long tenantId);

    // Payroll Transactions
    PayrollResponse processPayroll(PayrollProcessRequest request, Long tenantId, String actorEmail);
    PayrollResponse getPayrollById(Long id, Long tenantId);
    Page<PayrollResponse> getAllPayrolls(Long tenantId, String status, int page, int size);
    Page<PayrollResponse> getMyPayrolls(Long tenantId, String employeeEmail, int page, int size);
    PayrollResponse approvePayroll(Long id, Long tenantId, String actorEmail);
    PayrollResponse markPayrollPaid(Long id, Long tenantId, String actorEmail);
    void deletePayroll(Long id, Long tenantId, String actorEmail);
}
