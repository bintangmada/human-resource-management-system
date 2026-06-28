package com.hrms.enterprise.leave.service;

import com.hrms.enterprise.leave.dto.LeaveTypeRequest;
import com.hrms.enterprise.leave.dto.LeaveTypeResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface LeaveTypeService {
    LeaveTypeResponse createLeaveType(Long tenantId, LeaveTypeRequest request, String actorEmail);
    LeaveTypeResponse updateLeaveType(Long tenantId, Long id, LeaveTypeRequest request, String actorEmail);
    void deleteLeaveType(Long tenantId, Long id, String actorEmail);
    LeaveTypeResponse getLeaveType(Long tenantId, Long id);
    Page<LeaveTypeResponse> getAllLeaveTypes(Long tenantId, String search, int page, int size);
    List<LeaveTypeResponse> getActiveLeaveTypes(Long tenantId);
}
