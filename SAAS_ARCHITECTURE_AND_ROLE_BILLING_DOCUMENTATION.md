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

### Mekanisme Federated Tenant Email Filter
Untuk menyaring akses dan meniadakan portal login ganda, sistem melakukan filter email otomatis pada saat proses Login:
1. **Resolusi Kode Perusahaan:** Pengguna memasukkan Kode Perusahaan (Step 1) yang disinkronkan ke database `/tenants/lookup`.
2. **Pencarian Aktor Karyawan:** Saat pengguna memasukkan email (Step 2), sistem melakukan request ke `/api/v1/employees?email={email}` dengan menyematkan header `X-Tenant-ID`.
3. **Penyaringan Akses:**
   * Jika email ditemukan di database karyawan tenant tersebut, sistem mengizinkan login, membaca profil nama lengkap dan jabatan (`jobTitle`), menyimpan data sesi di `localStorage`, lalu mengarahkan ke dashboard.
   * Jika email tidak ditemukan atau tidak terdaftar di tenant tersebut, sistem memblokir akses dan memunculkan pesan eror: `"Email Anda tidak terdaftar di perusahaan ini!"`.
4. **Fleksibilitas Pengelolaan Member:** Setelah Administrator/Owner masuk ke dashboard, mereka dapat mendaftarkan perwakilan departemen (HR, Finance, IT, Staff) melalui menu kelola karyawan. Setiap akun baru yang terdaftar akan langsung bisa login menggunakan alur filter terpusat ini.

---

## 4. Panduan Pengujian & Simulasi Skenario

### Langkah A: Membuka Portal Master Admin (SaaS Owner)
1. Buka halaman login di browser (`http://localhost:5173`).
2. Masukkan subdomain: **`admin`** lalu tekan Enter / klik lookup.
3. Halaman login akan berubah menyesuaikan branding **SaaS Owner Administration**.
4. Gunakan email pre-filled **`admin@hrms.com`** lalu klik **Masuk Ke Dashboard**.
5. Anda akan masuk ke dashboard monitoring.

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
5. Setelah pendaftaran sukses, sistem otomatis menginisialisasi perusahaan, 3 departemen dasar, dan 3 akun utusan yang didaftarkan.
6. Anda (SaaS Owner) dapat melihat peningkatan estimasi pendapatan dan data PT. Jaya Abadi langsung di Master Admin Dashboard.

### Langkah C: Mencoba Login dari Sisi Klien (Tenant Admin)
1. Logout dari Master Admin.
2. Masukkan subdomain tenant baru yang Anda buat: **`jaya-abadi`**
3. Sistem akan mengenali perusahaan **PT. Jaya Abadi**.
4. Masuk menggunakan email admin utama klien: **`budi@jaya.com`**
5. Anda akan masuk ke dashboard khusus PT. Jaya Abadi dengan isolasi data penuh.
