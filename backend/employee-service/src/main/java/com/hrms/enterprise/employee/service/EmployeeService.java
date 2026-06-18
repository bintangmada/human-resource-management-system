package com.hrms.enterprise.employee.service;

import com.hrms.enterprise.employee.dto.EmployeeRequest;
import com.hrms.enterprise.employee.dto.EmployeeResponse;

import java.util.List;

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
     * Mendapatkan daftar semua karyawan aktif dalam satu perusahaan.
     * @param tenantId ID perusahaan penyewa
     * @return List data karyawan
     */
    List<EmployeeResponse> getAllEmployees(Long tenantId);

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
