package com.hrms.enterprise.payroll.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

public class TaxCalculationHelper {

    // PTKP Values in IDR per year
    private static final Map<String, BigDecimal> PTKP_MAP = new HashMap<>();

    static {
        PTKP_MAP.put("TK/0", new BigDecimal("54000000"));
        PTKP_MAP.put("TK/1", new BigDecimal("58500000"));
        PTKP_MAP.put("TK/2", new BigDecimal("63000000"));
        PTKP_MAP.put("TK/3", new BigDecimal("67500000"));
        PTKP_MAP.put("K/0", new BigDecimal("58500000"));
        PTKP_MAP.put("K/1", new BigDecimal("63000000"));
        PTKP_MAP.put("K/2", new BigDecimal("67500000"));
        PTKP_MAP.put("K/3", new BigDecimal("72000000"));
    }

    public static class TaxResult {
        public BigDecimal bpjsHealthEmployee;
        public BigDecimal bpjsHealthCompany;
        public BigDecimal bpjsJhtEmployee;
        public BigDecimal bpjsJhtCompany;
        public BigDecimal bpjsJpEmployee;
        public BigDecimal bpjsJpCompany;
        public BigDecimal bpjsJkkCompany;
        public BigDecimal bpjsJkmCompany;
        
        public BigDecimal grossSalary;
        public BigDecimal jabatanFee;
        public BigDecimal taxableDeductions;
        public BigDecimal taxableIncomeYearly; // PKP
        public BigDecimal taxPPh21Yearly;
        public BigDecimal taxPPh21Monthly;
    }

    public static TaxResult calculateIndonesianTax(
            BigDecimal baseSalary,
            BigDecimal allowances,
            BigDecimal bonus,
            boolean bpjsEnabled,
            String ptkpStatus,
            boolean hasNpwp) {

        TaxResult result = new TaxResult();

        if (bpjsEnabled) {
            // BPJS Health: Employee 1%, Company 4% (Cap base salary at 12M IDR)
            BigDecimal bpjsHealthBase = baseSalary.min(new BigDecimal("12000000"));
            result.bpjsHealthEmployee = bpjsHealthBase.multiply(new BigDecimal("0.01")).setScale(0, RoundingMode.HALF_UP);
            result.bpjsHealthCompany = bpjsHealthBase.multiply(new BigDecimal("0.04")).setScale(0, RoundingMode.HALF_UP);

            // BPJS JHT: Employee 2%, Company 3.7%
            result.bpjsJhtEmployee = baseSalary.multiply(new BigDecimal("0.02")).setScale(0, RoundingMode.HALF_UP);
            result.bpjsJhtCompany = baseSalary.multiply(new BigDecimal("0.037")).setScale(0, RoundingMode.HALF_UP);

            // BPJS JP: Employee 1%, Company 2% (Cap base salary at 10065500 IDR for 2026)
            BigDecimal bpjsJpBase = baseSalary.min(new BigDecimal("10065500"));
            result.bpjsJpEmployee = bpjsJpBase.multiply(new BigDecimal("0.01")).setScale(0, RoundingMode.HALF_UP);
            result.bpjsJpCompany = bpjsJpBase.multiply(new BigDecimal("0.02")).setScale(0, RoundingMode.HALF_UP);

            // BPJS JKK: Company 0.24%
            result.bpjsJkkCompany = baseSalary.multiply(new BigDecimal("0.0024")).setScale(0, RoundingMode.HALF_UP);

            // BPJS JKM: Company 0.3%
            result.bpjsJkmCompany = baseSalary.multiply(new BigDecimal("0.003")).setScale(0, RoundingMode.HALF_UP);
        } else {
            result.bpjsHealthEmployee = BigDecimal.ZERO;
            result.bpjsHealthCompany = BigDecimal.ZERO;
            result.bpjsJhtEmployee = BigDecimal.ZERO;
            result.bpjsJhtCompany = BigDecimal.ZERO;
            result.bpjsJpEmployee = BigDecimal.ZERO;
            result.bpjsJpCompany = BigDecimal.ZERO;
            result.bpjsJkkCompany = BigDecimal.ZERO;
            result.bpjsJkmCompany = BigDecimal.ZERO;
        }

        // Gross Income: Base + Allowances + Bonus + Taxable BPJS Paid by Company (Health 4%, JKK 0.24%, JKM 0.3%)
        BigDecimal grossIncomeMonthly = baseSalary
                .add(allowances)
                .add(bonus)
                .add(result.bpjsHealthCompany)
                .add(result.bpjsJkkCompany)
                .add(result.bpjsJkmCompany);

        result.grossSalary = grossIncomeMonthly;

        // Jabatan Fee: 5% of Gross, Capped at 500,000 IDR monthly
        BigDecimal jabatanFee = grossIncomeMonthly.multiply(new BigDecimal("0.05"))
                .min(new BigDecimal("500000"))
                .setScale(0, RoundingMode.HALF_UP);
        result.jabatanFee = jabatanFee;

        // Tax deductions: Jabatan Fee + Employee JHT + Employee JP
        BigDecimal deductionsMonthly = jabatanFee
                .add(result.bpjsJhtEmployee)
                .add(result.bpjsJpEmployee);
        result.taxableDeductions = deductionsMonthly;

        // Net Income Monthly
        BigDecimal netIncomeMonthly = grossIncomeMonthly.subtract(deductionsMonthly);
        if (netIncomeMonthly.compareTo(BigDecimal.ZERO) < 0) {
            netIncomeMonthly = BigDecimal.ZERO;
        }

        // Yearized Net Income
        BigDecimal netIncomeYearly = netIncomeMonthly.multiply(new BigDecimal("12"));

        // PTKP Threshold
        BigDecimal ptkp = PTKP_MAP.getOrDefault(ptkpStatus != null ? ptkpStatus.toUpperCase() : "TK/0", new BigDecimal("54000000"));

        // Taxable Income Yearly (PKP)
        BigDecimal pkp = netIncomeYearly.subtract(ptkp);
        if (pkp.compareTo(BigDecimal.ZERO) < 0) {
            pkp = BigDecimal.ZERO;
        }
        result.taxableIncomeYearly = pkp;

        // Calculate Progressive Tax (Pasal 17 Ayat 1a UU PPh)
        BigDecimal taxYearly = BigDecimal.ZERO;
        BigDecimal tempPkp = pkp;

        // Tier 1: Up to 60,000,000 IDR -> 5%
        BigDecimal tier1Cap = new BigDecimal("60000000");
        if (tempPkp.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal tier1Amount = tempPkp.min(tier1Cap);
            taxYearly = taxYearly.add(tier1Amount.multiply(new BigDecimal("0.05")));
            tempPkp = tempPkp.subtract(tier1Amount);
        }

        // Tier 2: 60M to 250M IDR -> 15% (190M Range)
        BigDecimal tier2Cap = new BigDecimal("190000000");
        if (tempPkp.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal tier2Amount = tempPkp.min(tier2Cap);
            taxYearly = taxYearly.add(tier2Amount.multiply(new BigDecimal("0.15")));
            tempPkp = tempPkp.subtract(tier2Amount);
        }

        // Tier 3: 250M to 500M IDR -> 25% (250M Range)
        BigDecimal tier3Cap = new BigDecimal("250000000");
        if (tempPkp.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal tier3Amount = tempPkp.min(tier3Cap);
            taxYearly = taxYearly.add(tier3Amount.multiply(new BigDecimal("0.25")));
            tempPkp = tempPkp.subtract(tier3Amount);
        }

        // Tier 4: 500M to 5,000,000,000 IDR -> 30% (4.5B Range)
        BigDecimal tier4Cap = new BigDecimal("4500000000");
        if (tempPkp.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal tier4Amount = tempPkp.min(tier4Cap);
            taxYearly = taxYearly.add(tier4Amount.multiply(new BigDecimal("0.30")));
            tempPkp = tempPkp.subtract(tier4Amount);
        }

        // Tier 5: Above 5,000,000,000 IDR -> 35%
        if (tempPkp.compareTo(BigDecimal.ZERO) > 0) {
            taxYearly = taxYearly.add(tempPkp.multiply(new BigDecimal("0.35")));
        }

        // Non-NPWP penalty: +20% (120% of tax)
        if (!hasNpwp) {
            taxYearly = taxYearly.multiply(new BigDecimal("1.20"));
        }

        result.taxPPh21Yearly = taxYearly.setScale(0, RoundingMode.HALF_UP);
        result.taxPPh21Monthly = taxYearly.divide(new BigDecimal("12"), 0, RoundingMode.HALF_UP);

        return result;
    }
}
