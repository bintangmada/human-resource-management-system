package com.hrms.enterprise.employee.repository;

import com.hrms.enterprise.employee.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface untuk mengelola akses data tabel 'employees' (karyawan).
 * Dilengkapi dengan filter tenantId dan deletedStatus untuk mendukung isolasi data multi-tenant dan soft delete.
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    /**
     * Mengambil daftar semua karyawan aktif yang terdaftar di suatu tenant perusahaan dengan paginasi dan filter per kolom (nama, NIK, dan email).
     * @param tenantId ID penyewa/klien perusahaan
     * @param deletedStatus Status hapus (0 = aktif)
     * @param fullName Filter pencarian nama karyawan (opsional)
     * @param employeeNumber Filter pencarian NIK (opsional)
     * @param email Filter pencarian email (opsional)
     * @param pageable Pengaturan paginasi (halaman, ukuran, sorting)
     * @return Halaman (Page) data karyawan
     */
    @Query("SELECT e FROM Employee e " +
           "LEFT JOIN Department d ON e.departmentId = d.id " +
           "LEFT JOIN Job j ON e.jobId = j.id " +
           "WHERE e.tenantId = :tenantId AND e.deletedStatus = :deletedStatus " +
           "AND (:status IS NULL OR e.status = :status) " +
           "AND (:id IS NULL OR CAST(e.id AS string) LIKE :id) " +
           "AND (:fullName IS NULL OR LOWER(e.fullName) LIKE :fullName) " +
           "AND (:employeeNumber IS NULL OR LOWER(e.employeeNumber) LIKE :employeeNumber) " +
           "AND (:email IS NULL OR LOWER(e.email) LIKE :email) " +
           "AND (:phoneNumber IS NULL OR LOWER(e.phoneNumber) LIKE :phoneNumber) " +
           "AND (:departmentName IS NULL OR LOWER(d.name) LIKE :departmentName) " +
           "AND (:jobTitle IS NULL OR LOWER(j.title) LIKE :jobTitle) " +
           "AND (:joinedAt IS NULL OR CAST(e.joinedAt AS string) LIKE :joinedAt)")
    Page<Employee> findAllByTenantIdAndDeletedStatusAndFilters(
            @Param("tenantId") Long tenantId,
            @Param("deletedStatus") Integer deletedStatus,
            @Param("status") Integer status,
            @Param("id") String id,
            @Param("fullName") String fullName,
            @Param("employeeNumber") String employeeNumber,
            @Param("email") String email,
            @Param("phoneNumber") String phoneNumber,
            @Param("departmentName") String departmentName,
            @Param("jobTitle") String jobTitle,
            @Param("joinedAt") String joinedAt,
            Pageable pageable);

    /**
     * Mengambil detail data karyawan berdasarkan ID dengan validasi tenantId.
     * @param id ID unik record database karyawan
     * @param tenantId ID penyewa/klien perusahaan
     * @param deletedStatus Status hapus (0 = aktif)
     * @return Optional Employee jika ditemukan
     */
    Optional<Employee> findByIdAndTenantIdAndDeletedStatus(Long id, Long tenantId, Integer deletedStatus);

    /**
     * Mengambil data satu karyawan berdasarkan Nomor Induk Karyawan (NIK) resmi perusahaan.
     * @param employeeNumber NIK karyawan (e.g. "EMP-2026-0001")
     * @param tenantId ID penyewa/klien perusahaan
     * @param deletedStatus Status hapus (0 = aktif)
     * @return Optional Employee jika ditemukan
     */
    Optional<Employee> findByEmployeeNumberAndTenantIdAndDeletedStatus(String employeeNumber, Long tenantId, Integer deletedStatus);

    /**
     * Memvalidasi apakah Nomor Induk Karyawan (NIK) sudah pernah digunakan di perusahaan ini.
     * NIK tidak boleh sama dalam satu lingkungan tenant perusahaan yang sama.
     * @param employeeNumber NIK yang ingin divalidasi
     * @param tenantId ID penyewa/klien perusahaan
     * @param deletedStatus Status hapus (0 = aktif)
     * @return boolean true jika NIK sudah terpakai
     */
    boolean existsByEmployeeNumberAndTenantIdAndDeletedStatus(String employeeNumber, Long tenantId, Integer deletedStatus);

    /**
     * Memvalidasi apakah alamat email sudah digunakan oleh karyawan lain di perusahaan ini.
     * Alamat email harus unik per penyewa untuk menghindari bentrok akun SSO/Keycloak.
     * @param email Alamat email yang ingin divalidasi
     * @param tenantId ID penyewa/klien perusahaan
     * @param deletedStatus Status hapus (0 = aktif)
     * @return boolean true jika email sudah terpakai
     */
    boolean existsByEmailAndTenantIdAndDeletedStatus(String email, Long tenantId, Integer deletedStatus);

    /**
     * Memeriksa apakah masih ada karyawan aktif yang ditugaskan pada departemen tertentu.
     * Digunakan untuk mencegah penghapusan departemen yang masih memiliki karyawan (Relational Integrity).
     */
    boolean existsByDepartmentIdAndTenantIdAndDeletedStatus(Long departmentId, Long tenantId, Integer deletedStatus);

    /**
     * Memeriksa apakah masih ada karyawan aktif yang memiliki posisi jabatan tertentu.
     * Digunakan untuk mencegah penghapusan jabatan yang masih digunakan oleh karyawan (Relational Integrity).
     */
    boolean existsByJobIdAndTenantIdAndDeletedStatus(Long jobId, Long tenantId, Integer deletedStatus);

    /**
     * Menghitung jumlah karyawan aktif dalam suatu tenant.
     */
    long countByTenantIdAndDeletedStatus(Long tenantId, Integer deletedStatus);

    /**
     * Menghitung jumlah karyawan aktif dalam tenant berdasarkan nama jabatan.
     */
    @Query("SELECT COUNT(e) FROM Employee e " +
           "JOIN Job j ON e.jobId = j.id " +
           "WHERE e.tenantId = :tenantId AND e.deletedStatus = :deletedStatus " +
           "AND LOWER(j.title) = LOWER(:jobTitle)")
    long countByTenantIdAndDeletedStatusAndJobTitle(
            @Param("tenantId") Long tenantId,
            @Param("deletedStatus") Integer deletedStatus,
            @Param("jobTitle") String jobTitle);
}
