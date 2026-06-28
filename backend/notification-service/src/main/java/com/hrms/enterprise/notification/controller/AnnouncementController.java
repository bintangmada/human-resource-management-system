package com.hrms.enterprise.notification.controller;

import com.hrms.enterprise.notification.dto.AnnouncementPayload;
import com.hrms.enterprise.notification.dto.ApiResponse;
import com.hrms.enterprise.notification.entity.Announcement;
import com.hrms.enterprise.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications/announcements")
public class AnnouncementController {

    private final NotificationService notificationService;

    public AnnouncementController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Announcement>> create(
            @Valid @RequestBody AnnouncementPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        Announcement data = notificationService.createAnnouncement(payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Announcement published successfully", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Announcement>> update(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncementPayload payload,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        Announcement data = notificationService.updateAnnouncement(id, payload, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Announcement updated", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Announcement>>> list(
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Announcement> data = notificationService.getAnnouncements(tenantId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Announcements retrieved", data));
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<Announcement>> archive(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") Long tenantId,
            @RequestHeader("X-User-Email") String actorEmail) {
        Announcement data = notificationService.archiveAnnouncement(id, tenantId, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Announcement archived", data));
    }
}
