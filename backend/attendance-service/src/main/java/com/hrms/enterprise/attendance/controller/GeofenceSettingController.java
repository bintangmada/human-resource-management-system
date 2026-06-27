package com.hrms.enterprise.attendance.controller;

import com.hrms.enterprise.attendance.dto.ApiResponse;
import com.hrms.enterprise.attendance.dto.GeofenceSettingRequest;
import com.hrms.enterprise.attendance.dto.GeofenceSettingResponse;
import com.hrms.enterprise.attendance.service.GeofenceSettingService;
import jakarta.validation.Valid;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;

@RestController
@RequestMapping("/api/v1/geofence")
public class GeofenceSettingController {

    private final GeofenceSettingService geofenceSettingService;
    private final MessageSource messageSource;

    public GeofenceSettingController(GeofenceSettingService geofenceSettingService, MessageSource messageSource) {
        this.geofenceSettingService = geofenceSettingService;
        this.messageSource = messageSource;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GeofenceSettingResponse>> createGeofence(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @Valid @RequestBody GeofenceSettingRequest request) {

        GeofenceSettingResponse responseData = geofenceSettingService.createGeofence(tenantId, request, actorEmail);
        Locale locale = LocaleContextHolder.getLocale();
        String message = messageSource.getMessage("geofence.create.success", null, locale);

        return ResponseEntity.ok(ApiResponse.success(message, responseData));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GeofenceSettingResponse>> updateGeofence(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @PathVariable Long id,
            @Valid @RequestBody GeofenceSettingRequest request) {

        GeofenceSettingResponse responseData = geofenceSettingService.updateGeofence(tenantId, id, request, actorEmail);
        Locale locale = LocaleContextHolder.getLocale();
        String message = messageSource.getMessage("geofence.update.success", null, locale);

        return ResponseEntity.ok(ApiResponse.success(message, responseData));
    }

    @PostMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteGeofence(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail,
            @PathVariable Long id) {

        geofenceSettingService.deleteGeofence(tenantId, id, actorEmail);
        Locale locale = LocaleContextHolder.getLocale();
        String message = messageSource.getMessage("geofence.delete.success", null, locale);

        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GeofenceSettingResponse>> getGeofence(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @PathVariable Long id) {

        GeofenceSettingResponse responseData = geofenceSettingService.getGeofence(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success("Success", responseData));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<GeofenceSettingResponse>>> getAllGeofences(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<GeofenceSettingResponse> pageData = geofenceSettingService.getAllGeofences(tenantId, search, page, size);
        ApiResponse.PaginationMetadata pagination = ApiResponse.PaginationMetadata.builder()
                .page(pageData.getNumber())
                .size(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .isLast(pageData.isLast())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Success", pageData, pagination));
    }
}
