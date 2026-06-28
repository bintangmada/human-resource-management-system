package com.hrms.enterprise.notification.controller;

import com.hrms.enterprise.notification.dto.ApiResponse;
import com.hrms.enterprise.notification.dto.CompanyEventPayload;
import com.hrms.enterprise.notification.entity.CompanyEvent;
import com.hrms.enterprise.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications/events")
public class CompanyEventController {

    private final NotificationService notificationService;

    public CompanyEventController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CompanyEvent>> create(
            @Valid @RequestBody CompanyEventPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        CompanyEvent data = notificationService.createEvent(payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Event created successfully", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyEvent>> update(
            @PathVariable Long id,
            @Valid @RequestBody CompanyEventPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        CompanyEvent data = notificationService.updateEvent(id, payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Event updated", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CompanyEvent>>> list(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Page<CompanyEvent> data = notificationService.getEvents(tenantId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Events retrieved", data));
    }

    @GetMapping("/range")
    public ResponseEntity<ApiResponse<List<CompanyEvent>>> range(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<CompanyEvent> data = notificationService.getEventsInRange(tenantId, from, to);
        return ResponseEntity.ok(ApiResponse.success("Events in range retrieved", data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId) {
        notificationService.deleteEvent(id, tenantId);
        return ResponseEntity.ok(ApiResponse.success("Event deleted"));
    }
}
