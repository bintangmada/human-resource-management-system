package com.hrms.enterprise.employee.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * BaseEntity ini bertindak sebagai kelas induk (Base Class) untuk semua entitas database.
 * Dengan menggunakan anotasi @MappedSuperclass, Hibernate akan otomatis menambahkan kolom-kolom
 * audit dan soft delete di bawah ini ke dalam tabel-tabel turunan yang mewarisi kelas ini.
 *
 * Catatan Arsitektur:
 * Fitur 'AuditorAware' dari Spring Data JPA sengaja tidak digunakan. Hal ini dilakukan
 * agar penentuan siapa yang membuat/mengubah/menghapus data dapat disuplai secara manual dan eksplisit
 * dari Service Layer (berdasarkan data User Session dari JWT/Keycloak), sehingga kode transparan
 * dan mudah dilacak alurnya tanpa ada proses otomatis tersembunyi di latar belakang.
 */
@MappedSuperclass
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public abstract class BaseEntity {

    // Menyimpan username/ID aktor yang membuat data ini pertama kali
    @Column(name = "created_by", length = 100)
    private String createdBy;

    // Tanggal dan waktu data dibuat. Diatur otomatis saat pertama kali persist.
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Menyimpan username/ID aktor yang terakhir kali mengubah data ini
    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    // Tanggal dan waktu data terakhir diubah. Diupdate otomatis saat record disimpan ulang.
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Menyimpan username/ID aktor yang melakukan soft delete pada data ini
    @Column(name = "deleted_by", length = 100)
    private String deletedBy;

    // Tanggal dan waktu soft delete dilakukan
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Status keaktifan operasional data:
    // 1 = ACTIVE (Aktif dan bisa digunakan dalam proses bisnis)
    // 0 = INACTIVE (Dinonaktifkan sementara oleh admin)
    @Builder.Default
    @Column(name = "status", nullable = false)
    private Integer status = 1;

    // Status soft delete data:
    // 0 = NOT DELETED (Data aman dan aktif di sistem)
    // 1 = DELETED (Data dianggap terhapus secara logis dan tidak boleh muncul di kueri normal)
    @Builder.Default
    @Column(name = "deleted_status", nullable = false)
    private Integer deletedStatus = 0;

    /**
     * Hook Siklus Hidup JPA (JPA Lifecycle Callback).
     * Dijalankan otomatis tepat sebelum record baru dimasukkan ke database.
     */
    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = 1; // Default status: Active
        }
        if (this.deletedStatus == null) {
            this.deletedStatus = 0; // Default soft delete status: Not Deleted
        }
    }

    /**
     * Hook Siklus Hidup JPA.
     * Dijalankan otomatis tepat sebelum record lama diperbarui di database.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
