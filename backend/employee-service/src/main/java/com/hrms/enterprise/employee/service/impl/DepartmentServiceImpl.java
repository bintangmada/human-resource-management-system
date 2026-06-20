package com.hrms.enterprise.employee.service.impl;

import com.hrms.enterprise.employee.dto.DepartmentRequest;
import com.hrms.enterprise.employee.dto.DepartmentResponse;
import com.hrms.enterprise.employee.entity.Department;
import com.hrms.enterprise.employee.exception.BadRequestException;
import com.hrms.enterprise.employee.exception.ResourceNotFoundException;
import com.hrms.enterprise.employee.repository.DepartmentRepository;
import com.hrms.enterprise.employee.repository.EmployeeRepository;
import com.hrms.enterprise.employee.service.DepartmentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Kelas implementasi dari DepartmentService.
 * Di sini seluruh alur logika bisnis, validasi keunikan data, pencatatan audit log aktor,
 * serta proses soft-delete (menghapus data secara logis tanpa menghapus baris SQL fisik) dieksekusi.
 */
@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository, EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Membuat Departemen Baru.
     */
    @Override
    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request, Long tenantId, String actor) {
        // Aturan Bisnis: Kode departemen (seperti "HRD" atau "FIN") tidak boleh kembar dalam satu perusahaan/tenant yang sama.
        if (departmentRepository.existsByCodeAndTenantIdAndDeletedStatus(request.getCode(), tenantId, 0)) {
            throw new BadRequestException("department.code.exists", request.getCode());
        }

        // Membuat instance entitas menggunakan SuperBuilder
        Department department = Department.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .code(request.getCode())
                .status(request.getStatus() != null ? request.getStatus() : 1)
                .createdBy(actor) // Mencatat manual aktor pembuat data
                .build();

        Department savedDepartment = departmentRepository.save(department);
        return mapToResponse(savedDepartment);
    }

    /**
     * Memperbarui Data Departemen.
     */
    @Override
    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request, Long tenantId, String actor) {
        // Mengambil data departemen lama. Pastikan datanya ada dan belum di-soft-delete (deletedStatus = 0).
        Department department = departmentRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("department.not.found", id));

        // Aturan Bisnis: Jika user mengubah kode departemen, pastikan kode baru tersebut belum pernah terdaftar.
        if (!department.getCode().equalsIgnoreCase(request.getCode())) {
            if (departmentRepository.existsByCodeAndTenantIdAndDeletedStatus(request.getCode(), tenantId, 0)) {
                throw new BadRequestException("department.code.exists", request.getCode());
            }
        }

        // Melakukan pembaruan nilai properti
        department.setName(request.getName());
        department.setCode(request.getCode());
        if (request.getStatus() != null) {
            department.setStatus(request.getStatus());
        }
        department.setUpdatedBy(actor); // Mencatat manual aktor pengubah data

        Department updatedDepartment = departmentRepository.save(department);
        return mapToResponse(updatedDepartment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DepartmentResponse> getAllDepartments(Long tenantId, Integer status, String id, String name, String code, Pageable pageable) {
        String cleanId = (id == null || id.trim().isEmpty()) ? null : "%" + id.trim() + "%";
        String cleanName = (name == null || name.trim().isEmpty()) ? null : "%" + name.trim().toLowerCase() + "%";
        String cleanCode = (code == null || code.trim().isEmpty()) ? null : "%" + code.trim().toLowerCase() + "%";

        return departmentRepository.findAllByTenantIdAndDeletedStatusAndFilters(
                tenantId, 0, status, cleanId, cleanName, cleanCode, pageable
        ).map(this::mapToResponse);
    }

    /**
     * Mengambil Detail Departemen Berdasarkan ID.
     */
    @Override
    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id, Long tenantId) {
        Department department = departmentRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("department.not.found", id));
        return mapToResponse(department);
    }

    /**
     * Penghapusan Secara Logis (Soft Delete).
     */
    @Override
    @Transactional
    public void deleteDepartment(Long id, Long tenantId, String actor) {
        // Mengambil data departemen yang ingin dihapus
        Department department = departmentRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("department.not.found", id));

        // Validasi Relasional: Pastikan tidak ada karyawan aktif yang ditugaskan pada departemen ini
        if (employeeRepository.existsByDepartmentIdAndTenantIdAndDeletedStatus(id, tenantId, 0)) {
            throw new BadRequestException("department.has.employees", id);
        }

        // IMPLEMENTASI SOFT DELETE:
        // Dibandingkan menggunakan 'departmentRepository.delete(department)' yang akan menghapus baris fisik SQL secara permanen,
        // pembaruan cukup dilakukan pada field audit soft-delete untuk menandai data ini sudah tidak aktif secara logis.
        department.setDeletedStatus(1);                 // 1 menandakan record terhapus (soft-deleted)
        department.setDeletedBy(actor);                   // Mencatat email aktor penghapus data
        department.setDeletedAt(LocalDateTime.now());       // Mencatat tanggal & waktu penghapusan logis

        // Simpan pembaruan status ke database
        departmentRepository.save(department);
    }

    /**
     * Helper Mapper manual dari Entity ke Response DTO.
     * Sengaja ditulis manual untuk mempermudah developer baru menelusuri alur transfer data
     * tanpa kebingungan oleh konfigurasi mapper otomatis yang tersembunyi.
     */
    private DepartmentResponse mapToResponse(Department department) {
        return DepartmentResponse.builder()
                .id(department.getId())
                .tenantId(department.getTenantId())
                .name(department.getName())
                .code(department.getCode())
                .status(department.getStatus())
                .createdBy(department.getCreatedBy())
                .createdAt(department.getCreatedAt())
                .updatedBy(department.getUpdatedBy())
                .updatedAt(department.getUpdatedAt())
                .build();
    }
}
