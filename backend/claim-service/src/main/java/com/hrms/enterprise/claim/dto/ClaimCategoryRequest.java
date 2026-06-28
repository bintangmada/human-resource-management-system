package com.hrms.enterprise.claim.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public class ClaimCategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;

    @NotNull(message = "Max limit is required")
    @PositiveOrZero(message = "Max limit must be zero or positive")
    private BigDecimal maxLimit;

    @NotNull(message = "Status is required")
    private Integer status; // 1 = Active, 0 = Inactive

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getMaxLimit() {
        return maxLimit;
    }

    public void setMaxLimit(BigDecimal maxLimit) {
        this.maxLimit = maxLimit;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
