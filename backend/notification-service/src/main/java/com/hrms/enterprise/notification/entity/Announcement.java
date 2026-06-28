package com.hrms.enterprise.notification.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "announcements", schema = "hrms_notification")
public class Announcement extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Priority level: INFO, WARNING, URGENT
     */
    @Column(nullable = false)
    private String priority = "INFO";

    /**
     * Target audience: ALL, HR_ONLY, MANAGER_ONLY
     */
    @Column(name = "target_audience", nullable = false)
    private String targetAudience = "ALL";

    /**
     * Status: DRAFT, PUBLISHED, ARCHIVED
     */
    @Column(nullable = false)
    private String status = "PUBLISHED";

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getTargetAudience() { return targetAudience; }
    public void setTargetAudience(String targetAudience) { this.targetAudience = targetAudience; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
