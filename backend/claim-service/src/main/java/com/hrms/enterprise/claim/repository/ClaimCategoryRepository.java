package com.hrms.enterprise.claim.repository;

import com.hrms.enterprise.claim.entity.ClaimCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimCategoryRepository extends JpaRepository<ClaimCategory, Long> {
    List<ClaimCategory> findByTenantId(Long tenantId);
    List<ClaimCategory> findByTenantIdAndStatus(Long tenantId, Integer status);
    Optional<ClaimCategory> findByIdAndTenantId(Long id, Long tenantId);
}
