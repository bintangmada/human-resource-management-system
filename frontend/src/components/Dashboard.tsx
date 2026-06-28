import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  EmployeeResponse,
  DepartmentResponse,
  JobResponse,
  ApiResponse,
  PaginationMetadata,
  AttendanceResponse,
  GeofenceSettingResponse,
  LeaveTypeResponse,
  LeaveBalanceResponse,
  LeaveRequestResponse
} from '../types';
import './Dashboard.css';
import { LeaveManagement } from './LeaveManagement';
import PayrollManagement from './PayrollManagement';
import { ClaimsManagement } from './ClaimsManagement';
import { LoansManagement } from './LoansManagement';
import { PerformanceManagement } from './PerformanceManagement';
import { RecruitmentManagement } from './RecruitmentManagement';
import { AssetManagement } from './AssetManagement';
import { AnnouncementsCalendar } from './AnnouncementsCalendar';
import { OffboardingManagement } from './OffboardingManagement';
import { Language, translations } from '../utils/i18n';

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

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
  </svg>
);

const ColumnsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', flexShrink: 0 }}>
    <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"/>
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
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

interface DashboardProps {
  tenantId: string;
  actorEmail: string;
  onLogout: () => void;
  lang: Language;
  changeLang: (l: Language) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
}

// Menentukan tipe data tab yang didukung
type ActiveTab = 'employees' | 'departments' | 'jobs' | 'attendance' | 'geofence' | 'leave' | 'payroll' | 'claims' | 'loans' | 'performance' | 'recruitment' | 'assets' | 'announcements' | 'offboarding';

export const Dashboard: React.FC<DashboardProps> = ({ tenantId, actorEmail: _actorEmail, onLogout, lang, changeLang, theme, setTheme }) => {

  const [tenantName, setTenantName] = useState<string>('Loading...');
  const t = translations[lang] as any; // Cast as any for new keys
  const actorName = localStorage.getItem('hrms_actor_name') || 'Employee';
  const actorRole = localStorage.getItem('hrms_actor_role') || 'Staff';

  useEffect(() => {
    const fetchTenantDetails = async () => {
      try {
        const response = await apiRequest<{ data: any[] }>('/tenants');
        if (response && response.data) {
          const current = response.data.find((t: any) => t.id.toString() === tenantId);
          if (current) {
            setTenantName(current.companyName);
          } else {
            setTenantName(`Tenant ID: ${tenantId}`);
          }
        }
      } catch (e) {
        setTenantName(tenantId === '1' ? 'PT. Teknologi Nusantara' : tenantId === '2' ? 'PT. Finance Mandiri' : `Tenant ID: ${tenantId}`);
      }
    };
    fetchTenantDetails();
  }, [tenantId]);

  // 1. STATE UNTUK TAB AKTIF
  // Menentukan tab mana yang sedang dibuka (default: employees/karyawan)
  const [activeTab, setActiveTab] = useState<ActiveTab>('employees');

  // 2. STATE UNTUK DATA LIST DARI BACKEND
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [attendances, setAttendances] = useState<AttendanceResponse[]>([]);
  const [geofences, setGeofences] = useState<GeofenceSettingResponse[]>([]);

  // Self-service attendance state
  const [myEmployeeId, setMyEmployeeId] = useState<number | null>(null);
  const [myEmployeeName, setMyEmployeeName] = useState<string>('');
  const [employeeMap, setEmployeeMap] = useState<Record<number, string>>({});
  const [todayAttendance, setTodayAttendance] = useState<AttendanceResponse | null>(null);
  const [selfNotes, setSelfNotes] = useState<string>('');
  const [selfGeoLocation, setSelfGeoLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selfGeoError, setSelfGeoError] = useState<string>('');

  // State untuk menyimpan metadata paginasi (halaman aktif, total halaman, total data, dll.)
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);

  // 3. STATE UNTUK FILTER PENCARIAN (Input User)
  const [empFilters, setEmpFilters] = useState({ id: '', fullName: '', employeeNumber: '', email: '', phoneNumber: '', departmentName: '', jobTitle: '', joinedAt: '', status: '' });
  const [deptFilters, setDeptFilters] = useState({ id: '', name: '', code: '', status: '' });
  const [jobFilters, setJobFilters] = useState({ id: '', title: '', grade: '', status: '' });
  const [attendanceFilters, setAttendanceFilters] = useState({ employeeId: '', startDate: '', endDate: '' });
  const [geofenceFilters, setGeofenceFilters] = useState({ name: '' });

  // 3b. STATE UNTUK GEOLOCATION CLOCK-IN CLOCK-OUT
  const detectSelfLocation = () => {
    setSelfGeoError('');
    if (!navigator.geolocation) {
      setSelfGeoError(lang === 'id' ? 'Geolocation tidak didukung browser Anda.' : 'Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelfGeoLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        let msg = 'Error';
        if (error.code === error.PERMISSION_DENIED) {
          msg = lang === 'id' ? 'Izin lokasi ditolak.' : 'Location permission denied.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = lang === 'id' ? 'Informasi lokasi tidak tersedia.' : 'Location position unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = lang === 'id' ? 'Waktu pendeteksian lokasi habis.' : 'Location detection timeout.';
        }
        setSelfGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Helper checks to see if search filters are active
  const isEmpFiltered = Object.values(empFilters).some(val => val !== '');
  const isDeptFiltered = Object.values(deptFilters).some(val => val !== '');
  const isJobFiltered = Object.values(jobFilters).some(val => val !== '');
  const isAttendanceFiltered = Object.values(attendanceFilters).some(val => val !== '');
  const isGeofenceFiltered = Object.values(geofenceFilters).some(val => val !== '');


  // State untuk visibilitas kolom tabel
  const [visibleColumns, setVisibleColumns] = useState<{
    employees: string[];
    departments: string[];
    jobs: string[];
    attendance: string[];
    geofence: string[];
  }>(() => {
    const saved = localStorage.getItem('hrms_visible_columns');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.employees) && Array.isArray(parsed.departments) && Array.isArray(parsed.jobs) && Array.isArray(parsed.attendance) && Array.isArray(parsed.geofence)) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return {
      employees: ['id', 'nik', 'fullName', 'email', 'phoneNumber', 'departmentName', 'jobTitle', 'joinedAt', 'status', 'actions'],
      departments: ['id', 'name', 'code', 'status', 'actions'],
      jobs: ['id', 'title', 'grade', 'status', 'actions'],
      attendance: ['id', 'date', 'employee', 'clockInTime', 'clockInStatus', 'clockOutTime', 'clockOutStatus', 'notes'],
      geofence: ['id', 'officeName', 'latitude', 'longitude', 'radius', 'status', 'actions']
    };
  });

  useEffect(() => {
    localStorage.setItem('hrms_visible_columns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const getTabColumnDefinitions = () => {
    if (activeTab === 'employees') {
      return [
        { key: 'id', label: 'ID' },
        { key: 'nik', label: t.nik },
        { key: 'fullName', label: t.fullName },
        { key: 'email', label: t.email },
        { key: 'phoneNumber', label: t.phoneNumber },
        { key: 'departmentName', label: t.departments },
        { key: 'jobTitle', label: `${t.jobs} (Grade)` },
        { key: 'joinedAt', label: t.joinedDate },
        { key: 'status', label: t.statusActive }
      ];
    } else if (activeTab === 'departments') {
      return [
        { key: 'id', label: 'ID' },
        { key: 'name', label: t.deptName },
        { key: 'code', label: t.shortcutCode },
        { key: 'status', label: t.statusActive }
      ];
    } else if (activeTab === 'jobs') {
      return [
        { key: 'id', label: 'ID' },
        { key: 'title', label: t.jobTitle },
        { key: 'grade', label: t.grade },
        { key: 'status', label: t.statusActive }
      ];
    } else if (activeTab === 'attendance') {
      return [
        { key: 'id', label: 'ID' },
        { key: 'date', label: t.date },
        { key: 'employee', label: t.employee },
        { key: 'clockInTime', label: t.clockInTime },
        { key: 'clockInStatus', label: t.clockInStatus },
        { key: 'clockOutTime', label: t.clockOutTime },
        { key: 'clockOutStatus', label: t.clockOutStatus },
        { key: 'notes', label: t.notes }
      ];
    } else {
      return [
        { key: 'id', label: 'ID' },
        { key: 'officeName', label: t.officeName },
        { key: 'latitude', label: t.latitude },
        { key: 'longitude', label: t.longitude },
        { key: 'radius', label: t.radius },
        { key: 'status', label: t.statusActive }
      ];
    }
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns((prev) => {
      const currentList = prev[activeTab];
      const isVisible = currentList.includes(columnKey);
      
      // Prevent hiding all columns (must keep at least one column besides actions)
      if (isVisible && currentList.filter(k => k !== 'actions').length <= 1) {
        return prev;
      }

      // Original orders
      const originalOrder = activeTab === 'employees' 
        ? ['id', 'nik', 'fullName', 'email', 'phoneNumber', 'departmentName', 'jobTitle', 'joinedAt', 'status', 'actions']
        : activeTab === 'departments'
          ? ['id', 'name', 'code', 'status', 'actions']
          : activeTab === 'jobs'
            ? ['id', 'title', 'grade', 'status', 'actions']
            : activeTab === 'attendance'
              ? ['id', 'date', 'employee', 'clockInTime', 'clockInStatus', 'clockOutTime', 'clockOutStatus', 'notes']
              : ['id', 'officeName', 'latitude', 'longitude', 'radius', 'status', 'actions'];

      const nextList = isVisible
        ? currentList.filter((k) => k !== columnKey)
        : originalOrder.filter((k) => currentList.includes(k) || k === columnKey);

      return {
        ...prev,
        [activeTab]: nextList
      };
    });
  };

  // 4. STATE UNTUK PAGINASI & PENGURUTAN (Sorting)
  const [currentPage, setCurrentPage] = useState<number>(0);         // Halaman aktif (0-indexed untuk backend Spring Boot)
  const [pageSize, setPageSize] = useState<number>(10);               // Jumlah item per halaman (default 10)
  const [sortBy, setSortBy] = useState<string>('id');                 // Kolom basis pengurutan (default: id)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');      // Arah pengurutan (asc: A-Z, desc: Z-A)

  // 5. STATE UNTUK MODAL DIALOG (Tambah & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);              // Penanda modal terbuka/tertutup
  const [modalType, setModalType] = useState<'employee' | 'department' | 'job' | 'geofence'>('employee'); // Jenis form modal
  const [editingId, setEditingId] = useState<number | null>(null);    // ID record yang sedang diedit (null jika mode Tambah Baru)

  // 6. STATE UNTUK FORM INPUT (Binding values)
  const [empForm, setEmpForm] = useState({
    employeeNumber: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    departmentId: '',
    jobId: '',
    joinedAt: new Date().toISOString().split('T')[0],                  // Default tanggal hari ini (format YYYY-MM-DD)
    status: 1
  });

  const [deptForm, setDeptForm] = useState({ name: '', code: '', status: 1 });
  const [jobForm, setJobForm] = useState({ title: '', grade: '', status: 1 });
  const [geofenceForm, setGeofenceForm] = useState({ name: '', latitude: '', longitude: '', radiusMeter: '100', isActive: true });

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

  // State & Effect untuk Dropdown Kustom (Page Size & Status Filters)
  const [activeDropdown, setActiveDropdown] = useState<'empStatus' | 'deptStatus' | 'jobStatus' | 'pageSize' | 'columnSelector' | null>(null);

  useEffect(() => {
    if (!activeDropdown) return;
    const handleClose = () => setActiveDropdown(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [activeDropdown]);

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
        const queryParams: any = {
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
        };
        if (empFilters.status !== '') {
          queryParams.status = empFilters.status;
        }
        const query = new URLSearchParams(queryParams);
        const res = await apiRequest<ApiResponse<EmployeeResponse[]>>(`/employees?${query.toString()}`);
        setEmployees(res.data);
        if (res.pagination) setPagination(res.pagination);
      } else if (activeTab === 'departments') {
        const queryParams: any = {
          id: deptFilters.id,
          name: deptFilters.name,
          code: deptFilters.code,
          page: currentPage.toString(),
          size: pageSize.toString(),
          sortBy,
          sortDir
        };
        if (deptFilters.status !== '') {
          queryParams.status = deptFilters.status;
        }
        const query = new URLSearchParams(queryParams);
        const res = await apiRequest<ApiResponse<DepartmentResponse[]>>(`/departments?${query.toString()}`);
        setDepartments(res.data);
        if (res.pagination) setPagination(res.pagination);
      } else if (activeTab === 'jobs') {
        const queryParams: any = {
          id: jobFilters.id,
          title: jobFilters.title,
          grade: jobFilters.grade,
          page: currentPage.toString(),
          size: pageSize.toString(),
          sortBy,
          sortDir
        };
        if (jobFilters.status !== '') {
          queryParams.status = jobFilters.status;
        }
        const query = new URLSearchParams(queryParams);
        const res = await apiRequest<ApiResponse<JobResponse[]>>(`/jobs?${query.toString()}`);
        setJobs(res.data);
        if (res.pagination) setPagination(res.pagination);
      } else if (activeTab === 'attendance') {
        const queryParams: any = {
          page: currentPage.toString(),
          size: pageSize.toString()
        };
        if (attendanceFilters.employeeId) {
          queryParams.employeeId = attendanceFilters.employeeId;
        }
        if (attendanceFilters.startDate) {
          queryParams.startDate = attendanceFilters.startDate;
        }
        if (attendanceFilters.endDate) {
          queryParams.endDate = attendanceFilters.endDate;
        }
        const query = new URLSearchParams(queryParams);
        const res = await apiRequest<ApiResponse<AttendanceResponse[]>>(`/attendance/history?${query.toString()}`);
        setAttendances(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      } else if (activeTab === 'geofence') {
        const queryParams: any = {
          page: currentPage.toString(),
          size: pageSize.toString()
        };
        if (geofenceFilters.name) {
          queryParams.search = geofenceFilters.name;
        }
        const query = new URLSearchParams(queryParams);
        const res = await apiRequest<ApiResponse<GeofenceSettingResponse[]>>(`/geofence?${query.toString()}`);
        setGeofences(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'id' ? 'Gagal memuat data dari server!' : 'Failed to load data from server!'));
    }
  };

  // Reset pagination ke halaman pertama jika filter pencarian berubah
  useEffect(() => {
    setCurrentPage(0);
  }, [empFilters, deptFilters, jobFilters, attendanceFilters, geofenceFilters]);

  // Efek samping untuk memuat lookup nama karyawan & detail karyawan saya
  const loadEmployeesForLookup = async () => {
    try {
      const res = await apiRequest<ApiResponse<EmployeeResponse[]>>('/employees?size=1000');
      if (res && res.data) {
        const map: Record<number, string> = {};
        res.data.forEach(emp => {
          map[emp.id] = `${emp.fullName} (${emp.employeeNumber})`;
        });
        setEmployeeMap(map);

        const own = res.data.find(emp => emp.email.toLowerCase() === _actorEmail.toLowerCase());
        if (own) {
          setMyEmployeeId(own.id);
          setMyEmployeeName(own.fullName);
        }
      }
    } catch (err) {
      console.error("Gagal memuat list karyawan", err);
    }
  };

  const fetchTodayAttendance = async (empId: number) => {
    try {
      const res = await apiRequest<ApiResponse<AttendanceResponse>>(`/attendance/today?employeeId=${empId}`);
      if (res && res.data) {
        setTodayAttendance(res.data);
      } else {
        setTodayAttendance(null);
      }
    } catch (err) {
      setTodayAttendance(null);
    }
  };

  useEffect(() => {
    loadEmployeesForLookup();
  }, [tenantId]);

  useEffect(() => {
    if (myEmployeeId) {
      fetchTodayAttendance(myEmployeeId);
    }
  }, [myEmployeeId, activeTab]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      detectSelfLocation();
    }
  }, [activeTab]);

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
  }, [activeTab, currentPage, pageSize, sortBy, sortDir, tenantId, empFilters, deptFilters, jobFilters, attendanceFilters, geofenceFilters]);

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
      setSuccessMsg(lang === 'id' ? 'Data berhasil dihapus secara aman!' : 'Data deleted safely and successfully!');
      setDeleteTargetId(null);
      fetchData(); // Muat ulang data tabel
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'id' ? 'Gagal menghapus data!' : 'Failed to delete data!'));
      setDeleteTargetId(null);
    }
  };

  const handleClockIn = async () => {
    if (!selfGeoLocation) {
      setErrorMsg(lang === 'id' ? 'Silakan deteksi lokasi GPS terlebih dahulu.' : 'Please detect your GPS location first.');
      return;
    }
    if (!myEmployeeId) {
      setErrorMsg(lang === 'id' ? 'ID Karyawan tidak ditemukan untuk email Anda.' : 'Employee ID not found for your email.');
      return;
    }
    try {
      const body = {
        employeeId: myEmployeeId,
        latitude: selfGeoLocation.lat,
        longitude: selfGeoLocation.lng,
        notes: selfNotes
      };
      const res = await apiRequest<ApiResponse<AttendanceResponse>>('/attendance/clock-in', {
        method: 'POST',
        body
      });
      if (res.success) {
        setSuccessMsg(res.message || (lang === 'id' ? 'Berhasil Absen Masuk!' : 'Clock In Successful!'));
        setSelfNotes('');
        fetchTodayAttendance(myEmployeeId);
        fetchData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'id' ? 'Gagal Absen Masuk!' : 'Clock In Failed!'));
    }
  };

  const handleClockOut = async () => {
    if (!selfGeoLocation) {
      setErrorMsg(lang === 'id' ? 'Silakan deteksi lokasi GPS terlebih dahulu.' : 'Please detect your GPS location first.');
      return;
    }
    if (!myEmployeeId) {
      setErrorMsg(lang === 'id' ? 'ID Karyawan tidak ditemukan untuk email Anda.' : 'Employee ID not found for your email.');
      return;
    }
    try {
      const body = {
        employeeId: myEmployeeId,
        latitude: selfGeoLocation.lat,
        longitude: selfGeoLocation.lng,
        notes: selfNotes
      };
      const res = await apiRequest<ApiResponse<AttendanceResponse>>('/attendance/clock-out', {
        method: 'POST',
        body
      });
      if (res.success) {
        setSuccessMsg(res.message || (lang === 'id' ? 'Berhasil Absen Keluar!' : 'Clock Out Successful!'));
        setSelfNotes('');
        fetchTodayAttendance(myEmployeeId);
        fetchData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'id' ? 'Gagal Absen Keluar!' : 'Clock Out Failed!'));
    }
  };

  /**
   * Fungsi openCreateModal:
   * Membuka form modal kosong untuk menginputkan data baru.
   */
  const openCreateModal = () => {
    setErrorMsg('');
    setEditingId(null);
    setModalType(
      activeTab === 'employees'
        ? 'employee'
        : activeTab === 'departments'
        ? 'department'
        : activeTab === 'jobs'
        ? 'job'
        : 'geofence'
    );

    // Reset isian form ke nilai awal
    setEmpForm({
      employeeNumber: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      departmentId: '',
      jobId: '',
      joinedAt: new Date().toISOString().split('T')[0],
      status: 1
    });
    setDeptForm({ name: '', code: '', status: 1 });
    setJobForm({ title: '', grade: '', status: 1 });
    setGeofenceForm({ name: '', latitude: '', longitude: '', radiusMeter: '100', isActive: true });

    setIsModalOpen(true);
  };

  /**
   * Fungsi openEditModal:
   * Membuka form modal yang telah terisi data item terpilih untuk dilakukan pembaruan (update).
   */
  const openEditModal = async (item: any) => {
    setErrorMsg('');
    setEditingId(item.id);
    setModalType(
      activeTab === 'employees'
        ? 'employee'
        : activeTab === 'departments'
        ? 'department'
        : activeTab === 'jobs'
        ? 'job'
        : 'geofence'
    );

    // Pindahkan isi baris tabel terpilih ke dalam state form input
    if (activeTab === 'employees') {
      setEmpForm({
        employeeNumber: item.employeeNumber,
        fullName: item.fullName,
        email: item.email,
        phoneNumber: item.phoneNumber || '',
        departmentId: item.departmentId.toString(),
        jobId: item.jobId.toString(),
        joinedAt: item.joinedAt,
        status: item.status
      });
    } else if (activeTab === 'departments') {
      setDeptForm({ name: item.name, code: item.code, status: item.status });
    } else if (activeTab === 'jobs') {
      setJobForm({ title: item.title, grade: item.grade || '', status: item.status });
    } else if (activeTab === 'geofence') {
      setGeofenceForm({
        name: item.name,
        latitude: item.latitude.toString(),
        longitude: item.longitude.toString(),
        radiusMeter: item.radiusMeter.toString(),
        isActive: item.isActive
      });
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
          jobId: parseInt(empForm.jobId),
          status: empForm.status
        };
      } else if (activeTab === 'departments') {
        body = {
          ...deptForm,
          status: deptForm.status
        };
      } else if (activeTab === 'jobs') {
        body = {
          ...jobForm,
          status: jobForm.status
        };
      } else if (activeTab === 'geofence') {
        body = {
          name: geofenceForm.name,
          latitude: parseFloat(geofenceForm.latitude),
          longitude: parseFloat(geofenceForm.longitude),
          radiusMeter: parseFloat(geofenceForm.radiusMeter),
          isActive: geofenceForm.isActive
        };
      }

      await apiRequest(endpoint, { method, body });
      setSuccessMsg(editingId 
        ? (lang === 'id' ? 'Data berhasil diperbarui!' : 'Data updated successfully!')
        : (lang === 'id' ? 'Data baru berhasil ditambahkan!' : 'New data added successfully!')
      );
      setIsModalOpen(false); // Tutup dialog modal
      fetchData();          // Muat ulang tabel data
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'id' ? 'Gagal menyimpan data!' : 'Failed to save data!'));
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
      <aside className={`sidebar glass-panel ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <BrandIcon />
          {!isSidebarCollapsed && <span className="brand-title">HRMS Portal</span>}
          <div className="sidebar-brand-actions" style={{ display: 'flex', gap: '6px', flexDirection: isSidebarCollapsed ? 'column' : 'row', alignItems: 'center' }}>
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={() => changeLang(lang === 'id' ? 'en' : 'id')}
              title={lang === 'id' ? "Switch to English" : "Ubah ke Bahasa Indonesia"}
              style={{ fontSize: '11px', fontWeight: 'bold' }}
            >
              {lang === 'id' ? 'EN' : 'ID'}
            </button>
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? "Mode Terang" : "Mode Gelap"}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              type="button"
              className="toggle-sidebar-btn"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>
          </div>
        </div>

        <div className="sidebar-menu">
          {/* Kelompok Menu: Konfigurasi Data Master */}
          <div className="menu-group">
            <div className="menu-group-title">{lang === 'id' ? 'KONFIGURASI DATA MASTER' : 'MASTER DATA CONFIGURATION'}</div>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'departments' ? 'active' : ''}`}
              onClick={() => handleTabChange('departments')}
              title={t.departments}
            >
              <span className="menu-icon"><FolderIcon /></span>
              {!isSidebarCollapsed && <span className="menu-label">{t.departments}</span>}
            </button>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => handleTabChange('jobs')}
              title={t.jobs}
            >
              <span className="menu-icon"><BriefcaseIcon /></span>
              {!isSidebarCollapsed && <span className="menu-label">{t.jobs}</span>}
            </button>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'geofence' ? 'active' : ''}`}
              onClick={() => handleTabChange('geofence')}
              title={t.geofence}
            >
              <span className="menu-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              {!isSidebarCollapsed && <span className="menu-label">{t.geofence}</span>}
            </button>
          </div>

          {/* Kelompok Menu: Data Transaksi */}
          <div className="menu-group">
            <div className="menu-group-title">{lang === 'id' ? 'DATA TRANSAKSI' : 'TRANSACTION DATA'}</div>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'employees' ? 'active' : ''}`}
              onClick={() => handleTabChange('employees')}
              title={t.employees}
            >
              <span className="menu-icon"><UsersIcon /></span>
              {!isSidebarCollapsed && <span className="menu-label">{t.employeeSub}</span>}
            </button>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => handleTabChange('attendance')}
              title={t.attendance}
            >
              <span className="menu-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </span>
              {!isSidebarCollapsed && <span className="menu-label">{t.attendance}</span>}
            </button>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'leave' ? 'active' : ''}`}
              onClick={() => handleTabChange('leave')}
              title={t.leave}
            >
              <span className="menu-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </span>
              {!isSidebarCollapsed && <span className="menu-label">{t.leave}</span>}
            </button>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'payroll' ? 'active' : ''}`}
              onClick={() => handleTabChange('payroll')}
              title={t.payroll}
            >
              <span className="menu-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </span>
              {!isSidebarCollapsed && <span className="menu-label">{t.payroll}</span>}
            </button>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'claims' ? 'active' : ''}`}
              onClick={() => handleTabChange('claims')}
              title={t.claims}
            >
              <span className="menu-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </span>
              {!isSidebarCollapsed && <span className="menu-label">{t.claims}</span>}
            </button>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'loans' ? 'active' : ''}`}
              onClick={() => handleTabChange('loans')}
              title={t.loans}
            >
              <span className="menu-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="9"></line>
                  <line x1="9" y1="13" x2="15" y2="13"></line>
                  <line x1="9" y1="17" x2="13" y2="17"></line>
                </svg>
              </span>
              {!isSidebarCollapsed && <span className="menu-label">{t.loans}</span>}
            </button>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => handleTabChange('performance')}
              title={t.performance}
            >
              <span className="menu-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </span>
              {!isSidebarCollapsed && <span className="menu-label">{t.performance}</span>}
            </button>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'recruitment' ? 'active' : ''}`}
              onClick={() => handleTabChange('recruitment')}
              title={t.recruitment}
            >
              <span className="menu-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </span>
              {!isSidebarCollapsed && <span className="menu-label">{t.recruitment}</span>}
            </button>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'assets' ? 'active' : ''}`}
              onClick={() => handleTabChange('assets')}
              title={t.assets}
            >
              <span className="menu-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </span>
              {!isSidebarCollapsed && <span className="menu-label">{t.assets}</span>}
            </button>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'announcements' ? 'active' : ''}`}
              onClick={() => handleTabChange('announcements')}
              title={t.announcements}
            >
              <span className="menu-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </span>
              {!isSidebarCollapsed && <span className="menu-label">{t.announcements}</span>}
            </button>
            <button
              type="button"
              className={`menu-item-btn ${activeTab === 'offboarding' ? 'active' : ''}`}
              onClick={() => handleTabChange('offboarding')}
              title={t.offboarding}
            >
              <span className="menu-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              {!isSidebarCollapsed && <span className="menu-label">{t.offboarding}</span>}
            </button>
          </div>
        </div>

        {/* Bagian Bawah Sidebar (Info Tenant & Akun) */}
        <div className="sidebar-footer">
          {!isSidebarCollapsed ? (
            <>
              <div className="tenant-badge">
                <span className="badge-dot"></span>
                <span className="tenant-name">{tenantName}</span>
              </div>
              <div className="actor-info">
                <span className="actor-icon"><UserIcon /></span>
                <div className="actor-details">
                  <span className="actor-name">{actorName}</span>
                  <span className="actor-role-badge">{actorRole}</span>
                </div>
              </div>
              <div className="sidebar-actions">
                <button type="button" className="switch-tenant-btn" onClick={() => setIsLogoutConfirmOpen(true)}>
                  {t.switchTenant}
                </button>
                <button type="button" className="logout-btn" onClick={() => setIsLogoutConfirmOpen(true)}>
                  {t.logout} <LogOutIcon />
                </button>
              </div>
            </>
          ) : (
            <div className="sidebar-actions-collapsed">
              <button
                type="button"
                className="action-icon-btn logout-icon-btn"
                onClick={() => setIsLogoutConfirmOpen(true)}
                title={t.logout}
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
                <div className="toast-title">{lang === 'id' ? 'Sukses' : 'Success'}</div>
                <div className="toast-desc">{successMsg}</div>
              </div>
              <button className="toast-close" onClick={(e) => { e.stopPropagation(); setSuccessMsg(''); }}>×</button>
            </div>
          )}

          {errorMsg && (
            <div className="toast toast-error" onClick={() => setErrorMsg('')}>
              <div className="toast-icon">✗</div>
              <div className="toast-body">
                <div className="toast-title">{lang === 'id' ? 'Kesalahan' : 'Error'}</div>
                <div className="toast-desc">{errorMsg}</div>
              </div>
              <button className="toast-close" onClick={(e) => { e.stopPropagation(); setErrorMsg(''); }}>×</button>
            </div>
          )}
        </div>

        {activeTab === 'leave' ? (
          <LeaveManagement
            tenantId={tenantId}
            actorEmail={_actorEmail}
            lang={lang}
            theme={theme}
          />
        ) : activeTab === 'payroll' ? (
          <PayrollManagement
            tenantId={tenantId}
            actorEmail={_actorEmail}
            lang={lang}
            theme={theme}
          />
        ) : activeTab === 'claims' ? (
          <ClaimsManagement
            tenantId={tenantId}
            actorEmail={_actorEmail}
            lang={lang}
            theme={theme}
          />
        ) : activeTab === 'loans' ? (
          <LoansManagement
            tenantId={tenantId}
            actorEmail={_actorEmail}
            lang={lang}
            theme={theme}
          />
        ) : activeTab === 'performance' ? (
          <PerformanceManagement
            tenantId={tenantId}
            actorEmail={_actorEmail}
            lang={lang}
            theme={theme}
          />
        ) : activeTab === 'recruitment' ? (
          <RecruitmentManagement
            tenantId={tenantId}
            actorEmail={_actorEmail}
            lang={lang}
            theme={theme}
          />
        ) : activeTab === 'assets' ? (
          <AssetManagement
            tenantId={tenantId}
            actorEmail={_actorEmail}
            lang={lang}
            theme={theme}
          />
        ) : activeTab === 'announcements' ? (
          <AnnouncementsCalendar
            tenantId={tenantId}
            actorEmail={_actorEmail}
            lang={lang}
            theme={theme}
          />
        ) : activeTab === 'offboarding' ? (
          <OffboardingManagement
            tenantId={tenantId}
            actorEmail={_actorEmail}
            lang={lang}
            theme={theme}
          />
        ) : (
          <>
            {/* Header Halaman Aktif */}
            <div className="content-header">
          <div className="page-header-info">
            <h1 className="page-header-title">
              {activeTab === 'employees'
                ? t.manageEmployees
                : activeTab === 'departments'
                ? t.manageDepartments
                : activeTab === 'jobs'
                ? t.manageJobs
                : activeTab === 'attendance'
                ? t.manageAttendance
                : t.manageGeofence}
            </h1>
            <p className="page-header-desc">
              {activeTab === 'employees'
                ? t.employeesDesc
                : activeTab === 'departments' || activeTab === 'jobs'
                ? t.masterDesc
                : activeTab === 'attendance'
                ? t.attendanceDesc
                : t.geofenceDesc}{' '}
              {tenantName}.
            </p>
          </div>

          <div className="page-header-actions">
            {/* Column Visibility Selector Dropdown */}
            <div className="column-selector-container">
              <button
                type="button"
                className={`btn-secondary column-selector-trigger ${activeDropdown === 'columnSelector' ? 'open' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'columnSelector' ? null : 'columnSelector');
                }}
              >
                <ColumnsIcon />
                <span>{t.column}</span>
                <ChevronDownIcon />
              </button>
              {activeDropdown === 'columnSelector' && (
                <div className="column-selector-menu">
                  <div className="column-selector-header">{t.showColumn}</div>
                  <ul className="column-selector-list">
                    {getTabColumnDefinitions().map((col) => (
                      <li key={col.key} onClick={(e) => { e.stopPropagation(); toggleColumnVisibility(col.key); }}>
                        <input
                          type="checkbox"
                          checked={visibleColumns[activeTab].includes(col.key)}
                          readOnly
                        />
                        <span>{col.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {activeTab !== 'attendance' && (
              <button className="btn-primary" onClick={openCreateModal}>
                + {activeTab === 'employees'
                  ? t.addEmployee
                  : activeTab === 'departments'
                  ? t.addDepartment
                  : activeTab === 'jobs'
                  ? t.addJob
                  : t.addGeofence}
              </button>
            )}
          </div>
        </div>

        {/* SELF-SERVICE CLOCK IN/CLOCK OUT PANEL */}
        {activeTab === 'attendance' && (
          <div className="self-service-card glass-panel" style={{ marginBottom: '24px', padding: '24px', borderRadius: '12px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 500px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}>
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {lang === 'id' ? 'Pusat Absensi Mandiri' : 'Self-Service Attendance Center'}
              </h2>
              
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '8px', marginBottom: '8px' }}>
                  <span className="text-muted">{lang === 'id' ? 'Nama Karyawan:' : 'Employee Name:'}</span>
                  <strong style={{ color: 'var(--text-color)' }}>{myEmployeeName || 'Guest / Admin'}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '8px', marginBottom: '8px' }}>
                  <span className="text-muted">{lang === 'id' ? 'Tanggal Hari Ini:' : 'Today\'s Date:'}</span>
                  <span style={{ color: 'var(--text-color)' }}>{new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '8px' }}>
                  <span className="text-muted">{lang === 'id' ? 'Status Kehadiran:' : 'Attendance Status:'}</span>
                  <div>
                    {!todayAttendance ? (
                      <span className="tag-status-inactive" style={{ display: 'inline-block' }}>
                        {lang === 'id' ? 'Belum Absen Masuk' : 'Not Clocked In Yet'}
                      </span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <span className="tag-status-active" style={{ display: 'inline-block' }}>
                          {lang === 'id' ? `Masuk: ${todayAttendance.clockIn} (${todayAttendance.clockInStatus})` : `In: ${todayAttendance.clockIn} (${todayAttendance.clockInStatus})`}
                        </span>
                        {todayAttendance.clockOut ? (
                          <span className="tag-status-active" style={{ display: 'inline-block', backgroundColor: 'var(--primary-color)' }}>
                            {lang === 'id' ? `Keluar: ${todayAttendance.clockOut} (${todayAttendance.clockOutStatus})` : `Out: ${todayAttendance.clockOut} (${todayAttendance.clockOutStatus})`}
                          </span>
                        ) : (
                          <span className="tag-status-inactive" style={{ display: 'inline-block', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                            {lang === 'id' ? 'Belum Absen Keluar' : 'Not Clocked Out Yet'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(!todayAttendance || !todayAttendance.clockOut) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ marginBottom: '6px' }}>{t.notes}</label>
                    <textarea
                      className="custom-input"
                      style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
                      value={selfNotes}
                      onChange={(e) => setSelfNotes(e.target.value)}
                      placeholder={lang === 'id' ? 'Tulis catatan absen (misal: Tugas lapangan, WFH, dll)...' : 'Write clock notes (e.g. Field assignment, WFH, etc)...'}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {!todayAttendance ? (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleClockIn}
                        disabled={!selfGeoLocation}
                        style={{ flex: 1, height: '42px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                          <polyline points="10 17 15 12 10 7"></polyline>
                          <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                        {t.clockIn}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleClockOut}
                        disabled={!selfGeoLocation}
                        style={{ flex: 1, height: '42px', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        {t.clockOut}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }} className="self-service-geo-panel">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  {lang === 'id' ? 'Status Geokoding & GPS' : 'GPS & Geocoding Status'}
                </h3>
                
                {selfGeoLocation ? (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                    <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600 }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                      {lang === 'id' ? 'Lokasi Terdeteksi' : 'Location Detected'}
                    </div>
                    <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                      Lat: {selfGeoLocation.lat.toFixed(6)}<br />
                      Lng: {selfGeoLocation.lng.toFixed(6)}
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selfGeoLocation.lat},${selfGeoLocation.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', color: '#3b82f6', textDecoration: 'underline' }}
                    >
                      {lang === 'id' ? 'Lihat di Google Maps' : 'View on Google Maps'}
                    </a>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '12px', color: '#ef4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600 }}>
                      <span>⚠️</span>
                      {lang === 'id' ? 'Lokasi Belum Terdeteksi' : 'Location Not Detected'}
                    </div>
                    <p style={{ fontSize: '12px', margin: 0 }}>
                      {selfGeoError || (lang === 'id' ? 'Mengambil koordinat satelit GPS Anda...' : 'Retrieving your GPS satellite coordinates...')}
                    </p>
                  </div>
                )}
                
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {lang === 'id' 
                    ? '*Catatan: Anda harus berada di radius Geofence kantor untuk dapat melakukan absensi. Pastikan Anda mengizinkan akses lokasi.' 
                    : '*Note: You must be within the office Geofence radius to perform attendance. Make sure you allow location access.'}
                </p>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={detectSelfLocation}
                style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                🔄 {lang === 'id' ? 'Pindai Ulang Lokasi' : 'Rescan Location'}
              </button>
            </div>
          </div>
        )}

        {/* 4. TABEL UTAMA DATA */}
        <div className="table-container glass-panel">
          <table className="custom-table">
            <thead>
              {/* Header Kolom Karyawan */}
              {activeTab === 'employees' && (
                <>
                  <tr>
                    {visibleColumns.employees.includes('id') && <th onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.employees.includes('nik') && <th onClick={() => handleSort('employeeNumber')}>{t.nik} {sortBy === 'employeeNumber' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.employees.includes('fullName') && <th onClick={() => handleSort('fullName')}>{t.fullName} {sortBy === 'fullName' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.employees.includes('email') && <th onClick={() => handleSort('email')}>{t.email} {sortBy === 'email' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.employees.includes('phoneNumber') && <th>{t.phoneNumber}</th>}
                    {visibleColumns.employees.includes('departmentName') && <th>{t.departments}</th>}
                    {visibleColumns.employees.includes('jobTitle') && <th>{t.jobs} (Grade)</th>}
                    {visibleColumns.employees.includes('joinedAt') && <th onClick={() => handleSort('joinedAt')}>{t.joinedDate} {sortBy === 'joinedAt' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.employees.includes('status') && <th>{t.status}</th>}
                    {visibleColumns.employees.includes('actions') && <th>{t.actions}</th>}
                  </tr>
                  <tr className="table-filter-row">
                    {visibleColumns.employees.includes('id') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={empFilters.id}
                          onChange={(e) => setEmpFilters({ ...empFilters, id: e.target.value })}
                          placeholder={lang === 'id' ? "Filter ID..." : "Filter ID..."}
                        />
                      </th>
                    )}
                    {visibleColumns.employees.includes('nik') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={empFilters.employeeNumber}
                          onChange={(e) => setEmpFilters({ ...empFilters, employeeNumber: e.target.value })}
                          placeholder={lang === 'id' ? "Filter NIK..." : "Filter ID..."}
                        />
                      </th>
                    )}
                    {visibleColumns.employees.includes('fullName') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={empFilters.fullName}
                          onChange={(e) => setEmpFilters({ ...empFilters, fullName: e.target.value })}
                          placeholder={lang === 'id' ? "Filter nama..." : "Filter name..."}
                        />
                      </th>
                    )}
                    {visibleColumns.employees.includes('email') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={empFilters.email}
                          onChange={(e) => setEmpFilters({ ...empFilters, email: e.target.value })}
                          placeholder={lang === 'id' ? "Filter email..." : "Filter email..."}
                        />
                      </th>
                    )}
                    {visibleColumns.employees.includes('phoneNumber') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={empFilters.phoneNumber}
                          onChange={(e) => setEmpFilters({ ...empFilters, phoneNumber: e.target.value })}
                          placeholder={lang === 'id' ? "Filter telepon..." : "Filter phone..."}
                        />
                      </th>
                    )}
                    {visibleColumns.employees.includes('departmentName') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={empFilters.departmentName}
                          onChange={(e) => setEmpFilters({ ...empFilters, departmentName: e.target.value })}
                          placeholder={lang === 'id' ? "Filter departemen..." : "Filter department..."}
                        />
                      </th>
                    )}
                    {visibleColumns.employees.includes('jobTitle') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={empFilters.jobTitle}
                          onChange={(e) => setEmpFilters({ ...empFilters, jobTitle: e.target.value })}
                          placeholder={lang === 'id' ? "Filter jabatan..." : "Filter job..."}
                        />
                      </th>
                    )}
                    {visibleColumns.employees.includes('joinedAt') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={empFilters.joinedAt}
                          onChange={(e) => setEmpFilters({ ...empFilters, joinedAt: e.target.value })}
                          placeholder={lang === 'id' ? "Filter tanggal..." : "Filter date..."}
                        />
                      </th>
                    )}
                    {visibleColumns.employees.includes('status') && (
                      <th>
                        <div className="table-dropdown-container">
                          <button
                            type="button"
                            className={`table-dropdown-trigger ${activeDropdown === 'empStatus' ? 'open' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === 'empStatus' ? null : 'empStatus');
                            }}
                          >
                            <span>
                              {empFilters.status === '1' ? t.active : empFilters.status === '0' ? t.inactive : t.all}
                            </span>
                            <ChevronDownIcon />
                          </button>
                          {activeDropdown === 'empStatus' && (
                            <ul className="table-dropdown-menu">
                              {[
                                { value: '', label: t.all },
                                { value: '1', label: t.active },
                                { value: '0', label: t.inactive }
                              ].map((opt) => (
                                <li
                                  key={opt.value}
                                  className={empFilters.status === opt.value ? 'active' : ''}
                                  onClick={() => {
                                    setEmpFilters({ ...empFilters, status: opt.value });
                                    setActiveDropdown(null);
                                  }}
                                >
                                  {opt.label}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </th>
                    )}
                    {visibleColumns.employees.includes('actions') && (
                      <th>
                        {isEmpFiltered && (
                          <button
                            type="button"
                            className="clear-filters-btn"
                            onClick={() => setEmpFilters({ id: '', fullName: '', employeeNumber: '', email: '', phoneNumber: '', departmentName: '', jobTitle: '', joinedAt: '', status: '' })}
                            title={t.resetFilter}
                          >
                            <ResetIcon />
                          </button>
                        )}
                      </th>
                    )}
                  </tr>
                </>
              )}

              {/* Header Kolom Departemen */}
              {activeTab === 'departments' && (
                <>
                  <tr>
                    {visibleColumns.departments.includes('id') && <th onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.departments.includes('name') && <th onClick={() => handleSort('name')}>{t.deptName} {sortBy === 'name' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.departments.includes('code') && <th onClick={() => handleSort('code')}>{t.shortcutCode} {sortBy === 'code' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.departments.includes('status') && <th>{t.status}</th>}
                    {visibleColumns.departments.includes('actions') && <th>{t.actions}</th>}
                  </tr>
                  <tr className="table-filter-row">
                    {visibleColumns.departments.includes('id') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={deptFilters.id}
                          onChange={(e) => setDeptFilters({ ...deptFilters, id: e.target.value })}
                          placeholder={lang === 'id' ? "Filter ID..." : "Filter ID..."}
                        />
                      </th>
                    )}
                    {visibleColumns.departments.includes('name') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={deptFilters.name}
                          onChange={(e) => setDeptFilters({ ...deptFilters, name: e.target.value })}
                          placeholder={lang === 'id' ? "Filter nama..." : "Filter name..."}
                        />
                      </th>
                    )}
                    {visibleColumns.departments.includes('code') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={deptFilters.code}
                          onChange={(e) => setDeptFilters({ ...deptFilters, code: e.target.value })}
                          placeholder={lang === 'id' ? "Filter kode..." : "Filter code..."}
                        />
                      </th>
                    )}
                    {visibleColumns.departments.includes('status') && (
                      <th>
                        <div className="table-dropdown-container">
                          <button
                            type="button"
                            className={`table-dropdown-trigger ${activeDropdown === 'deptStatus' ? 'open' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === 'deptStatus' ? null : 'deptStatus');
                            }}
                          >
                            <span>
                              {deptFilters.status === '1' ? t.active : deptFilters.status === '0' ? t.inactive : t.all}
                            </span>
                            <ChevronDownIcon />
                          </button>
                          {activeDropdown === 'deptStatus' && (
                            <ul className="table-dropdown-menu">
                              {[
                                { value: '', label: t.all },
                                { value: '1', label: t.active },
                                { value: '0', label: t.inactive }
                              ].map((opt) => (
                                <li
                                  key={opt.value}
                                  className={deptFilters.status === opt.value ? 'active' : ''}
                                  onClick={() => {
                                    setDeptFilters({ ...deptFilters, status: opt.value });
                                    setActiveDropdown(null);
                                  }}
                                >
                                  {opt.label}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </th>
                    )}
                    {visibleColumns.departments.includes('actions') && (
                      <th>
                        {isDeptFiltered && (
                          <button
                            type="button"
                            className="clear-filters-btn"
                            onClick={() => setDeptFilters({ id: '', name: '', code: '', status: '' })}
                            title={t.resetFilter}
                          >
                            <ResetIcon />
                          </button>
                        )}
                      </th>
                    )}
                  </tr>
                </>
              )}

              {/* Header Kolom Jabatan */}
              {activeTab === 'jobs' && (
                <>
                  <tr>
                    {visibleColumns.jobs.includes('id') && <th onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.jobs.includes('title') && <th onClick={() => handleSort('title')}>{t.jobTitle} {sortBy === 'title' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.jobs.includes('grade') && <th onClick={() => handleSort('grade')}>{t.grade} {sortBy === 'grade' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.jobs.includes('status') && <th>{t.status}</th>}
                    {visibleColumns.jobs.includes('actions') && <th>{t.actions}</th>}
                  </tr>
                  <tr className="table-filter-row">
                    {visibleColumns.jobs.includes('id') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={jobFilters.id}
                          onChange={(e) => setJobFilters({ ...jobFilters, id: e.target.value })}
                          placeholder={lang === 'id' ? "Filter ID..." : "Filter ID..."}
                        />
                      </th>
                    )}
                    {visibleColumns.jobs.includes('title') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={jobFilters.title}
                          onChange={(e) => setJobFilters({ ...jobFilters, title: e.target.value })}
                          placeholder={lang === 'id' ? "Filter jabatan..." : "Filter job..."}
                        />
                      </th>
                    )}
                    {visibleColumns.jobs.includes('grade') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={jobFilters.grade}
                          onChange={(e) => setJobFilters({ ...jobFilters, grade: e.target.value })}
                          placeholder={lang === 'id' ? "Filter grade..." : "Filter grade..."}
                        />
                      </th>
                    )}
                    {visibleColumns.jobs.includes('status') && (
                      <th>
                        <div className="table-dropdown-container">
                          <button
                            type="button"
                            className={`table-dropdown-trigger ${activeDropdown === 'jobStatus' ? 'open' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === 'jobStatus' ? null : 'jobStatus');
                            }}
                          >
                            <span>
                              {jobFilters.status === '1' ? t.active : jobFilters.status === '0' ? t.inactive : t.all}
                            </span>
                            <ChevronDownIcon />
                          </button>
                          {activeDropdown === 'jobStatus' && (
                            <ul className="table-dropdown-menu">
                              {[
                                { value: '', label: t.all },
                                { value: '1', label: t.active },
                                { value: '0', label: t.inactive }
                              ].map((opt) => (
                                <li
                                  key={opt.value}
                                  className={jobFilters.status === opt.value ? 'active' : ''}
                                  onClick={() => {
                                    setJobFilters({ ...jobFilters, status: opt.value });
                                    setActiveDropdown(null);
                                  }}
                                >
                                  {opt.label}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </th>
                    )}
                    {visibleColumns.jobs.includes('actions') && (
                      <th>
                        {isJobFiltered && (
                          <button
                            type="button"
                            className="clear-filters-btn"
                            onClick={() => setJobFilters({ id: '', title: '', grade: '', status: '' })}
                            title={t.resetFilter}
                          >
                            <ResetIcon />
                          </button>
                        )}
                      </th>
                    )}
                  </tr>
                </>
              )}

              {/* Header Kolom Kehadiran */}
              {activeTab === 'attendance' && (
                <>
                  <tr>
                    {visibleColumns.attendance.includes('id') && <th onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.attendance.includes('date') && <th onClick={() => handleSort('date')}>{t.date} {sortBy === 'date' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.attendance.includes('employee') && <th>{t.employee}</th>}
                    {visibleColumns.attendance.includes('clockInTime') && <th>{t.clockInTime}</th>}
                    {visibleColumns.attendance.includes('clockInStatus') && <th>{t.clockInStatus}</th>}
                    {visibleColumns.attendance.includes('clockOutTime') && <th>{t.clockOutTime}</th>}
                    {visibleColumns.attendance.includes('clockOutStatus') && <th>{t.clockOutStatus}</th>}
                    {visibleColumns.attendance.includes('notes') && <th>{t.notes}</th>}
                  </tr>
                  <tr className="table-filter-row">
                    {visibleColumns.attendance.includes('id') && <th></th>}
                    {visibleColumns.attendance.includes('date') && (
                      <th>
                        <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                          <input
                            type="date"
                            className="table-filter-input"
                            value={attendanceFilters.startDate}
                            onChange={(e) => setAttendanceFilters({ ...attendanceFilters, startDate: e.target.value })}
                            placeholder="Start"
                          />
                          <input
                            type="date"
                            className="table-filter-input"
                            value={attendanceFilters.endDate}
                            onChange={(e) => setAttendanceFilters({ ...attendanceFilters, endDate: e.target.value })}
                            placeholder="End"
                          />
                        </div>
                      </th>
                    )}
                    {visibleColumns.attendance.includes('employee') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={attendanceFilters.employeeId}
                          onChange={(e) => setAttendanceFilters({ ...attendanceFilters, employeeId: e.target.value })}
                          placeholder="Emp ID..."
                        />
                      </th>
                    )}
                    {visibleColumns.attendance.includes('clockInTime') && <th></th>}
                    {visibleColumns.attendance.includes('clockInStatus') && <th></th>}
                    {visibleColumns.attendance.includes('clockOutTime') && <th></th>}
                    {visibleColumns.attendance.includes('clockOutStatus') && <th></th>}
                    {visibleColumns.attendance.includes('notes') && (
                      <th>
                        {isAttendanceFiltered && (
                          <button
                            type="button"
                            className="clear-filters-btn"
                            onClick={() => setAttendanceFilters({ employeeId: '', startDate: '', endDate: '' })}
                            title={t.resetFilter}
                          >
                            <ResetIcon />
                          </button>
                        )}
                      </th>
                    )}
                  </tr>
                </>
              )}

              {/* Header Kolom Geofence */}
              {activeTab === 'geofence' && (
                <>
                  <tr>
                    {visibleColumns.geofence.includes('id') && <th onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.geofence.includes('officeName') && <th onClick={() => handleSort('name')}>{t.officeName} {sortBy === 'name' && (sortDir === 'asc' ? '▲' : '▼')}</th>}
                    {visibleColumns.geofence.includes('latitude') && <th>{t.latitude}</th>}
                    {visibleColumns.geofence.includes('longitude') && <th>{t.longitude}</th>}
                    {visibleColumns.geofence.includes('radius') && <th>{t.radius}</th>}
                    {visibleColumns.geofence.includes('status') && <th>{t.statusActive}</th>}
                    {visibleColumns.geofence.includes('actions') && <th>{t.actions}</th>}
                  </tr>
                  <tr className="table-filter-row">
                    {visibleColumns.geofence.includes('id') && <th></th>}
                    {visibleColumns.geofence.includes('officeName') && (
                      <th>
                        <input
                          type="text"
                          className="table-filter-input"
                          value={geofenceFilters.name}
                          onChange={(e) => setGeofenceFilters({ ...geofenceFilters, name: e.target.value })}
                          placeholder="Filter name..."
                        />
                      </th>
                    )}
                    {visibleColumns.geofence.includes('latitude') && <th></th>}
                    {visibleColumns.geofence.includes('longitude') && <th></th>}
                    {visibleColumns.geofence.includes('radius') && <th></th>}
                    {visibleColumns.geofence.includes('status') && <th></th>}
                    {visibleColumns.geofence.includes('actions') && (
                      <th>
                        {isGeofenceFiltered && (
                          <button
                            type="button"
                            className="clear-filters-btn"
                            onClick={() => setGeofenceFilters({ name: '' })}
                            title={t.resetFilter}
                          >
                            <ResetIcon />
                          </button>
                        )}
                      </th>
                    )}
                  </tr>
                </>
              )}
            </thead>
            <tbody>
              {/* Loop Baris Karyawan */}
              {activeTab === 'employees' && employees.map((emp) => (
                <tr key={emp.id}>
                  {visibleColumns.employees.includes('id') && <td>{emp.id}</td>}
                  {visibleColumns.employees.includes('nik') && <td className="bold">{emp.employeeNumber}</td>}
                  {visibleColumns.employees.includes('fullName') && <td>{emp.fullName}</td>}
                  {visibleColumns.employees.includes('email') && <td>{emp.email}</td>}
                  {visibleColumns.employees.includes('phoneNumber') && <td>{emp.phoneNumber || '-'}</td>}
                  {visibleColumns.employees.includes('departmentName') && (
                    <td>
                      <span className="tag-dept">{emp.departmentName}</span>
                    </td>
                  )}
                  {visibleColumns.employees.includes('jobTitle') && (
                    <td>
                      {emp.jobTitle} <span className="text-muted">({emp.jobGrade})</span>
                    </td>
                  )}
                  {visibleColumns.employees.includes('joinedAt') && <td>{emp.joinedAt}</td>}
                  {visibleColumns.employees.includes('status') && (
                    <td>
                      <span className={emp.status === 1 ? 'tag-status-active' : 'tag-status-inactive'}>
                        {emp.status === 1 ? t.active : t.inactive}
                      </span>
                    </td>
                  )}
                  {visibleColumns.employees.includes('actions') && (
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit-btn" onClick={() => openEditModal(emp)} title={lang === 'id' ? 'Ubah Data' : 'Edit Data'}><EditIcon /></button>
                        <button className="action-btn delete-btn" onClick={() => confirmDelete(emp.id)} title={lang === 'id' ? 'Hapus Data' : 'Delete Data'}><TrashIcon /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {/* Loop Baris Departemen */}
              {activeTab === 'departments' && departments.map((dept) => (
                <tr key={dept.id}>
                  {visibleColumns.departments.includes('id') && <td>{dept.id}</td>}
                  {visibleColumns.departments.includes('name') && <td className="bold">{dept.name}</td>}
                  {visibleColumns.departments.includes('code') && (
                    <td>
                      <span className="tag-code">{dept.code}</span>
                    </td>
                  )}
                  {visibleColumns.departments.includes('status') && (
                    <td>
                      <span className={dept.status === 1 ? 'tag-status-active' : 'tag-status-inactive'}>
                        {dept.status === 1 ? t.active : t.inactive}
                      </span>
                    </td>
                  )}
                  {visibleColumns.departments.includes('actions') && (
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit-btn" onClick={() => openEditModal(dept)} title={lang === 'id' ? 'Ubah Data' : 'Edit Data'}><EditIcon /></button>
                        <button className="action-btn delete-btn" onClick={() => confirmDelete(dept.id)} title={lang === 'id' ? 'Hapus Data' : 'Delete Data'}><TrashIcon /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {/* Loop Baris Jabatan */}
              {activeTab === 'jobs' && jobs.map((job) => (
                <tr key={job.id}>
                  {visibleColumns.jobs.includes('id') && <td>{job.id}</td>}
                  {visibleColumns.jobs.includes('title') && <td className="bold">{job.title}</td>}
                  {visibleColumns.jobs.includes('grade') && (
                    <td>
                      <span className="tag-grade">{job.grade}</span>
                    </td>
                  )}
                  {visibleColumns.jobs.includes('status') && (
                    <td>
                      <span className={job.status === 1 ? 'tag-status-active' : 'tag-status-inactive'}>
                        {job.status === 1 ? t.active : t.inactive}
                      </span>
                    </td>
                  )}
                  {visibleColumns.jobs.includes('actions') && (
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit-btn" onClick={() => openEditModal(job)} title={lang === 'id' ? 'Ubah Data' : 'Edit Data'}><EditIcon /></button>
                        <button className="action-btn delete-btn" onClick={() => confirmDelete(job.id)} title={lang === 'id' ? 'Hapus Data' : 'Delete Data'}><TrashIcon /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {/* Loop Baris Kehadiran */}
              {activeTab === 'attendance' && attendances.map((att) => (
                <tr key={att.id}>
                  {visibleColumns.attendance.includes('id') && <td>{att.id}</td>}
                  {visibleColumns.attendance.includes('date') && <td>{att.date}</td>}
                  {visibleColumns.attendance.includes('employee') && (
                    <td>{employeeMap[att.employeeId] || `ID: ${att.employeeId}`}</td>
                  )}
                  {visibleColumns.attendance.includes('clockInTime') && <td>{att.clockIn || '-'}</td>}
                  {visibleColumns.attendance.includes('clockInStatus') && (
                    <td>
                      {att.clockInStatus ? (
                        <span className={att.clockInStatus === 'ON_TIME' ? 'tag-status-active' : 'tag-status-inactive'} style={att.clockInStatus !== 'ON_TIME' ? { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' } : {}}>
                          {att.clockInStatus}
                        </span>
                      ) : '-'}
                    </td>
                  )}
                  {visibleColumns.attendance.includes('clockOutTime') && <td>{att.clockOut || '-'}</td>}
                  {visibleColumns.attendance.includes('clockOutStatus') && (
                    <td>
                      {att.clockOutStatus ? (
                        <span className={att.clockOutStatus === 'ON_TIME' ? 'tag-status-active' : 'tag-status-inactive'} style={att.clockOutStatus !== 'ON_TIME' ? { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' } : {}}>
                          {att.clockOutStatus}
                        </span>
                      ) : '-'}
                    </td>
                  )}
                  {visibleColumns.attendance.includes('notes') && <td>{att.notes || '-'}</td>}
                </tr>
              ))}

              {/* Loop Baris Geofence */}
              {activeTab === 'geofence' && geofences.map((geo) => (
                <tr key={geo.id}>
                  {visibleColumns.geofence.includes('id') && <td>{geo.id}</td>}
                  {visibleColumns.geofence.includes('officeName') && <td className="bold">{geo.name}</td>}
                  {visibleColumns.geofence.includes('latitude') && <td>{geo.latitude}</td>}
                  {visibleColumns.geofence.includes('longitude') && <td>{geo.longitude}</td>}
                  {visibleColumns.geofence.includes('radius') && <td>{geo.radiusMeter} m</td>}
                  {visibleColumns.geofence.includes('status') && (
                    <td>
                      <span className={geo.isActive ? 'tag-status-active' : 'tag-status-inactive'}>
                        {geo.isActive ? t.active : t.inactive}
                      </span>
                    </td>
                  )}
                  {visibleColumns.geofence.includes('actions') && (
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit-btn" onClick={() => openEditModal(geo)} title={lang === 'id' ? 'Ubah Data' : 'Edit Data'}><EditIcon /></button>
                        <button className="action-btn delete-btn" onClick={() => confirmDelete(geo.id)} title={lang === 'id' ? 'Hapus Data' : 'Delete Data'}><TrashIcon /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {((activeTab === 'employees' && employees.length === 0) ||
                (activeTab === 'departments' && departments.length === 0) ||
                (activeTab === 'jobs' && jobs.length === 0) ||
                (activeTab === 'attendance' && attendances.length === 0) ||
                (activeTab === 'geofence' && geofences.length === 0)) && (
                  <tr>
                    <td colSpan={visibleColumns[activeTab].length} className="empty-row">
                      {t.noData}
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
              {lang === 'id' ? (
                <>Menampilkan Halaman <strong>{pagination.page + 1}</strong> dari <strong>{pagination.totalPages || 1}</strong> ({pagination.totalElements} data)</>
              ) : (
                <>Showing Page <strong>{pagination.page + 1}</strong> of <strong>{pagination.totalPages || 1}</strong> ({pagination.totalElements} records)</>
              )}
            </div>
            <div className="pagination-actions">
              <button
                className="btn-secondary"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                {lang === 'id' ? '◀ Sebelumnya' : '◀ Previous'}
              </button>
              <button
                className="btn-secondary"
                disabled={pagination.isLast || pagination.totalPages <= currentPage + 1}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                {lang === 'id' ? 'Berikutnya ▶' : 'Next ▶'}
              </button>
              {/* Dropdown Ukuran/Batas Baris per Halaman (Desain Kustom Modern) */}
              <div className="custom-dropdown-container">
                <button
                  type="button"
                  className={`custom-dropdown-trigger ${activeDropdown === 'pageSize' ? 'open' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'pageSize' ? null : 'pageSize');
                  }}
                  title={lang === 'id' ? "Pilih jumlah baris data per halaman" : "Select number of records per page"}
                >
                  <span>{lang === 'id' ? `${pageSize} data / hal` : `${pageSize} records / page`}</span>
                  <ChevronDownIcon />
                </button>
                {activeDropdown === 'pageSize' && (
                  <ul className="custom-dropdown-menu">
                    {[5, 10, 20].map((size) => (
                      <li
                        key={size}
                        className={pageSize === size ? 'active' : ''}
                        onClick={() => {
                          setPageSize(size);
                          setCurrentPage(0);
                          setActiveDropdown(null);
                        }}
                      >
                        {lang === 'id' ? `${size} data / hal` : `${size} records / page`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* 6. MODAL FORM DIALOG (Tambah / Edit Data) */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h2>
                {editingId ? (lang === 'id' ? 'Edit' : 'Edit') : (lang === 'id' ? 'Tambah' : 'Add')}{' '}
                {modalType === 'employee'
                  ? t.employees
                  : modalType === 'department'
                  ? t.departments
                  : modalType === 'job'
                  ? t.jobs
                  : t.geofence}
              </h2>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Form Khusus Karyawan */}
              {modalType === 'employee' && (
                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">{t.nik}</label>
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
                    <label className="form-label">{t.fullName}</label>
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
                    <label className="form-label">{t.email}</label>
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
                    <label className="form-label">{t.phoneNumber}</label>
                    <input
                      type="text"
                      className="custom-input"
                      value={empForm.phoneNumber}
                      onChange={(e) => setEmpForm({ ...empForm, phoneNumber: e.target.value })}
                      placeholder="e.g. 08123456789"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.departments}</label>
                    <select
                      className="custom-input"
                      value={empForm.departmentId}
                      onChange={(e) => setEmpForm({ ...empForm, departmentId: e.target.value })}
                      required
                    >
                      <option value="">{t.selectDept}</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.jobs} (Grade)</label>
                    <select
                      className="custom-input"
                      value={empForm.jobId}
                      onChange={(e) => setEmpForm({ ...empForm, jobId: e.target.value })}
                      required
                    >
                      <option value="">{t.selectJob}</option>
                      {jobs.map(j => (
                        <option key={j.id} value={j.id}>{j.title} ({j.grade})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.joinedDate}</label>
                    <input
                      type="date"
                      className="custom-input"
                      value={empForm.joinedAt}
                      onChange={(e) => setEmpForm({ ...empForm, joinedAt: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.statusActive}</label>
                    <select
                      className="custom-input"
                      value={empForm.status}
                      onChange={(e) => setEmpForm({ ...empForm, status: parseInt(e.target.value) })}
                      required
                    >
                      <option value={1}>{t.active}</option>
                      <option value={0}>{t.inactive}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Form Khusus Departemen */}
              {modalType === 'department' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t.deptName}</label>
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
                    <label className="form-label">{t.shortcutCode}</label>
                    <input
                      type="text"
                      className="custom-input"
                      value={deptForm.code}
                      onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                      placeholder="e.g. IT"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.statusActive}</label>
                    <select
                      className="custom-input"
                      value={deptForm.status}
                      onChange={(e) => setDeptForm({ ...deptForm, status: parseInt(e.target.value) })}
                      required
                    >
                      <option value={1}>{t.active}</option>
                      <option value={0}>{t.inactive}</option>
                    </select>
                  </div>
                </>
              )}

              {/* Form Khusus Jabatan */}
              {modalType === 'job' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t.jobTitle}</label>
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
                    <label className="form-label">{t.grade}</label>
                    <input
                      type="text"
                      className="custom-input"
                      value={jobForm.grade}
                      onChange={(e) => setJobForm({ ...jobForm, grade: e.target.value })}
                      placeholder="e.g. SE3"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.statusActive}</label>
                    <select
                      className="custom-input"
                      value={jobForm.status}
                      onChange={(e) => setJobForm({ ...jobForm, status: parseInt(e.target.value) })}
                      required
                    >
                      <option value={1}>{t.active}</option>
                      <option value={0}>{t.inactive}</option>
                    </select>
                  </div>
                </>
              )}

              {/* Form Khusus Geofence */}
              {modalType === 'geofence' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t.officeName}</label>
                    <input
                      type="text"
                      className="custom-input"
                      value={geofenceForm.name}
                      onChange={(e) => setGeofenceForm({ ...geofenceForm, name: e.target.value })}
                      placeholder="e.g. Kantor Pusat Jakarta"
                      required
                    />
                  </div>
                  <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">{t.latitude}</label>
                      <input
                        type="number"
                        step="any"
                        className="custom-input"
                        value={geofenceForm.latitude}
                        onChange={(e) => setGeofenceForm({ ...geofenceForm, latitude: e.target.value })}
                        placeholder="e.g. -6.200000"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t.longitude}</label>
                      <input
                        type="number"
                        step="any"
                        className="custom-input"
                        value={geofenceForm.longitude}
                        onChange={(e) => setGeofenceForm({ ...geofenceForm, longitude: e.target.value })}
                        placeholder="e.g. 106.816666"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">{t.radius} (meter)</label>
                      <input
                        type="number"
                        className="custom-input"
                        value={geofenceForm.radiusMeter}
                        onChange={(e) => setGeofenceForm({ ...geofenceForm, radiusMeter: e.target.value })}
                        placeholder="e.g. 100"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t.statusActive}</label>
                      <select
                        className="custom-input"
                        value={geofenceForm.isActive ? 'true' : 'false'}
                        onChange={(e) => setGeofenceForm({ ...geofenceForm, isActive: e.target.value === 'true' })}
                        required
                      >
                        <option value="true">{t.active}</option>
                        <option value="false">{t.inactive}</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setGeofenceForm({
                              ...geofenceForm,
                              latitude: position.coords.latitude.toString(),
                              longitude: position.coords.longitude.toString()
                            });
                          },
                          (error) => {
                            setErrorMsg(lang === 'id' ? `Gagal mengambil lokasi: ${error.message}` : `Failed to get location: ${error.message}`);
                          }
                        );
                      } else {
                        setErrorMsg(lang === 'id' ? 'Geolocation tidak didukung oleh browser ini.' : 'Geolocation is not supported by this browser.');
                      }
                    }}
                    style={{ width: '100%', marginTop: '16px', padding: '10px', fontSize: '13px' }}
                  >
                    📍 {lang === 'id' ? 'Gunakan Lokasi Saya Saat Ini' : 'Use My Current Location'}
                  </button>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>{t.cancel}</button>
                <button type="submit" className="btn-primary">{t.save}</button>
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
              <h3>{t.deleteConfirm}</h3>
              <p>{t.deleteConfirmText}</p>
              <span className="confirm-subtext">{t.deleteWarningText}</span>
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
                {t.cancel}
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={executeDelete}
              >
                {t.delete}
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
              <h3>{lang === 'id' ? 'Konfirmasi Keluar' : 'Confirm Logout'}</h3>
              <p>{lang === 'id' ? 'Apakah Anda benar-benar yakin ingin keluar dari sesi admin saat ini?' : 'Are you absolutely sure you want to log out from the current admin session?'}</p>
              <span className="confirm-subtext">{lang === 'id' ? 'Anda perlu login kembali untuk mengakses data dashboard.' : 'You will need to log in again to access the dashboard data.'}</span>
            </div>
            <div className="modal-actions confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsLogoutConfirmOpen(false)}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={onLogout}
              >
                {lang === 'id' ? 'Ya, Keluar' : 'Yes, Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
