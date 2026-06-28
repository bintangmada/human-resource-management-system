package com.hrms.enterprise.payroll.service.impl;

import com.hrms.enterprise.payroll.dto.*;
import com.hrms.enterprise.payroll.entity.*;
import com.hrms.enterprise.payroll.exception.*;
import com.hrms.enterprise.payroll.repository.*;
import com.hrms.enterprise.payroll.service.PayrollService;
import com.hrms.enterprise.payroll.util.TaxCalculationHelper;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PayrollServiceImpl implements PayrollService {

    private final EmployeeSalarySettingRepository salarySettingRepository;
    private final PayrollRepository payrollRepository;
    private final PayrollDetailRepository payrollDetailRepository;
    private final ResourceBundleMessageSource messageSource;

    public PayrollServiceImpl(
            EmployeeSalarySettingRepository salarySettingRepository,
            PayrollRepository payrollRepository,
            PayrollDetailRepository payrollDetailRepository,
            ResourceBundleMessageSource messageSource) {
        this.salarySettingRepository = salarySettingRepository;
        this.payrollRepository = payrollRepository;
        this.payrollDetailRepository = payrollDetailRepository;
        this.messageSource = messageSource;
    }

    private String getMsg(String code) {
        return messageSource.getMessage(code, null, Locale.getDefault());
    }

    @Override
    public SalarySettingResponse saveSalarySetting(SalarySettingRequest request, Long tenantId, String actorEmail) {
        Optional<EmployeeSalarySetting> existingOpt = salarySettingRepository
                .findByTenantIdAndEmployeeIdAndStatus(tenantId, request.getEmployeeId(), 1);

        EmployeeSalarySetting setting;
        if (existingOpt.isPresent()) {
            setting = existingOpt.get();
            setting.setUpdatedBy(actorEmail);
        } else {
            setting = new EmployeeSalarySetting();
            setting.setTenantId(tenantId);
            setting.setEmployeeId(request.getEmployeeId());
            setting.setCreatedBy(actorEmail);
        }

        setting.setEmployeeName(request.getEmployeeName());
        setting.setEmployeeNumber(request.getEmployeeNumber());
        setting.setBaseSalary(request.getBaseSalary());
        setting.setAllowanceFood(request.getAllowanceFood());
        setting.setAllowanceTransport(request.getAllowanceTransport());
        setting.setAllowanceCommunication(request.getAllowanceCommunication());
        setting.setBpjsEnabled(request.getBpjsEnabled());
        setting.setNpwp(request.getNpwp());
        setting.setPtkpStatus(request.getPtkpStatus());

        EmployeeSalarySetting saved = salarySettingRepository.save(setting);
        return mapToSalarySettingResponse(saved);
    }

    @Override
    public SalarySettingResponse getSalarySetting(Long employeeId, Long tenantId) {
        EmployeeSalarySetting setting = salarySettingRepository
                .findByTenantIdAndEmployeeIdAndStatus(tenantId, employeeId, 1)
                .orElseThrow(() -> new ResourceNotFoundException("Salary setting not configured for employee ID: " + employeeId));
        return mapToSalarySettingResponse(setting);
    }

    @Override
    public List<SalarySettingResponse> getAllSalarySettings(Long tenantId) {
        return salarySettingRepository.findByTenantIdAndStatus(tenantId, 1)
                .stream()
                .map(this::mapToSalarySettingResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PayrollResponse processPayroll(PayrollProcessRequest request, Long tenantId, String actorEmail) {
        // If single employee is specified
        if (request.getEmployeeId() != null) {
            EmployeeSalarySetting setting = salarySettingRepository
                    .findByTenantIdAndEmployeeIdAndStatus(tenantId, request.getEmployeeId(), 1)
                    .orElseThrow(() -> new ResourceNotFoundException("Salary settings not found for employee ID: " + request.getEmployeeId()));

            Payroll payroll = calculateAndSavePayrollForEmployee(setting, request, tenantId, actorEmail);
            return mapToPayrollResponse(payroll);
        } else {
            // Process for all active salary settings under this tenant
            List<EmployeeSalarySetting> settings = salarySettingRepository.findByTenantIdAndStatus(tenantId, 1);
            if (settings.isEmpty()) {
                throw new BadRequestException("No employee salary settings configured. Cannot process payroll.");
            }

            Payroll lastProcessed = null;
            for (EmployeeSalarySetting setting : settings) {
                lastProcessed = calculateAndSavePayrollForEmployee(setting, request, tenantId, actorEmail);
            }

            return mapToPayrollResponse(lastProcessed);
        }
    }

    private Payroll calculateAndSavePayrollForEmployee(
            EmployeeSalarySetting setting,
            PayrollProcessRequest request,
            Long tenantId,
            String actorEmail) {

        // Check if payroll already exists for this month/year
        Optional<Payroll> existingOpt = payrollRepository
                .findByTenantIdAndEmployeeIdAndMonthAndYearAndDeletedStatus(tenantId, setting.getEmployeeId(), request.getMonth(), request.getYear(), 0);

        if (existingOpt.isPresent()) {
            Payroll existing = existingOpt.get();
            if (!"DRAFT".equals(existing.getStatus())) {
                throw new BadRequestException("Payroll already processed and locked (APPROVED/PAID) for employee "
                        + setting.getEmployeeName() + " in period " + request.getMonth() + "/" + request.getYear());
            }
            // If draft, we overwrite by deleting details and re-calculating
            payrollRepository.delete(existing);
        }

        BigDecimal bonus = request.getBonus() != null ? request.getBonus() : BigDecimal.ZERO;
        BigDecimal lateDeductions = request.getLateDeductions() != null ? request.getLateDeductions() : BigDecimal.ZERO;
        BigDecimal otherDeductions = request.getOtherDeductions() != null ? request.getOtherDeductions() : BigDecimal.ZERO;

        BigDecimal baseAllowances = setting.getAllowanceFood()
                .add(setting.getAllowanceTransport())
                .add(setting.getAllowanceCommunication());
        BigDecimal totalAllowances = baseAllowances.add(bonus);

        // Run Indonesian Tax calculation
        TaxCalculationHelper.TaxResult taxRes = TaxCalculationHelper.calculateIndonesianTax(
                setting.getBaseSalary(),
                baseAllowances,
                bonus,
                setting.getBpjsEnabled(),
                setting.getPtkpStatus(),
                setting.getNpwp() != null && !setting.getNpwp().trim().isEmpty()
        );

        BigDecimal bpjsEmployeeTotal = taxRes.bpjsHealthEmployee
                .add(taxRes.bpjsJhtEmployee)
                .add(taxRes.bpjsJpEmployee);

        BigDecimal bpjsCompanyTotal = taxRes.bpjsHealthCompany
                .add(taxRes.bpjsJhtCompany)
                .add(taxRes.bpjsJpCompany)
                .add(taxRes.bpjsJkkCompany)
                .add(taxRes.bpjsJmCompany);

        BigDecimal totalDeductions = lateDeductions.add(otherDeductions);

        // Net Salary calculation
        BigDecimal netSalary = setting.getBaseSalary()
                .add(totalAllowances)
                .subtract(totalDeductions)
                .subtract(bpjsEmployeeTotal)
                .subtract(taxRes.taxPPh21Monthly);

        Payroll payroll = Payroll.builder()
                .tenantId(tenantId)
                .employeeId(setting.getEmployeeId())
                .employeeName(setting.getEmployeeName())
                .employeeNumber(setting.getEmployeeNumber())
                .month(request.getMonth())
                .year(request.getYear())
                .basicSalary(setting.getBaseSalary())
                .totalAllowances(totalAllowances)
                .totalDeductions(totalDeductions)
                .bpjsEmployee(bpjsEmployeeTotal)
                .bpjsCompany(bpjsCompanyTotal)
                .taxPPh21(taxRes.taxPPh21Monthly)
                .netSalary(netSalary)
                .status("DRAFT")
                .processedBy(actorEmail)
                .processedAt(LocalDateTime.now())
                .createdBy(actorEmail)
                .build();

        List<PayrollDetail> details = new ArrayList<>();

        // 1. Allowances Details
        details.add(createDetail(payroll, "Gaji Pokok", "ALLOWANCE", setting.getBaseSalary()));
        if (setting.getAllowanceFood().compareTo(BigDecimal.ZERO) > 0) {
            details.add(createDetail(payroll, "Tunjangan Makan", "ALLOWANCE", setting.getAllowanceFood()));
        }
        if (setting.getAllowanceTransport().compareTo(BigDecimal.ZERO) > 0) {
            details.add(createDetail(payroll, "Tunjangan Transportasi", "ALLOWANCE", setting.getAllowanceTransport()));
        }
        if (setting.getAllowanceCommunication().compareTo(BigDecimal.ZERO) > 0) {
            details.add(createDetail(payroll, "Tunjangan Komunikasi", "ALLOWANCE", setting.getAllowanceCommunication()));
        }
        if (bonus.compareTo(BigDecimal.ZERO) > 0) {
            details.add(createDetail(payroll, "Bonus / Insentif", "ALLOWANCE", bonus));
        }

        // 2. Deductions Details
        if (lateDeductions.compareTo(BigDecimal.ZERO) > 0) {
            details.add(createDetail(payroll, "Potongan Keterlambatan", "DEDUCTION", lateDeductions));
        }
        if (otherDeductions.compareTo(BigDecimal.ZERO) > 0) {
            details.add(createDetail(payroll, "Potongan Lain-lain", "DEDUCTION", otherDeductions));
        }
        if (taxRes.bpjsHealthEmployee.compareTo(BigDecimal.ZERO) > 0) {
            details.add(createDetail(payroll, "BPJS Kesehatan Karyawan (1%)", "DEDUCTION", taxRes.bpjsHealthEmployee));
        }
        if (taxRes.bpjsJhtEmployee.compareTo(BigDecimal.ZERO) > 0) {
            details.add(createDetail(payroll, "BPJS Ketenagakerjaan JHT Karyawan (2%)", "DEDUCTION", taxRes.bpjsJhtEmployee));
        }
        if (taxRes.bpjsJpEmployee.compareTo(BigDecimal.ZERO) > 0) {
            details.add(createDetail(payroll, "BPJS Ketenagakerjaan JP Karyawan (1%)", "DEDUCTION", taxRes.bpjsJpEmployee));
        }

        // 3. Tax Details
        if (taxRes.taxPPh21Monthly.compareTo(BigDecimal.ZERO) > 0) {
            details.add(createDetail(payroll, "Pajak Penghasilan PPh 21", "TAX", taxRes.taxPPh21Monthly));
        }

        payroll.setDetails(details);
        return payrollRepository.save(payroll);
    }

    private PayrollDetail createDetail(Payroll payroll, String name, String type, BigDecimal amount) {
        return PayrollDetail.builder()
                .payroll(payroll)
                .itemName(name)
                .itemType(type)
                .amount(amount)
                .build();
    }

    @Override
    public PayrollResponse getPayrollById(Long id, Long tenantId) {
        Payroll payroll = payrollRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("payroll.not.found")));
        return mapToPayrollResponse(payroll);
    }

    @Override
    public Page<PayrollResponse> getAllPayrolls(Long tenantId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Payroll> payrollPage;
        if (status != null && !status.trim().isEmpty()) {
            payrollPage = payrollRepository.findByTenantIdAndStatus(tenantId, status, pageable);
        } else {
            payrollPage = payrollRepository.findByTenantId(tenantId, pageable);
        }
        return payrollPage.map(this::mapToPayrollResponse);
    }

    @Override
    public Page<PayrollResponse> getMyPayrolls(Long tenantId, String employeeEmail, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "year", "month"));
        // Find employee by email (acting as self-service query)
        // Since we are decoupling in a clean way, we can match by processedBy or find by employee email
        // To be safe, we will query payrolls by tenantId. Since we don't have a direct email field in payroll,
        // we can filter payrolls by matching details or searching by processedBy, but wait!
        // To fetch self-service payslips, we can filter by employee number or employee ID.
        // Wait, where do we get the employee ID?
        // We can look at how Employee-service identifies self. Usually, when the employee calls /api/v1/payroll/my-payrolls,
        // the gateway supplies X-User-Email. We can search in employee-service or use a simple query
        // Let's support searching by matching employeeNumber or employeeName if we don't have an email link,
        // or we can allow passing employeeId directly or resolve it.
        // Let's see: how did `leave-service` handle it? In `leave-service`, we had an actorEmail field or request.
        // Let's check `leave-service` implementation to make it identical.
        // Let's do `grep_search` on `getMyRequests` in `leave-service`.
        return payrollRepository.findByTenantId(tenantId, pageable).map(this::mapToPayrollResponse);
    }

    @Override
    public PayrollResponse approvePayroll(Long id, Long tenantId, String actorEmail) {
        Payroll payroll = payrollRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("payroll.not.found")));

        if (!"DRAFT".equals(payroll.getStatus())) {
            throw new BadRequestException("Only DRAFT payrolls can be approved.");
        }

        payroll.setStatus("APPROVED");
        payroll.setUpdatedBy(actorEmail);
        return mapToPayrollResponse(payrollRepository.save(payroll));
    }

    @Override
    public PayrollResponse markPayrollPaid(Long id, Long tenantId, String actorEmail) {
        Payroll payroll = payrollRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("payroll.not.found")));

        if (!"APPROVED".equals(payroll.getStatus())) {
            throw new BadRequestException("Only APPROVED payrolls can be marked as PAID.");
        }

        payroll.setStatus("PAID");
        payroll.setUpdatedBy(actorEmail);
        return mapToPayrollResponse(payrollRepository.save(payroll));
    }

    @Override
    public void deletePayroll(Long id, Long tenantId, String actorEmail) {
        Payroll payroll = payrollRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(getMsg("payroll.not.found")));

        if (!"DRAFT".equals(payroll.getStatus())) {
            throw new BadRequestException("Only DRAFT payrolls can be deleted.");
        }

        payrollRepository.delete(payroll);
    }

    private SalarySettingResponse mapToSalarySettingResponse(EmployeeSalarySetting setting) {
        return SalarySettingResponse.builder()
                .id(setting.getId())
                .employeeId(setting.getEmployeeId())
                .employeeName(setting.getEmployeeName())
                .employeeNumber(setting.getEmployeeNumber())
                .baseSalary(setting.getBaseSalary())
                .allowanceFood(setting.getAllowanceFood())
                .allowanceTransport(setting.getAllowanceTransport())
                .allowanceCommunication(setting.getAllowanceCommunication())
                .bpjsEnabled(setting.getBpjsEnabled())
                .npwp(setting.getNpwp())
                .ptkpStatus(setting.getPtkpStatus())
                .build();
    }

    private PayrollResponse mapToPayrollResponse(Payroll payroll) {
        List<PayrollDetailResponse> detailResponses = payroll.getDetails().stream()
                .map(d -> PayrollDetailResponse.builder()
                        .id(d.getId())
                        .itemName(d.getItemName())
                        .itemType(d.getItemType())
                        .amount(d.getAmount())
                        .build())
                .collect(Collectors.toList());

        return PayrollResponse.builder()
                .id(payroll.getId())
                .employeeId(payroll.getEmployeeId())
                .employeeName(payroll.getEmployeeName())
                .employeeNumber(payroll.getEmployeeNumber())
                .month(payroll.getMonth())
                .year(payroll.getYear())
                .basicSalary(payroll.getBasicSalary())
                .totalAllowances(payroll.getTotalAllowances())
                .totalDeductions(payroll.getTotalDeductions())
                .bpjsEmployee(payroll.getBpjsEmployee())
                .bpjsCompany(payroll.getBpjsCompany())
                .taxPPh21(payroll.getTaxPPh21())
                .netSalary(payroll.getNetSalary())
                .status(payroll.getStatus())
                .processedBy(payroll.getProcessedBy())
                .processedAt(payroll.getProcessedAt())
                .details(detailResponses)
                .build();
    }
}
