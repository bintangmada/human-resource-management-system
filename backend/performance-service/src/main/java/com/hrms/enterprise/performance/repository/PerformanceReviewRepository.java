package com.hrms.enterprise.performance.repository;

import com.hrms.enterprise.performance.entity.PerformanceReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    Page<PerformanceReview> findByTenantId(Long tenantId, Pageable pageable);
    Page<PerformanceReview> findByTenantIdAndEmployeeId(Long tenantId, Long employeeId, Pageable pageable);
    Page<PerformanceReview> findByTenantIdAndStatus(Long tenantId, String status, Pageable pageable);
    Optional<PerformanceReview> findByIdAndTenantId(Long id, Long tenantId);
}
