package com.hrms.enterprise.claim.repository;

import com.hrms.enterprise.claim.entity.ClaimBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimBalanceRepository extends JpaRepository<ClaimBalance, Long> {
    List<ClaimBalance> findByTenantIdAndEmployeeIdAndYear(Long tenantId, Long employeeId, Integer year);
    List<ClaimBalance> findByTenantIdAndYear(Long tenantId, Integer year);
    Optional<ClaimBalance> findByTenantIdAndEmployeeIdAndCategoryIdAndYear(Long tenantId, Long employeeId, Long categoryId, Integer year);
    Optional<ClaimBalance> findByIdAndTenantId(Long id, Long tenantId);
}
