package com.hrms.enterprise.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Kelas Konfigurasi Web (WebConfig):
 * Mengimplementasikan WebMvcConfigurer untuk mengatur konfigurasi tingkat web,
 * khususnya CORS (Cross-Origin Resource Sharing).
 * 
 * Sesuai kebijakan keamanan, konfigurasi ini membatasi akses metode HTTP 
 * yang masuk dari luar (Frontend) HANYA untuk metode GET dan POST saja.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Mengonfigurasi aturan CORS agar aplikasi frontend dapat berinteraksi 
     * secara aman dengan REST API backend.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Menerapkan aturan CORS pada seluruh endpoint yang diawali dengan /api/v1/
        registry.addMapping("/api/v1/**")
                // Mengizinkan domain asal (origin) dari development server frontend
                .allowedOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173")
                // MEMBATASI METODE HTTP HANYA GET DAN POST
                .allowedMethods("GET", "POST")
                // Mengizinkan semua header HTTP bawaan maupun kustom (seperti X-Tenant-ID)
                .allowedHeaders("*")
                // Mengizinkan pengiriman kredensial (seperti cookie / auth headers) jika diperlukan
                .allowCredentials(true);
    }
}
