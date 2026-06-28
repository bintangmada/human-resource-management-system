package com.hrms.enterprise.leave.repository;

import com.hrms.enterprise.leave.entity.LeaveType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {
    Page<LeaveType> findByTenantIdAndDeletedStatus(Long tenantId, Integer deletedStatus, Pageable pageable);
    Page<LeaveType> findByTenantIdAndNameContainingIgnoreCaseAndDeletedStatus(Long tenantId, String name, Integer deletedStatus, Pageable pageable);
    List<LeaveType> findByTenantIdAndDeletedStatus(Long tenantId, Integer deletedStatus);
    Optional<LeaveType> findByIdAndTenantIdAndDeletedStatus(Long id, Long tenantId, Integer deletedStatus);
}
