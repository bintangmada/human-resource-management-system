# Spesifikasi Demo Publik & Akun Penguji (Public Demo & Sandbox Specifications)
> Dokumen ini menjelaskan rancangan akses pengujian publik (*sandbox*), daftar kredensial akun uji coba, ruang lingkup data dummy (*seed data*), serta sistem pembersihan database otomatis (*daily database reset*).

---

## 1. Konsep Dasbor Login Demo (Fast guest Login)

Untuk memberikan pengalaman pengguna (*User Experience*) terbaik bagi perekrut kerja atau peninjau teknis, halaman login aplikasi web akan dilengkapi dengan panel **"Quick Demo Login"** yang memungkinkan pengujian peran secara instan tanpa perlu registrasi manual.

### Tampilan Rancangan Antarmuka Login:
```
+---------------------------------------------------------------------------------+
|                                                                                 |
|                             ENTERPRISE HRIS SYSTEM                              |
|                               [ Sign In Portal ]                                |
|                                                                                 |
|   Email:    [__________________________________________]                        |
|   Password: [__________________________________________]                        |
|                                 [ LOGIN ]                                       |
|                                                                                 |
|   ----------------------------- ATAU ----------------------------------------   |
|   Coba Cepat sebagai Akun Demo (1-Klik):                                        |
|                                                                                 |
|   [ Login Super Admin ]      -> admin@demo-hris.com / AdminSecure123!           |
|   [ Login HR Admin ]         -> hrd@demo-hris.com / HrdSecure123!               |
|   [ Login Manager ]          -> manager@demo-hris.com / ManagerSecure123!       |
|   [ Login Karyawan (ESS) ]   -> employee@demo-hris.com / EmployeeSecure123!     |
|                                                                                 |
+---------------------------------------------------------------------------------+
```

---

## 2. Daftar Akun Uji Coba & Kredensial (Demo Credentials)

Berikut adalah daftar kredensial akun yang sudah disediakan (*pre-seeded*) di dalam sistem beserta fokus fitur yang dapat diuji oleh masing-masing akun:

| No | Peran (Role) | Akun Email Demo | Sandi (Password) | Fitur Utama untuk Diuji |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Super Admin** | `admin@demo-hris.com` | `AdminSecure123!` | • Mengubah konfigurasi global toleransi keterlambatan<br>• Melihat log audit aktivitas pengguna (`audit_logs`) |
| **2** | **HR Admin** | `hrd@demo-hris.com` | `HrdSecure123!` | • Menambah/mengubah data karyawan (`employees`) baru<br>• Membuat struktur shift kerja & jadwal dinamis<br>• Memproses payroll & PPh 21 bulanan |
| **3** | **Manager / Approver**| `manager@demo-hris.com`| `ManagerSecure123!`| • Menyetujui/menolak pengajuan cuti, klaim, & pinjaman<br>• Memberikan penilaian kinerja tahunan & OKR tim |
| **4** | **Employee (ESS)** | `employee@demo-hris.com`| `EmployeeSecure123!`| • Mencoba simulasi Clock-In/Out absensi (Geofencing)<br>• Mengajukan cuti, reimburse klaim, & pinjaman dana<br>• Mengunduh slip gaji bulanan digital |

---

## 3. Ruang Lingkup Data Dummy (Mock Seed Data Scope)

Agar aplikasi demo tidak terlihat kosong dan terasa "hidup" saat pertama kali diakses, sistem database akan diisi secara otomatis (*seeding*) dengan data-data berikut:

1.  **Struktur Organisasi**: 1 Perusahaan Utama, 3 Departemen (IT, HR, Operations), dan 5 Posisi Pekerjaan (Manager, Software Engineer, Senior Recruiter, dll).
2.  **Karyawan Aktif**: Minimal 10 record data karyawan dummy dengan variasi masa kerja, riwayat gaji pokok, dan informasi rekening bank terdaftar.
3.  **Kalender Shift**: 3 Master Shift (Pagi, Siang, Libur) beserta kalender jadwal kerja teralokasi selama sebulan berjalan.
4.  **Log Riwayat Absensi**: Data riwayat absensi dummy selama 14 hari terakhir untuk menampilkan grafik kehadiran secara visual di dashboard.
5.  **Saldo Cuti & Klaim**: Saldo cuti tahunan terisi (contoh: sisa 12 hari) dan saldo plafon klaim kesehatan terisi (contoh: Rp 5.000.000) untuk masing-masing karyawan demo.

---

## 4. Kebijakan Reset Database Otomatis Harian (Daily Database Reset Policy)

Untuk mencegah penumpukan data sampah atau modifikasi yang merusak demo publik, sistem akan melakukan reset database secara menyeluruh ke kondisi semula setiap hari pada pukul **00:00 UTC / 07:00 WIB**.

### Implementasi Teknis Reset via Spring Boot Scheduler:
Di dalam modul `employee-service`, kita akan mengimplementasikan sebuah task terjadwal menggunakan anotasi `@Scheduled` di Java:

```java
package com.bintang.service.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@Component
public class DatabaseResetScheduler {
    
    private static final Logger log = LoggerFactory.getLogger(DatabaseResetScheduler.class);
    
    @Autowired
    private DataSource dataSource;

    // Berjalan setiap hari pukul 00:00 UTC
    @Scheduled(cron = "0 0 0 * * ?", zone = "UTC")
    @Transactional
    public void executeDailyDatabaseReset() {
        log.info("Memulai proses pembersihan & reset database demo...");
        try (Connection conn = dataSource.getConnection(); 
             Statement stmt = conn.createStatement()) {
            
            // 1. Matikan pengecekan Foreign Key untuk mempermudah pembersihan
            stmt.execute("SET CONSTRAINTS ALL DEFERRED;");
            
            // 2. Jalankan script SQL Truncate ke semua tabel transaksi
            stmt.execute("TRUNCATE TABLE audit_logs, attendances, payroll_details, payrolls, " +
                         "leave_requests, claim_requests, loan_installments, loan_requests CASCADE;");
            
            // 3. Panggil ulang SQL DDL Data Seeder untuk mengisi ulang data dummy dasar
            stmt.execute("SELECT reload_demo_seed_data();");
            
            log.info("Reset database demo sukses diselesaikan.");
        } catch (Exception e) {
            log.error("Gagal melakukan reset database demo: ", e);
        }
    }
}
```

---

## 5. Keuntungan Pendekatan Demo Ini
1.  **Meningkatkan Konversi Reviewer**: Perekrut kerja tidak memiliki waktu untuk melakukan registrasi email, aktivasi, dan pengisian profil. Tombol 1-klik akan langsung membawa mereka ke fitur inti.
2.  **Sistem Selalu Bersih**: Menghindari data sampah dan menjaga performa kueri database di VPS tetap optimal.
3.  **Portofolio Tepercaya**: Menunjukkan bahwa Anda memikirkan aspek *Product Management* dan *User Experience* di samping keahlian pengodean backend Anda.
