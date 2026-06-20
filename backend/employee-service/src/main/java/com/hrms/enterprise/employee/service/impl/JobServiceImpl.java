package com.hrms.enterprise.employee.service.impl;

import com.hrms.enterprise.employee.dto.JobRequest;
import com.hrms.enterprise.employee.dto.JobResponse;
import com.hrms.enterprise.employee.entity.Job;
import com.hrms.enterprise.employee.exception.BadRequestException;
import com.hrms.enterprise.employee.exception.ResourceNotFoundException;
import com.hrms.enterprise.employee.repository.JobRepository;
import com.hrms.enterprise.employee.repository.EmployeeRepository;
import com.hrms.enterprise.employee.service.JobService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Kelas implementasi dari JobService.
 * Menangani aturan bisnis posisi jabatan, verifikasi keunikan nama jabatan per
 * tenant,
 * pencatatan audit log manual, dan mekanisme soft delete.
 */
@Service
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final EmployeeRepository employeeRepository;

    public JobServiceImpl(JobRepository jobRepository, EmployeeRepository employeeRepository) {
        this.jobRepository = jobRepository;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Membuat Posisi Jabatan Baru.
     */
    @Override
    @Transactional
    public JobResponse createJob(JobRequest request, Long tenantId, String actor) {
        // Aturan Bisnis: Nama jabatan tidak boleh duplikat di perusahaan yang sama.
        if (jobRepository.existsByTitleAndTenantIdAndDeletedStatus(request.getTitle(), tenantId, 0)) {
            throw new BadRequestException("job.title.exists", request.getTitle());
        }

        Job job = Job.builder()
                .tenantId(tenantId)
                .title(request.getTitle())
                .grade(request.getGrade())
                .status(request.getStatus() != null ? request.getStatus() : 1)
                .createdBy(actor) // Audit trail manual
                .build();

        Job savedJob = jobRepository.save(job);
        return mapToResponse(savedJob);
    }

    /**
     * Memperbarui Data Posisi Jabatan.
     */
    @Override
    @Transactional
    public JobResponse updateJob(Long id, JobRequest request, Long tenantId, String actor) {
        Job job = jobRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("job.not.found", id));

        // Aturan Bisnis: Jika nama jabatan diubah, pastikan tidak duplikat dengan yang
        // sudah ada.
        if (!job.getTitle().equalsIgnoreCase(request.getTitle())) {
            if (jobRepository.existsByTitleAndTenantIdAndDeletedStatus(request.getTitle(), tenantId, 0)) {
                throw new BadRequestException("job.title.exists", request.getTitle());
            }
        }

        job.setTitle(request.getTitle());
        job.setGrade(request.getGrade());
        if (request.getStatus() != null) {
            job.setStatus(request.getStatus());
        }
        job.setUpdatedBy(actor); // Audit trail manual

        Job updatedJob = jobRepository.save(job);
        return mapToResponse(updatedJob);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getAllJobs(Long tenantId, Integer status, String id, String title, String grade, Pageable pageable) {
        String cleanId = (id == null || id.trim().isEmpty()) ? null : "%" + id.trim() + "%";
        String cleanTitle = (title == null || title.trim().isEmpty()) ? null : "%" + title.trim().toLowerCase() + "%";
        String cleanGrade = (grade == null || grade.trim().isEmpty()) ? null : "%" + grade.trim().toLowerCase() + "%";

        return jobRepository.findAllByTenantIdAndDeletedStatusAndFilters(
                tenantId, 0, status, cleanId, cleanTitle, cleanGrade, pageable).map(this::mapToResponse);
    }

    /**
     * Mengambil Detail Posisi Jabatan Berdasarkan ID.
     */
    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobById(Long id, Long tenantId) {
        Job job = jobRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("job.not.found", id));
        return mapToResponse(job);
    }

    /**
     * Penghapusan Secara Logis (Soft Delete).
     */
    @Override
    @Transactional
    public void deleteJob(Long id, Long tenantId, String actor) {
        Job job = jobRepository.findByIdAndTenantIdAndDeletedStatus(id, tenantId, 0)
                .orElseThrow(() -> new ResourceNotFoundException("job.not.found", id));

        // Validasi Relasional: Pastikan tidak ada karyawan aktif yang memiliki posisi
        // jabatan ini
        if (employeeRepository.existsByJobIdAndTenantIdAndDeletedStatus(id, tenantId, 0)) {
            throw new BadRequestException("job.has.employees", id);
        }

        // Melakukan pembaruan status soft-delete daripada menghapus baris SQL secara
        // fisik.
        job.setDeletedStatus(1);
        job.setDeletedBy(actor);
        job.setDeletedAt(LocalDateTime.now());

        jobRepository.save(job);
    }

    /**
     * Helper Mapper manual dari Entity ke Response DTO.
     */
    private JobResponse mapToResponse(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .tenantId(job.getTenantId())
                .title(job.getTitle())
                .grade(job.getGrade())
                .status(job.getStatus())
                .createdBy(job.getCreatedBy())
                .createdAt(job.getCreatedAt())
                .updatedBy(job.getUpdatedBy())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
