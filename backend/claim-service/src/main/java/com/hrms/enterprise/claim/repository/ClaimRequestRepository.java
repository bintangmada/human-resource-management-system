package com.hrms.enterprise.claim.repository;

import com.hrms.enterprise.claim.entity.ClaimRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClaimRequestRepository extends JpaRepository<ClaimRequest, Long> {
    Page<ClaimRequest> findByTenantId(Long tenantId, Pageable pageable);
    Page<ClaimRequest> findByTenantIdAndStatus(Long tenantId, String status, Pageable pageable);
    Page<ClaimRequest> findByTenantIdAndEmployeeId(Long tenantId, Long employeeId, Pageable pageable);
    Optional<ClaimRequest> findByIdAndTenantId(Long id, Long tenantId);
}
