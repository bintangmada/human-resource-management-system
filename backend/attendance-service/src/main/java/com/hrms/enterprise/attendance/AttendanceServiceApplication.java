package com.hrms.enterprise.attendance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * AttendanceServiceApplication:
 * Aplikasi mikroservis khusus untuk menangani Kehadiran (Attendance) karyawan
 * dan Pengaturan Geofencing.
 */
@SpringBootApplication(scanBasePackages = "com.hrms.enterprise.attendance")
@EntityScan(basePackages = "com.hrms.enterprise.attendance.entity")
@EnableJpaRepositories(basePackages = "com.hrms.enterprise.attendance.repository")
public class AttendanceServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AttendanceServiceApplication.class, args);
    }
}
