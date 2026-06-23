# Dokumen Arsitektur Multi-Tenant & Skema Billing SaaS HRMS

Dokumen ini menjelaskan struktur arsitektur multi-tenant, hierarki hak akses (SaaS Owner vs Tenant Admin), serta sistem perhitungan tagihan berbasis peran (**Role-Based Pricing**) yang diimplementasikan pada HRMS Enterprise.

---

## 1. Konsep Hierarki Akun & Batas Otoritas

Aplikasi HRMS ini memisahkan otoritas menjadi dua level utama guna memastikan keamanan data (*data isolation*) dan kemudahan pengelolaan.

### A. SaaS Owner (Platform / Master Admin)
* **Status Sistem:** `tenant_id = 0` (Bypass Global)
* **Subdomain Akses:** `admin` atau `system`
* **Email default:** `admin@hrms.com`
* **Peran Bisnis:** Pemilik platform yang menyewakan software (SaaS Provider).
* **Fitur Utama:**
  * Memantau performa bisnis SaaS global (Total Klien, Total Pengguna).
  * Perhitungan estimasi keuntungan real-time berdasarkan lisensi yang aktif.
  * Pendaftaran manual / sales-led tenant baru.
  * Trigger email notifikasi tagihan/jatuh tempo ke owner tenant.
  * Penghentian akses (*suspension*) bagi tenant yang telat membayar.

### B. Tenant Admin (Super Admin Perusahaan Klien)
* **Status Sistem:** `tenant_id = [ID Unik Tenant]` (Isolasi data ketat di tingkat baris database)
* **Subdomain Akses:** Subdomain unik perusahaan (contoh: `pt-indonesia.hrms.com`)
* **Email default:** Ditetapkan saat registrasi awal tenant (contoh: `admin@pt-indonesia.com`)
* **Peran Bisnis:** Direktur / IT Manager perwakilan internal perusahaan klien.
* **Fitur Utama:**
  * Mengelola profil internal perusahaan.
  * Menambah, mengedit, atau menonaktifkan karyawan internal.
  * Memberikan akses peran khusus (**HR Manager** atau **Finance Manager**) untuk staf mereka sendiri.
  * Mengelola payroll, departemen, dan jabatan mandiri tanpa bantuan SaaS Owner.

---

## 2. Skema Billing Berbasis Peran (Role-Based Pricing)

Untuk memaksimalkan pendapatan dan menyesuaikan beban server, sistem menggunakan perhitungan tarif berbeda berdasarkan jabatan/peran karyawan yang didaftarkan oleh klien:

| Jenis Jabatan / Role | Tarif Bulanan per User | Deskripsi Akses Sistem |
| :--- | :--- | :--- |
| **Administrator** | **$30** | Pemilik sistem internal klien, pengatur modul setting. |
| **Finance Manager** | **$25** | Pengelola payroll, benefit, slip gaji karyawan, dan pelaporan pajak. |
| **HR Manager** | **$15** | Pengelola database karyawan, rekrutmen, dan data kehadiran. |
| **Karyawan Biasa (Staff)** | **$2** | Portal mandiri (ESS) untuk absensi, pengajuan cuti, dan slip gaji pribadi. |

### Formula Perhitungan Pendapatan SaaS (Master Admin Console)
Setiap tenant yang berstatus **ACTIVE** (status = 1) akan dihitung pendapatannya secara dinamis menggunakan formula:
$$\text{Revenue} = (\text{adminCount} \times \$30) + (\text{financeCount} \times \$25) + (\text{hrCount} \times \$15) + (\text{staffCount} \times \$2)$$

---

## 3. Alur Registrasi Otomatis & Provisioning (Self-Service)

Proses pendaftaran tenant baru dilakukan secara mandiri oleh calon klien langsung melalui portal publik secara ringkas:

```
[ Klien mengakses Portal & Klik 'Daftarkan Perusahaan Anda' ]
                              │
                              ▼
    [ Mengisi Form Pendaftaran Perusahaan, Kode Perusahaan, ]
    [ Paket Pilihan, serta data Administrator Utama (Owner) ]
                              │
                              ▼
               [ POST /api/v1/tenants/register ]
                              │
                              ▼
    1. Membuat record TENANT baru dengan paket pilihan (Trial/Professional/Enterprise).
    2. Membuat 3 DEPARTEMEN default (IT, HRD, FIN).
    3. Membuat 3 JABATAN default (Administrator, HR Manager, Finance Manager).
    4. Mendaftarkan data Administrator Utama (Owner) sebagai Karyawan pertama dengan jabatan "Administrator".
    5. (Opsional) Mendaftarkan utusan awal HR / Finance jika disertakan.
```

### Mekanisme Autentikasi Secure JWT & Isolasi Tenant
Untuk memastikan keamanan tingkat enterprise, aplikasi menggunakan autentikasi berbasis stateless JSON Web Token (JWT):
1. **Resolusi Kode Perusahaan (Step 1):** Pengguna memasukkan Kode Perusahaan (subdomain) yang divalidasi ke database via `/api/v1/tenants/lookup`.
2. **Kredensial & Autentikasi (Step 2):** Pengguna memasukkan email dan password mereka. Request dikirim melalui `POST /api/v1/auth/login`.
3. **Verifikasi Kredensial di Backend:**
   * Backend memverifikasi email pengguna secara global dari `Employee` repository (atau static credential jika Master Admin `admin@hrms.com`).
   * Password diverifikasi menggunakan `BCryptPasswordEncoder`.
   * Jika valid, backend merakit JWT token yang disandi dengan algoritma HMAC-SHA256, berisi klaim aman: `tenantId`, `email`, dan `roles`.
4. **Penyimpanan Token & Sesi:** Frontend React menerima response login sukses, menyimpan JWT token (`hrms_jwt_token`) ke LocalStorage, dan mengarahkan pengguna ke dashboard yang sesuai.
5. **Request Interceptor & Context Wrapper:**
   * Di frontend, modul `api.ts` secara otomatis menyisipkan header `Authorization: Bearer <token>` pada semua request HTTP.
   * Di backend, `JwtAuthenticationFilter` memvalidasi token dan mengisi konteks keamanan Spring Security (`SecurityContextHolder`).
   * Sebuah servlet request wrapper (`TenantSecurityRequestWrapper`) menyadap parameter `@RequestHeader("X-Tenant-ID")` dan `@RequestHeader("X-User-Email")` dan menggantinya dengan data yang telah divalidasi dari JWT token. Hal ini mencegah spoofing data tenant oleh pengguna nakal.

---

## 4. Panduan Pengujian & Simulasi Skenario

### Langkah A: Membuka Portal Master Admin (SaaS Owner)
1. Buka halaman login di browser (`http://localhost:5173`).
2. Masukkan subdomain: **`admin`** lalu tekan Enter / klik lookup.
3. Halaman login akan berubah menyesuaikan branding **SaaS Owner Administration**.
4. Masukkan email **`admin@hrms.com`** dan Password default **`admin123`** atau **`superadmin`** lalu klik **Masuk Ke Dashboard**.
5. Anda akan masuk ke dashboard monitoring SaaS Owner.

### Langkah B: Simulasi Klien Melakukan Pendaftaran Mandiri (Self-Service)
1. Buka halaman login di browser (`http://localhost:5173`).
2. Klik link **Daftarkan Perusahaan Baru** untuk masuk ke form pendaftaran.
3. Isi formulir pendaftaran secara mandiri:
   * **Nama Perusahaan:** PT. Jaya Abadi
   * **Subdomain:** `jaya-abadi`
   * **Pilih Paket:** `PROFESSIONAL` (Batas 100 karyawan, durasi 1 tahun)
   * **Utusan 1 (Administrator/Owner):** Budi Hartono (`budi@jaya.com`)
   * **Utusan 2 (HR Admin):** Siska Amalia (`siska@jaya.com`)
   * **Utusan 3 (Finance Admin):** Anton Wijaya (`anton@jaya.com`)
4. Klik **Daftarkan Perusahaan & Utusan**.
5. Setelah pendaftaran sukses, sistem otomatis menginisialisasi perusahaan, 3 departemen dasar, dan 3 akun utusan yang didaftarkan. Password default untuk semua akun baru adalah **`password123`**.
6. Anda (SaaS Owner) dapat melihat peningkatan estimasi pendapatan dan data PT. Jaya Abadi langsung di Master Admin Dashboard.

### Langkah C: Mencoba Login dari Sisi Klien (Tenant Admin)
1. Logout dari Master Admin.
2. Masukkan subdomain tenant baru yang Anda buat: **`jaya-abadi`**
3. Sistem akan mengenali perusahaan **PT. Jaya Abadi**.
4. Masuk menggunakan email admin utama klien: **`budi@jaya.com`** dan password **`password123`**.
5. Anda akan masuk ke dashboard khusus PT. Jaya Abadi dengan isolasi data penuh berbasis JWT.
