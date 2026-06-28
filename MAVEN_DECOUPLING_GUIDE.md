# ⚙️ Panduan Desentralisasi & Pemisahan Modul Maven HRMS (Decoupling Monorepo to Polyrepo)

Dokumen ini menjelaskan langkah-langkah, implikasi, dan perubahan konfigurasi yang diperlukan jika Anda ingin memisahkan modul-modul mikroservis HRMS dari satu Maven Parent Project (Monorepo) menjadi proyek-proyek independen yang berdiri sendiri (Polyrepo / repositori terpisah).

---

## 🗺️ 1. Perbandingan Arsitektur

### Kondisi Sekarang (Maven Multi-Module / Monorepo)
Semua modul bersandar pada satu berkas parent `pom.xml` yang mengelola siklus hidup kompilasi secara bersamaan.
- **Root Directory**: Mengandung berkas `pom.xml` induk dengan tag `<modules>`.
- **Sub-Modul**: `api-gateway`, `auth-service`, `employee-service`, `attendance-service`, `leave-service`, `payroll-service`, `claim-service`, `loan-service`.

### Kondisi Target (Independent Projects / Polyrepo)
Setiap mikroservis dikelola secara independen tanpa keterikatan relasi direktori parent-child.
- **Git Repository**: Tiap modul memiliki repositori Git sendiri (misal: `hrms-employee-service`, `hrms-payroll-service`).
- **Build Scope**: Proses *test*, *compile*, dan *package* dilakukan secara terisolasi tanpa mempengaruhi modul lainnya.

---

## 🛠️ 2. Langkah-Langkah Pemisahan Modul

### Langkah 1: Hapus Tag `<modules>` di Parent POM
Buka file `backend/pom.xml` utama dan hapus deklarasi modul agar parent project tidak lagi mencari sub-folder saat proses kompilasi (`mvn compile` / `mvn package`).
```diff
-    <modules>
-        <module>api-gateway</module>
-        <module>auth-service</module>
-        <module>employee-service</module>
-        <module>attendance-service</module>
-        <module>leave-service</module>
-        <module>payroll-service</module>
-        <module>claim-service</module>
-        <module>loan-service</module>
-    </modules>
```

### Langkah 2: Ubah Parent Config di Masing-Masing Mikroservis
Pada kondisi monorepo, file `pom.xml` di tiap submodul menunjuk ke parent proyek HRMS:
```xml
<!-- Kondisi Lama -->
<parent>
    <groupId>com.hrms.enterprise</groupId>
    <artifactId>human-resource-management-system</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <relativePath>../pom.xml</relativePath> <!-- Mengacu ke parent lokal -->
</parent>
```

Untuk menjadikannya proyek independen, Anda harus mengubah parent-nya secara langsung ke **Spring Boot Starter Parent**:
```xml
<!-- Kondisi Baru (Independen) -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.4</version> <!-- Gunakan versi Spring Boot stabil Anda -->
    <relativePath/> <!-- Mencari langsung ke Maven Central Repository -->
</parent>
```

### Langkah 3: Sesuaikan GroupId, ArtifactId, dan Dependencies
Karena parent-nya sekarang langsung mengarah ke Spring Boot, Anda harus menyalin deklarasi properti (seperti versi Java, Lombok, atau Spring Cloud BOM) langsung ke dalam `pom.xml` mikroservis tersebut. 

Sebagai contoh, penyesuaian untuk `loan-service/pom.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" ...>
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/>
    </parent>

    <groupId>com.hrms.enterprise</groupId>
    <artifactId>loan-service</artifactId>
    <version>1.0.0</version>
    <name>loan-service</name>

    <properties>
        <java.version>17</java.version>
        <spring-cloud.version>2023.0.1</spring-cloud.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <!-- Dependency spesifik mikroservis diletakkan di sini -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <!-- dst... -->
    </dependencies>
</project>
```

---

## 📈 3. Kelebihan & Kekurangan Pemisahan Proyek

| Kategori | Monorepo (Kondisi Saat Ini) | Polyrepo / Independen (Kondisi Target) |
| :--- | :--- | :--- |
| **Kemudahan Build** | Sekali perintah `mvn package` di root akan mem-build semua modul. | Harus mem-build setiap modul satu per satu. |
| **Ketergantungan Kode** | Sangat mudah berbagi DTO / Utility class jika berada dalam satu repositori. | Harus mempublish kode bersama ke artifact repository (misal: Nexus/Artifactory) dalam bentuk library `.jar` terpisah. |
| **Siklus Rilis (CI/CD)** | Perubahan pada satu file berisiko men-trigger build ulang seluruh sistem. | Tim pengembang bebas melakukan deploy & rilis versi mikroservis miliknya tanpa mengganggu tim lain. |
| **Ukuran Repositori** | Repositori Git berukuran sangat besar karena menyimpan semua kode backend. | Repositori Git kecil, bersih, dan hanya berfokus pada fungsionalitas tunggal mikroservis terkait. |

---

## 🚀 4. Rekomendasi Alur Publikasi Library Bersama (Shared Code)
Jika Anda memiliki kelas Common Utility, JWT filter, atau DTO yang dipakai bersama oleh banyak mikroservis (misal `JwtAuthenticationFilter` atau `ApiResponse`), disarankan untuk membuat satu modul bernama `hrms-common`. 

Modul `hrms-common` ini dicompile ke file `.jar` dan didistribusikan melalui repositori Maven lokal / cloud (seperti *JitPack*, *GitHub Packages*, atau *AWS CodeArtifact*), sehingga mikroservis lain tinggal mengimpornya seperti dependency biasa:
```xml
<dependency>
    <groupId>com.hrms.enterprise</groupId>
    <artifactId>hrms-common</artifactId>
    <version>1.0.0</version>
</dependency>
```
