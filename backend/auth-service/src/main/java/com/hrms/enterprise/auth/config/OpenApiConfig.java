package com.hrms.enterprise.auth.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Konfigurasi OpenAPI (Swagger) untuk Employee Service.
 * Membatasi dokumentasi hanya pada API-API utama yang relevan dan menyembunyikan detail entity database.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("HRMS Employee Service API")
                        .version("1.0.0")
                        .description("Dokumentasi REST API utama untuk pengelolaan data Departemen, Jabatan, dan Karyawan.\n\n" +
                                     "**Header Penting yang Wajib Dikirim:**\n" +
                                     "* `X-Tenant-ID`: ID Tenant/Perusahaan penyewa SaaS (e.g. `1` atau `2`)\n" +
                                     "* `X-User-Email`: Alamat email aktor yang melakukan request (e.g. `admin@tenant1.com`)"));
    }
}
