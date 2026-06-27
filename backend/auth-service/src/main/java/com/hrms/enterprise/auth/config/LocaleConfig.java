package com.hrms.enterprise.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.Locale;

/**
 * Kelas konfigurasi ini mengaktifkan dukungan multibahasa (Internationalization / i18n)
 * agar respon API, pesan sukses, atau pesan kesalahan (error messages) dapat disajikan
 * dalam Bahasa Indonesia atau Bahasa Inggris sesuai keinginan klien.
 */
@Configuration
public class LocaleConfig {

    /**
     * LocaleResolver bertugas menentukan bahasa aktif saat ini.
     * Menggunakan AcceptHeaderLocaleResolver agar server secara otomatis membaca
     * header HTTP 'Accept-Language' (misal: 'id' untuk Indonesia, 'en' untuk Inggris)
     * yang dikirimkan oleh browser atau aplikasi mobile/frontend.
     */
    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver localeResolver = new AcceptHeaderLocaleResolver();
        // Jika klien tidak mengirimkan header Accept-Language, maka sistem otomatis
        // menggunakan Bahasa Inggris (Locale.ENGLISH) sebagai bahasa default.
        localeResolver.setDefaultLocale(Locale.ENGLISH);
        return localeResolver;
    }

    /**
     * MessageSource mengarahkan Spring ke lokasi penyimpanan terjemahan kalimat.
     * File-file tersebut diletakkan di folder resource dengan nama awalan 'messages'.
     */
    @Bean
    public ResourceBundleMessageSource messageSource() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        // Mengacu ke file 'messages.properties' (English) dan 'messages_id.properties' (Indonesia)
        messageSource.setBasename("messages");
        messageSource.setDefaultEncoding("UTF-8");
        // Jika ada key terjemahan yang tidak didefinisikan, tampilkan kode key-nya saja
        // sebagai cadangan agar aplikasi tidak crash saat mencari teks terjemahan.
        messageSource.setUseCodeAsDefaultMessage(true);
        return messageSource;
    }
}
