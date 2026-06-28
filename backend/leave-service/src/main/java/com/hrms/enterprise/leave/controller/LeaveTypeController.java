package com.hrms.enterprise.leave.controller;

import com.hrms.enterprise.leave.dto.ApiResponse;
import com.hrms.enterprise.leave.dto.LeaveTypeRequest;
import com.hrms.enterprise.leave.dto.LeaveTypeResponse;
import com.hrms.enterprise.leave.service.LeaveTypeService;
import jakarta.validation.Valid;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/v1/leave/types")
public class LeaveTypeController {

    private final LeaveTypeService leaveTypeService;
    private final MessageSource messageSource;

    public LeaveTypeController(LeaveTypeService leaveTypeService, MessageSource messageSource) {
        this.leaveTypeService = leaveTypeService;
        this.messageSource = messageSource;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveTypeResponse>> createLeaveType(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @Valid @RequestBody LeaveTypeRequest request) {

        LeaveTypeResponse responseData = leaveTypeService.createLeaveType(tenantId, request, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Leave type created successfully", responseData));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveTypeResponse>> updateLeaveType(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @PathVariable Long id,
            @Valid @RequestBody LeaveTypeRequest request) {

        LeaveTypeResponse responseData = leaveTypeService.updateLeaveType(tenantId, id, request, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Leave type updated successfully", responseData));
    }

    @PostMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteLeaveType(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @PathVariable Long id) {

        leaveTypeService.deleteLeaveType(tenantId, id, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Leave type deleted successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveTypeResponse>> getLeaveType(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @PathVariable Long id) {

        LeaveTypeResponse responseData = leaveTypeService.getLeaveType(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success("Success", responseData));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<LeaveTypeResponse>>> getActiveLeaveTypes(
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        List<LeaveTypeResponse> list = leaveTypeService.getActiveLeaveTypes(tenantId);
        return ResponseEntity.ok(ApiResponse.success("Success", list));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LeaveTypeResponse>>> getAllLeaveTypes(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<LeaveTypeResponse> pageData = leaveTypeService.getAllLeaveTypes(tenantId, search, page, size);
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
