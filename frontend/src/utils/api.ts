/**
 * Endpoint Dasar API Backend (Base URL).
 * Mengarah ke port 8020 sesuai konfigurasi employee-service Spring Boot.
 */
const BASE_URL = 'http://localhost:8020/api/v1';

/**
 * Interface RequestOptions:
 * Digunakan untuk membatasi opsi konfigurasi request HTTP agar aman dari typo.
 */
export interface RequestOptions {
  // Metode request HTTP yang diperbolehkan
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  
  // Data payload yang akan dikirim ke backend (misal: JSON request body)
  body?: any;
  
  // Custom header tambahan jika diperlukan sewaktu-waktu
  headers?: Record<string, string>;
}

/**
 * Fungsi Pembantu apiRequest:
 * Berfungsi sebagai pembungkus (wrapper) fetch API bawaan browser.
 * Fungsi ini otomatis menyisipkan header Multi-Tenancy (X-Tenant-ID dan X-User-Email) 
 * yang diambil secara dinamis dari penyimpanan lokal browser (LocalStorage).
 *
 * Generic Type <T> digunakan agar tipe kembalian data menyesuaikan DTO yang diinginkan.
 */
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  
  // 1. Mengambil Tenant ID aktif dari LocalStorage (default '1' jika belum login)
  const tenantId = localStorage.getItem('hrms_tenant_id') || '1';
  
  // 2. Mengambil Email Aktor aktif untuk audit log (default email sistem)
  const actorEmail = localStorage.getItem('hrms_actor_email') || 'system@hrms.com';

  // 3. Merakit headers standar yang wajib dikirim ke backend HRMS
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',          // Memberitahu server bahwa payload berupa JSON
    'X-Tenant-ID': tenantId,                     // Header Multi-Tenancy untuk isolasi data
    'X-User-Email': actorEmail,                  // Header Audit Log untuk mencatat siapa yang mengubah data
    'Accept-Language': 'id',                     // Meminta pesan balasan dalam Bahasa Indonesia
    ...options.headers,                          // Menggabungkan custom header jika ada
  };

  // 4. Menyusun konfigurasi request HTTP
  const config: RequestInit = {
    method: options.method || 'GET',             // Jika method kosong, default ke GET
    headers,
  };

  // 5. Jika ada request body, ubah objek JavaScript menjadi string JSON
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  // 6. Melakukan request HTTP ke Backend menggunakan fetch
  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  // 7. Jika HTTP status code bukan 2xx (gagal)
  if (!response.ok) {
    // Coba baca pesan error dari JSON response backend
    const errorData = await response.json().catch(() => ({}));
    // Lempar error agar bisa ditangkap oleh blok try-catch di komponen pemanggil
    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
  }

  // 8. Kembalikan data respon sukses dalam bentuk objek Java / JavaScript (JSON parsing)
  return response.json();
}
