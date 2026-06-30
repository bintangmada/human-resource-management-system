package com.hrms.enterprise.payroll.repository;

import com.hrms.enterprise.payroll.entity.Payroll;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    Page<Payroll> findByTenantIdAndPayrollStatus(Long tenantId, String payrollStatus, Pageable pageable);
    Page<Payroll> findByTenantId(Long tenantId, Pageable pageable);
    Page<Payroll> findByTenantIdAndEmployeeId(Long tenantId, Long employeeId, Pageable pageable);
    Optional<Payroll> findByTenantIdAndEmployeeIdAndMonthAndYearAndDeletedStatus(Long tenantId, Long employeeId, Integer month, Integer year, Integer deletedStatus);
    Optional<Payroll> findByIdAndTenantId(Long id, Long tenantId);
}
