package com.hrms.enterprise.employee.repository;

import com.hrms.enterprise.employee.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface untuk mengelola akses data tabel 'departments' di database.
 * Di sini kita mendefinisikan query dengan filter 'tenantId' (SaaS tenant) dan 'deletedStatus'
 * agar data yang sudah di-soft-delete tidak ikut tertarik ke aplikasi.
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    /**
     * Mengambil daftar semua departemen milik satu tenant/perusahaan tertentu yang masih aktif (belum dihapus).
     * @param tenantId ID penyewa/klien perusahaan
     * @param deletedStatus Status hapus (kita suplai 0 untuk data yang tidak dihapus)
     * @return List departemen yang aktif
     */
    List<Department> findAllByTenantIdAndDeletedStatus(Long tenantId, Integer deletedStatus);

    /**
     * Mengambil detail satu departemen berdasarkan ID. Kita sertakan tenantId untuk validasi keamanan
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
