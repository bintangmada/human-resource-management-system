package com.hrms.enterprise.leave.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveTypeResponse {
    private Long id;
    private String name;
    private Integer defaultEntitlement;
    private Boolean requiresApproval;
}
