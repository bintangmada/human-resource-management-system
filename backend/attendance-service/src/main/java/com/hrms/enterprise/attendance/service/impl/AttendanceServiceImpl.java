package com.hrms.enterprise.attendance.service.impl;

import com.hrms.enterprise.attendance.dto.AttendanceResponse;
import com.hrms.enterprise.attendance.dto.ClockInRequest;
import com.hrms.enterprise.attendance.dto.ClockOutRequest;
import com.hrms.enterprise.attendance.entity.Attendance;
import com.hrms.enterprise.attendance.entity.GeofenceSetting;
import com.hrms.enterprise.attendance.exception.BadRequestException;
import com.hrms.enterprise.attendance.exception.ResourceNotFoundException;
import com.hrms.enterprise.attendance.repository.AttendanceRepository;
import com.hrms.enterprise.attendance.repository.GeofenceSettingRepository;
import com.hrms.enterprise.attendance.service.AttendanceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final GeofenceSettingRepository geofenceSettingRepository;

    // Batas waktu clock-in standar: 09:00 pagi
    private static final LocalTime STANDAR_CLOCK_IN_LIMIT = LocalTime.of(9, 0);
    // Batas waktu clock-out standar: 17:00 sore
    private static final LocalTime STANDAR_CLOCK_OUT_LIMIT = LocalTime.of(17, 0);

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository,
                                 GeofenceSettingRepository geofenceSettingRepository) {
        this.attendanceRepository = attendanceRepository;
        this.geofenceSettingRepository = geofenceSettingRepository;
    }

    @Override
    @Transactional
    public AttendanceResponse clockIn(Long tenantId, ClockInRequest request, String actorEmail) {
        LocalDate today = LocalDate.now();

        // 1. Cek apakah sudah clock-in hari ini
        attendanceRepository.findByTenantIdAndEmployeeIdAndDateAndDeletedStatus(tenantId, request.getEmployeeId(), today, 0)
                .ifPresent(a -> {
                    throw new BadRequestException("attendance.already.clockedin");
                });

        // 2. Validasi Geofencing jika ada geofence aktif untuk tenant ini
        validateGeofence(tenantId, request.getLatitude(), request.getLongitude());

        // 3. Tentukan status terlambat (LATE) atau normal
        LocalDateTime now = LocalDateTime.now();
        String status = now.toLocalTime().isAfter(STANDAR_CLOCK_IN_LIMIT) ? "LATE" : "NORMAL";

        Attendance attendance = Attendance.builder()
                .tenantId(tenantId)
                .employeeId(request.getEmployeeId())
                .date(today)
                .clockIn(now)
                .clockInLatitude(request.getLatitude())
                .clockInLongitude(request.getLongitude())
                .clockInStatus(status)
                .notes(request.getNotes())
                .createdBy(actorEmail)
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AttendanceResponse clockOut(Long tenantId, ClockOutRequest request, String actorEmail) {
        LocalDate today = LocalDate.now();

        // 1. Dapatkan data clock-in hari ini
        Attendance attendance = attendanceRepository.findByTenantIdAndEmployeeIdAndDateAndDeletedStatus(tenantId, request.getEmployeeId(), today, 0)
                .orElseThrow(() -> new BadRequestException("attendance.not.clockedin"));

        // 2. Cek apakah sudah clock-out hari ini
        if (attendance.getClockOut() != null) {
            throw new BadRequestException("attendance.already.clockedout");
        }

        // 3. Validasi Geofencing
        validateGeofence(tenantId, request.getLatitude(), request.getLongitude());

        // 4. Tentukan status pulang cepat (EARLY_OUT) atau normal
        LocalDateTime now = LocalDateTime.now();
        String status = now.toLocalTime().isBefore(STANDAR_CLOCK_OUT_LIMIT) ? "EARLY_OUT" : "NORMAL";

        attendance.setClockOut(now);
        attendance.setClockOutLatitude(request.getLatitude());
        attendance.setClockOutLongitude(request.getLongitude());
        attendance.setClockOutStatus(status);
        if (request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            String combinedNotes = attendance.getNotes() != null
                    ? attendance.getNotes() + " | Clock-Out Note: " + request.getNotes()
                    : request.getNotes();
            attendance.setNotes(combinedNotes);
        }
        attendance.setUpdatedBy(actorEmail);

        Attendance saved = attendanceRepository.save(attendance);
        return mapToResponse(saved);
    }

    @Override
    public AttendanceResponse getTodayAttendance(Long tenantId, Long employeeId) {
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByTenantIdAndEmployeeIdAndDateAndDeletedStatus(tenantId, employeeId, today, 0)
                .orElseThrow(() -> new ResourceNotFoundException("attendance.not.found"));
        return mapToResponse(attendance);
    }

    @Override
    public Page<AttendanceResponse> getAttendanceHistory(
            Long tenantId, Long employeeId, LocalDate startDate, LocalDate endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Attendance> pageResult;

        if (employeeId != null) {
            if (startDate != null && endDate != null) {
                pageResult = attendanceRepository.findByTenantIdAndEmployeeIdAndDateBetweenAndDeletedStatus(
                        tenantId, employeeId, startDate, endDate, 0, pageable);
            } else {
                pageResult = attendanceRepository.findByTenantIdAndEmployeeIdAndDeletedStatus(
                        tenantId, employeeId, 0, pageable);
            }
        } else {
            if (startDate != null && endDate != null) {
                pageResult = attendanceRepository.findByTenantIdAndDateBetweenAndDeletedStatus(
                        tenantId, startDate, endDate, 0, pageable);
            } else {
                pageResult = attendanceRepository.findByTenantIdAndDeletedStatus(tenantId, 0, pageable);
            }
        }

        return pageResult.map(this::mapToResponse);
    }

    /**
     * Memvalidasi apakah koordinat yang diberikan berada di dalam radius salah satu geofence yang aktif.
     */
    private void validateGeofence(Long tenantId, double clientLat, double clientLng) {
        List<GeofenceSetting> activeGeofences = geofenceSettingRepository
                .findByTenantIdAndIsActiveTrueAndDeletedStatus(tenantId, 0);

        // Jika tidak ada geofence yang dikonfigurasi/aktif, maka bypass validasi
        if (activeGeofences.isEmpty()) {
            return;
        }

        boolean insideAnyGeofence = false;
        for (GeofenceSetting geofence : activeGeofences) {
            double distance = calculateDistance(clientLat, clientLng, geofence.getLatitude(), geofence.getLongitude());
            if (distance <= geofence.getRadiusMeter()) {
                insideAnyGeofence = true;
                break;
            }
        }

        if (!insideAnyGeofence) {
            throw new BadRequestException("attendance.outside.geofence");
        }
    }

    /**
     * Menghitung jarak antara dua koordinat menggunakan formula Haversine (dalam meter).
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Radius bumi dalam meter
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private AttendanceResponse mapToResponse(Attendance entity) {
        return AttendanceResponse.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployeeId())
                .date(entity.getDate())
                .clockIn(entity.getClockIn())
                .clockOut(entity.getClockOut())
                .clockInLatitude(entity.getClockInLatitude())
                .clockInLongitude(entity.getClockInLongitude())
                .clockOutLatitude(entity.getClockOutLatitude())
                .clockOutLongitude(entity.getClockOutLongitude())
                .clockInStatus(entity.getClockInStatus())
                .clockOutStatus(entity.getClockOutStatus())
                .notes(entity.getNotes())
                .build();
    }
}
