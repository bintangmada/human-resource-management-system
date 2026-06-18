package com.hrms.enterprise.employee.exception;

import com.hrms.enterprise.employee.dto.ApiResponse;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Controller Advice Global yang bertindak sebagai "jaring pengaman" eror di aplikasi.
 * Setiap kali Controller melempar exception, kelas ini menangkapnya secara otomatis,
 * menerjemahkan pesannya secara bilingual (i18n), dan membungkusnya dalam standar ApiResponse.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    // Menyuntikkan (inject) bean MessageSource untuk mengambil terjemahan dari properties i18n
    public GlobalExceptionHandler(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    /**
     * Menangani kasus data tidak ditemukan (HTTP 404).
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        // Mendapatkan bahasa aktif saat ini dari request context
        Locale locale = LocaleContextHolder.getLocale();
        
        // Menerjemahkan key pesan dari file properties i18n beserta argumen dinamisnya
        String errorMessage = messageSource.getMessage(ex.getMessageKey(), ex.getArgs(), locale);

        ApiResponse<Void> response = ApiResponse.error(errorMessage);
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * Menangani kasus kesalahan input data atau pelanggaran aturan bisnis (HTTP 400).
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        Locale locale = LocaleContextHolder.getLocale();
        String errorMessage = messageSource.getMessage(ex.getMessageKey(), ex.getArgs(), locale);

        ApiResponse<Void> response = ApiResponse.error(errorMessage);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Menangani eror validasi input payload DTO dari controller (seperti anotasi @NotBlank, @NotNull, @Size).
     * Mengembalikan HTTP 400 dengan rincian field mana saja yang gagal divalidasi.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> validationErrors = new HashMap<>();
        
        // Loop seluruh field error dan kumpulkan ke dalam Map
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            validationErrors.put(fieldName, errorMessage);
        });

        // Sajikan response error seragam dengan field 'errors' berisi detail validasi
        ApiResponse<Void> response = ApiResponse.error("Validation failed", validationErrors);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}
