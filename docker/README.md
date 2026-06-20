# 🐳 Docker Infrastructure & Disaster Recovery Guide

Dokumen ini berisi panduan lengkap pengelolaan kontainer Docker, arsitektur volume data, serta prosedur **mitigasi & pemulihan bencana (disaster recovery)** jika terjadi kehilangan data pada ekosistem microservice HRMS.

---

## 🏗️ 1. Arsitektur Kontainer & Port Mapping

Layanan infrastruktur berjalan menggunakan Docker Compose dengan pemetaan port berikut untuk menghindari konflik dengan aplikasi lokal di mesin host:

| Nama Kontainer | Layanan / Peran | Port Kontainer | Port Host | Status Persistensi |
| :--- | :--- | :---: | :---: | :---: |
| **`hrms-postgres`** | Database Transaksional Utama | `5432` | `5434` | **Persisten** (`postgres_data`) |
| **`hrms-timescaledb`**| DB Time-series (Absensi) | `5432` | `5433` | **Persisten** (`timescaledb_data`) |
| **`hrms-redis`** | Caching & Session Manager | `6379` | `6379` | **Persisten** (`redis_data`) |
| **`hrms-kafka`** | Message Broker (KRaft Mode) | `9092` | `9092` | Sementara *(Ephemeral)* |

> [!NOTE]
> **Mengapa Port PostgreSQL di Host adalah 5434?**
> Port default PostgreSQL (`5432`) dialihkan ke `5434` pada mesin host karena port `5432` lokal mesin host Anda sudah digunakan oleh instance PostgreSQL native bawaan OS.

---

## 💾 2. Arsitektur Penyimpanan & Volume

Docker menggunakan **Named Volumes** yang dikelola oleh Docker Engine untuk memastikan data tidak hilang saat kontainer dimatikan atau diperbarui.

```mermaid
graph TD
    subgraph Host OS (Linux)
        V1["/var/lib/docker/volumes/docker_postgres_data/_data"]
        V2["/var/lib/docker/volumes/docker_redis_data/_data"]
    end
    subgraph Docker Container
        C1["hrms-postgres:5432"] -->|Mounts to /var/lib/postgresql/data| V1
        C2["hrms-redis:6379"] -->|Mounts to /data| V2
    end
```

---

## 🚨 3. Rencana Mitigasi Kehilangan Data (Disaster Recovery Plan)

Bagian ini menjelaskan skenario kegagalan data dan langkah mitigasi/pemulihannya.

### Skenario A: Kontainer Terhapus Secara Tidak Sengaja
*   **Penyebab**: Perintah `docker rm -f hrms-postgres` atau `docker compose down`.
*   **Dampak**: Kontainer hilang, namun **data tetap aman** karena tersimpan di Named Volume host.
*   **Langkah Pemulihan**:
    Cukup jalankan ulang docker compose. Docker otomatis mendeteksi volume lama dan menempelkannya kembali ke kontainer baru:
    ```bash
    docker compose up -d postgres redis kafka
    ```

### Skenario B: Perintah `docker compose down -v` Dijalankan (Volume Terhapus)
*   **Penyebab**: Menjalankan perintah pembersihan dengan flag `-v` (volume) yang secara eksplisit menghapus seluruh volume penyimpanan tersemat.
*   **Dampak**: Seluruh data transaksi database dan cache hilang permanen dari disk host.
*   **Langkah Mitigasi**:
    1. **Hindari** penggunaan flag `-v` di lingkungan produksi/development penting kecuali Anda sengaja ingin melakukan *hard-reset*.
    2. **Lakukan Backup Rutin** ke file `.sql` di luar direktori Docker (lihat bab 4).

### Skenario C: Kerusakan Disk Host (Hardware Failure)
*   **Penyebab**: Disk komputer host rusak, terformat, atau terkena malware.
*   **Dampak**: Seluruh data volume Docker di `/var/lib/docker/` hilang total.
*   **Langkah Mitigasi**:
    1. Simpan salinan file backup `.sql` secara otomatis ke cloud storage atau server backup terpisah menggunakan Cron Job mingguan/harian.
    2. Jika terjadi kerusakan, instal ulang Docker, jalankan kontainer baru, lalu lakukan prosedur **Restore** dari file backup terakhir.

---

## 🛠️ 4. Panduan Operasional (Cheat Sheet)

### A. Backup & Restore PostgreSQL (Database Transaksional)

**Melakukan Backup:**
Jalankan perintah ini untuk mengekspor seluruh skema dan data tabel dari kontainer ke berkas `.sql` di komputer host Anda:
```bash
# Backup PostgreSQL Utama
docker exec -t hrms-postgres pg_dump -U postgres -d hrms_main > backup_hrms_main.sql

# Backup TimescaleDB (Jika sudah digunakan)
docker exec -t hrms-timescaledb pg_dump -U postgres -d hrms_timeseries > backup_hrms_timeseries.sql
```

**Melakukan Restore (Pemulihan):**
Jika database kosong atau baru saja terhapus, gunakan berkas cadangan `.sql` untuk memulihkan keadaan data:
```bash
# Restore PostgreSQL Utama
cat backup_hrms_main.sql | docker exec -i hrms-postgres psql -U postgres -d hrms_main
```

---

### B. Backup & Restore Redis (Cache & Session)

Redis menyimpan data memory secara periodik ke file snapshot `/data/dump.rdb`.

**Melakukan Backup:**
```bash
# 1. Paksa Redis menulis data memory terbaru ke file dump di disk
docker exec -t hrms-redis redis-cli SAVE

# 2. Salin file dump.rdb dari dalam kontainer ke komputer host Anda
docker cp hrms-redis:/data/dump.rdb ./backup_redis_dump.rdb
```

**Melakukan Restore (Pemulihan):**
```bash
# 1. Hentikan kontainer Redis terlebih dahulu
docker stop hrms-redis

# 2. Salin file cadangan dump.rdb kembali ke dalam kontainer
docker cp ./backup_redis_dump.rdb hrms-redis:/data/dump.rdb

# 3. Jalankan kembali kontainer Redis
docker start hrms-redis
```

---

### C. Backup & Restore Kafka (Event Broker)

Saat ini Kafka menyimpan data topik dan offset di direktori internal `/tmp/kraft-combined-logs`.

**Melakukan Backup:**
```bash
# Salin seluruh direktori log/pesan Kafka dari kontainer ke komputer host Anda
docker cp hrms-kafka:/tmp/kraft-combined-logs ./backup_kafka_logs
```

**Melakukan Restore (Pemulihan):**
```bash
# 1. Hentikan kontainer Kafka terlebih dahulu
docker stop hrms-kafka

# 2. Salin direktori cadangan kembali ke dalam direktori kontainer
docker cp ./backup_kafka_logs/. hrms-kafka:/tmp/kraft-combined-logs/

# 3. Jalankan kembali kontainer Kafka
docker start hrms-kafka
```

---

### D. Utilitas Manajemen Volume Docker
Gunakan perintah-perintah ini untuk memantau status penyimpanan Docker:

```bash
# Menampilkan semua volume yang terdaftar di Docker
docker volume ls

# Melihat informasi detail direktori fisik penyimpanan volume tertentu
docker volume inspect docker_postgres_data

# Menghapus volume yang tidak digunakan (hati-hati)
docker volume prune
```
