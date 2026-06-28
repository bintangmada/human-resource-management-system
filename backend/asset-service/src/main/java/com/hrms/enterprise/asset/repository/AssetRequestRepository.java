package com.hrms.enterprise.asset.repository;

import com.hrms.enterprise.asset.entity.AssetRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssetRequestRepository extends JpaRepository<AssetRequest, Long> {
    Page<AssetRequest> findByTenantId(Long tenantId, Pageable pageable);
    Page<AssetRequest> findByTenantIdAndEmployeeId(Long tenantId, Long employeeId, Pageable pageable);
    Optional<AssetRequest> findByIdAndTenantId(Long id, Long tenantId);
}
