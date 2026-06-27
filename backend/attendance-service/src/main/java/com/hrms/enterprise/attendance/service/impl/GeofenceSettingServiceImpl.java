package com.hrms.enterprise.attendance.service.impl;

import com.hrms.enterprise.attendance.dto.GeofenceSettingRequest;
import com.hrms.enterprise.attendance.dto.GeofenceSettingResponse;
import com.hrms.enterprise.attendance.entity.GeofenceSetting;
import com.hrms.enterprise.attendance.exception.ResourceNotFoundException;
import com.hrms.enterprise.attendance.repository.GeofenceSettingRepository;
import com.hrms.enterprise.attendance.service.GeofenceSettingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GeofenceSettingServiceImpl implements GeofenceSettingService {

    private final GeofenceSettingRepository geofenceSettingRepository;

    public GeofenceSettingServiceImpl(GeofenceSettingRepository geofenceSettingRepository) {
        this.geofenceSettingRepository = geofenceSettingRepository;
    }

    @Override
    @Transactional
    public GeofenceSettingResponse createGeofence(Long tenantId, GeofenceSettingRequest request, String actorEmail) {
        GeofenceSetting geofence = GeofenceSetting.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .radiusMeter(request.getRadiusMeter())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .createdBy(actorEmail)
                .build();

        GeofenceSetting saved = geofenceSettingRepository.save(geofence);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public GeofenceSettingResponse updateGeofence(Long tenantId, Long id, GeofenceSettingRequest request, String actorEmail) {
        GeofenceSetting geofence = geofenceSettingRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("geofence.not.found"));

        geofence.setName(request.getName());
        geofence.setLatitude(request.getLatitude());
        geofence.setLongitude(request.getLongitude());
        geofence.setRadiusMeter(request.getRadiusMeter());
        if (request.getIsActive() != null) {
            geofence.setIsActive(request.getIsActive());
        }
        geofence.setUpdatedBy(actorEmail);

        GeofenceSetting saved = geofenceSettingRepository.save(geofence);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteGeofence(Long tenantId, Long id, String actorEmail) {
        GeofenceSetting geofence = geofenceSettingRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("geofence.not.found"));

        geofence.setDeletedStatus(1);
        geofence.setDeletedBy(actorEmail);
        geofence.setDeletedAt(java.time.LocalDateTime.now());
        geofenceSettingRepository.save(geofence);
    }

    @Override
    public GeofenceSettingResponse getGeofence(Long tenantId, Long id) {
        GeofenceSetting geofence = geofenceSettingRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("geofence.not.found"));
        return mapToResponse(geofence);
    }

    @Override
    public Page<GeofenceSettingResponse> getAllGeofences(Long tenantId, String nameSearch, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GeofenceSetting> pageResult;
        if (nameSearch != null && !nameSearch.trim().isEmpty()) {
            pageResult = geofenceSettingRepository.findByTenantIdAndNameContainingIgnoreCaseAndDeletedStatus(
                    tenantId, nameSearch, 0, pageable);
        } else {
            pageResult = geofenceSettingRepository.findByTenantIdAndDeletedStatus(tenantId, 0, pageable);
        }
        return pageResult.map(this::mapToResponse);
    }

    private GeofenceSettingResponse mapToResponse(GeofenceSetting entity) {
        return GeofenceSettingResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .radiusMeter(entity.getRadiusMeter())
                .isActive(entity.getIsActive())
                .build();
    }
}
