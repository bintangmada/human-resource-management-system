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
import java.util.ArrayList;
import java.util.List;

/**
 * Seeder Database untuk menginisialisasi 20 data awal secara otomatis
 * ketika aplikasi dijalankan jika database dalam kondisi kosong.
 *
 * Sangat berguna untuk pengujian fitur pencarian, filter, dan paginasi API.
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
            System.out.println("=== MEMULAI PROSES DATABASE SEEDING (20 DATA) ===");

            Long tenantId1 = 1L;
            String actor = "seeder@hrms.com";

            // 1. Seed 20 Departments (Tenant 1)
            String[] deptNames = {
                "Information Technology", "Human Resource Development", "Finance & Accounting",
                "Marketing & Sales", "Logistics & Supply Chain", "Legal & Compliance",
                "Research & Development", "Quality Assurance", "Customer Support",
                "Product Management", "Design & UX", "Operations",
                "Public Relations", "Security & Facilities", "Procurement",
                "Business Development", "Data & Analytics", "Internal Audit",
                "Corporate Strategy", "Administrative Support"
            };
            String[] deptCodes = {
                "IT", "HRD", "FIN", "MKT", "LOG", "LGL", "RND", "QA", "CS", "PROD",
                "DSN", "OPS", "PR", "SEC", "PROC", "BD", "DATA", "AUD", "STRAT", "ADMIN"
            };

            List<Department> departments = new ArrayList<>();
            for (int i = 0; i < 20; i++) {
                departments.add(Department.builder()
                        .tenantId(tenantId1)
                        .name(deptNames[i])
                        .code(deptCodes[i])
                        .createdBy(actor)
                        .status(1)
                        .deletedStatus(0)
                        .build());
            }
            List<Department> savedDepts = departmentRepository.saveAll(departments);

            // 2. Seed 20 Jobs (Tenant 1)
            String[] jobTitles = {
                "Software Engineer", "HR Specialist", "Accountant", "Marketing Executive",
                "Logistics Coordinator", "Legal Counsel", "R&D Researcher", "QA Tester",
                "Support Representative", "Product Owner", "UI/UX Designer", "Operations Manager",
                "PR Specialist", "Security Supervisor", "Procurement Officer", "Business Analyst",
                "Data Scientist", "Internal Auditor", "Strategic Planner", "Executive Assistant"
            };
            String[] jobGrades = {
                "SE1", "HR2", "FN2", "SL1", "LG1", "LG2", "RD3", "QA1", "CS1", "PO3",
                "DS2", "M1", "PR1", "SV1", "PR2", "BA2", "DS3", "AU2", "ST3", "EA1"
            };

            List<Job> jobs = new ArrayList<>();
            for (int i = 0; i < 20; i++) {
                jobs.add(Job.builder()
                        .tenantId(tenantId1)
                        .title(jobTitles[i])
                        .grade(jobGrades[i])
                        .createdBy(actor)
                        .status(1)
                        .deletedStatus(0)
                        .build());
            }
            List<Job> savedJobs = jobRepository.saveAll(jobs);

            // 3. Seed 20 Employees (Tenant 1)
            String[] empNames = {
                "Ahmad Fauzi", "Siti Aminah", "Budi Santoso", "Dewi Lestari", "Eko Prasetyo",
                "Rina Kartika", "Hendra Wijaya", "Dian Safitri", "Andi Pratama", "Mega Utami",
                "Fajar Ramadhan", "Indah Permata", "Rian Hidayat", "Fitriani Hasan", "Aditya Putra",
                "Novianti Eka", "Guntur Wibowo", "Sri Wahyuni", "Doni Setiawan", "Yanti Rahmawati"
            };

            List<Employee> employees = new ArrayList<>();
            for (int i = 0; i < 20; i++) {
                String emailLocal = empNames[i].toLowerCase().replace(" ", ".");
                employees.add(Employee.builder()
                        .tenantId(tenantId1)
                        .employeeNumber(String.format("EMP-2026-%03d", i + 1))
                        .fullName(empNames[i])
                        .email(emailLocal + "@tenant1.com")
                        .phoneNumber(String.format("+62812345678%02d", i))
                        .departmentId(savedDepts.get(i).getId())
                        .jobId(savedJobs.get(i).getId())
                        .joinedAt(LocalDate.of(2023, 1, 1).plusMonths(i))
                        .createdBy(actor)
                        .status(1)
                        .deletedStatus(0)
                        .build());
            }
            employeeRepository.saveAll(employees);


            // --- DATA UNTUK TENANT 2 (PT. Finance Mandiri) - Multi-tenancy check ---
            Long tenantId2 = 2L;

            Department deptFinance2 = Department.builder()
                    .tenantId(tenantId2)
                    .name("Finance & Corporate Planning")
                    .code("FIN-CP")
                    .createdBy(actor)
                    .status(1)
                    .deletedStatus(0)
                    .build();
            Department savedDept2 = departmentRepository.save(deptFinance2);

            Job jobManager2 = Job.builder()
                    .tenantId(tenantId2)
                    .title("Corporate Planning Manager")
                    .grade("M2")
                    .createdBy(actor)
                    .status(1)
                    .deletedStatus(0)
                    .build();
            Job savedJob2 = jobRepository.save(jobManager2);

            Employee empTenant2 = Employee.builder()
                    .tenantId(tenantId2)
                    .employeeNumber("EMP-2026-901")
                    .fullName("Budi Santoso")
                    .email("budi.santoso@tenant2.com")
                    .phoneNumber("+628998877665")
                    .departmentId(savedDept2.getId())
                    .jobId(savedJob2.getId())
                    .joinedAt(LocalDate.of(2022, 6, 10))
                    .createdBy(actor)
                    .status(1)
                    .deletedStatus(0)
                    .build();
            employeeRepository.save(empTenant2);

            System.out.println("=== PROSES DATABASE SEEDING (20 DATA) BERHASIL DISELESAIKAN ===");
        }
    }
}
