package com.hrms.enterprise.notification.dto;

import jakarta.validation.constraints.NotBlank;

public class AnnouncementPayload {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private String priority = "INFO";       // INFO, WARNING, URGENT
    private String targetAudience = "ALL";  // ALL, HR_ONLY, MANAGER_ONLY
    private String status = "PUBLISHED";    // DRAFT, PUBLISHED

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
