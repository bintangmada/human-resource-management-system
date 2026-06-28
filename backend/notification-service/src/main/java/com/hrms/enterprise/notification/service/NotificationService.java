package com.hrms.enterprise.notification.service;

import com.hrms.enterprise.notification.dto.AnnouncementPayload;
import com.hrms.enterprise.notification.dto.CompanyEventPayload;
import com.hrms.enterprise.notification.entity.Announcement;
import com.hrms.enterprise.notification.entity.CompanyEvent;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public interface NotificationService {

    // Announcements
    Announcement createAnnouncement(AnnouncementPayload payload, Long tenantId, String actorEmail);
    Announcement updateAnnouncement(Long id, AnnouncementPayload payload, Long tenantId, String actorEmail);
    Page<Announcement> getAnnouncements(Long tenantId, String status, int page, int size);
    Announcement archiveAnnouncement(Long id, Long tenantId, String actorEmail);

    // Company Events / Calendar
    CompanyEvent createEvent(CompanyEventPayload payload, Long tenantId, String actorEmail);
    CompanyEvent updateEvent(Long id, CompanyEventPayload payload, Long tenantId, String actorEmail);
    Page<CompanyEvent> getEvents(Long tenantId, int page, int size);
    List<CompanyEvent> getEventsInRange(Long tenantId, LocalDate from, LocalDate to);
    void deleteEvent(Long id, Long tenantId);
}
