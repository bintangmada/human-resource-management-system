package com.hrms.enterprise.attendance.controller;

import com.hrms.enterprise.attendance.dto.ApiResponse;
import com.hrms.enterprise.attendance.dto.AttendanceResponse;
import com.hrms.enterprise.attendance.dto.ClockInRequest;
import com.hrms.enterprise.attendance.dto.ClockOutRequest;
import com.hrms.enterprise.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Locale;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final MessageSource messageSource;

    public AttendanceController(AttendanceService attendanceService, MessageSource messageSource) {
        this.attendanceService = attendanceService;
        this.messageSource = messageSource;
    }

    @PostMapping("/clock-in")
    public ResponseEntity<ApiResponse<AttendanceResponse>> clockIn(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @Valid @RequestBody ClockInRequest request) {

        AttendanceResponse responseData = attendanceService.clockIn(tenantId, request, actorEmail);
        Locale locale = LocaleContextHolder.getLocale();
        String message = messageSource.getMessage("attendance.clockin.success", null, locale);

        return ResponseEntity.ok(ApiResponse.success(message, responseData));
    }

    @PostMapping("/clock-out")
    public ResponseEntity<ApiResponse<AttendanceResponse>> clockOut(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @Valid @RequestBody ClockOutRequest request) {

        AttendanceResponse responseData = attendanceService.clockOut(tenantId, request, actorEmail);
        Locale locale = LocaleContextHolder.getLocale();
        String message = messageSource.getMessage("attendance.clockout.success", null, locale);

        return ResponseEntity.ok(ApiResponse.success(message, responseData));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<AttendanceResponse>> getTodayAttendance(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam Long employeeId) {

        AttendanceResponse responseData = attendanceService.getTodayAttendance(tenantId, employeeId);
        return ResponseEntity.ok(ApiResponse.success("Success", responseData));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<AttendanceResponse>>> getAttendanceHistory(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<AttendanceResponse> pageData = attendanceService.getAttendanceHistory(
                tenantId, employeeId, startDate, endDate, page, size);

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
