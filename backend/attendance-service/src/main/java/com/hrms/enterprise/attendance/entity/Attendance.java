package com.hrms.enterprise.attendance.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entitas Attendance menyimpan riwayat clock-in dan clock-out harian karyawan.
 */
@Entity
@Table(name = "attendances")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@SuperBuilder
public class Attendance extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "clock_in")
    private LocalDateTime clockIn;

    @Column(name = "clock_out")
    private LocalDateTime clockOut;

    @Column(name = "clock_in_latitude")
    private Double clockInLatitude;

    @Column(name = "clock_in_longitude")
    private Double clockInLongitude;

    @Column(name = "clock_out_latitude")
    private Double clockOutLatitude;

    @Column(name = "clock_out_longitude")
    private Double clockOutLongitude;

    // Status clock in: NORMAL, LATE
    @Column(name = "clock_in_status", length = 20)
    private String clockInStatus;

    // Status clock out: NORMAL, EARLY_OUT
    @Column(name = "clock_out_status", length = 20)
    private String clockOutStatus;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
