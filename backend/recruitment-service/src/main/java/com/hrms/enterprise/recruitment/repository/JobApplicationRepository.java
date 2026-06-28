package com.hrms.enterprise.recruitment.repository;

import com.hrms.enterprise.recruitment.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    Page<JobApplication> findByTenantId(Long tenantId, Pageable pageable);
    Page<JobApplication> findByTenantIdAndJobPostingId(Long tenantId, Long jobPostingId, Pageable pageable);
    Page<JobApplication> findByTenantIdAndStatus(Long tenantId, String status, Pageable pageable);
    Optional<JobApplication> findByIdAndTenantId(Long id, Long tenantId);
}
