package com.hrms.enterprise.asset.repository;

import com.hrms.enterprise.asset.entity.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    Page<Asset> findByTenantId(Long tenantId, Pageable pageable);
    List<Asset> findByTenantIdAndEmployeeId(Long tenantId, Long employeeId);
    Optional<Asset> findByIdAndTenantId(Long id, Long tenantId);
    Optional<Asset> findBySerialNumberAndTenantId(String serialNumber, Long tenantId);
}
