package com.hrms.enterprise.employee.bootstrap;

import com.hrms.enterprise.employee.entity.Department;
import com.hrms.enterprise.employee.entity.Employee;
import com.hrms.enterprise.employee.entity.Job;
import com.hrms.enterprise.employee.repository.DepartmentRepository;
import com.hrms.enterprise.employee.repository.EmployeeRepository;
import com.hrms.enterprise.employee.repository.JobRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Seeder Database untuk menginisialisasi data awal (bootstrap data) secara otomatis
 * ketika aplikasi dijalankan jika database dalam kondisi kosong.
 *
 * Berguna untuk mempermudah pengujian API lokal, pengujian filter per kolom,
 * serta verifikasi isolasi data multi-tenancy.
 */
@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final JobRepository jobRepository;
    private final EmployeeRepository employeeRepository;

    public DatabaseSeeder(DepartmentRepository departmentRepository,
                          JobRepository jobRepository,
                          EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.jobRepository = jobRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Melakukan seeding hanya jika database masih kosong
        if (departmentRepository.count() == 0 && jobRepository.count() == 0 && employeeRepository.count() == 0) {
            System.out.println("=== MEMULAI PROSES DATABASE SEEDING ===");

            // --- DATA UNTUK TENANT 1 (PT. Teknologi Nusantara) ---
            Long tenantId1 = 1L;
            String actor = "seeder@hrms.com";

            // 1. Seed Department (Tenant 1)
            Department deptIT = Department.builder()
                    .tenantId(tenantId1)
                    .name("Information Technology")
                    .code("IT")
                    .createdBy(actor)
                    .status(1)
                    .deletedStatus(0)
                    .build();

            Department deptHR = Department.builder()
                    .tenantId(tenantId1)
                    .name("Human Resource Development")
                    .code("HRD")
                    .createdBy(actor)
                    .status(1)
                    .deletedStatus(0)
                    .build();

            departmentRepository.saveAll(List.of(deptIT, deptHR));

            // 2. Seed Job (Tenant 1)
            Job jobEngineer = Job.builder()
                    .tenantId(tenantId1)
                    .title("Senior Backend Engineer")
                    .grade("SE3")
                    .createdBy(actor)
                    .status(1)
                    .deletedStatus(0)
                    .build();

            Job jobHRManager = Job.builder()
                    .tenantId(tenantId1)
                    .title("HR Manager")
                    .grade("M1")
                    .createdBy(actor)
                    .status(1)
                    .deletedStatus(0)
                    .build();

            jobRepository.saveAll(List.of(jobEngineer, jobHRManager));

            // 3. Seed Employee (Tenant 1)
            Employee emp1 = Employee.builder()
                    .tenantId(tenantId1)
                    .employeeNumber("EMP-2026-001")
                    .fullName("Ahmad Fauzi")
                    .email("ahmad.fauzi@tenant1.com")
                    .phoneNumber("+6281234567890")
                    .departmentId(deptIT.getId())
                    .jobId(jobEngineer.getId())
                    .joinedAt(LocalDate.of(2023, 1, 15))
                    .createdBy(actor)
                    .status(1)
                    .deletedStatus(0)
                    .build();

            Employee emp2 = Employee.builder()
                    .tenantId(tenantId1)
                    .employeeNumber("EMP-2026-002")
                    .fullName("Siti Aminah")
                    .email("siti.aminah@tenant1.com")
                    .phoneNumber("+6281234567891")
                    .departmentId(deptHR.getId())
                    .jobId(jobHRManager.getId())
                    .joinedAt(LocalDate.of(2024, 2, 20))
                    .createdBy(actor)
                    .status(1)
                    .deletedStatus(0)
                    .build();

            employeeRepository.saveAll(List.of(emp1, emp2));


            // --- DATA UNTUK TENANT 2 (PT. Finance Mandiri) ---
            Long tenantId2 = 2L;

            // 1. Seed Department (Tenant 2)
            Department deptFinance = Department.builder()
                    .tenantId(tenantId2)
                    .name("Finance & Accounting")
                    .code("FIN")
                    .createdBy(actor)
                    .status(1)
                    .deletedStatus(0)
                    .build();

            departmentRepository.save(deptFinance);

            // 2. Seed Job (Tenant 2)
            Job jobFinManager = Job.builder()
                    .tenantId(tenantId2)
                    .title("Finance Manager")
                    .grade("M1")
                    .createdBy(actor)
                    .status(1)
                    .deletedStatus(0)
                    .build();

            jobRepository.save(jobFinManager);

            // 3. Seed Employee (Tenant 2)
            Employee emp3 = Employee.builder()
                    .tenantId(tenantId2)
                    .employeeNumber("EMP-2026-101")
                    .fullName("Budi Santoso")
                    .email("budi.santoso@tenant2.com")
                    .phoneNumber("+628998877665")
                    .departmentId(deptFinance.getId())
                    .jobId(jobFinManager.getId())
                    .joinedAt(LocalDate.of(2022, 6, 10))
                    .createdBy(actor)
                    .status(1)
                    .deletedStatus(0)
                    .build();

            employeeRepository.save(emp3);

            System.out.println("=== PROSES DATABASE SEEDING BERHASIL DISELESAIKAN ===");
        }
    }
}
