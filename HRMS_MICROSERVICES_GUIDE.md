# 🌐 HRMS Microservices Directory & Architecture Guide

Dokumen ini berisi panduan lengkap untuk seluruh modul mikroservis (backend & routing) yang terintegrasi di dalam HRMS (Human Resource Management System) Enterprise. Setiap mikroservis berjalan secara independen dengan database terisolasi demi menjamin keamanan data multi-tenant.

---

## 🏗️ Peta Port & Skema Database

| No | Nama Mikroservis | Port Default | Database PostgreSQL | Endpoint Utama (Melalui Gateway) | Deskripsi Utama |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **`api-gateway`** | `8020` | *None* | `http://localhost:8020/` | Pintu gerbang utama (Gateway) untuk routing lalu lintas API. |
| 2 | **`auth-service`** | `8021` | `hrms_auth` | `/api/v1/auth/**` | Otentikasi JWT, registrasi tenant/perusahaan baru, login. |
| 3 | **`employee-service`** | `8022` | `hrms_employee` | `/api/v1/employees/**`, `/departments/**` | Manajemen data karyawan, jabatan (jobs), & struktur departemen. |
| 4 | **`attendance-service`** | `8023` | `hrms_attendance` | `/api/v1/attendance/**` | Pencatatan kehadiran (Clock-in/out) berbasis koordinat geofencing. |
| 5 | **`leave-service`** | `8024` | `hrms_leave` | `/api/v1/leaves/**` | Pengajuan cuti karyawan & pemotongan kuota cuti tahunan. |
| 6 | **`payroll-service`** | `8025` | `hrms_payroll` | `/api/v1/payroll/**` | Perhitungan gaji bulanan, tunjangan, slip gaji (payslip). |
| 7 | **`claim-service`** | `8026` | `hrms_claim` | `/api/v1/claims/**` | Penggantian biaya (reimbursement) medis, bensin, kacamata dll. |
| 8 | **`loan-service`** | `8027` | `hrms_loan` | `/api/v1/loans/**` | Pengajuan kasbon/pinjaman dengan tabel amortisasi cicilan otomatis. |
| 9 | **`performance-service`** | `8028` | `hrms_performance` | `/api/v1/performance/**` | Evaluasi kinerja karyawan berdasarkan 5 kriteria KPI core. |
| 11 | **`asset-service`** | `8031` | `hrms_asset` | `/api/v1/assets/**` | Pendaftaran aset kantor & pengajuan permohonan inventaris/servis. |
| 12 | **`notification-service`** | `8032` | `hrms_notification` | `/api/v1/notifications/**` | Pengumuman internal perusahaan & kalender kegiatan kantor. |
| 13 | **`offboarding-service`** | `8034` | `hrms_offboarding` | `/api/v1/offboarding/**` | Pengajuan resign mandiri & penyelesaian ceklis exit clearance. |
| 14 | **`travel-service`** | `8033` | `hrms_travel` | `/api/v1/travel/**` | Pengajuan dinas & reimbursement perjalanan dinas. |
| 15 | **`training-service`** | `8030` | `hrms_training` | `/api/v1/training/**` | Pembelajaran & pengembangan program pelatihan karyawan (L&D). |

---

## 🔑 1. Keamanan & Multi-Tenancy
Sistem HRMS ini menerapkan konsep **Logical Isolation Multi-Tenancy** pada level database:
- Semua request dari frontend wajib melewati `api-gateway` (Port `8020`).
- Gateway melakukan verifikasi JWT Token, lalu meneruskan informasi context berupa header:
  - `X-Tenant-ID`: Mengisolasi data antar-perusahaan sehingga tidak terjadi kebocoran data.
  - `X-User-Email`: Untuk pencatatan audit log (`createdBy` / `updatedBy`).
- Filter `TenantSecurityRequestWrapper` di tiap modul secara otomatis menyaring data database berdasarkan `X-Tenant-ID` tersebut.

---

## 📦 2. Penjelasan Detail Setiap Modul

### 1️⃣ API Gateway (`api-gateway`)
Pusat kendali rute lalu lintas API. Menggunakan **Spring Cloud Gateway**. Berkas konfigurasi rute berada di:
`backend/api-gateway/src/main/resources/application.yml`

### 2️⃣ Authentication Service (`auth-service`)
Mengatur pendaftaran perusahaan baru (Tenant) dan pembuatan akun pengguna pertama (Owner/Admin).
- **APIs**:
  - `POST /api/v1/auth/register` (Registrasi perusahaan baru)
  - `POST /api/v1/auth/login` (Login & dapatkan JWT Token)

### 3️⃣ Employee Directory (`employee-service`)
Pusat data karyawan. Digunakan oleh servis lain (melalui sinkronisasi REST API internal) untuk mencari nama, nomor karyawan, dan email.
- **APIs**:
  - `GET /api/v1/employees` (Daftar karyawan)
  - `POST /api/v1/departments` (Manajemen departemen)

### 4️⃣ Attendance & Geofencing (`attendance-service`)
Mencatat jam masuk/keluar karyawan. Kehadiran divalidasi berdasarkan jarak koordinat lintang/bujur (Latitude/Longitude) kantor yang telah diset oleh HR.
- **APIs**:
  - `POST /api/v1/attendance/check-in` (Clock-in masuk kerja)
  - `POST /api/v1/attendance/check-out` (Clock-out selesai kerja)

### 5️⃣ Leave & Quota Management (`leave-service`)
Karyawan mengajukan permohonan cuti (misal: Cuti Tahunan, Sakit). Mengurangi kuota cuti secara otomatis setelah disetujui HR.
- **APIs**:
  - `POST /api/v1/leaves/request` (Pengajuan cuti)
  - `POST /api/v1/leaves/{id}/approve` (Persetujuan cuti oleh HR)

### 6️⃣ Payroll & Payslip (`payroll-service`)
Menghitung gaji kotor, potongan pinjaman aktif, potongan asuransi, dan menghasilkan slip gaji PDF bulanan.
- **APIs**:
  - `POST /api/v1/payroll/generate` (Kalkulasi slip gaji karyawan)
  - `GET /api/v1/payroll/my` (Unduh/lihat slip gaji sendiri)

### 7️⃣ Claims & Reimbursements (`claim-service`)
Pengajuan klaim penggantian dana operasional dengan menyertakan tautan foto bukti kuitansi belanja.
- **APIs**:
  - `POST /api/v1/claims/apply` (Pengajuan klaim baru)
  - `PUT /api/v1/claims/{id}/status` (Approval/Rejection klaim)

### 8️⃣ Loan & Amortization Repayments (`loan-service`)
Sistem peminjaman uang darurat/kasbon karyawan. Begitu disetujui, tabel amortisasi cicilan flat bulanan akan dihitung otomatis.
- **APIs**:
  - `POST /api/v1/loans/apply` (Pengajuan kasbon)
  - `GET /api/v1/loans/{id}/installments` (Lihat tabel rencana cicilan bulanan)

### 9️⃣ Performance Reviews & KPIs (`performance-service`)
Melakukan review kerja triwulanan/tahunan berdasarkan KPI core. Memiliki live gauge kalkulator skor rata-rata di frontend.
- **APIs**:
  - `POST /api/v1/performance/submit` (Kirim penilaian)
  - `POST /api/v1/performance/{id}/approve` (Finalisasi KPI)

### 🔟 Recruitment & ATS (`recruitment-service`)
Mengelola alur pelamar kerja (Applicant Tracking System) mulai dari screening CV, wawancara, penawaran kontrak, hingga diterima bekerja.
- **APIs**:
  - `POST /api/v1/recruitment/jobs` (Publikasi lowongan kerja baru)
  - `POST /api/v1/recruitment/applications/submit` (Pendaftaran pelamar kerja)
  - `PUT /api/v1/recruitment/applications/{id}/stage` (Ubah tahapan seleksi)

### 1️⃣1️⃣ Asset & Inventory Management (`asset-service`)
Pencatatan aset sarana prasarana fisik kantor, inventarisasi kepemilikan perangkat kerja karyawan, serta pemrosesan tiket perbaikan.
- **APIs**:
  - `POST /api/v1/assets` (Registrasi aset baru)
  - `GET /api/v1/assets/my` (Daftar aset teralokasi ke saya)
  - `POST /api/v1/assets/requests` (Pengajuan peminjaman/perbaikan aset)
  - `PUT /api/v1/assets/requests/{id}/process` (Keputusan alokasi aset oleh HR)

### 1️⃣2️⃣ Announcements & Calendar (`notification-service`)
Publikasi pengumuman penting perusahaan dan pengelolaan jadwal agenda kalender kegiatan bulanan kantor.
- **APIs**:
  - `POST /api/v1/notifications/announcements` (Membuat pengumuman baru)
  - `GET /api/v1/notifications/events` (Mendapatkan event agenda kalender kantor)

### 1️⃣3️⃣ Resign & Exit Clearance (`offboarding-service`)
Pengajuan pengunduran diri karyawan mandiri, verifikasi persetujuan HR, dan pelacakan ceklis exit clearance lintas departemen.
- **APIs**:
  - `POST /api/v1/offboarding/requests` (Pengajuan resign mandiri)
  - `PUT /api/v1/offboarding/requests/{id}/process` (Persetujuan HR & inisialisasi clearance)
  - `PUT /api/v1/offboarding/requests/{requestId}/items/{itemId}` (Update status item ceklis clearance)

### 1️⃣4️⃣ Business Travel & Expense (`travel-service`)
Pengajuan dinas perjalanan bisnis karyawan, budget approval oleh HR, dan penyerahan klaim reimbursable nota/kuitansi.
- **APIs**:
  - `POST /api/v1/travel/requests` (Pengajuan perjalanan dinas baru)
  - `PUT /api/v1/travel/requests/{id}/process` (Review & penetapan anggaran)
  - `POST /api/v1/travel/requests/{id}/expenses` (Upload nota klaim baru)
  - `PUT /api/v1/travel/requests/{reqId}/expenses/{expId}/process` (Approval/Rejection biaya nota)

### 1️⃣5️⃣ Learning & Development (`training-service`)
Penyusunan jadwal program kelas pelatihan, pendaftaran mandiri oleh karyawan, serta pelaporan sertifikat kelulusan.
- **APIs**:
  - `POST /api/v1/training` (Membuat program pelatihan baru)
  - `GET /api/v1/training` (Daftar program pelatihan aktif)
  - `PUT /api/v1/training/{id}/process` (Edit status: ONGOING/COMPLETED)
  - `POST /api/v1/training/{id}/enroll` (Pendaftaran mandiri peserta)
  - `PUT /api/v1/training/{id}/enrollments/{enrollmentId}` (Unggah sertifikat & feedback kelulusan)

---

## 🚦 3. Panduan Menjalankan Semua Servis (Lokal)
Pastikan Anda membuat database PostgreSQL lokal untuk tiap servis terlebih dahulu:
```sql
CREATE DATABASE hrms_auth;
CREATE DATABASE hrms_employee;
CREATE DATABASE hrms_attendance;
CREATE DATABASE hrms_leave;
CREATE DATABASE hrms_payroll;
CREATE DATABASE hrms_claim;
CREATE DATABASE hrms_loan;
CREATE DATABASE hrms_performance;
CREATE DATABASE hrms_recruitment;
CREATE DATABASE hrms_asset;
CREATE DATABASE hrms_notification;
CREATE DATABASE hrms_offboarding;
CREATE DATABASE hrms_travel;
CREATE DATABASE hrms_training;
```

Setelah database siap, Anda dapat menjalankan masing-masing service Spring Boot dari IDE pilihan Anda atau menggunakan Maven CLI:
```bash
mvn spring-boot:run -pl api-gateway
mvn spring-boot:run -pl auth-service
# ... dan seterusnya untuk setiap folder service
```
Lalu jalankan frontend React (Vite):
```bash
cd frontend
npm run dev
```
Buka peramban di alamat `http://localhost:5173`.
