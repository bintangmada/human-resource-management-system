package com.hrms.enterprise.leave.repository;

import com.hrms.enterprise.leave.entity.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    Page<LeaveRequest> findByTenantIdAndDeletedStatus(Long tenantId, Integer deletedStatus, Pageable pageable);
    
    Page<LeaveRequest> findByTenantIdAndEmployeeIdAndDeletedStatus(Long tenantId, Long employeeId, Integer deletedStatus, Pageable pageable);
    
    Page<LeaveRequest> findByTenantIdAndLeaveStatusAndDeletedStatus(Long tenantId, String leaveStatus, Integer deletedStatus, Pageable pageable);
    
    Optional<LeaveRequest> findByIdAndTenantIdAndDeletedStatus(Long id, Long tenantId, Integer deletedStatus);
}
