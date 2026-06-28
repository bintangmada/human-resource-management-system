package com.hrms.enterprise.loan.repository;

import com.hrms.enterprise.loan.entity.LoanRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoanRequestRepository extends JpaRepository<LoanRequest, Long> {
    Page<LoanRequest> findByTenantId(Long tenantId, Pageable pageable);
    Page<LoanRequest> findByTenantIdAndEmployeeId(Long tenantId, Long employeeId, Pageable pageable);
    Page<LoanRequest> findByTenantIdAndStatus(Long tenantId, String status, Pageable pageable);
    Optional<LoanRequest> findByIdAndTenantId(Long id, Long tenantId);
}
