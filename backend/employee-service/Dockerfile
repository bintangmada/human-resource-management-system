# ==========================================
# STAGE 1: Tahap Build (Kompilasi & Pengemasan)
# ==========================================
# Menggunakan base image Maven dengan JDK 17 di atas Alpine OS yang super ringan.
# Diberi nama alias 'build' agar file hasil kompilasi bisa diambil di stage berikutnya.
FROM maven:3.8.8-eclipse-temurin-17-alpine AS build

# Menetapkan direktori kerja aktif di dalam kontainer.
# Semua perintah COPY dan RUN setelah ini akan dijalankan di dalam direktori '/app'.
WORKDIR /app

# Menyalin file konfigurasi maven parent pom.xml dan seluruh sub-modul employee-service.
# Struktur monorepo ini membutuhkan parent pom.xml agar relasi path dependensi valid.
COPY backend/pom.xml backend/pom.xml
COPY backend/employee-service backend/employee-service

# Mengompilasi kode program dan membungkusnya menjadi file executable .jar.
# -f menentukan file POM spesifik yang akan dipaketkan.
# -DskipTests digunakan untuk melewati fase pengujian unit agar waktu build lebih cepat.
RUN mvn -f backend/employee-service/pom.xml clean package -DskipTests

# ==========================================
# STAGE 2: Tahap Runtime (Menjalankan Aplikasi)
# ==========================================
# Menggunakan JRE 17 (Java Runtime Environment) yang tidak memiliki kompiler Java.
# Ini membuat ukuran image akhir menjadi jauh lebih kecil, hemat memori, dan lebih aman.
FROM eclipse-temurin:17-jre-alpine

# Menetapkan direktori kerja aktif untuk proses runtime.
WORKDIR /app

# Menyalin file JAR hasil kompilasi dari Stage 1 (build) ke direktori kerja saat ini.
# File diganti namanya menjadi 'app.jar' agar lebih mudah diakses.
COPY --from=build /app/backend/employee-service/target/employee-service-1.0.0-SNAPSHOT.jar app.jar

# Mendokumentasikan port yang digunakan oleh aplikasi (port 8020 sesuai application.yml).
EXPOSE 8020

# Menentukan instruksi utama yang dijalankan saat kontainer dihidupkan.
ENTRYPOINT ["java", "-jar", "app.jar"]
