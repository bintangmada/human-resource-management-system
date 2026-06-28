package com.hrms.enterprise.asset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AssetRequestPayload {

    private Long assetId; // Can be null for REQUISITION

    @NotBlank(message = "Asset name is required")
    private String assetName;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotBlank(message = "Request type is required")
    private String requestType; // REQUISITION, REPAIR, RETURN

    @NotBlank(message = "Reason is required")
    private String reason;

    // Getters and Setters
    public Long getAssetId() {
        return assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getRequestType() {
        return requestType;
    }

    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
