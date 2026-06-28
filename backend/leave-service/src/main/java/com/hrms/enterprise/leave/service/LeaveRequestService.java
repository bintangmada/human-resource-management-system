package com.hrms.enterprise.leave.service;

import com.hrms.enterprise.leave.dto.LeaveRequestDto;
import com.hrms.enterprise.leave.dto.LeaveRequestResponse;
import org.springframework.data.domain.Page;

public interface LeaveRequestService {
    LeaveRequestResponse submitLeaveRequest(Long tenantId, Long employeeId, LeaveRequestDto request, String actorEmail);
    
    LeaveRequestResponse approveLeaveRequest(Long tenantId, Long id, String approverEmail, String notes);
    
    LeaveRequestResponse rejectLeaveRequest(Long tenantId, Long id, String rejectorEmail, String notes);
    
    LeaveRequestResponse cancelLeaveRequest(Long tenantId, Long id, String actorEmail);
    
    LeaveRequestResponse getLeaveRequest(Long tenantId, Long id);
    
    Page<LeaveRequestResponse> getAllLeaveRequests(Long tenantId, String status, int page, int size);
    
    Page<LeaveRequestResponse> getEmployeeLeaveRequests(Long tenantId, Long employeeId, int page, int size);
}
