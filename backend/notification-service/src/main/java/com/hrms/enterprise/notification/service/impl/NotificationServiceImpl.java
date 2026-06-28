package com.hrms.enterprise.notification.service.impl;

import com.hrms.enterprise.notification.dto.AnnouncementPayload;
import com.hrms.enterprise.notification.dto.CompanyEventPayload;
import com.hrms.enterprise.notification.entity.Announcement;
import com.hrms.enterprise.notification.entity.CompanyEvent;
import com.hrms.enterprise.notification.exception.ResourceNotFoundException;
import com.hrms.enterprise.notification.repository.AnnouncementRepository;
import com.hrms.enterprise.notification.repository.CompanyEventRepository;
import com.hrms.enterprise.notification.service.NotificationService;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final AnnouncementRepository announcementRepository;
    private final CompanyEventRepository companyEventRepository;
    private final MessageSource messageSource;

    public NotificationServiceImpl(AnnouncementRepository announcementRepository,
                                   CompanyEventRepository companyEventRepository,
                                   MessageSource messageSource) {
        this.announcementRepository = announcementRepository;
        this.companyEventRepository = companyEventRepository;
        this.messageSource = messageSource;
    }

    private String msg(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    // ── Announcements ─────────────────────────────────────────────────────────

    @Override
    public Announcement createAnnouncement(AnnouncementPayload payload, Long tenantId, String actorEmail) {
        Announcement a = new Announcement();
        a.setTenantId(tenantId);
        a.setTitle(payload.getTitle());
        a.setContent(payload.getContent());
        a.setPriority(payload.getPriority() != null ? payload.getPriority().toUpperCase() : "INFO");
        a.setTargetAudience(payload.getTargetAudience() != null ? payload.getTargetAudience().toUpperCase() : "ALL");
        a.setStatus(payload.getStatus() != null ? payload.getStatus().toUpperCase() : "PUBLISHED");
        a.setCreatedBy(actorEmail);
        return announcementRepository.save(a);
    }

    @Override
    public Announcement updateAnnouncement(Long id, AnnouncementPayload payload, Long tenantId, String actorEmail) {
        Announcement a = announcementRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(msg("announcement.not.found")));
        a.setTitle(payload.getTitle());
        a.setContent(payload.getContent());
        if (payload.getPriority() != null) a.setPriority(payload.getPriority().toUpperCase());
        if (payload.getTargetAudience() != null) a.setTargetAudience(payload.getTargetAudience().toUpperCase());
        if (payload.getStatus() != null) a.setStatus(payload.getStatus().toUpperCase());
        a.setUpdatedBy(actorEmail);
        return announcementRepository.save(a);
    }

    @Override
    public Page<Announcement> getAnnouncements(Long tenantId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null && !status.isBlank()) {
            return announcementRepository.findByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, status.toUpperCase(), pageable);
        }
        return announcementRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
    }

    @Override
    public Announcement archiveAnnouncement(Long id, Long tenantId, String actorEmail) {
        Announcement a = announcementRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(msg("announcement.not.found")));
        a.setStatus("ARCHIVED");
        a.setUpdatedBy(actorEmail);
        return announcementRepository.save(a);
    }

    // ── Company Events ─────────────────────────────────────────────────────────

    @Override
    public CompanyEvent createEvent(CompanyEventPayload payload, Long tenantId, String actorEmail) {
        CompanyEvent ev = new CompanyEvent();
        ev.setTenantId(tenantId);
        ev.setTitle(payload.getTitle());
        ev.setDescription(payload.getDescription());
        ev.setEventDate(payload.getEventDate());
        ev.setEndDate(payload.getEndDate());
        ev.setEventType(payload.getEventType() != null ? payload.getEventType().toUpperCase() : "OTHER");
        ev.setLocation(payload.getLocation());
        ev.setVisibility(payload.getVisibility() != null ? payload.getVisibility().toUpperCase() : "ALL");
        ev.setCreatedBy(actorEmail);
        return companyEventRepository.save(ev);
    }

    @Override
    public CompanyEvent updateEvent(Long id, CompanyEventPayload payload, Long tenantId, String actorEmail) {
        CompanyEvent ev = companyEventRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(msg("event.not.found")));
        ev.setTitle(payload.getTitle());
        ev.setDescription(payload.getDescription());
        ev.setEventDate(payload.getEventDate());
        ev.setEndDate(payload.getEndDate());
        if (payload.getEventType() != null) ev.setEventType(payload.getEventType().toUpperCase());
        ev.setLocation(payload.getLocation());
        if (payload.getVisibility() != null) ev.setVisibility(payload.getVisibility().toUpperCase());
        ev.setUpdatedBy(actorEmail);
        return companyEventRepository.save(ev);
    }

    @Override
    public Page<CompanyEvent> getEvents(Long tenantId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("eventDate").ascending());
        return companyEventRepository.findByTenantIdOrderByEventDateAsc(tenantId, pageable);
    }

    @Override
    public List<CompanyEvent> getEventsInRange(Long tenantId, LocalDate from, LocalDate to) {
        return companyEventRepository.findByTenantIdAndEventDateBetweenOrderByEventDateAsc(tenantId, from, to);
    }

    @Override
    public void deleteEvent(Long id, Long tenantId) {
        CompanyEvent ev = companyEventRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(msg("event.not.found")));
        companyEventRepository.delete(ev);
    }
}
