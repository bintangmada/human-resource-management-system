package com.hrms.enterprise.attendance.repository;

import com.hrms.enterprise.attendance.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByTenantIdAndEmployeeIdAndDateAndDeletedStatus(
            Long tenantId, Long employeeId, LocalDate date, Integer deletedStatus);

    Page<Attendance> findByTenantIdAndDeletedStatus(
            Long tenantId, Integer deletedStatus, Pageable pageable);

    Page<Attendance> findByTenantIdAndEmployeeIdAndDeletedStatus(
            Long tenantId, Long employeeId, Integer deletedStatus, Pageable pageable);

    Page<Attendance> findByTenantIdAndDateBetweenAndDeletedStatus(
            Long tenantId, LocalDate startDate, LocalDate endDate, Integer deletedStatus, Pageable pageable);

    Page<Attendance> findByTenantIdAndEmployeeIdAndDateBetweenAndDeletedStatus(
            Long tenantId, Long employeeId, LocalDate startDate, LocalDate endDate, Integer deletedStatus, Pageable pageable);
}
