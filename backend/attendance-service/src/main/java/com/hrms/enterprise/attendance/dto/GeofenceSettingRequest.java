package com.hrms.enterprise.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GeofenceSettingRequest {

    @NotBlank(message = "Geofence name is required")
    private String name;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotNull(message = "Radius meter is required")
    private Double radiusMeter;

    private Boolean isActive;
}
