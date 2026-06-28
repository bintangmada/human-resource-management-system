package com.hrms.enterprise.recruitment.dto;

import jakarta.validation.constraints.NotBlank;

public class JobPostingPayload {

    @NotBlank(message = "Job title is required")
    private String title;

    private Long departmentId;
    private String departmentName;

    @NotBlank(message = "Job description is required")
    private String description;

    private String requirements;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Employment type is required")
    private String employmentType; // FULL_TIME, PART_TIME, CONTRACT, INTERN

    @NotBlank(message = "Status is required")
    private String status; // DRAFT, ACTIVE, CLOSED

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
