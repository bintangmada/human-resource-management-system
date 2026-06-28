package com.hrms.enterprise.leave.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveTypeRequest {

    @NotBlank(message = "Leave type name is required")
    private String name;

    @NotNull(message = "Default entitlement is required")
    @Min(value = 0, message = "Default entitlement must be greater than or equal to 0")
    private Integer defaultEntitlement;

    private Boolean requiresApproval;
}
