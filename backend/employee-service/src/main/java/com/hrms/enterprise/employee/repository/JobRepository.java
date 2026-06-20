package com.hrms.enterprise.employee.repository;

import com.hrms.enterprise.employee.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface untuk mengelola akses data tabel 'jobs' (posisi jabatan).
 * Semua query dilengkapi filter tenantId dan deletedStatus demi keamanan dan dukungan soft delete.
 */
@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    /**
     * Mengambil semua posisi jabatan aktif di tenant tertentu dengan paginasi dan filter per kolom (nama jabatan dan golongan/grade).
     * @param tenantId ID penyewa/klien perusahaan
     * @param deletedStatus Status hapus (0 = aktif)
     * @param title Filter pencarian nama jabatan (opsional)
     * @param grade Filter pencarian grade golongan (opsional)
     * @param pageable Pengaturan paginasi (halaman, ukuran, sorting)
     * @return Halaman (Page) posisi jabatan
     */
    @Query("SELECT j FROM Job j WHERE j.tenantId = :tenantId AND j.deletedStatus = :deletedStatus " +
           "AND (:id IS NULL OR CAST(j.id AS string) LIKE :id) " +
           "AND (:title IS NULL OR LOWER(j.title) LIKE :title) " +
           "AND (:grade IS NULL OR LOWER(j.grade) LIKE :grade)")
    Page<Job> findAllByTenantIdAndDeletedStatusAndFilters(
            @Param("tenantId") Long tenantId,
            @Param("deletedStatus") Integer deletedStatus,
            @Param("id") String id,
            @Param("title") String title,
            @Param("grade") String grade,
            Pageable pageable);

    /**
     * Mengambil detail satu posisi jabatan dengan validasi kepemilikan tenantId.
     * @param id ID unik jabatan
     * @param tenantId ID penyewa/klien perusahaan
     * @param deletedStatus Status hapus (0 = aktif)
     * @return Optional Job jika ditemukan
     */
    Optional<Job> findByIdAndTenantIdAndDeletedStatus(Long id, Long tenantId, Integer deletedStatus);

    /**
     * Mengecek apakah nama jabatan (misal: "Software Engineer") sudah pernah didaftarkan
     * sebelumnya di perusahaan (tenant) yang sama agar tidak terjadi duplikasi nama jabatan.
     * @param title Nama posisi/jabatan
     * @param tenantId ID penyewa/klien perusahaan
     * @param deletedStatus Status hapus (0 = aktif)
     * @return boolean true jika sudah terdaftar
     */
    boolean existsByTitleAndTenantIdAndDeletedStatus(String title, Long tenantId, Integer deletedStatus);
}
