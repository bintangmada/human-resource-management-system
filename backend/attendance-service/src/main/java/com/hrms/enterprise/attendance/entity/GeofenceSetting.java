package com.hrms.enterprise.attendance.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Entitas GeofenceSetting untuk menyimpan koordinat lokasi absensi
 * yang diperbolehkan beserta radius toleransi per tenant.
 */
@Entity
@Table(name = "geofence_settings")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@SuperBuilder
public class GeofenceSetting extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "radius_meter", nullable = false)
    private Double radiusMeter;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
