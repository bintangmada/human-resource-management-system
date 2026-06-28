package com.hrms.enterprise.leave.repository;

import com.hrms.enterprise.leave.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    Optional<LeaveBalance> findByTenantIdAndEmployeeIdAndLeaveTypeIdAndYearAndDeletedStatus(
            Long tenantId, Long employeeId, Long leaveTypeId, Integer year, Integer deletedStatus);

    List<LeaveBalance> findByTenantIdAndEmployeeIdAndYearAndDeletedStatus(
            Long tenantId, Long employeeId, Integer year, Integer deletedStatus);

    List<LeaveBalance> findByTenantIdAndEmployeeIdAndDeletedStatus(
            Long tenantId, Long employeeId, Integer deletedStatus);

    Optional<LeaveBalance> findByIdAndTenantIdAndDeletedStatus(Long id, Long tenantId, Integer deletedStatus);
}
