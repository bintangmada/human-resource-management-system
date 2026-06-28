package com.hrms.enterprise.asset.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class AssetPayload {

    @NotBlank(message = "Asset name is required")
    private String assetName;

    @NotBlank(message = "Serial number is required")
    private String serialNumber;

    @NotBlank(message = "Category is required")
    private String category; // ELECTRONICS, FURNITURE, VEHICLE, etc.

    private LocalDate purchaseDate;

    private Long employeeId;
    private String employeeName;

    // Getters and Setters
    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }
}
