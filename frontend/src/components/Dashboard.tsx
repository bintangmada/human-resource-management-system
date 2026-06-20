import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  EmployeeResponse,
  DepartmentResponse,
  JobResponse,
  ApiResponse,
  PaginationMetadata
} from '../types';
import './Dashboard.css';

// Inline SVG Flat Icons for premium consistent aesthetics
const BrandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} className="brand-icon-svg">
    <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
    <path d="M7 22V14h10v8"></path>
    <path d="M17 18h1"></path>
    <path d="M12 18h.01"></path>
    <path d="M7 18h1"></path>
    <path d="M17 14h1"></path>
    <path d="M12 14h.01"></path>
    <path d="M7 14h1"></path>
    <path d="M17 10h1"></path>
    <path d="M12 10h.01"></path>
    <path d="M7 10h1"></path>
    <path d="M17 6h1"></path>
    <path d="M12 6h.01"></path>
    <path d="M7 6h1"></path>
  </svg>
);

const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const LogOutIcon = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

/**
 * Interface DashboardProps:
 * Menentukan props yang harus dikirim oleh App.tsx ke Dashboard.
 * Di sini kita memerlukan:
 * - tenantId: ID tenant aktif saat ini.
 * - actorEmail: Email aktor yang sedang login.
 * - onLogout: Fungsi callback untuk keluar/kembali ke halaman login simulator.
 */
interface DashboardProps {
  tenantId: string;
  actorEmail: string;
  onLogout: () => void;
}

// Menentukan tipe data tab yang didukung
type ActiveTab = 'employees' | 'departments' | 'jobs';

export const Dashboard: React.FC<DashboardProps> = ({ tenantId, actorEmail, onLogout }) => {

  // 1. STATE UNTUK TAB AKTIF
  // Menentukan tab mana yang sedang dibuka (default: employees/karyawan)
  const [activeTab, setActiveTab] = useState<ActiveTab>('employees');

  // 2. STATE UNTUK DATA LIST DARI BACKEND
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [jobs, setJobs] = useState<JobResponse[]>([]);

  // State untuk menyimpan metadata paginasi (halaman aktif, total halaman, total data, dll.)
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);

  // 3. STATE UNTUK FILTER PENCARIAN (Input User)
  const [empFilters, setEmpFilters] = useState({ id: '', fullName: '', employeeNumber: '', email: '', phoneNumber: '', departmentName: '', jobTitle: '', joinedAt: '' });
  const [deptFilters, setDeptFilters] = useState({ id: '', name: '', code: '' });
  const [jobFilters, setJobFilters] = useState({ id: '', title: '', grade: '' });

  // 4. STATE UNTUK PAGINASI & PENGURUTAN (Sorting)
  const [currentPage, setCurrentPage] = useState<number>(0);         // Halaman aktif (0-indexed untuk backend Spring Boot)
  const [pageSize, setPageSize] = useState<number>(10);               // Jumlah item per halaman (default 10)
  const [sortBy, setSortBy] = useState<string>('id');                 // Kolom basis pengurutan (default: id)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');      // Arah pengurutan (asc: A-Z, desc: Z-A)

  // 5. STATE UNTUK MODAL DIALOG (Tambah & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);              // Penanda modal terbuka/tertutup
  const [modalType, setModalType] = useState<'employee' | 'department' | 'job'>('employee'); // Jenis form modal
  const [editingId, setEditingId] = useState<number | null>(null);    // ID record yang sedang diedit (null jika mode Tambah Baru)

  // 6. STATE UNTUK FORM INPUT (Binding values)
  const [empForm, setEmpForm] = useState({
    employeeNumber: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    departmentId: '',
    jobId: '',
    joinedAt: new Date().toISOString().split('T')[0]                  // Default tanggal hari ini (format YYYY-MM-DD)
  });

  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [jobForm, setJobForm] = useState({ title: '', grade: '' });

  // 7. STATE UNTUK NOTIFIKASI
  const [errorMsg, setErrorMsg] = useState('');                       // Menyimpan pesan kesalahan
  const [successMsg, setSuccessMsg] = useState('');                   // Menyimpan pesan sukses operasional

  // State untuk dialog konfirmasi hapus kustom
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // State untuk dialog konfirmasi logout kustom
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // State untuk melipat sidebar (Collapse/Expand)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Efek samping untuk menghilangkan notifikasi secara otomatis setelah 4 detik (Auto-Dismiss)
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  /**
   * Fungsi fetchData:
   * Mengambil data dari backend secara asinkron berdasarkan Tab aktif.
   * Parameter pencarian, paginasi, dan sorting digabungkan menjadi URL query parameters.
   */
  const fetchData = async () => {
    try {
      if (activeTab === 'employees') {
        const query = new URLSearchParams({
          id: empFilters.id,
          fullName: empFilters.fullName,
          employeeNumber: empFilters.employeeNumber,
          email: empFilters.email,
          phoneNumber: empFilters.phoneNumber,
          departmentName: empFilters.departmentName,
          jobTitle: empFilters.jobTitle,
          joinedAt: empFilters.joinedAt,
          page: currentPage.toString(),
          size: pageSize.toString(),
          sortBy,
          sortDir
        });
        const res = await apiRequest<ApiResponse<EmployeeResponse[]>>(`/employees?${query.toString()}`);
        setEmployees(res.data);
        if (res.pagination) setPagination(res.pagination);
      } else if (activeTab === 'departments') {
        const query = new URLSearchParams({
          id: deptFilters.id,
          name: deptFilters.name,
          code: deptFilters.code,
          page: currentPage.toString(),
          size: pageSize.toString(),
          sortBy,
          sortDir
        });
        const res = await apiRequest<ApiResponse<DepartmentResponse[]>>(`/departments?${query.toString()}`);
        setDepartments(res.data);
        if (res.pagination) setPagination(res.pagination);
      } else if (activeTab === 'jobs') {
        const query = new URLSearchParams({
          id: jobFilters.id,
          title: jobFilters.title,
          grade: jobFilters.grade,
          page: currentPage.toString(),
          size: pageSize.toString(),
          sortBy,
          sortDir
        });
        const res = await apiRequest<ApiResponse<JobResponse[]>>(`/jobs?${query.toString()}`);
        setJobs(res.data);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat data dari server!');
    }
  };

  // Reset pagination ke halaman pertama jika filter pencarian berubah
  useEffect(() => {
    setCurrentPage(0);
  }, [empFilters, deptFilters, jobFilters]);

  /**
   * React hook `useEffect`:
   * Fungsi ini akan dipicu secara otomatis setiap kali ada perubahan pada:
   * activeTab, currentPage, pageSize, sortBy, sortDir, tenantId, atau filter pencarian.
   * Debouncing 400ms diterapkan untuk mencegah overload request API saat mengetik.
   */
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [activeTab, currentPage, pageSize, sortBy, sortDir, tenantId, empFilters, deptFilters, jobFilters]);

  /**
   * Fungsi handleTabChange:
   * Dipanggil ketika user berpindah tab. 
   * Reset halaman ke 0 dan sort ke mode default untuk menghindari bug filter antar tabel.
   */
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setCurrentPage(0);
    setSortBy('id');
    setSortDir('asc');
    setErrorMsg('');
    setSuccessMsg('');
  };

  /**
   * Fungsi handleSort:
   * Mengaktifkan fitur pengurutan data tabel secara dinamis.
   * Jika kolom yang sama diklik lagi, arah urutan akan dibalik (asc <-> desc).
   */
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  /**
   * Fungsi confirmDelete:
   * Membuka modal konfirmasi hapus kustom untuk ID yang dipilih.
   */
  const confirmDelete = (id: number) => {
    setDeleteTargetId(id);
    setIsConfirmOpen(true);
  };

  /**
   * Fungsi executeDelete:
   * Menghapus record secara aman (Soft Delete) setelah konfirmasi disetujui.
   */
  const executeDelete = async () => {
    if (deleteTargetId === null) return;
    setIsConfirmOpen(false);
    try {
      await apiRequest(`/${activeTab}/${deleteTargetId}/delete`, { method: 'POST' });
      setSuccessMsg('Data berhasil dihapus secara aman!');
      setDeleteTargetId(null);
      fetchData(); // Muat ulang data tabel
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus data!');
      setDeleteTargetId(null);
    }
  };

  /**
   * Fungsi openCreateModal:
   * Membuka form modal kosong untuk menginputkan data baru.
   */
  const openCreateModal = () => {
    setErrorMsg('');
    setEditingId(null);
    setModalType(activeTab === 'employees' ? 'employee' : activeTab === 'departments' ? 'department' : 'job');

    // Reset isian form ke nilai awal
    setEmpForm({
      employeeNumber: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      departmentId: '',
      jobId: '',
      joinedAt: new Date().toISOString().split('T')[0]
    });
    setDeptForm({ name: '', code: '' });
    setJobForm({ title: '', grade: '' });

    setIsModalOpen(true);
  };

  /**
   * Fungsi openEditModal:
   * Membuka form modal yang telah terisi data item terpilih untuk dilakukan pembaruan (update).
   */
  const openEditModal = async (item: any) => {
    setErrorMsg('');
    setEditingId(item.id);
    setModalType(activeTab === 'employees' ? 'employee' : activeTab === 'departments' ? 'department' : 'job');

    // Pindahkan isi baris tabel terpilih ke dalam state form input
    if (activeTab === 'employees') {
      setEmpForm({
        employeeNumber: item.employeeNumber,
        fullName: item.fullName,
        email: item.email,
        phoneNumber: item.phoneNumber || '',
        departmentId: item.departmentId.toString(),
        jobId: item.jobId.toString(),
        joinedAt: item.joinedAt
      });
    } else if (activeTab === 'departments') {
      setDeptForm({ name: item.name, code: item.code });
    } else if (activeTab === 'jobs') {
      setJobForm({ title: item.title, grade: item.grade || '' });
    }

    setIsModalOpen(true);
  };

  /**
   * Fungsi handleSubmit:
   * Menangani pengiriman data form (Insert/Update) ke backend.
   * Metode HTTP ditentukan secara dinamis (POST untuk data baru, PUT untuk update data lama).
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let endpoint = `/${activeTab}`;
      const method = 'POST'; // Hanya menggunakan metode POST (tidak menggunakan PUT)

      // Jika mode edit, tambahkan ID dan path /update di ujung endpoint URL
      if (editingId) endpoint += `/${editingId}/update`;

      let body: any = {};
      if (activeTab === 'employees') {
        body = {
          ...empForm,
          departmentId: parseInt(empForm.departmentId),
          jobId: parseInt(empForm.jobId)
        };
      } else if (activeTab === 'departments') {
        body = deptForm;
      } else if (activeTab === 'jobs') {
        body = jobForm;
      }

      await apiRequest(endpoint, { method, body });
      setSuccessMsg(editingId ? 'Data berhasil diperbarui!' : 'Data baru berhasil ditambahkan!');
      setIsModalOpen(false); // Tutup dialog modal
      fetchData();          // Muat ulang tabel data
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data!');
    }
  };

  /**
   * Fungsi loadSelectors:
   * Mengambil seluruh opsi departemen & jabatan tanpa paginasi ketat 
   * untuk ditampilkan di menu dropdown form tambah/edit karyawan.
   */
  const loadSelectors = async () => {
    try {
      const deptRes = await apiRequest<ApiResponse<DepartmentResponse[]>>('/departments?size=100');
      const jobRes = await apiRequest<ApiResponse<JobResponse[]>>('/jobs?size=100');
      setDepartments(deptRes.data);
      setJobs(jobRes.data);
    } catch (err) {
      console.error("Gagal memuat opsi form", err);
    }
  };

  // Muat opsi dropdown tepat saat form modal Karyawan dibuka
  useEffect(() => {
    if (isModalOpen && modalType === 'employee') {
      loadSelectors();
    }
  }, [isModalOpen, modalType]);

  return (
    <div className="dashboard-layout">
      {/* 1. SIDEBAR DI SEBELAH KIRI */}
      {/* 1. SIDEBAR DI SEBELAH KIRI */}
      <aside className={`sidebar glass-panel ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <BrandIcon />
          {!isSidebarCollapsed && <span className="brand-title">HRMS Portal</span>}
          <button
            type="button"
            className="toggle-sidebar-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        <div className="sidebar-menu">
          {/* Kelompok Menu: Konfigurasi Data Master */}
          <div className="menu-group">
            <div className="menu-group-title">KONFIGURASI DATA MASTER</div>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'departments' ? 'active' : ''}`}
              onClick={() => handleTabChange('departments')}
              title="Departemen"
            >
              <span className="menu-icon"><FolderIcon /></span>
              {!isSidebarCollapsed && <span className="menu-label">Departemen</span>}
            </button>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => handleTabChange('jobs')}
              title="Posisi Jabatan"
            >
              <span className="menu-icon"><BriefcaseIcon /></span>
              {!isSidebarCollapsed && <span className="menu-label">Posisi Jabatan</span>}
            </button>
          </div>

          {/* Kelompok Menu: Data Transaksi */}
          <div className="menu-group">
            <div className="menu-group-title">DATA TRANSAKSI</div>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'employees' ? 'active' : ''}`}
              onClick={() => handleTabChange('employees')}
              title="Karyawan (Pegawai)"
            >
              <span className="menu-icon"><UsersIcon /></span>
              {!isSidebarCollapsed && <span className="menu-label">Karyawan (Pegawai)</span>}
            </button>
          </div>
        </div>

        {/* Bagian Bawah Sidebar (Info Tenant & Akun) */}
        <div className="sidebar-footer">
          {!isSidebarCollapsed ? (
            <>
              <div className="tenant-badge">
                <span className="badge-dot"></span>
                <span className="tenant-name">{tenantId === '1' ? 'PT. Teknologi Nusantara' : 'PT. Finance Mandiri'}</span>
              </div>
              <div className="actor-info">
                <span className="actor-icon"><UserIcon /></span>
                <span className="actor-email">{actorEmail}</span>
              </div>
              <div className="sidebar-actions">
                <button type="button" className="switch-tenant-btn" onClick={() => setIsLogoutConfirmOpen(true)}>
                  Ganti Tenant ⇄
                </button>
                <button type="button" className="logout-btn" onClick={() => setIsLogoutConfirmOpen(true)}>
                  Logout / Keluar <LogOutIcon />
                </button>
              </div>
            </>
          ) : (
            <div className="sidebar-actions-collapsed">
              <button
                type="button"
                className="action-icon-btn logout-icon-btn"
                onClick={() => setIsLogoutConfirmOpen(true)}
                title="Logout / Keluar"
              >
                <LogOutIcon size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. AREA UTAMA KONTEN (KANAN) */}
      <div className="dashboard-content">

        {/* FLOATING TOAST NOTIFICATIONS (Notifikasi Melayang) */}
        <div className="toast-container">
          {successMsg && (
            <div className="toast toast-success" onClick={() => setSuccessMsg('')}>
              <div className="toast-icon">✓</div>
              <div className="toast-body">
                <div className="toast-title">Sukses</div>
                <div className="toast-desc">{successMsg}</div>
              </div>
              <button className="toast-close" onClick={(e) => { e.stopPropagation(); setSuccessMsg(''); }}>×</button>
            </div>
          )}

          {errorMsg && (
            <div className="toast toast-error" onClick={() => setErrorMsg('')}>
              <div className="toast-icon">✗</div>
              <div className="toast-body">
                <div className="toast-title">Kesalahan</div>
                <div className="toast-desc">{errorMsg}</div>
              </div>
              <button className="toast-close" onClick={(e) => { e.stopPropagation(); setErrorMsg(''); }}>×</button>
            </div>
          )}
        </div>

        {/* Header Halaman Aktif */}
        <div className="content-header">
          <div className="page-header-info">
            <h1 className="page-header-title">
              {activeTab === 'employees' ? 'Kelola Karyawan' : activeTab === 'departments' ? 'Kelola Departemen' : 'Kelola Jabatan'}
            </h1>
            <p className="page-header-desc">
              Halaman operasional untuk mengelola {activeTab === 'employees' ? 'data transaksi karyawan' : 'data konfigurasi master'} multi-tenant.
            </p>
          </div>

          <button className="btn-primary" onClick={openCreateModal}>
            + Tambah {activeTab === 'employees' ? 'Karyawan' : activeTab === 'departments' ? 'Departemen' : 'Jabatan'}
          </button>
        </div>

        {/* 4. TABEL UTAMA DATA */}
        <div className="table-container glass-panel">
          <table className="custom-table">
            <thead>
              {/* Header Kolom Karyawan */}
              {activeTab === 'employees' && (
                <>
                  <tr>
                    <th onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                    <th onClick={() => handleSort('employeeNumber')}>NIK {sortBy === 'employeeNumber' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                    <th onClick={() => handleSort('fullName')}>Nama Lengkap {sortBy === 'fullName' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                    <th onClick={() => handleSort('email')}>Email {sortBy === 'email' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                    <th>No. Telepon</th>
                    <th>Departemen</th>
                    <th>Jabatan (Grade)</th>
                    <th onClick={() => handleSort('joinedAt')}>Bergabung {sortBy === 'joinedAt' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                    <th>Aksi</th>
                  </tr>
                  <tr className="table-filter-row">
                    <th>
                      <input
                        type="text"
                        className="table-filter-input"
                        value={empFilters.id}
                        onChange={(e) => setEmpFilters({ ...empFilters, id: e.target.value })}
                        placeholder="Filter ID..."
                      />
                    </th>
                    <th>
                      <input
                        type="text"
                        className="table-filter-input"
                        value={empFilters.employeeNumber}
                        onChange={(e) => setEmpFilters({ ...empFilters, employeeNumber: e.target.value })}
                        placeholder="Filter NIK..."
                      />
                    </th>
                    <th>
                      <input
                        type="text"
                        className="table-filter-input"
                        value={empFilters.fullName}
                        onChange={(e) => setEmpFilters({ ...empFilters, fullName: e.target.value })}
                        placeholder="Filter nama..."
                      />
                    </th>
                    <th>
                      <input
                        type="text"
                        className="table-filter-input"
                        value={empFilters.email}
                        onChange={(e) => setEmpFilters({ ...empFilters, email: e.target.value })}
                        placeholder="Filter email..."
                      />
                    </th>
                    <th>
                      <input
                        type="text"
                        className="table-filter-input"
                        value={empFilters.phoneNumber}
                        onChange={(e) => setEmpFilters({ ...empFilters, phoneNumber: e.target.value })}
                        placeholder="Filter telepon..."
                      />
                    </th>
                    <th>
                      <input
                        type="text"
                        className="table-filter-input"
                        value={empFilters.departmentName}
                        onChange={(e) => setEmpFilters({ ...empFilters, departmentName: e.target.value })}
                        placeholder="Filter divisi..."
                      />
                    </th>
                    <th>
                      <input
                        type="text"
                        className="table-filter-input"
                        value={empFilters.jobTitle}
                        onChange={(e) => setEmpFilters({ ...empFilters, jobTitle: e.target.value })}
                        placeholder="Filter jabatan..."
                      />
                    </th>
                    <th>
                      <input
                        type="text"
                        className="table-filter-input"
                        value={empFilters.joinedAt}
                        onChange={(e) => setEmpFilters({ ...empFilters, joinedAt: e.target.value })}
                        placeholder="Filter tanggal..."
                      />
                    </th>
                    <th>
                      <button
                        type="button"
                        className="clear-filters-btn"
                        onClick={() => setEmpFilters({ id: '', fullName: '', employeeNumber: '', email: '', phoneNumber: '', departmentName: '', jobTitle: '', joinedAt: '' })}
                        title="Clear Filters"
                      >
                        ✕
                      </button>
                    </th>
                  </tr>
                </>
              )}

              {/* Header Kolom Departemen */}
              {activeTab === 'departments' && (
                <>
                  <tr>
                    <th onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                    <th onClick={() => handleSort('name')}>Nama Departemen {sortBy === 'name' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                    <th onClick={() => handleSort('code')}>Kode Singkatan {sortBy === 'code' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                    <th>Aksi</th>
                  </tr>
                  <tr className="table-filter-row">
                    <th>
                      <input
                        type="text"
                        className="table-filter-input"
                        value={deptFilters.id}
                        onChange={(e) => setDeptFilters({ ...deptFilters, id: e.target.value })}
                        placeholder="Filter ID..."
                      />
                    </th>
                    <th>
                      <input
                        type="text"
                        className="table-filter-input"
                        value={deptFilters.name}
                        onChange={(e) => setDeptFilters({ ...deptFilters, name: e.target.value })}
                        placeholder="Filter nama..."
                      />
                    </th>
                    <th>
                      <input
                        type="text"
                        className="table-filter-input"
                        value={deptFilters.code}
                        onChange={(e) => setDeptFilters({ ...deptFilters, code: e.target.value })}
                        placeholder="Filter kode..."
                      />
                    </th>
                    <th>
                      <button
                        type="button"
                        className="clear-filters-btn"
                        onClick={() => setDeptFilters({ id: '', name: '', code: '' })}
                        title="Clear Filters"
                      >
                        ✕
                      </button>
                    </th>
                  </tr>
                </>
              )}

              {/* Header Kolom Jabatan */}
              {activeTab === 'jobs' && (
                <>
                  <tr>
                    <th onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                    <th onClick={() => handleSort('title')}>Nama Jabatan {sortBy === 'title' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                    <th onClick={() => handleSort('grade')}>Golongan (Grade) {sortBy === 'grade' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                    <th>Aksi</th>
                  </tr>
                  <tr className="table-filter-row">
                    <th>
                      <input
                        type="text"
                        className="table-filter-input"
                        value={jobFilters.id}
                        onChange={(e) => setJobFilters({ ...jobFilters, id: e.target.value })}
                        placeholder="Filter ID..."
                      />
                    </th>
                    <th>
                      <input
                        type="text"
                        className="table-filter-input"
                        value={jobFilters.title}
                        onChange={(e) => setJobFilters({ ...jobFilters, title: e.target.value })}
                        placeholder="Filter jabatan..."
                      />
                    </th>
                    <th>
                      <input
                        type="text"
                        className="table-filter-input"
                        value={jobFilters.grade}
                        onChange={(e) => setJobFilters({ ...jobFilters, grade: e.target.value })}
                        placeholder="Filter grade..."
                      />
                    </th>
                    <th>
                      <button
                        type="button"
                        className="clear-filters-btn"
                        onClick={() => setJobFilters({ id: '', title: '', grade: '' })}
                        title="Clear Filters"
                      >
                        ✕
                      </button>
                    </th>
                  </tr>
                </>
              )}
            </thead>
            <tbody>
              {/* Loop Baris Karyawan */}
              {activeTab === 'employees' && employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td className="bold">{emp.employeeNumber}</td>
                  <td>{emp.fullName}</td>
                  <td>{emp.email}</td>
                  <td>{emp.phoneNumber || '-'}</td>
                  <td>
                    <span className="tag-dept">{emp.departmentName}</span>
                  </td>
                  <td>
                    {emp.jobTitle} <span className="text-muted">({emp.jobGrade})</span>
                  </td>
                  <td>{emp.joinedAt}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" onClick={() => openEditModal(emp)} title="Ubah Data"><EditIcon /></button>
                      <button className="action-btn delete-btn" onClick={() => confirmDelete(emp.id)} title="Hapus Data"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Loop Baris Departemen */}
              {activeTab === 'departments' && departments.map((dept) => (
                <tr key={dept.id}>
                  <td>{dept.id}</td>
                  <td className="bold">{dept.name}</td>
                  <td>
                    <span className="tag-code">{dept.code}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" onClick={() => openEditModal(dept)} title="Ubah Data"><EditIcon /></button>
                      <button className="action-btn delete-btn" onClick={() => confirmDelete(dept.id)} title="Hapus Data"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Loop Baris Jabatan */}
              {activeTab === 'jobs' && jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.id}</td>
                  <td className="bold">{job.title}</td>
                  <td>
                    <span className="tag-grade">{job.grade}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" onClick={() => openEditModal(job)} title="Ubah Data"><EditIcon /></button>
                      <button className="action-btn delete-btn" onClick={() => confirmDelete(job.id)} title="Hapus Data"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Menampilkan pesan jika array data kosong */}
              {((activeTab === 'employees' && employees.length === 0) ||
                (activeTab === 'departments' && departments.length === 0) ||
                (activeTab === 'jobs' && jobs.length === 0)) && (
                  <tr>
                    <td colSpan={10} className="empty-row">
                      Data tidak ditemukan. Silakan tambahkan data baru atau sesuaikan filter Anda.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {/* 5. PANEL PAGINASI TABEL */}
        {pagination && (
          <div className="pagination-panel glass-panel">
            <div className="pagination-info">
              Menampilkan Halaman <strong>{pagination.page + 1}</strong> dari <strong>{pagination.totalPages || 1}</strong> ({pagination.totalElements} data)
            </div>
            <div className="pagination-actions">
              <button
                className="btn-secondary"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ◀ Sebelumnya
              </button>
              <button
                className="btn-secondary"
                disabled={pagination.isLast || pagination.totalPages <= currentPage + 1}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Berikutnya ▶
              </button>
              {/* Dropdown Ukuran/Batas Baris per Halaman */}
              <select
                className="custom-input page-size-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(0); // Reset ke halaman pertama saat ukuran diubah
                }}
              >
                <option value="5">5 data / hal</option>
                <option value="10">10 data / hal</option>
                <option value="20">20 data / hal</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 6. MODAL FORM DIALOG (Tambah / Edit Data) */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h2>{editingId ? 'Edit' : 'Tambah'} {modalType === 'employee' ? 'Karyawan' : modalType === 'department' ? 'Departemen' : 'Jabatan'}</h2>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Form Khusus Karyawan */}
              {modalType === 'employee' && (
                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">NIK / Nomor Karyawan</label>
                    <input
                      type="text"
                      className="custom-input"
                      value={empForm.employeeNumber}
                      onChange={(e) => setEmpForm({ ...empForm, employeeNumber: e.target.value })}
                      placeholder="e.g. EMP-2026-001"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap</label>
                    <input
                      type="text"
                      className="custom-input"
                      value={empForm.fullName}
                      onChange={(e) => setEmpForm({ ...empForm, fullName: e.target.value })}
                      placeholder="e.g. Ahmad Fauzi"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="custom-input"
                      value={empForm.email}
                      onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                      placeholder="e.g. ahmad@company.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">No. Telepon</label>
                    <input
                      type="text"
                      className="custom-input"
                      value={empForm.phoneNumber}
                      onChange={(e) => setEmpForm({ ...empForm, phoneNumber: e.target.value })}
                      placeholder="e.g. 08123456789"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Departemen</label>
                    <select
                      className="custom-input"
                      value={empForm.departmentId}
                      onChange={(e) => setEmpForm({ ...empForm, departmentId: e.target.value })}
                      required
                    >
                      <option value="">-- Pilih Departemen --</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jabatan (Grade)</label>
                    <select
                      className="custom-input"
                      value={empForm.jobId}
                      onChange={(e) => setEmpForm({ ...empForm, jobId: e.target.value })}
                      required
                    >
                      <option value="">-- Pilih Jabatan --</option>
                      {jobs.map(j => (
                        <option key={j.id} value={j.id}>{j.title} ({j.grade})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Tanggal Bergabung</label>
                    <input
                      type="date"
                      className="custom-input"
                      value={empForm.joinedAt}
                      onChange={(e) => setEmpForm({ ...empForm, joinedAt: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Form Khusus Departemen */}
              {modalType === 'department' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Nama Departemen</label>
                    <input
                      type="text"
                      className="custom-input"
                      value={deptForm.name}
                      onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                      placeholder="e.g. Information Technology"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kode Singkatan</label>
                    <input
                      type="text"
                      className="custom-input"
                      value={deptForm.code}
                      onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                      placeholder="e.g. IT"
                      required
                    />
                  </div>
                </>
              )}

              {/* Form Khusus Jabatan */}
              {modalType === 'job' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Nama Posisi / Jabatan</label>
                    <input
                      type="text"
                      className="custom-input"
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      placeholder="e.g. Senior Backend Engineer"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Golongan (Grade)</label>
                    <input
                      type="text"
                      className="custom-input"
                      value={jobForm.grade}
                      onChange={(e) => setJobForm({ ...jobForm, grade: e.target.value })}
                      placeholder="e.g. SE3"
                      required
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. DIALOG KONFIRMASI HAPUS KUSTOM */}
      {isConfirmOpen && (
        <div className="modal-backdrop">
          <div className="modal-content confirm-modal glass-panel">
            <div className="confirm-icon-wrapper confirm-warning-icon">
              <WarningIcon />
            </div>
            <div className="confirm-body">
              <h3>Konfirmasi Penghapusan</h3>
              <p>Apakah Anda benar-benar yakin ingin menghapus data ini secara permanen?</p>
              <span className="confirm-subtext">Tindakan ini tidak dapat dibatalkan.</span>
            </div>
            <div className="modal-actions confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setIsConfirmOpen(false);
                  setDeleteTargetId(null);
                }}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={executeDelete}
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DIALOG KONFIRMASI LOGOUT KUSTOM */}
      {isLogoutConfirmOpen && (
        <div className="modal-backdrop">
          <div className="modal-content confirm-modal glass-panel">
            <div className="confirm-icon-wrapper confirm-warning-icon">
              <LogOutIcon size={48} />
            </div>
            <div className="confirm-body">
              <h3>Konfirmasi Keluar</h3>
              <p>Apakah Anda benar-benar yakin ingin keluar dari sesi admin saat ini?</p>
              <span className="confirm-subtext">Anda perlu login kembali untuk mengakses data dashboard.</span>
            </div>
            <div className="modal-actions confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsLogoutConfirmOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={onLogout}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
