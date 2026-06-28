package com.hrms.enterprise.leave;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * LeaveServiceApplication:
 * Aplikasi mikroservis khusus untuk menangani Manajemen Cuti & Izin (Leave & Time Off) karyawan.
 */
@SpringBootApplication(scanBasePackages = "com.hrms.enterprise.leave")
@EntityScan(basePackages = "com.hrms.enterprise.leave.entity")
@EnableJpaRepositories(basePackages = "com.hrms.enterprise.leave.repository")
public class LeaveServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LeaveServiceApplication.class, args);
    }
}
