package com.hrms.enterprise.attendance.service;

import com.hrms.enterprise.attendance.dto.AttendanceResponse;
import com.hrms.enterprise.attendance.dto.ClockInRequest;
import com.hrms.enterprise.attendance.dto.ClockOutRequest;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

public interface AttendanceService {

    AttendanceResponse clockIn(Long tenantId, ClockInRequest request, String actorEmail);

    AttendanceResponse clockOut(Long tenantId, ClockOutRequest request, String actorEmail);

    AttendanceResponse getTodayAttendance(Long tenantId, Long employeeId);

    Page<AttendanceResponse> getAttendanceHistory(
            Long tenantId, Long employeeId, LocalDate startDate, LocalDate endDate, int page, int size);
}
