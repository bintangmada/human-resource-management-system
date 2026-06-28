package com.hrms.enterprise.payroll.repository;

import com.hrms.enterprise.payroll.entity.EmployeeSalarySetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeSalarySettingRepository extends JpaRepository<EmployeeSalarySetting, Long> {
    List<EmployeeSalarySetting> findByTenantIdAndStatus(Long tenantId, Integer status);
    Optional<EmployeeSalarySetting> findByTenantIdAndEmployeeIdAndStatus(Long tenantId, Long employeeId, Integer status);
    boolean existsByTenantIdAndEmployeeIdAndStatus(Long tenantId, Long employeeId, Integer status);
}
