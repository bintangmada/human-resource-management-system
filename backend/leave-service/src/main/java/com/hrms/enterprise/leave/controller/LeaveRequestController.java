package com.hrms.enterprise.leave.controller;

import com.hrms.enterprise.leave.dto.ApiResponse;
import com.hrms.enterprise.leave.dto.ApprovalRequest;
import com.hrms.enterprise.leave.dto.LeaveRequestDto;
import com.hrms.enterprise.leave.dto.LeaveRequestResponse;
import com.hrms.enterprise.leave.service.LeaveRequestService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/leave/requests")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> submitLeaveRequest(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @RequestParam Long employeeId,
            @Valid @RequestBody LeaveRequestDto request) {

        LeaveRequestResponse responseData = leaveRequestService.submitLeaveRequest(tenantId, employeeId, request, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Leave request submitted successfully", responseData));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> approveLeaveRequest(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @PathVariable Long id,
            @RequestBody(required = false) ApprovalRequest request) {

        String notes = request != null ? request.getNotes() : "Approved";
        LeaveRequestResponse responseData = leaveRequestService.approveLeaveRequest(tenantId, id, actorEmail, notes);
        return ResponseEntity.ok(ApiResponse.success("Leave request approved successfully", responseData));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> rejectLeaveRequest(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @PathVariable Long id,
            @RequestBody(required = false) ApprovalRequest request) {

        String notes = request != null ? request.getNotes() : "Rejected";
        LeaveRequestResponse responseData = leaveRequestService.rejectLeaveRequest(tenantId, id, actorEmail, notes);
        return ResponseEntity.ok(ApiResponse.success("Leave request rejected successfully", responseData));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> cancelLeaveRequest(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @PathVariable Long id) {

        LeaveRequestResponse responseData = leaveRequestService.cancelLeaveRequest(tenantId, id, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Leave request cancelled successfully", responseData));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> getLeaveRequest(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @PathVariable Long id) {

        LeaveRequestResponse responseData = leaveRequestService.getLeaveRequest(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success("Success", responseData));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LeaveRequestResponse>>> getLeaveRequests(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<LeaveRequestResponse> pageData;
        if (employeeId != null) {
            pageData = leaveRequestService.getEmployeeLeaveRequests(tenantId, employeeId, page, size);
        } else {
            pageData = leaveRequestService.getAllLeaveRequests(tenantId, status, page, size);
        }

        ApiResponse.PaginationMetadata pagination = ApiResponse.PaginationMetadata.builder()
                .page(pageData.getNumber())
                .size(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .isLast(pageData.isLast())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Success", pageData, pagination));
    }
}
