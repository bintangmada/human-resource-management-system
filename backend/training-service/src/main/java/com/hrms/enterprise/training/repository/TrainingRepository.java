package com.hrms.enterprise.training.repository;

import com.hrms.enterprise.training.entity.Training;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainingRepository extends JpaRepository<Training, Long> {
    Page<Training> findByTenantIdOrderByScheduleDateDesc(Long tenantId, Pageable pageable);
    Optional<Training> findByIdAndTenantId(Long id, Long tenantId);
}
