# Enterprise HRIS Architecture & Multi-Tenant Microservices

[![Java Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203.x-brightgreen?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/Frontend--Web-React.js%20(Vite)-blue?logo=react&logoColor=white)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Caching-Redis%20Cluster-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Apache Kafka](https://img.shields.io/badge/Messaging-Apache%20Kafka-231F20?logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

A cloud-native, highly scalable **Enterprise Human Resource Information System (HRIS)** blueprint designed to support **millions of active users** with strict multi-tenant logical data isolation, robust event-driven workflows, and a glassmorphic dashboard frontend.

---

## 📌 Table of Contents
1. [System Topology & Port Mapping](#-system-topology--port-mapping)
2. [Logical Isolation & Multi-Tenancy](#-logical-isolation--multi-tenancy)
3. [Monorepo Directory Structure](#-monorepo-directory-structure)
4. [Enterprise Core Modules](#-enterprise-core-modules)
5. [Getting Started (Local Development)](#-getting-started-local-development)
6. [Managing Services](#-managing-services)

---

## 🏗 System Topology & Port Mapping

This architecture implements a containerized, decoupled **Microservices Pattern** powered by **Spring Cloud Gateway** and independent PostgreSQL databases for each service to ensure strict boundaries.

| No | Microservice | Port | PostgreSQL Database | Main Endpoint (via Gateway) | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **`api-gateway`** | `8020` | *None* | `http://localhost:8020/` | Main gateway routing and JWT context propagation. |
| 2 | **`auth-service`** | `8021` | `hrms_auth` | `/api/v1/auth/**` | Keycloak/JWT authentication and tenant registration. |
| 3 | **`employee-service`**| `8022` | `hrms_employee` | `/api/v1/employees/**` | Core employee profile directory and org structure. |
| 4 | **`attendance-service`**| `8023` | `hrms_attendance`| `/api/v1/attendance/**` | Coordinate-based geofenced clock-in/out logs. |
| 5 | **`leave-service`** | `8024` | `hrms_leave` | `/api/v1/leaves/**` | Time-off requests and annual quota calculations. |
| 6 | **`payroll-service`** | `8025` | `hrms_payroll` | `/api/v1/payroll/**` | Monthly payslip generator with BPJS and tax engine. |
| 7 | **`claim-service`** | `8026` | `hrms_claim` | `/api/v1/claims/**` | Medical and transport expense reimbursement. |
| 8 | **`loan-service`** | `8027` | `hrms_loan` | `/api/v1/loans/**` | Emergency cash advances with flat amortization tables. |
| 9 | **`performance-service`**| `8028` | `hrms_performance`| `/api/v1/performance/**` | Employee KPI evaluations and rating gauges. |
| 10| **`recruitment-service`**| `8029` | `hrms_recruitment`| `/api/v1/recruitment/**` | ATS recruitment pipeline and job board. |
| 11| **`training-service`**| `8030` | `hrms_training` | `/api/v1/training/**` | Learning & Development program enrollments. |
| 12| **`asset-service`** | `8031` | `hrms_asset` | `/api/v1/assets/**` | Office inventory listing and maintenance ticket tracking. |
| 13| **`notification-service`**| `8032` | `hrms_notification`| `/api/v1/notifications/**`| Corporate announcement tickers and calendar schedules. |
| 14| **`travel-service`** | `8033` | `hrms_travel` | `/api/v1/travel/**` | Business travel requests and receipt claims. |
| 15| **`offboarding-service`**| `8034` | `hrms_offboarding` | `/api/v1/offboarding/**`| Resignation clearance workflow checklist. |

---

## 🔑 Logical Isolation & Multi-Tenancy

Every request entering the gateway is authenticated using standard **JSON Web Tokens (JWT)**.
- **Tenant Context**: The gateway forwards the validated user context to downstream microservices via the `X-Tenant-ID` header.
- **Data Safety**: A Spring-based filter wrapper intercepts incoming SQL queries and JpaRepositories to filter records against the target `tenantId`, preventing cross-company data leakage.

---

## 📂 Monorepo Directory Structure

```text
human-resource-management-system/
├── backend/                       # Java Spring Boot 3.x Microservices
│   ├── pom.xml                    # Maven parent project definition
│   ├── api-gateway/               # Spring Cloud Gateway (Port 8020)
│   ├── auth-service/              # Identity manager (Port 8021)
│   ├── employee-service/          # Core directory (Port 8022)
│   ├── attendance-service/        # Clocking & geofencing (Port 8023)
│   ├── leave-service/             # Cuti/time-off planner (Port 8024)
│   ├── payroll-service/           # Tax & payslip generator (Port 8025)
│   ├── claim-service/             # Reimbursement processor (Port 8026)
│   ├── loan-service/              # Salary advance schedules (Port 8027)
│   ├── performance-service/       # OKR & KPI evaluations (Port 8028)
│   ├── recruitment-service/       # Applicant tracker ATS (Port 8029)
│   ├── training-service/          # Learning & Development L&D (Port 8030)
│   ├── asset-service/             # Inventory tracker (Port 8031)
│   ├── notification-service/      # Calendars & bulletins (Port 8032)
│   ├── travel-service/            # Business trip expense logs (Port 8033)
│   └── offboarding-service/       # Exit clearance items (Port 8034)
├── frontend/                      # Web Dashboard built on React.js (Vite)
├── docker/                        # Compose files for postgres, timescale, redis, and kafka
├── create-all-db.sql              # Inductive database generation SQL script
└── start-all-services.sh          # Concurrent microservices bash manager
```

---

## ⚡ Getting Started (Local Development)

### Prerequisites
- Docker & Docker Compose
- Java JDK 17
- Node.js 18+

### Step 1: Run Infrastructure Stack
Start database servers, TimescaleDB, Redis caches, and Apache Kafka brokers:
```bash
docker compose -f docker/docker-compose.yml up -d
```

### Step 2: Initialize Databases
Provision all 14 isolated schemas within your PostgreSQL container:
```bash
psql -U postgres -h localhost -p 5434 -f create-all-db.sql
```

---

## 🛠 Managing Services

We provide a custom utility script to manage starting and stopping all 15 microservices concurrently:

```bash
# Start all Spring Boot services in the background
./start-all-services.sh start

# Monitor execution status of all services
./start-all-services.sh status

# Stop all background services
./start-all-services.sh stop
```

Log outputs for each service are piped directly to `backend/logs/<service-name>.log`.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
