package com.hrms.enterprise.attendance.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GeofenceSettingResponse {
    private Long id;
    private String name;
    private Double latitude;
    private Double longitude;
    private Double radiusMeter;
    private Boolean isActive;
}
