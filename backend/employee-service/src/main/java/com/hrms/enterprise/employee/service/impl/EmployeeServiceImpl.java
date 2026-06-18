package com.hrms.enterprise.employee.service.impl;

import com.hrms.enterprise.employee.dto.EmployeeRequest;
import com.hrms.enterprise.employee.dto.EmployeeResponse;
import com.hrms.enterprise.employee.entity.Employee;
import com.hrms.enterprise.employee.exception.BadRequestException;
import com.hrms.enterprise.employee.exception.ResourceNotFoundException;
import com.hrms.enterprise.employee.repository.DepartmentRepository;
import com.hrms.enterprise.employee.repository.EmployeeRepository;
import com.hrms.enterprise.employee.repository.JobRepository;
import com.hrms.enterprise.employee.service.EmployeeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Kelas implementasi dari EmployeeService.
 * Menangani aturan bisnis karyawan seperti verifikasi relasi departemen/jabatan yang sah,
 * validasi keunikan NIK dan Email dalam lingkup tenant, pencatatan audit log manual,
 * serta mekanisme soft delete.
 */
@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final JobRepository jobRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository,
                               DepartmentRepository departmentRepository,
                               JobRepository jobRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.jobRepository = jobRepository;
    }

    /**
     * Mendaftarkan Karyawan Baru.
     */
    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request, Long tenantId, String actor) {
        // Validasi 1: Pastikan Departemen yang dipilih ada di dalam tenant yang sama dan aktif
        departmentRepository.findByIdAndTenantIdAndDeletedStatus(request.getDepartmentId(), tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("department.not.found", request.getDepartmentId()));

        // Validasi 2: Pastikan Jabatan yang dipilih ada di dalam tenant yang sama dan aktif
        jobRepository.findByIdAndTenantIdAndDeletedStatus(request.getJobId(), tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("job.not.found", request.getJobId()));

        // Validasi 3: Pastikan Nomor Induk Karyawan (NIK) belum pernah terdaftar di tenant ini
        if (employeeRepository.existsByEmployeeNumberAndTenantIdAndDeletedStatus(request.getEmployeeNumber(), tenantId, 0)) {
            throw new BadRequestException("employee.number.exists", request.getEmployeeNumber());
        }

        // Validasi 4: Pastikan alamat Email belum pernah terdaftar di tenant ini
        if (employeeRepository.existsByEmailAndTenantIdAndDeletedStatus(request.getEmail(), tenantId, 0)) {
            throw new BadRequestException("employee.email.exists", request.getEmail());
        }

        Employee employee = Employee.builder()
                .tenantId(tenantId)
                .employeeNumber(request.getEmployeeNumber())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .departmentId(request.getDepartmentId())
                .jobId(request.getJobId())
                .joinedAt(request.getJoinedAt())
                .createdBy(actor) // Audit log manual
                .build();

        Employee savedEmployee = employeeRepository.save(employee);
        return mapToResponse(savedEmployee);
    }

    /**
     * Memperbarui Data Karyawan.
     */
    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request, Long tenantId, String actor) {
        // Validasi 1: Pastikan data karyawan ada dan aktif
        Employee employee = employeeRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("employee.not.found", id));

        // Validasi 2: Pastikan Departemen tujuan pemindahan ada dan aktif
        departmentRepository.findByIdAndTenantIdAndDeletedStatus(request.getDepartmentId(), tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("department.not.found", request.getDepartmentId()));

        // Validasi 3: Pastikan Jabatan tujuan pemindahan ada dan aktif
        jobRepository.findByIdAndTenantIdAndDeletedStatus(request.getJobId(), tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("job.not.found", request.getJobId()));

        // Validasi 4: Jika NIK diubah, pastikan NIK baru belum terpakai di tenant ini
        if (!employee.getEmployeeNumber().equalsIgnoreCase(request.getEmployeeNumber())) {
            if (employeeRepository.existsByEmployeeNumberAndTenantIdAndDeletedStatus(request.getEmployeeNumber(), tenantId, 0)) {
                throw new BadRequestException("employee.number.exists", request.getEmployeeNumber());
            }
        }

        // Validasi 5: Jika Email diubah, pastikan Email baru belum terpakai di tenant ini
        if (!employee.getEmail().equalsIgnoreCase(request.getEmail())) {
            if (employeeRepository.existsByEmailAndTenantIdAndDeletedStatus(request.getEmail(), tenantId, 0)) {
                throw new BadRequestException("employee.email.exists", request.getEmail());
            }
        }

        employee.setEmployeeNumber(request.getEmployeeNumber());
        employee.setFullName(request.getFullName());
        employee.setEmail(request.getEmail());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setDepartmentId(request.getDepartmentId());
        employee.setJobId(request.getJobId());
        employee.setJoinedAt(request.getJoinedAt());
        employee.setUpdatedBy(actor); // Audit log manual

        Employee updatedEmployee = employeeRepository.save(employee);
        return mapToResponse(updatedEmployee);
    }

    /**
     * Menarik Semua Karyawan Aktif Milik Tenant.
     */
    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees(Long tenantId) {
        return employeeRepository.findAllByTenantIdAndDeletedStatus(tenantId, 0)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Mengambil Detail Karyawan Berdasarkan ID.
     */
    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id, Long tenantId) {
        Employee employee = employeeRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("employee.not.found", id));
        return mapToResponse(employee);
    }

    /**
     * Penghapusan Secara Logis (Soft Delete).
     */
    @Override
    @Transactional
    public void deleteEmployee(Long id, Long tenantId, String actor) {
        Employee employee = employeeRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("employee.not.found", id));

        // Melakukan penandaan soft delete pada data karyawan
        employee.setDeletedStatus(1);
        employee.setDeletedBy(actor);
        employee.setDeletedAt(LocalDateTime.now());

        employeeRepository.save(employee);
    }

    /**
     * Helper Mapper manual dari Entity ke Response DTO.
     */
    private EmployeeResponse mapToResponse(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .tenantId(employee.getTenantId())
                .employeeNumber(employee.getEmployeeNumber())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .phoneNumber(employee.getPhoneNumber())
                .departmentId(employee.getDepartmentId())
                .jobId(employee.getJobId())
                .joinedAt(employee.getJoinedAt())
                .status(employee.getStatus())
                .createdBy(employee.getCreatedBy())
                .createdAt(employee.getCreatedAt())
                .updatedBy(employee.getUpdatedBy())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }
}
