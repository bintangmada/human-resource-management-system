# ⚙️ Panduan Konfigurasi Environment Variables (Multi-OS)

Dokumen ini menjelaskan cara mengatur variabel lingkungan (*Environment Variables*) di Linux, macOS, dan Windows agar dapat dibaca oleh konfigurasi Spring Boot (`application.yml`).

---

## 🔍 1. Bagaimana Spring Boot Membaca Environment Variables?

Di dalam file `application.yml`, Spring Boot menggunakan sintaks placeholder khusus:
```yaml
url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5434}/${DB_NAME:hrms_main}
username: ${DB_USERNAME:postgres}
password: ${DB_PASSWORD:postgres}
```
**Cara Kerjanya:**
1. Spring Boot mencari variabel lingkungan sistem bernama `DB_HOST`, `DB_PORT`, dsb.
2. Jika variabel tersebut **ditemukan**, nilainya akan digunakan langsung.
3. Jika variabel tersebut **tidak ditemukan**, Spring Boot akan menggunakan nilai default setelah tanda titik dua (`:`), misalnya `localhost` untuk host, dan `5434` untuk port.

---

## 🐧 2. Konfigurasi di Linux & macOS (Bash / Zsh)

### A. Bersifat Sementara (Hanya aktif pada tab terminal saat ini)
Jalankan di terminal sebelum menjalankan perintah Maven:
```bash
export DB_HOST=localhost
export DB_PORT=5434
export DB_NAME=hrms_main
export DB_USERNAME=postgres
export DB_PASSWORD=your_secure_password

export REDIS_HOST=localhost
export REDIS_PORT=6379
export REDIS_PASSWORD=your_redis_password

export KAFKA_SERVERS=localhost:9092
```

### B. Bersifat Permanen (Berlaku untuk semua terminal baru)
1. Buka file `.bashrc` (untuk shell Bash) atau `.zshrc` (untuk shell Zsh) di folder home Anda menggunakan text editor (misal: `nano ~/.bashrc`).
2. Tempelkan template berikut di bagian paling bawah file:
   ```bash
   # HRMS Project Environment Variables
   export DB_HOST=localhost
   export DB_PORT=5434
   export DB_NAME=hrms_main
   export DB_USERNAME=postgres
   export DB_PASSWORD=<ISI_PASSWORD_DATABASE_ANDA>

   export REDIS_HOST=localhost
   export REDIS_PORT=6379
   export REDIS_PASSWORD=<ISI_PASSWORD_REDIS_ANDA>

   export KAFKA_SERVERS=localhost:9092
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
$env:DB_HOST="localhost"
$env:DB_PORT="5434"
$env:DB_NAME="hrms_main"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_secure_password"

$env:REDIS_HOST="localhost"
$env:REDIS_PORT="6379"
$env:REDIS_PASSWORD="your_redis_password"

$env:KAFKA_SERVERS="localhost:9092"
```

### B. Melalui Command Prompt / CMD (Sementara)
```cmd
set DB_HOST=localhost
set DB_PORT=5434
set DB_NAME=hrms_main
set DB_USERNAME=postgres
set DB_PASSWORD=your_secure_password

set REDIS_HOST=localhost
set REDIS_PORT=6379
set REDIS_PASSWORD=your_redis_password

set KAFKA_SERVERS=localhost:9092
```

### C. Bersifat Permanen (Windows System Properties GUI)
1. Tekan tombol `Windows + S`, ketik **"environment variables"**, lalu pilih **"Edit the system environment variables"**.
2. Klik tombol **"Environment Variables..."** di bagian bawah.
3. Pada panel **"User variables for [User Anda]"** (untuk user saat ini) atau **"System variables"** (untuk semua user), klik **"New..."**.
4. Buat variabel satu per satu dengan nama dan nilai seperti di bawah:
   * **Variable name**: `DB_HOST` | **Variable value**: `localhost`
   * **Variable name**: `DB_PORT` | **Variable value**: `5434`
   * **Variable name**: `DB_NAME` | **Variable value**: `hrms_main`
   * **Variable name**: `DB_USERNAME` | **Variable value**: `postgres`
   * **Variable name**: `DB_PASSWORD` | **Variable value**: `<password_postgres_anda>`
   * **Variable name**: `REDIS_HOST` | **Variable value**: `localhost`
   * **Variable name**: `REDIS_PORT` | **Variable value**: `6379`
   * **Variable name**: `REDIS_PASSWORD` | **Variable value**: `<password_redis_anda>`
   * **Variable name**: `KAFKA_SERVERS` | **Variable value**: `localhost:9092`
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
5. Tambahkan nama dan nilai variabel (misal: `DB_PASSWORD=<password_anda>`), pisahkan tiap variabel menggunakan tanda titik koma (`;`).
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
        "DB_HOST": "localhost",
        "DB_PORT": "5434",
        "DB_NAME": "hrms_main",
        "DB_USERNAME": "postgres",
        "DB_PASSWORD": "your_secure_password",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": "6379",
        "REDIS_PASSWORD": "your_redis_password",
        "KAFKA_SERVERS": "localhost:9092"
      }
    }
  ]
}
```
