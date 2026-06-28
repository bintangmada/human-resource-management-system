package com.hrms.enterprise.notification.repository;

import com.hrms.enterprise.notification.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    Page<Announcement> findByTenantIdAndStatusOrderByCreatedAtDesc(Long tenantId, String status, Pageable pageable);
    Page<Announcement> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);
    Optional<Announcement> findByIdAndTenantId(Long id, Long tenantId);
}
