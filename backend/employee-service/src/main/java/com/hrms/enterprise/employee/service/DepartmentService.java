package com.hrms.enterprise.employee.service;

import com.hrms.enterprise.employee.dto.DepartmentRequest;
import com.hrms.enterprise.employee.dto.DepartmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface yang mendefinisikan kontrak logika bisnis untuk modul Departemen.
 * Semua method menyertakan tenantId untuk memvalidasi batasan data antar perusahaan penyewa,
 * serta menyertakan userEmail/actor untuk kepentingan pencatatan audit log (createdBy/updatedBy/deletedBy).
 */
public interface DepartmentService {

    /**
     * Membuat data departemen baru.
     * @param request Data input departemen
     * @param tenantId ID perusahaan penyewa
     * @param actor Username/Email pelaku aksi
     * @return Detail data departemen yang berhasil dibuat
     */
    DepartmentResponse createDepartment(DepartmentRequest request, Long tenantId, String actor);

    /**
     * Memperbarui data departemen yang sudah ada.
     * @param id ID unik departemen
     * @param request Data input pembaruan departemen
     * @param tenantId ID perusahaan penyewa
     * @param actor Username/Email pelaku aksi
     * @return Detail data departemen yang berhasil diperbarui
     */
    DepartmentResponse updateDepartment(Long id, DepartmentRequest request, Long tenantId, String actor);

    /**
     * Mendapatkan daftar semua departemen aktif (belum di-soft delete) dalam satu perusahaan dengan paginasi.
     * @param tenantId ID perusahaan penyewa
     * @param pageable Pengaturan paginasi (halaman, ukuran, sorting)
     * @return Halaman (Page) departemen
     */
    Page<DepartmentResponse> getAllDepartments(Long tenantId, Pageable pageable);

    /**
     * Mendapatkan detail satu departemen berdasarkan ID dengan validasi kepemilikan tenant.
     * @param id ID unik departemen
     * @param tenantId ID perusahaan penyewa
     * @return Detail data departemen
     */
    DepartmentResponse getDepartmentById(Long id, Long tenantId);

    /**
     * Melakukan soft delete terhadap data departemen berdasarkan ID.
     * @param id ID unik departemen
     * @param tenantId ID perusahaan penyewa
     * @param actor Username/Email pelaku aksi penghapusan
     */
    void deleteDepartment(Long id, Long tenantId, String actor);
}
