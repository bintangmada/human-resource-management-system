package com.hrms.enterprise.notification.repository;

import com.hrms.enterprise.notification.entity.CompanyEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyEventRepository extends JpaRepository<CompanyEvent, Long> {
    Page<CompanyEvent> findByTenantIdOrderByEventDateAsc(Long tenantId, Pageable pageable);
    List<CompanyEvent> findByTenantIdAndEventDateBetweenOrderByEventDateAsc(
            Long tenantId, LocalDate from, LocalDate to);
    Optional<CompanyEvent> findByIdAndTenantId(Long id, Long tenantId);
}
