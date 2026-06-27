export type Language = 'id' | 'en';

export const translations = {
  id: {
    // Login Page
    portalTitle: 'Portal Sistem Informasi Kepegawaian Multi-Tenant',
    selectCompany: 'Pilih Perusahaan / Tenant:',
    emailActor: 'Email Aktor (Audit Log):',
    enterEmail: 'Masukkan email Anda',
    loginError: 'Silakan masukkan format email yang valid!',
    enterDashboard: 'Masuk Ke Dashboard ➔',
    dbSecurity: 'Keamanan database terisolasi ketat per Tenant ID di PostgreSQL.',
    
    // Registrasi & Onboarding
    registerTenant: 'Daftar Perusahaan Baru (SaaS Onboarding)',
    companyLegalName: 'Nama Resmi Perusahaan',
    subdomainPrefix: 'Kode Perusahaan',
    ownerFullName: 'Nama Lengkap Administrator',
    ownerWorkEmail: 'Email Kerja Administrator',
    registerSuccess: 'Pendaftaran perusahaan berhasil! Silakan login.',
    alreadyHaveAccount: 'Sudah terdaftar? Login ke Perusahaan Anda',
    noAccountYet: 'Ingin menggunakan SaaS ini? Daftarkan Perusahaan Anda ➔',
    subdomainChecked: 'Kode Perusahaan tersedia!',
    subdomainChecking: 'Memeriksa ketersediaan Kode Perusahaan...',
    subdomainTaken: 'Kode Perusahaan sudah digunakan perusahaan lain!',
    enterCompanyName: 'Masukkan nama perusahaan Anda',
    enterSubdomain: 'contoh: teknologi-nusantara',
    enterOwnerName: 'Masukkan nama lengkap Anda',
    enterOwnerEmail: 'Masukkan email kerja Anda',
    backToLogin: 'Kembali ke Login',
    
    // Dashboard Common
    logout: 'Logout / Keluar',
    switchTenant: 'Ganti Tenant ⇄',
    employees: 'Karyawan',
    departments: 'Departemen',
    jobs: 'Posisi Jabatan',
    column: 'Kolom',
    showColumn: 'Tampilkan Kolom',
    actions: 'Aksi',
    search: 'Cari...',
    resetFilter: 'Reset Filter',
    active: 'Aktif',
    inactive: 'Tidak Aktif',
    status: 'Status',
    all: 'Semua',
    loading: 'Memuat data...',
    noData: 'Tidak ada data ditemukan.',
    recordsText: 'Menampilkan {start} - {end} dari {total} data',
    
    // Sidebar
    employeeSub: 'Karyawan (Pegawai)',
    
    // Dashboard Headers
    manageEmployees: 'Kelola Karyawan',
    manageDepartments: 'Kelola Departemen',
    manageJobs: 'Kelola Jabatan',
    employeesDesc: 'Halaman operasional untuk mengelola data transaksi karyawan',
    masterDesc: 'Halaman operasional untuk mengelola data konfigurasi master',
    
    // Actions & Modals
    addEmployee: 'Tambah Karyawan',
    editEmployee: 'Edit Karyawan',
    addDepartment: 'Tambah Departemen',
    editDepartment: 'Edit Departemen',
    addJob: 'Tambah Jabatan',
    editJob: 'Edit Jabatan',
    deleteConfirm: 'Konfirmasi Penghapusan',
    deleteConfirmText: 'Apakah Anda benar-benar yakin ingin menghapus data ini secara permanen?',
    deleteWarningText: 'Data yang dihapus tidak dapat dikembalikan.',
    cancel: 'Batal',
    delete: 'Ya, Hapus Data',
    save: 'Simpan',
    
    // Employee Form Fields
    nik: 'NIK / Nomor Karyawan',
    fullName: 'Nama Lengkap',
    email: 'Email',
    phoneNumber: 'No. Telepon',
    joinedDate: 'Tanggal Bergabung',
    statusActive: 'Status Keaktifan',
    selectDept: '-- Pilih Departemen --',
    selectJob: '-- Pilih Jabatan --',
    
    // Department Form Fields
    deptName: 'Nama Departemen',
    shortcutCode: 'Kode Singkatan',
    
    // Job Form Fields
    jobTitle: 'Nama Posisi / Jabatan',
    grade: 'Golongan (Grade)',
    
    // Toast Messages
    saveSuccess: 'Data berhasil disimpan!',
    deleteSuccess: 'Data berhasil dihapus!',
    fetchError: 'Gagal mengambil data dari server.',
    saveError: 'Gagal menyimpan data.',
    deleteError: 'Gagal menghapus data.',
    minColumnWarning: 'Minimal harus ada 1 kolom yang ditampilkan!',

    // Attendance & Geofence
    attendance: 'Kehadiran',
    geofence: 'Pengaturan Geofence',
    clockIn: 'Absen Masuk',
    clockOut: 'Absen Keluar',
    manageAttendance: 'Kelola Kehadiran',
    manageGeofence: 'Kelola Geofence',
    addGeofence: 'Tambah Geofence',
    editGeofence: 'Edit Geofence',
    latitude: 'Latitude',
    longitude: 'Longitude',
    radius: 'Radius (Meter)',
    clockInStatus: 'Status Masuk',
    clockOutStatus: 'Status Keluar',
    clockInTime: 'Waktu Masuk',
    clockOutTime: 'Waktu Keluar',
    notes: 'Catatan',
    date: 'Tanggal',
    employee: 'Karyawan',
    attendanceDesc: 'Halaman operasional untuk melacak absensi masuk dan keluar karyawan',
    geofenceDesc: 'Pengaturan wilayah radius lokasi absensi kantor',
    officeName: 'Nama Lokasi / Kantor',
  },
  en: {
    // Login Page
    portalTitle: 'Multi-Tenant Personnel Information System Portal',
    selectCompany: 'Select Company / Tenant:',
    emailActor: 'Actor Email (Audit Log):',
    enterEmail: 'Enter your email',
    loginError: 'Please enter a valid email format!',
    enterDashboard: 'Enter Dashboard ➔',
    dbSecurity: 'Database security is strictly isolated per Tenant ID in PostgreSQL.',
    
    // Registration & Onboarding
    registerTenant: 'Register New Company (SaaS Onboarding)',
    companyLegalName: 'Company Legal Name',
    subdomainPrefix: 'Company Code',
    ownerFullName: 'Administrator Full Name',
    ownerWorkEmail: 'Administrator Work Email',
    registerSuccess: 'Company registration successful! Please login.',
    alreadyHaveAccount: 'Already registered? Login to your Company',
    noAccountYet: 'Want to use this SaaS? Register your Company ➔',
    subdomainChecked: 'Company Code is available!',
    subdomainChecking: 'Checking Company Code availability...',
    subdomainTaken: 'Company Code is already taken by another company!',
    enterCompanyName: 'Enter your company name',
    enterSubdomain: 'example: technology-nusantara',
    enterOwnerName: 'Enter your full name',
    enterOwnerEmail: 'Enter your work email',
    backToLogin: 'Back to Login',
    
    // Dashboard Common
    logout: 'Logout',
    switchTenant: 'Switch Tenant ⇄',
    employees: 'Employees',
    departments: 'Departments',
    jobs: 'Job Positions',
    column: 'Column',
    showColumn: 'Show Columns',
    actions: 'Actions',
    search: 'Search...',
    resetFilter: 'Reset Filters',
    active: 'Active',
    inactive: 'Inactive',
    status: 'Status',
    all: 'All',
    loading: 'Loading data...',
    noData: 'No data found.',
    recordsText: 'Showing {start} - {end} of {total} records',
    
    // Sidebar
    employeeSub: 'Employees',
    
    // Dashboard Headers
    manageEmployees: 'Manage Employees',
    manageDepartments: 'Manage Departments',
    manageJobs: 'Manage Jobs',
    employeesDesc: 'Operational page for managing employee transaction data',
    masterDesc: 'Operational page for managing master configuration data',
    
    // Actions & Modals
    addEmployee: 'Add Employee',
    editEmployee: 'Edit Employee',
    addDepartment: 'Add Department',
    editDepartment: 'Edit Department',
    addJob: 'Add Job',
    editJob: 'Edit Job',
    deleteConfirm: 'Confirm Deletion',
    deleteConfirmText: 'Are you absolutely sure you want to permanently delete this data?',
    deleteWarningText: 'Deleted data cannot be recovered.',
    cancel: 'Cancel',
    delete: 'Yes, Delete Data',
    save: 'Save',
    
    // Employee Form Fields
    nik: 'Employee ID (NIK)',
    fullName: 'Full Name',
    email: 'Email',
    phoneNumber: 'Phone Number',
    joinedDate: 'Joined Date',
    statusActive: 'Status',
    selectDept: '-- Select Department --',
    selectJob: '-- Select Job --',
    
    // Department Form Fields
    deptName: 'Department Name',
    shortcutCode: 'Abbreviation Code',
    
    // Job Form Fields
    jobTitle: 'Job Title / Position',
    grade: 'Grade / Golongan',
    
    // Toast Messages
    saveSuccess: 'Data saved successfully!',
    deleteSuccess: 'Data deleted successfully!',
    fetchError: 'Failed to fetch data from server.',
    saveError: 'Failed to save data.',
    deleteError: 'Failed to delete data.',
    minColumnWarning: 'At least 1 column must be displayed!',

    // Attendance & Geofence
    attendance: 'Attendance',
    geofence: 'Geofence Settings',
    clockIn: 'Clock In',
    clockOut: 'Clock Out',
    manageAttendance: 'Manage Attendance',
    manageGeofence: 'Manage Geofence',
    addGeofence: 'Add Geofence',
    editGeofence: 'Edit Geofence',
    latitude: 'Latitude',
    longitude: 'Longitude',
    radius: 'Radius (Meters)',
    clockInStatus: 'Clock In Status',
    clockOutStatus: 'Clock Out Status',
    clockInTime: 'Clock In Time',
    clockOutTime: 'Clock Out Time',
    notes: 'Notes',
    date: 'Date',
    employee: 'Employee',
    attendanceDesc: 'Operational page to track employee clock-in and clock-out',
    geofenceDesc: 'Office geofence radius location settings',
    officeName: 'Location Name / Office',
  }
};
