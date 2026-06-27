package com.hrms.enterprise.attendance.repository;

import com.hrms.enterprise.attendance.entity.GeofenceSetting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GeofenceSettingRepository extends JpaRepository<GeofenceSetting, Long> {

    Optional<GeofenceSetting> findByIdAndTenantIdAndDeletedStatus(
            Long id, Long tenantId, Integer deletedStatus);

    List<GeofenceSetting> findByTenantIdAndIsActiveTrueAndDeletedStatus(
            Long tenantId, Integer deletedStatus);

    Page<GeofenceSetting> findByTenantIdAndDeletedStatus(
            Long tenantId, Integer deletedStatus, Pageable pageable);

    Page<GeofenceSetting> findByTenantIdAndNameContainingIgnoreCaseAndDeletedStatus(
            Long tenantId, String name, Integer deletedStatus, Pageable pageable);
}
