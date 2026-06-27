package com.hrms.enterprise.attendance.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AttendanceResponse {
    private Long id;
    private Long employeeId;
    private LocalDate date;
    private LocalDateTime clockIn;
    private LocalDateTime clockOut;
    private Double clockInLatitude;
    private Double clockInLongitude;
    private Double clockOutLatitude;
    private Double clockOutLongitude;
    private String clockInStatus;
    private String clockOutStatus;
    private String notes;
}
