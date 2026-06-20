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

interface DashboardProps {
  tenantId: string;
  actorEmail: string;
  onLogout: () => void;
}

type ActiveTab = 'employees' | 'departments' | 'jobs';

export const Dashboard: React.FC<DashboardProps> = ({ tenantId, actorEmail, onLogout }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('employees');
  
  // Data States
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);

  // Filter States
  const [empFilters, setEmpFilters] = useState({ fullName: '', employeeNumber: '', email: '' });
  const [deptFilters, setDeptFilters] = useState({ name: '', code: '' });
  const [jobFilters, setJobFilters] = useState({ title: '', grade: '' });

  // Pagination & Sort States
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'employee' | 'department' | 'job'>('employee');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form States
  const [empForm, setEmpForm] = useState({
    employeeNumber: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    departmentId: '',
    jobId: '',
    joinedAt: new Date().toISOString().split('T')[0]
  });

  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [jobForm, setJobForm] = useState({ title: '', grade: '' });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch lists based on active tab
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

  // Trigger fetch when tab, filters, page, sorting, or tenant changes
  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, pageSize, sortBy, sortDir, tenantId]);

  // Handle Tab Switch (reset page & sorting)
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setCurrentPage(0);
    setSortBy('id');
    setSortDir('asc');
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Helper for toggle sort direction
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  // Handle Delete (Soft Delete)
  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      await apiRequest(`/${activeTab}/${id}`, { method: 'DELETE' });
      setSuccessMsg('Data berhasil dihapus secara aman!');
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus data!');
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setErrorMsg('');
    setEditingId(null);
    setModalType(activeTab === 'employees' ? 'employee' : activeTab === 'departments' ? 'department' : 'job');
    
    // Reset forms
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

  // Open Edit Modal
  const openEditModal = async (item: any) => {
    setErrorMsg('');
    setEditingId(item.id);
    setModalType(activeTab === 'employees' ? 'employee' : activeTab === 'departments' ? 'department' : 'job');
    
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

  // Handle Form Submit (Create & Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let endpoint = `/${activeTab}`;
      const method = editingId ? 'PUT' : 'POST';
      if (editingId) endpoint += `/${editingId}`;

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
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data!');
    }
  };

  // Fetch departments & jobs for employee form selectors
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

  useEffect(() => {
    if (isModalOpen && modalType === 'employee') {
      loadSelectors();
    }
  }, [isModalOpen, modalType]);

  return (
    <div className="dashboard-layout">
      {/* Top Navigation Bar */}
      <nav className="navbar glass-panel">
        <div className="nav-brand">
          <span className="brand-logo">🏢</span>
          <span className="brand-title">HRMS Enterprise</span>
        </div>
        <div className="nav-actions">
          <div className="tenant-badge">
            <span className="badge-dot"></span>
            Tenant: <strong>{tenantId === '1' ? 'PT. Teknologi Nusantara' : 'PT. Finance Mandiri'}</strong>
          </div>
          <div className="actor-info">
            👤 <span>{actorEmail}</span>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Switch Tenant ⇄
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Alerts */}
        {successMsg && (
          <div className="alert alert-success" onClick={() => setSuccessMsg('')}>
            ✓ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="alert alert-error" onClick={() => setErrorMsg('')}>
            ✗ {errorMsg}
          </div>
        )}

        {/* Tab Switcher & Action buttons */}
        <div className="content-header">
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
              onClick={() => handleTabChange('employees')}
            >
              👥 Karyawan
            </button>
            <button 
              className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
              onClick={() => handleTabChange('departments')}
            >
              📂 Departemen
            </button>
            <button 
              className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => handleTabChange('jobs')}
            >
              💼 Posisi Jabatan
            </button>
          </div>
          
          <button className="btn-primary" onClick={openCreateModal}>
            + Tambah {activeTab === 'employees' ? 'Karyawan' : activeTab === 'departments' ? 'Departemen' : 'Jabatan'}
          </button>
        </div>

        {/* Filters Panel */}
        <div className="filters-panel glass-panel">
          <h3>🔍 Filter Pencarian</h3>
          <div className="filters-grid">
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
                  <label>NIK / Employee Number</label>
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

        {/* Data Table */}
        <div className="table-container glass-panel">
          <table className="custom-table">
            <thead>
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

              {activeTab === 'departments' && (
                <tr>
                  <th onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th onClick={() => handleSort('name')}>Nama Departemen {sortBy === 'name' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th onClick={() => handleSort('code')}>Kode Singkatan {sortBy === 'code' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th>Aksi</th>
                </tr>
              )}

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
                      <button className="action-btn delete-btn" onClick={() => handleDelete(emp.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}

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
                      <button className="action-btn delete-btn" onClick={() => handleDelete(dept.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}

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
                      <button className="action-btn delete-btn" onClick={() => handleDelete(job.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}

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

        {/* Pagination Controls */}
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
              <select 
                className="custom-input page-size-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(0);
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

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h2>{editingId ? 'Edit' : 'Tambah'} {modalType === 'employee' ? 'Karyawan' : modalType === 'department' ? 'Departemen' : 'Jabatan'}</h2>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              {modalType === 'employee' && (
                <>
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
                  <div className="form-group">
                    <label className="form-label">Tanggal Bergabung</label>
                    <input 
                      type="date" 
                      className="custom-input"
                      value={empForm.joinedAt}
                      onChange={(e) => setEmpForm({...empForm, joinedAt: e.target.value})}
                      required
                    />
                  </div>
                </>
              )}

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
    </div>
  );
};
