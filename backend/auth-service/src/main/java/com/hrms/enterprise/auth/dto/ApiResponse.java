package com.hrms.enterprise.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Standard Envelope Response API (Response Wrapper) yang digunakan secara konsisten
 * di seluruh endpoint microservices.
 *
 * Mengikuti best-practice internasional (seperti panduan API dari Google, Microsoft, dan Spring):
 * 1. Selalu mengembalikan status sukses (success: true/false).
 * 2. Menyediakan pesan human-readable (message) untuk UI/log.
 * 3. Menyimpan payload data utama di field 'data'.
 * 4. Menyimpan rincian kesalahan input validasi di field 'errors'.
 * 5. Menyertakan metadata halaman di field 'pagination' khusus untuk data list (paging).
 * 6. Menyertakan waktu server saat merespon (timestamp).
 */
@Getter
@Setter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // Kolom bernilai NULL otomatis disembunyikan dari JSON output agar payload bersih
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private Object errors; // Menyimpan detail error (misal: Map <NamaField, PesanValidasi>)
    private PaginationMetadata pagination;
    private LocalDateTime timestamp;

    /**
     * Respon sukses tanpa mengembalikan data payload (biasanya untuk aksi DELETE atau status OK sederhana).
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Respon sukses standar dengan payload data (untuk aksi GET detail, POST, atau PUT).
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Respon sukses khusus untuk data list yang dipaginasi (Pagination).
     */
    public static <T> ApiResponse<T> success(String message, T data, PaginationMetadata pagination) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .pagination(pagination)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Respon eror umum (Internal Server Error, Bad Gateway, dsb).
     */
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Respon eror lengkap dengan rincian validasi field yang gagal (misal: Bad Request 400).
     */
    public static <T> ApiResponse<T> error(String message, Object errors) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errors(errors)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Kelas pendukung (Inner Class) untuk memuat metadata paginasi data list.
     * Sangat berguna bagi frontend developer untuk menggambar komponen pagination (Next/Prev/Page Number).
     */
    @Getter
    @Setter
    @Builder
    public static class PaginationMetadata {
        private int page;            // Halaman saat ini (dimulai dari 0)
        private int size;            // Jumlah maksimal data per halaman
        private long totalElements;  // Total seluruh baris data di database
        private int totalPages;      // Total halaman yang tersedia
        private boolean isLast;      // Apakah ini halaman terakhir
    }
}
