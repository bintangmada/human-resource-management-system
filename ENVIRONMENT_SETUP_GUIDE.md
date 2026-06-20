# ⚙️ Panduan Konfigurasi Environment Variables (Multi-OS)

Dokumen ini menjelaskan cara mengatur variabel lingkungan (*Environment Variables*) di Linux, macOS, dan Windows agar dapat dibaca oleh konfigurasi Spring Boot (`application.yml`) menggunakan prefix proyek `HRMS_`.

---

## 🔍 1. Bagaimana Spring Boot Membaca Environment Variables?

Di dalam file `application.yml`, Spring Boot menggunakan sintaks placeholder khusus:
```yaml
url: jdbc:postgresql://${HRMS_DB_HOST:localhost}:${HRMS_DB_PORT:5434}/${HRMS_DB_NAME:hrms_main}
username: ${HRMS_DB_USERNAME:postgres}
password: ${HRMS_DB_PASSWORD:postgres}
```
**Cara Kerjanya:**
1. Spring Boot mencari variabel lingkungan sistem bernama `HRMS_DB_HOST`, `HRMS_DB_PORT`, dsb.
2. Jika variabel tersebut **ditemukan**, nilainya akan digunakan langsung.
3. Jika variabel tersebut **tidak ditemukan**, Spring Boot akan menggunakan nilai default setelah tanda titik dua (`:`), misalnya `localhost` untuk host, dan `5434` untuk port.

---

## 🐧 2. Konfigurasi di Linux & macOS (Bash / Zsh)

### A. Bersifat Sementara (Hanya aktif pada tab terminal saat ini)
Jalankan di terminal sebelum menjalankan perintah Maven:
```bash
export HRMS_DB_HOST=localhost
export HRMS_DB_PORT=5434
export HRMS_DB_NAME=hrms_main
export HRMS_DB_USERNAME=postgres
export HRMS_DB_PASSWORD=your_secure_password

export HRMS_REDIS_HOST=localhost
export HRMS_REDIS_PORT=6379
export HRMS_REDIS_PASSWORD=your_redis_password

export HRMS_KAFKA_SERVERS=localhost:9092
```

### B. Bersifat Permanen (Berlaku untuk semua terminal baru)
1. Buka file `.bashrc` (untuk shell Bash) atau `.zshrc` (untuk shell Zsh) di folder home Anda menggunakan text editor (misal: `nano ~/.bashrc`).
2. Tempelkan template berikut di bagian paling bawah file:
   ```bash
   # HRMS Project Environment Variables
   export HRMS_DB_HOST=localhost
   export HRMS_DB_PORT=5434
   export HRMS_DB_NAME=hrms_main
   export HRMS_DB_USERNAME=postgres
   export HRMS_DB_PASSWORD=<ISI_PASSWORD_DATABASE_ANDA>

   export HRMS_REDIS_HOST=localhost
   export HRMS_REDIS_PORT=6379
   export HRMS_REDIS_PASSWORD=<ISI_PASSWORD_REDIS_ANDA>

   export HRMS_KAFKA_SERVERS=localhost:9092
   ```
3. Simpan berkas, lalu aktifkan perubahan dengan mengetik perintah berikut di terminal:
   ```bash
   source ~/.bashrc  # jika menggunakan Bash
   # atau
   source ~/.zshrc   # jika menggunakan Zsh
   ```

---

## 🪟 3. Konfigurasi di Windows

### A. Melalui PowerShell (Sementara)
```powershell
$env:HRMS_DB_HOST="localhost"
$env:HRMS_DB_PORT="5434"
$env:HRMS_DB_NAME="hrms_main"
$env:HRMS_DB_USERNAME="postgres"
$env:HRMS_DB_PASSWORD="your_secure_password"

$env:HRMS_REDIS_HOST="localhost"
$env:HRMS_REDIS_PORT="6379"
$env:HRMS_REDIS_PASSWORD="your_redis_password"

$env:HRMS_KAFKA_SERVERS="localhost:9092"
```

### B. Melalui Command Prompt / CMD (Sementara)
```cmd
set HRMS_DB_HOST=localhost
set HRMS_DB_PORT=5434
set HRMS_DB_NAME=hrms_main
set HRMS_DB_USERNAME=postgres
set HRMS_DB_PASSWORD=your_secure_password

set HRMS_REDIS_HOST=localhost
set HRMS_REDIS_PORT=6379
set HRMS_REDIS_PASSWORD=your_redis_password

set HRMS_KAFKA_SERVERS=localhost:9092
```

### C. Bersifat Permanen (Windows System Properties GUI)
1. Tekan tombol `Windows + S`, ketik **"environment variables"**, lalu pilih **"Edit the system environment variables"**.
2. Klik tombol **"Environment Variables..."** di bagian bawah.
3. Pada panel **"User variables for [User Anda]"** (untuk user saat ini) atau **"System variables"** (untuk semua user), klik **"New..."**.
4. Buat variabel satu per satu dengan nama dan nilai seperti di bawah:
   * **Variable name**: `HRMS_DB_HOST` | **Variable value**: `localhost`
   * **Variable name**: `HRMS_DB_PORT` | **Variable value**: `5434`
   * **Variable name**: `HRMS_DB_NAME` | **Variable value**: `hrms_main`
   * **Variable name**: `HRMS_DB_USERNAME` | **Variable value**: `postgres`
   * **Variable name**: `HRMS_DB_PASSWORD` | **Variable value**: `<password_postgres_anda>`
   * **Variable name**: `HRMS_REDIS_HOST` | **Variable value**: `localhost`
   * **Variable name**: `HRMS_REDIS_PORT` | **Variable value**: `6379`
   * **Variable name**: `HRMS_REDIS_PASSWORD` | **Variable value**: `<password_redis_anda>`
   * **Variable name**: `HRMS_KAFKA_SERVERS` | **Variable value**: `localhost:9092`
5. Klik **OK** pada semua jendela untuk menyimpan.
6. *Catatan*: Restart terminal/IDE Anda agar Windows membaca variabel baru tersebut.

---

## 💻 4. Konfigurasi Langsung di IDE (Sangat Direkomendasikan)

Dibandingkan mengotori variabel sistem komputer Anda secara global, Anda bisa mengatur variabel lingkungan khusus untuk proyek ini langsung di dalam IDE Anda:

### A. IntelliJ IDEA
1. Buka menu drop-down konfigurasi jalannya aplikasi di pojok kanan atas, klik **"Edit Configurations..."**.
2. Pilih konfigurasi jalannya class `EmployeeServiceApplication`.
3. Cari kolom **"Environment variables"**.
4. Klik ikon folder kecil di sebelah kanan kolom tersebut untuk membuka entri baris.
5. Tambahkan nama dan nilai variabel (misal: `HRMS_DB_PASSWORD=<password_anda>`), pisahkan tiap variabel menggunakan tanda titik koma (`;`).
6. Klik **Apply** dan **OK**.

### B. VS Code (Melalui `.vscode/launch.json`)
Tambahkan blok `env` ke dalam konfigurasi debug Anda:
```json
{
  "configurations": [
    {
      "type": "java",
      "name": "Spring Boot Application",
      "request": "launch",
      "mainClass": "com.hrms.enterprise.employee.EmployeeServiceApplication",
      "env": {
        "HRMS_DB_HOST": "localhost",
        "HRMS_DB_PORT": "5434",
        "HRMS_DB_NAME": "hrms_main",
        "HRMS_DB_USERNAME": "postgres",
        "HRMS_DB_PASSWORD": "your_secure_password",
        "HRMS_REDIS_HOST": "localhost",
        "HRMS_REDIS_PORT": "6379",
        "HRMS_REDIS_PASSWORD": "your_redis_password",
        "HRMS_KAFKA_SERVERS": "localhost:9092"
      }
    }
  ]
}
```
