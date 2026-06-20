# 📝 HRMS Operations Cheat Sheet

Dokumen ini berisi kumpulan perintah penting untuk **Docker**, **PostgreSQL (SQL)**, **Redis**, **Apache Kafka**, dan **Spring Boot** yang digunakan dalam pengembangan HRMS. Setiap perintah dilengkapi dengan komentar penjelas fungsinya.

---

## 🐳 1. Docker Compose (Manajemen Infrastruktur)

Jalankan perintah ini di dalam direktori tempat berkas `docker-compose.yml` berada:

```bash
# Menyalakan semua kontainer di latar belakang (detched mode)
docker compose up -d

# Menyalakan kontainer tertentu saja (misal: postgres dan redis)
docker compose up -d postgres redis

# Mematikan semua kontainer tanpa menghapus data volume
docker compose down

# Mematikan semua kontainer SEKALIGUS menghapus seluruh data volume (Hati-hati! Data akan hilang)
docker compose down -v

# Melihat daftar kontainer yang sedang berjalan beserta port-nya
docker ps

# Melihat log dari semua kontainer secara real-time (tambahkan Ctrl+C untuk keluar)
docker compose logs -f

# Melihat log kontainer tertentu secara real-time (contoh: postgres)
docker compose logs -f postgres

# Memaksa pembuatan ulang kontainer tertentu setelah mengubah konfigurasi yml (contoh: redis)
docker compose up -d --force-recreate redis
```

---

## 🐘 2. PostgreSQL (SQL Queries & Command Line)

### A. Masuk ke Command Line PostgreSQL (`psql`)
```bash
# Masuk ke terminal PostgreSQL di dalam kontainer hrms-postgres
docker exec -it hrms-postgres psql -U postgres -d hrms_main
```

### B. Perintah Navigasi psql (Ketik setelah masuk ke Prompt psql)
```sql
-- Menampilkan semua tabel yang ada di database saat ini
\dt

-- Menampilkan struktur kolom dari tabel tertentu (contoh: tabel employees)
\d employees

-- Keluar dari terminal psql
\q
```

### C. Query SQL yang Sering Digunakan
```sql
-- Menampilkan semua karyawan untuk Tenant ID = 1
SELECT * FROM employees WHERE tenant_id = 1 AND deleted_status = 0;

-- Menghitung jumlah karyawan berdasarkan departemen
SELECT department_id, COUNT(*) FROM employees GROUP BY department_id;

-- Melihat daftar departemen yang terdaftar
SELECT * FROM departments;

-- Melihat daftar jabatan (jobs) yang aktif
SELECT * FROM jobs WHERE status = 1;
```

---

## 🔴 3. Redis (Caching & Session CLI)

### A. Masuk ke Command Line Redis (`redis-cli`)
```bash
# Masuk ke CLI Redis di kontainer menggunakan password default
docker exec -it hrms-redis redis-cli -a hrms_redis_secret
```

### B. Perintah Interaktif Redis (Ketik setelah masuk ke Prompt Redis)
```bash
# Mengecek status koneksi (jika sukses akan membalas PONG)
ping

# Melihat daftar seluruh Key yang tersimpan di memori Redis
keys *

# Mengambil nilai dari suatu key tertentu (contoh key: user_session:1)
get user_session:1

# Menyimpan data key-value baru secara manual (berlaku selamanya)
set my_key "hello_world"

# Menyimpan data key-value baru dengan masa kedaluwarsa (TTL) 60 detik
setex temp_key 60 "expires_in_one_minute"

# Mengetahui sisa waktu kedaluwarsa suatu key dalam satuan detik (TTL)
ttl temp_key

# Menghapus suatu key tertentu
del my_key

# Menghapus seluruh data yang tersimpan di dalam Redis (Gunakan hanya untuk testing!)
flushall
```

---

## kafka 4. Apache Kafka (Event Broker CLI)

Jalankan perintah utilitas Kafka ini langsung melalui kontainer `hrms-kafka`:

### A. Mengelola Topik (Topics)
```bash
# Menampilkan semua daftar topik yang ada di Kafka
docker exec -it hrms-kafka kafka-topics --bootstrap-server localhost:9092 --list

# Membuat topik baru secara manual bernama 'employee-created'
docker exec -it hrms-kafka kafka-topics --bootstrap-server localhost:9092 --create --topic employee-created --partitions 1 --replication-factor 1

# Melihat detail konfigurasi suatu topik tertentu
docker exec -it hrms-kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic employee-created

# Menghapus topik tertentu
docker exec -it hrms-kafka kafka-topics --bootstrap-server localhost:9092 --delete --topic employee-created
```

### B. Mengirim & Membaca Pesan (Produce & Consume)
```bash
# Membaca/mendengarkan pesan masuk pada topik tertentu dari awal (from-beginning)
docker exec -it hrms-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic employee-created --from-beginning

# Mengirim pesan manual ke suatu topik (tekan Enter setelah mengetik pesan, Ctrl+C untuk keluar)
docker exec -it hrms-kafka kafka-console-producer --bootstrap-server localhost:9092 --topic employee-created
```

---

## ☕ 5. Spring Boot & Maven (Backend Development)

Jalankan perintah ini di direktori root backend (`/human-resource-management-system`):

```bash
# Mengompilasi kode program tanpa menjalankannya
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
mvn -f backend/employee-service/pom.xml clean compile

# Menjalankan aplikasi Spring Boot secara langsung
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
mvn -f backend/employee-service/pom.xml spring-boot:run

# Membuat file build (.jar) dengan melewati proses unit test untuk mempercepat
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
mvn -f backend/employee-service/pom.xml clean package -DskipTests
```

---

## 📖 6. Cara Menguji API Secara Langsung (Swagger UI)

Setelah aplikasi Spring Boot berhasil dijalankan:

1.  **Buka Halaman Uji Coba API (Swagger UI)**:
    Klik link berikut di browser Anda untuk membuka antarmuka interaktif:
    👉 **[http://localhost:8020/swagger-ui.html](http://localhost:8020/swagger-ui.html)**

2.  **Cara Mencoba Endpoint**:
    *   Pilih salah satu endpoint API (misalnya: `GET /api/v1/employees`).
    *   Klik tombol **"Try it out"** di sebelah kanan.
    *   **Penting**: Isi kolom parameter **`X-Tenant-ID`** dengan angka `1` atau `2` (ini adalah ID perusahaan sampel Anda).
    *   Klik tombol biru **"Execute"**.
    *   Hasil respons database akan langsung muncul di bagian bawah.

*(Catatan: Anda wajib mengisi `X-Tenant-ID` agar sistem tahu database perusahaan mana yang ingin Anda akses).*
