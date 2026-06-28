package com.hrms.enterprise.offboarding.repository;

import com.hrms.enterprise.offboarding.entity.OffboardingRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OffboardingRequestRepository extends JpaRepository<OffboardingRequest, Long> {
    Page<OffboardingRequest> findByTenantIdOrderByResignationDateDesc(Long tenantId, Pageable pageable);
    List<OffboardingRequest> findByTenantIdAndEmployeeEmail(Long tenantId, String employeeEmail);
    Optional<OffboardingRequest> findByIdAndTenantId(Long id, Long tenantId);
}
