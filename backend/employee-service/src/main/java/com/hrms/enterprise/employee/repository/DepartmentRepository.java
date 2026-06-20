package com.hrms.enterprise.employee.repository;

import com.hrms.enterprise.employee.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface untuk mengelola akses data tabel 'departments' di database.
 * Pendefinisian query dilengkapi dengan filter 'tenantId' (SaaS tenant) dan 'deletedStatus'
 * agar data yang sudah di-soft-delete tidak ikut tertarik ke aplikasi.
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    /**
     * Mengambil daftar departemen milik satu tenant/perusahaan tertentu yang aktif dengan paginasi dan filter per kolom (nama dan kode).
     * @param tenantId ID penyewa/klien perusahaan
     * @param deletedStatus Status hapus (bernilai 0 untuk data yang tidak dihapus)
     * @param name Filter pencarian nama departemen (opsional)
     * @param code Filter pencarian kode departemen (opsional)
     * @param pageable Pengaturan paginasi (halaman, ukuran, sorting)
     * @return Halaman (Page) departemen yang aktif
     */
    @Query("SELECT d FROM Department d WHERE d.tenantId = :tenantId AND d.deletedStatus = :deletedStatus " +
           "AND (:name IS NULL OR LOWER(d.name) LIKE :name) " +
           "AND (:code IS NULL OR LOWER(d.code) LIKE :code)")
    Page<Department> findAllByTenantIdAndDeletedStatusAndFilters(
            @Param("tenantId") Long tenantId,
            @Param("deletedStatus") Integer deletedStatus,
            @Param("name") String name,
            @Param("code") String code,
            Pageable pageable);

    /**
     * Mengambil detail satu departemen berdasarkan ID. Validasi keamanan menyertakan tenantId
     * agar user dari perusahaan lain tidak bisa menebak ID departemen milik perusahaan lain (ID Harvesting).
     * @param id ID unik departemen
     * @param tenantId ID penyewa/klien perusahaan
     * @param deletedStatus Status hapus (0 = aktif)
     * @return Optional Department jika ditemukan
     */
    Optional<Department> findByIdAndTenantIdAndDeletedStatus(Long id, Long tenantId, Integer deletedStatus);

    /**
     * Memeriksa apakah ada kode departemen yang sama dalam satu perusahaan (tenant).
     * Kode departemen (seperti "HRD" atau "FIN") harus unik per perusahaan.
     * @param code Kode departemen (e.g. "HRD")
     * @param tenantId ID penyewa/klien perusahaan
     * @param deletedStatus Status hapus (0 = aktif)
     * @return boolean true jika kode sudah terdaftar
     */
    boolean existsByCodeAndTenantIdAndDeletedStatus(String code, Long tenantId, Integer deletedStatus);
}
