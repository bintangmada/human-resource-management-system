package com.hrms.enterprise.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ApiGatewayApplication:
 * Aplikasi Spring Cloud Gateway yang bertindak sebagai pintu masuk (Reverse Proxy) utama
 * untuk merutekan request dari Frontend ke mikroservis internal yang sesuai.
 */
@SpringBootApplication
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
