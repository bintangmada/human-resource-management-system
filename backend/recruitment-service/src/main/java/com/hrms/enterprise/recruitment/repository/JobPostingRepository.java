package com.hrms.enterprise.recruitment.repository;

import com.hrms.enterprise.recruitment.entity.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    Page<JobPosting> findByTenantId(Long tenantId, Pageable pageable);
    Page<JobPosting> findByTenantIdAndStatus(Long tenantId, String status, Pageable pageable);
    Optional<JobPosting> findByIdAndTenantId(Long id, Long tenantId);
}
