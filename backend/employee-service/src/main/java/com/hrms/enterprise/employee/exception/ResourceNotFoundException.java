package com.hrms.enterprise.employee.exception;

/**
 * Exception custom untuk menandakan bahwa data/resource yang diminta tidak ditemukan di database.
 * Exception ini akan ditangkap oleh GlobalExceptionHandler untuk diterjemahkan menggunakan i18n
 * dan dikembalikan sebagai respon HTTP 404 (Not Found).
 */
public class ResourceNotFoundException extends RuntimeException {

    // Menyimpan key kode pesan dari properties i18n (misal: "employee.not.found")
    private final String messageKey;
    
    // Menyimpan argumen dinamis untuk disisipkan ke dalam pesan (misal: ID karyawan)
    private final Object[] args;

    public ResourceNotFoundException(String messageKey, Object... args) {
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
