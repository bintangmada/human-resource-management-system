package com.hrms.enterprise.employee.service;

import com.hrms.enterprise.employee.dto.JobRequest;
import com.hrms.enterprise.employee.dto.JobResponse;

import java.util.List;

/**
 * Service Interface untuk mendefinisikan kontrak operasi bisnis pada posisi/jabatan (Job).
 * Menjamin kepemilikan tenant (SaaS isolation) dan pencatatan audit log aktor pada setiap aksi.
 */
public interface JobService {

    /**
     * Membuat data posisi jabatan baru.
     * @param request Data input posisi jabatan
     * @param tenantId ID perusahaan penyewa
     * @param actor Username/Email pelaku aksi
     * @return Detail data posisi jabatan yang berhasil dibuat
     */
    JobResponse createJob(JobRequest request, Long tenantId, String actor);

    /**
     * Memperbarui data posisi jabatan yang sudah ada.
     * @param id ID unik posisi jabatan
     * @param request Data input pembaruan
     * @param tenantId ID perusahaan penyewa
     * @param actor Username/Email pelaku aksi
     * @return Detail data posisi jabatan yang berhasil diperbarui
     */
    JobResponse updateJob(Long id, JobRequest request, Long tenantId, String actor);

    /**
     * Mendapatkan daftar semua posisi jabatan aktif dalam satu perusahaan.
     * @param tenantId ID perusahaan penyewa
     * @return List posisi jabatan
     */
    List<JobResponse> getAllJobs(Long tenantId);

    /**
     * Mendapatkan detail satu posisi jabatan berdasarkan ID.
     * @param id ID unik posisi jabatan
     * @param tenantId ID perusahaan penyewa
     * @return Detail data posisi jabatan
     */
    JobResponse getJobById(Long id, Long tenantId);

    /**
     * Melakukan soft delete terhadap data posisi jabatan berdasarkan ID.
     * @param id ID unik posisi jabatan
     * @param tenantId ID perusahaan penyewa
     * @param actor Username/Email pelaku aksi penghapusan
     */
    void deleteJob(Long id, Long tenantId, String actor);
}
