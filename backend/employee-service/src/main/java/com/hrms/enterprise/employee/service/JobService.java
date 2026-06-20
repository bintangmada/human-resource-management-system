package com.hrms.enterprise.employee.service;

import com.hrms.enterprise.employee.dto.JobRequest;
import com.hrms.enterprise.employee.dto.JobResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface untuk mendefinisikan kontrak operasi bisnis pada
 * posisi/jabatan (Job).
 * Menjamin kepemilikan tenant (SaaS isolation) dan pencatatan audit log aktor
 * pada setiap aksi.
 */
public interface JobService {

    /**
     * Membuat data posisi jabatan baru.
     * 
     * @param request  Data input posisi jabatan
     * @param tenantId ID perusahaan penyewa
     * @param actor    Username/Email pelaku aksi
     * @return Detail data posisi jabatan yang berhasil dibuat
     */
    JobResponse createJob(JobRequest request, Long tenantId, String actor);

    /**
     * Memperbarui data posisi jabatan yang sudah ada.
     * 
     * @param id       ID unik posisi jabatan
     * @param request  Data input pembaruan
     * @param tenantId ID perusahaan penyewa
     * @param actor    Username/Email pelaku aksi
     * @return Detail data posisi jabatan yang berhasil diperbarui
     */
    JobResponse updateJob(Long id, JobRequest request, Long tenantId, String actor);

    /**
     * Mendapatkan daftar semua posisi jabatan aktif dalam satu perusahaan dengan
     * paginasi dan filter per kolom.
     * 
     * @param tenantId ID perusahaan penyewa
     * @param title    Filter pencarian nama jabatan
     * @param grade    Filter pencarian grade golongan
     * @param pageable Pengaturan paginasi (halaman, ukuran, sorting)
     * @return Halaman (Page) posisi jabatan
     */
    Page<JobResponse> getAllJobs(Long tenantId, String id, String title, String grade, Pageable pageable);

    /**
     * Mendapatkan detail satu posisi jabatan berdasarkan ID.
     * 
     * @param id       ID unik posisi jabatan
     * @param tenantId ID perusahaan penyewa
     * @return Detail data posisi jabatan
     */
    JobResponse getJobById(Long id, Long tenantId);

    /**
     * Melakukan soft delete terhadap data posisi jabatan berdasarkan ID.
     * 
     * @param id       ID unik posisi jabatan
     * @param tenantId ID perusahaan penyewa
     * @param actor    Username/Email pelaku aksi penghapusan
     */
    void deleteJob(Long id, Long tenantId, String actor);
}
