package com.hrms.enterprise.employee.exception;

/**
 * Exception custom untuk menandakan adanya kesalahan input dari klien atau pelanggaran aturan bisnis
 * (misal: duplikasi NIK, format email salah).
 * Ditangkap oleh GlobalExceptionHandler untuk diterjemahkan menggunakan i18n
 * dan dikembalikan sebagai respon HTTP 400 (Bad Request).
 */
public class BadRequestException extends RuntimeException {

    // Key untuk file properties i18n (misal: "employee.number.exists")
    private final String messageKey;
    
    // Argumen dinamis untuk disisipkan ke dalam kalimat pesan
    private final Object[] args;

    public BadRequestException(String messageKey, Object... args) {
        super(messageKey);
        this.messageKey = messageKey;
        this.args = args;
    }

    public String getMessageKey() {
        return messageKey;
    }

    public Object[] getArgs() {
        return args;
    }
}
