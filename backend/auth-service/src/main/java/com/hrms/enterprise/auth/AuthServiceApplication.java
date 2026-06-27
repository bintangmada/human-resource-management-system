package com.hrms.enterprise.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * AuthServiceApplication:
 * Aplikasi mikroservis khusus untuk menangani Autentikasi (Login/JWT) dan
 * pendaftaran serta verifikasi tenant baru (Onboarding).
 */
@SpringBootApplication(scanBasePackages = "com.hrms.enterprise.auth")
@EntityScan(basePackages = "com.hrms.enterprise.auth.entity")
@EnableJpaRepositories(basePackages = "com.hrms.enterprise.auth.repository")
public class AuthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
