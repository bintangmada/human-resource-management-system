package com.hrms.enterprise.employee.repository;

import com.hrms.enterprise.employee.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository TenantRepository menyediakan operasi database standar (CRUD)
 * untuk entitas Tenant menggunakan Spring Data JPA.
 */
@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    
    // Mencari tenant berdasarkan subdomain (untuk otentikasi login terisolasi)
    Optional<Tenant> findBySubdomainAndDeletedStatus(String subdomain, Integer deletedStatus);
    
    // Cek keunikan subdomain saat onboarding tenant baru
    boolean existsBySubdomainAndDeletedStatus(String subdomain, Integer deletedStatus);
}
