package com.hrms.enterprise.leave.service;

import com.hrms.enterprise.leave.dto.LeaveBalanceResponse;

import java.util.List;

public interface LeaveBalanceService {
    List<LeaveBalanceResponse> getEmployeeBalances(Long tenantId, Long employeeId, Integer year);
    
    LeaveBalanceResponse allocateBalance(Long tenantId, Long employeeId, Long leaveTypeId, Integer year, Integer entitlement, String actorEmail);
    
    void initializeBalancesForEmployee(Long tenantId, Long employeeId, Integer year, String actorEmail);
    
    LeaveBalanceResponse getEmployeeBalanceForType(Long tenantId, Long employeeId, Long leaveTypeId, Integer year);
}
