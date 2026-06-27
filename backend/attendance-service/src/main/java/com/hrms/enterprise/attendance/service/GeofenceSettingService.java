package com.hrms.enterprise.attendance.service;

import com.hrms.enterprise.attendance.dto.GeofenceSettingRequest;
import com.hrms.enterprise.attendance.dto.GeofenceSettingResponse;
import org.springframework.data.domain.Page;

public interface GeofenceSettingService {

    GeofenceSettingResponse createGeofence(Long tenantId, GeofenceSettingRequest request, String actorEmail);

    GeofenceSettingResponse updateGeofence(Long tenantId, Long id, GeofenceSettingRequest request, String actorEmail);

    void deleteGeofence(Long tenantId, Long id, String actorEmail);

    GeofenceSettingResponse getGeofence(Long tenantId, Long id);

    Page<GeofenceSettingResponse> getAllGeofences(Long tenantId, String nameSearch, int page, int size);
}
