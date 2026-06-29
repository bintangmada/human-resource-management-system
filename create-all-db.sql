-- ==============================================================================
-- HRMS Enterprise - Multi-Tenant Microservices Database Initialization Script
-- ==============================================================================
-- Running this script will provision all 14 isolated database schemas required
-- by the HRMS microservices ecosystem.
-- 
-- Usage:
--   psql -U postgres -h localhost -p 5434 -f create-all-db.sql
-- ==============================================================================

-- 1. Authentication & Tenant Registry Service Database
SELECT 'Creating database: hrms_auth' AS progress;
CREATE DATABASE hrms_auth;

-- 2. Core Employee Directory Service Database
SELECT 'Creating database: hrms_employee' AS progress;
CREATE DATABASE hrms_employee;

-- 3. Attendance & Geofencing Tracking Service Database
SELECT 'Creating database: hrms_attendance' AS progress;
CREATE DATABASE hrms_attendance;

-- 4. Annual Leave & Quota Management Service Database
SELECT 'Creating database: hrms_leave' AS progress;
CREATE DATABASE hrms_leave;

-- 5. Payroll Calculations & Payslip Service Database
SELECT 'Creating database: hrms_payroll' AS progress;
CREATE DATABASE hrms_payroll;

-- 6. Claim & Reimbursement Management Service Database
SELECT 'Creating database: hrms_claim' AS progress;
CREATE DATABASE hrms_claim;

-- 7. Salary Advance & Loan Installments Service Database
SELECT 'Creating database: hrms_loan' AS progress;
CREATE DATABASE hrms_loan;

-- 8. Employee Performance Review (KPI) Service Database
SELECT 'Creating database: hrms_performance' AS progress;
CREATE DATABASE hrms_performance;

-- 9. Applicant Tracking System (ATS) Recruitment Service Database
SELECT 'Creating database: hrms_recruitment' AS progress;
CREATE DATABASE hrms_recruitment;

-- 10. Office Inventory & Asset Allocation Service Database
SELECT 'Creating database: hrms_asset' AS progress;
CREATE DATABASE hrms_asset;

-- 11. Announcements & Corporate Calendar Service Database
SELECT 'Creating database: hrms_notification' AS progress;
CREATE DATABASE hrms_notification;

-- 12. Employee Resign & Exit Clearance Service Database
SELECT 'Creating database: hrms_offboarding' AS progress;
CREATE DATABASE hrms_offboarding;

-- 13. Business Travel & Expense Budget Service Database
SELECT 'Creating database: hrms_travel' AS progress;
CREATE DATABASE hrms_travel;

-- 14. Learning & Development (L&D) Course Enrollment Database
SELECT 'Creating database: hrms_training' AS progress;
CREATE DATABASE hrms_training;

SELECT 'All 14 databases created successfully!' AS status;
