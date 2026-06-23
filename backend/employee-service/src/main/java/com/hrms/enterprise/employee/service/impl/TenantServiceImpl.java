package com.hrms.enterprise.employee.service.impl;

import com.hrms.enterprise.employee.dto.TenantLookupResponse;
import com.hrms.enterprise.employee.dto.TenantRequest;
import com.hrms.enterprise.employee.dto.TenantResponse;
import com.hrms.enterprise.employee.entity.Department;
import com.hrms.enterprise.employee.entity.Employee;
import com.hrms.enterprise.employee.entity.Job;
import com.hrms.enterprise.employee.entity.Tenant;
import com.hrms.enterprise.employee.repository.DepartmentRepository;
import com.hrms.enterprise.employee.repository.EmployeeRepository;
import com.hrms.enterprise.employee.repository.JobRepository;
import com.hrms.enterprise.employee.repository.TenantRepository;
import com.hrms.enterprise.employee.service.TenantService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.hrms.enterprise.employee.service.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.UUID;

/**
 * Implementasi TenantService yang mengelola alur pendaftaran,
 * resolusi subdomain, pemantauan status, dan inisialisasi data default.
 */
@Service
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;
    private final DepartmentRepository departmentRepository;
    private final JobRepository jobRepository;
    private final EmployeeRepository employeeRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public TenantServiceImpl(TenantRepository tenantRepository,
                             DepartmentRepository departmentRepository,
                             JobRepository jobRepository,
                             EmployeeRepository employeeRepository,
                             EmailService emailService,
                             PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.departmentRepository = departmentRepository;
        this.jobRepository = jobRepository;
        this.employeeRepository = employeeRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public TenantResponse registerTenant(TenantRequest request) {
        // 1. Validasi Keunikan Subdomain
        if (tenantRepository.existsBySubdomainAndDeletedStatus(request.getSubdomain(), 0)) {
            throw new IllegalArgumentException("Subdomain '" + request.getSubdomain() + "' sudah terdaftar.");
        }

        // 2. Simpan Tenant baru dengan paket dinamis
        String selectedPlan = request.getPlan() != null ? request.getPlan().toUpperCase() : "TRIAL";
        int maxEmp = 50;
        LocalDateTime expiry = LocalDateTime.now().plusDays(30);

        if ("PROFESSIONAL".equals(selectedPlan)) {
            maxEmp = 100;
            expiry = LocalDateTime.now().plusYears(1);
        } else if ("ENTERPRISE".equals(selectedPlan)) {
            maxEmp = 200;
            expiry = LocalDateTime.now().plusYears(1);
        } else {
            selectedPlan = "TRIAL";
        }

        String verificationToken = UUID.randomUUID().toString();
        Tenant tenant = Tenant.builder()
                .companyName(request.getCompanyName())
                .subdomain(request.getSubdomain())
                .ownerName(request.getOwnerName())
                .ownerEmail(request.getOwnerEmail())
                .plan(selectedPlan)
                .expiryDate(expiry)
                .maxEmployees(maxEmp)
                .status(0) // 0 = INACTIVE (Pending email verification)
                .deletedStatus(0)
                .verificationToken(verificationToken)
                .emailVerified(false)
                .createdBy("system_register")
                .build();
        
        Tenant savedTenant = tenantRepository.save(tenant);
        Long tenantId = savedTenant.getId();

        // 3. SEEDING OTOMATIS: Departemen Default (HRD, IT, FIN)
        Department deptHr = Department.builder()
                .tenantId(tenantId)
                .name("Human Resource Development")
                .code("HRD")
                .createdBy("system_register")
                .status(1)
                .deletedStatus(0)
                .build();
        Department deptIt = Department.builder()
                .tenantId(tenantId)
                .name("Information Technology")
                .code("IT")
                .createdBy("system_register")
                .status(1)
                .deletedStatus(0)
                .build();
        Department deptFin = Department.builder()
                .tenantId(tenantId)
                .name("Finance & Accounting")
                .code("FIN")
                .createdBy("system_register")
                .status(1)
                .deletedStatus(0)
                .build();
        
        Department savedDeptHr = departmentRepository.save(deptHr);
        departmentRepository.save(deptIt);
        Department savedDeptFin = departmentRepository.save(deptFin);

        // 4. SEEDING OTOMATIS: Jabatan Default (Administrator, HR Manager, Finance Manager)
        Job jobAdmin = Job.builder()
                .tenantId(tenantId)
                .title("Administrator")
                .grade("ADM")
                .createdBy("system_register")
                .status(1)
                .deletedStatus(0)
                .build();
        Job jobHrManager = Job.builder()
                .tenantId(tenantId)
                .title("HR Manager")
                .grade("HRM")
                .createdBy("system_register")
                .status(1)
                .deletedStatus(0)
                .build();
        Job jobFinManager = Job.builder()
                .tenantId(tenantId)
                .title("Finance Manager")
                .grade("FINM")
                .createdBy("system_register")
                .status(1)
                .deletedStatus(0)
                .build();
        
        Job savedJobAdmin = jobRepository.save(jobAdmin);
        Job savedJobHrManager = jobRepository.save(jobHrManager);
        Job savedJobFinManager = jobRepository.save(jobFinManager);

        // Generate password default acak untuk masing-masing akun
        String adminPassword = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        String hrPassword = null;
        String financePassword = null;

        // 5. SEEDING OTOMATIS: Akun Karyawan Admin Pertama (Super Admin Tenant)
        Employee adminEmployee = Employee.builder()
                .tenantId(tenantId)
                .employeeNumber("EMP-" + tenantId + "-001")
                .fullName(request.getOwnerName())
                .email(request.getOwnerEmail())
                .phoneNumber("+628123456789")
                .departmentId(savedDeptHr.getId())
                .jobId(savedJobAdmin.getId())
                .joinedAt(LocalDate.now())
                .createdBy("system_register")
                .status(1)
                .deletedStatus(0)
                .password(passwordEncoder.encode(adminPassword))
                .build();
        employeeRepository.save(adminEmployee);

        // 6. SEEDING OPTIONAL: Akun Karyawan HR Admin Kedua
        if (request.getHrName() != null && !request.getHrName().trim().isEmpty() &&
            request.getHrEmail() != null && !request.getHrEmail().trim().isEmpty()) {
            hrPassword = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
            Employee hrEmployee = Employee.builder()
                    .tenantId(tenantId)
                    .employeeNumber("EMP-" + tenantId + "-002")
                    .fullName(request.getHrName())
                    .email(request.getHrEmail())
                    .phoneNumber("+628123456788")
                    .departmentId(savedDeptHr.getId())
                    .jobId(savedJobHrManager.getId())
                    .joinedAt(LocalDate.now())
                    .createdBy("system_register")
                    .status(1)
                    .deletedStatus(0)
                    .password(passwordEncoder.encode(hrPassword))
                    .build();
            employeeRepository.save(hrEmployee);
        }

        // 7. SEEDING OPTIONAL: Akun Karyawan Finance Admin Ketiga
        if (request.getFinanceName() != null && !request.getFinanceName().trim().isEmpty() &&
            request.getFinanceEmail() != null && !request.getFinanceEmail().trim().isEmpty()) {
            financePassword = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
            Employee finEmployee = Employee.builder()
                    .tenantId(tenantId)
                    .employeeNumber("EMP-" + tenantId + "-003")
                    .fullName(request.getFinanceName())
                    .email(request.getFinanceEmail())
                    .phoneNumber("+628123456787")
                    .departmentId(savedDeptFin.getId())
                    .jobId(savedJobFinManager.getId())
                    .joinedAt(LocalDate.now())
                    .createdBy("system_register")
                    .status(1)
                    .deletedStatus(0)
                    .password(passwordEncoder.encode(financePassword))
                    .build();
            employeeRepository.save(finEmployee);
        }

        // Kirim email verifikasi untuk aktivasi Tenant dengan menyertakan password default acak
        emailService.sendVerificationEmail(request.getOwnerEmail(), request.getOwnerName(), request.getSubdomain(), verificationToken,
                adminPassword, hrPassword, financePassword);

        return mapToTenantResponse(savedTenant);
    }

    @Override
    public TenantLookupResponse lookupTenant(String subdomain) {
        Tenant tenant = tenantRepository.findBySubdomainAndDeletedStatus(subdomain, 0)
                .orElseThrow(() -> new IllegalArgumentException("Tenant dengan subdomain '" + subdomain + "' tidak ditemukan."));
        
        return TenantLookupResponse.builder()
                .id(tenant.getId())
                .companyName(tenant.getCompanyName())
                .subdomain(tenant.getSubdomain())
                .status(tenant.getStatus() == 1 ? "ACTIVE" : "INACTIVE")
                .build();
    }

    @Override
    public List<TenantResponse> getAllTenants() {
        return tenantRepository.findAll().stream()
                .filter(t -> t.getDeletedStatus() == 0)
                .map(this::mapToTenantResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void triggerExpiryAlert(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant dengan ID " + id + " tidak ditemukan."));
        
        // Simulasi pengiriman alert di console log
        System.out.println(">>> [ALERT] Email tagihan/peringatan dikirim ke Owner: " + tenant.getOwnerEmail());
        System.out.println(">>> Pesan: Yth. " + tenant.getOwnerName() + ", layanan HRMS Enterprise untuk " 
                + tenant.getCompanyName() + " akan berakhir pada " + tenant.getExpiryDate() + ". Silakan lakukan perpanjangan.");
    }

    private TenantResponse mapToTenantResponse(Tenant tenant) {
        long count = employeeRepository.countByTenantIdAndDeletedStatus(tenant.getId(), 0);
        
        long adminCount = employeeRepository.countByTenantIdAndDeletedStatusAndJobTitle(tenant.getId(), 0, "Administrator");
        long hrCount = employeeRepository.countByTenantIdAndDeletedStatusAndJobTitle(tenant.getId(), 0, "HR Manager");
        long financeCount = employeeRepository.countByTenantIdAndDeletedStatusAndJobTitle(tenant.getId(), 0, "Finance Manager");
        long staffCount = count - adminCount - hrCount - financeCount;
        if (staffCount < 0) staffCount = 0;
        
        return TenantResponse.builder()
                .id(tenant.getId())
                .companyName(tenant.getCompanyName())
                .subdomain(tenant.getSubdomain())
                .ownerName(tenant.getOwnerName())
                .ownerEmail(tenant.getOwnerEmail())
                .plan(tenant.getPlan())
                .status(tenant.getStatus())
                .joinedAt(tenant.getCreatedAt())
                .expiryDate(tenant.getExpiryDate())
                .maxEmployees(tenant.getMaxEmployees())
                .activeEmployeeCount(count)
                .adminCount(adminCount)
                .hrCount(hrCount)
                .financeCount(financeCount)
                .staffCount(staffCount)
                .build();
    }

    @Override
    @Transactional
    public void confirmEmail(String subdomain, String token) {
        Tenant tenant = tenantRepository.findBySubdomainAndDeletedStatus(subdomain, 0)
                .orElseThrow(() -> new IllegalArgumentException("Tenant dengan subdomain '" + subdomain + "' tidak ditemukan."));
        
        if (Boolean.TRUE.equals(tenant.getEmailVerified())) {
            throw new IllegalStateException("Email tenant untuk subdomain '" + subdomain + "' sudah pernah diverifikasi.");
        }
        
        if (tenant.getVerificationToken() == null || !tenant.getVerificationToken().equals(token)) {
            throw new IllegalArgumentException("Token verifikasi email tidak valid.");
        }
        
        tenant.setEmailVerified(true);
        tenant.setStatus(1); // Aktifkan Tenant
        tenant.setVerificationToken(null); // Bersihkan token
        tenantRepository.save(tenant);
        
        System.out.println(">>> [TENANT AKTIVASI] Tenant dengan subdomain '" + subdomain + "' berhasil diaktifkan.");
    }
}
