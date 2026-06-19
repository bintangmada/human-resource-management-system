package com.hrms.enterprise.employee.service;

import com.hrms.enterprise.employee.dto.EmployeeRequest;
import com.hrms.enterprise.employee.dto.EmployeeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface yang mendefinisikan kontrak logika bisnis untuk modul Karyawan (Employee).
 * Melindungi kedaulatan data tenant (SaaS) dan melacak data audit log secara manual.
 */
public interface EmployeeService {

    /**
     * Membuat data karyawan baru beserta validasi kelayakan NIK, Email, Departemen, dan Jabatan.
     * @param request Data input karyawan
     * @param tenantId ID perusahaan penyewa
     * @param actor Username/Email pelaku aksi
     * @return Detail data karyawan yang berhasil didaftarkan
     */
    EmployeeResponse createEmployee(EmployeeRequest request, Long tenantId, String actor);

    /**
     * Memperbarui biodata karyawan.
     * @param id ID unik karyawan
     * @param request Data input pembaruan karyawan
     * @param tenantId ID perusahaan penyewa
     * @param actor Username/Email pelaku aksi
     * @return Detail data karyawan yang berhasil diperbarui
     */
    EmployeeResponse updateEmployee(Long id, EmployeeRequest request, Long tenantId, String actor);

    /**
     * Mendapatkan daftar semua karyawan aktif dalam satu perusahaan dengan paginasi dan pencarian.
     * @param tenantId ID perusahaan penyewa
     * @param search Kata kunci pencarian
     * @param pageable Pengaturan paginasi (halaman, ukuran, sorting)
     * @return Halaman (Page) data karyawan
     */
    Page<EmployeeResponse> getAllEmployees(Long tenantId, String search, Pageable pageable);

    /**
     * Mendapatkan detail satu karyawan berdasarkan ID.
     * @param id ID unik karyawan
     * @param tenantId ID perusahaan penyewa
     * @return Detail data karyawan
     */
    EmployeeResponse getEmployeeById(Long id, Long tenantId);

    /**
     * Melakukan soft delete terhadap data karyawan berdasarkan ID.
     * @param id ID unik karyawan
     * @param tenantId ID perusahaan penyewa
     * @param actor Username/Email pelaku aksi penghapusan
     */
    void deleteEmployee(Long id, Long tenantId, String actor);
}
