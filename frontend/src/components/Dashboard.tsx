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
  const [empFilters, setEmpFilters] = useState({ fullName: '', employeeNumber: '', email: '' });
  const [deptFilters, setDeptFilters] = useState({ name: '', code: '' });
  const [jobFilters, setJobFilters] = useState({ title: '', grade: '' });

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
          fullName: empFilters.fullName,
          employeeNumber: empFilters.employeeNumber,
          email: empFilters.email,
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

  /**
   * React hook `useEffect`:
   * Fungsi ini akan dipicu secara otomatis setiap kali ada perubahan pada:
   * activeTab, currentPage, pageSize, sortBy, sortDir, atau tenantId.
   * Hal ini memastikan data tabel selalu selaras (sync) secara realtime.
   */
  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, pageSize, sortBy, sortDir, tenantId]);

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
      <aside className="sidebar glass-panel">
        <div className="sidebar-brand">
          <span className="brand-logo">🏢</span>
          <span className="brand-title">HRMS Portal</span>
        </div>
        
        <div className="sidebar-menu">
          {/* Kelompok Menu: Konfigurasi Data Master */}
          <div className="menu-group">
            <div className="menu-group-title">KONFIGURASI DATA MASTER</div>
            <button 
              type="button"
              className={`menu-item-btn ${activeTab === 'departments' ? 'active' : ''}`}
              onClick={() => handleTabChange('departments')}
            >
              <span className="menu-icon">📂</span>
              <span className="menu-label">Departemen</span>
            </button>
            <button 
              type="button"
              className={`menu-item-btn ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => handleTabChange('jobs')}
            >
              <span className="menu-icon">💼</span>
              <span className="menu-label">Posisi Jabatan</span>
            </button>
          </div>

          {/* Kelompok Menu: Data Transaksi */}
          <div className="menu-group">
            <div className="menu-group-title">DATA TRANSAKSI</div>
            <button 
              type="button"
              className={`menu-item-btn ${activeTab === 'employees' ? 'active' : ''}`}
              onClick={() => handleTabChange('employees')}
            >
              <span className="menu-icon">👥</span>
              <span className="menu-label">Karyawan (Pegawai)</span>
            </button>
          </div>
        </div>

        {/* Bagian Bawah Sidebar (Info Tenant & Akun) */}
        <div className="sidebar-footer">
          <div className="tenant-badge">
            <span className="badge-dot"></span>
            <span className="tenant-name">{tenantId === '1' ? 'PT. Teknologi Nusantara' : 'PT. Finance Mandiri'}</span>
          </div>
          <div className="actor-info">
            <span className="actor-icon">👤</span>
            <span className="actor-email">{actorEmail}</span>
          </div>
          <button type="button" className="logout-btn" onClick={onLogout}>
            Switch Tenant ⇄
          </button>
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

        {/* 3. PANEL FILTER PENCARIAN (Berdasarkan Tab Aktif) */}
        <div className="filters-panel glass-panel">
          <h3>🔍 Filter Pencarian</h3>
          <div className="filters-grid">
            
            {/* Filter Khusus Tab Karyawan */}
            {activeTab === 'employees' && (
              <>
                <div className="filter-input-group">
                  <label>Nama Lengkap</label>
                  <input 
                    type="text" 
                    className="custom-input"
                    value={empFilters.fullName}
                    onChange={(e) => setEmpFilters({...empFilters, fullName: e.target.value})}
                    placeholder="Cari nama..."
                  />
                </div>
                <div className="filter-input-group">
                  <label>NIK / Nomor Karyawan</label>
                  <input 
                    type="text" 
                    className="custom-input"
                    value={empFilters.employeeNumber}
                    onChange={(e) => setEmpFilters({...empFilters, employeeNumber: e.target.value})}
                    placeholder="Cari NIK..."
                  />
                </div>
                <div className="filter-input-group">
                  <label>Email</label>
                  <input 
                    type="text" 
                    className="custom-input"
                    value={empFilters.email}
                    onChange={(e) => setEmpFilters({...empFilters, email: e.target.value})}
                    placeholder="Cari email..."
                  />
                </div>
              </>
            )}

            {/* Filter Khusus Tab Departemen */}
            {activeTab === 'departments' && (
              <>
                <div className="filter-input-group">
                  <label>Nama Departemen</label>
                  <input 
                    type="text" 
                    className="custom-input"
                    value={deptFilters.name}
                    onChange={(e) => setDeptFilters({...deptFilters, name: e.target.value})}
                    placeholder="Cari departemen..."
                  />
                </div>
                <div className="filter-input-group">
                  <label>Kode Singkatan</label>
                  <input 
                    type="text" 
                    className="custom-input"
                    value={deptFilters.code}
                    onChange={(e) => setDeptFilters({...deptFilters, code: e.target.value})}
                    placeholder="Cari kode..."
                  />
                </div>
              </>
            )}

            {/* Filter Khusus Tab Jabatan */}
            {activeTab === 'jobs' && (
              <>
                <div className="filter-input-group">
                  <label>Nama Jabatan</label>
                  <input 
                    type="text" 
                    className="custom-input"
                    value={jobFilters.title}
                    onChange={(e) => setJobFilters({...jobFilters, title: e.target.value})}
                    placeholder="Cari jabatan..."
                  />
                </div>
                <div className="filter-input-group">
                  <label>Golongan / Grade</label>
                  <input 
                    type="text" 
                    className="custom-input"
                    value={jobFilters.grade}
                    onChange={(e) => setJobFilters({...jobFilters, grade: e.target.value})}
                    placeholder="Cari golongan..."
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="filter-actions">
            <button className="btn-secondary" onClick={() => {
              // Bersihkan seluruh isian kolom filter
              setEmpFilters({ fullName: '', employeeNumber: '', email: '' });
              setDeptFilters({ name: '', code: '' });
              setJobFilters({ title: '', grade: '' });
            }}>
              Clear Filters
            </button>
            <button className="btn-primary" onClick={fetchData}>
              Terapkan Filter
            </button>
          </div>
        </div>

        {/* 4. TABEL UTAMA DATA */}
        <div className="table-container glass-panel">
          <table className="custom-table">
            <thead>
              {/* Header Kolom Karyawan */}
              {activeTab === 'employees' && (
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
              )}

              {/* Header Kolom Departemen */}
              {activeTab === 'departments' && (
                <tr>
                  <th onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th onClick={() => handleSort('name')}>Nama Departemen {sortBy === 'name' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th onClick={() => handleSort('code')}>Kode Singkatan {sortBy === 'code' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th>Aksi</th>
                </tr>
              )}

              {/* Header Kolom Jabatan */}
              {activeTab === 'jobs' && (
                <tr>
                  <th onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th onClick={() => handleSort('title')}>Nama Jabatan {sortBy === 'title' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th onClick={() => handleSort('grade')}>Golongan (Grade) {sortBy === 'grade' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th>Aksi</th>
                </tr>
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
                      <button className="action-btn edit-btn" onClick={() => openEditModal(emp)}>✏️</button>
                      <button className="action-btn delete-btn" onClick={() => confirmDelete(emp.id)}>🗑️</button>
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
                      <button className="action-btn edit-btn" onClick={() => openEditModal(dept)}>✏️</button>
                      <button className="action-btn delete-btn" onClick={() => confirmDelete(dept.id)}>🗑️</button>
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
                      <button className="action-btn edit-btn" onClick={() => openEditModal(job)}>✏️</button>
                      <button className="action-btn delete-btn" onClick={() => confirmDelete(job.id)}>🗑️</button>
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
                      onChange={(e) => setEmpForm({...empForm, employeeNumber: e.target.value})}
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
                      onChange={(e) => setEmpForm({...empForm, fullName: e.target.value})}
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
                      onChange={(e) => setEmpForm({...empForm, email: e.target.value})}
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
                      onChange={(e) => setEmpForm({...empForm, phoneNumber: e.target.value})}
                      placeholder="e.g. 08123456789"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Departemen</label>
                    <select 
                      className="custom-input"
                      value={empForm.departmentId}
                      onChange={(e) => setEmpForm({...empForm, departmentId: e.target.value})}
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
                      onChange={(e) => setEmpForm({...empForm, jobId: e.target.value})}
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
                      onChange={(e) => setEmpForm({...empForm, joinedAt: e.target.value})}
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
                      onChange={(e) => setDeptForm({...deptForm, name: e.target.value})}
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
                      onChange={(e) => setDeptForm({...deptForm, code: e.target.value})}
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
                      onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
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
                      onChange={(e) => setJobForm({...jobForm, grade: e.target.value})}
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
            <div className="confirm-icon-wrapper">
              <span className="confirm-warning-icon">⚠️</span>
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
    </div>
  );
};
