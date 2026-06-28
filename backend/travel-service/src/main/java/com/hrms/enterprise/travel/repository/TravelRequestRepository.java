package com.hrms.enterprise.travel.repository;

import com.hrms.enterprise.travel.entity.TravelRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TravelRequestRepository extends JpaRepository<TravelRequest, Long> {
    Page<TravelRequest> findByTenantIdOrderByStartDateDesc(Long tenantId, Pageable pageable);
    List<TravelRequest> findByTenantIdAndEmployeeEmailOrderByStartDateDesc(Long tenantId, String employeeEmail);
    Optional<TravelRequest> findByIdAndTenantId(Long id, Long tenantId);
}
