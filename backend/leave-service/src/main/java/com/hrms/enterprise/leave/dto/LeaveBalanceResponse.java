package com.hrms.enterprise.leave.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceResponse {
    private Long id;
    private Long employeeId;
    private Long leaveTypeId;
    private String leaveTypeName;
    private Integer year;
    private Integer entitlement;
    private Integer used;
    private Integer pending;
    private Integer remaining;
}
