import React, { useState, useEffect } from 'react';
import './MasterDashboard.css';
import { apiRequest } from '../utils/api';
import { Language } from '../utils/i18n';

interface Tenant {
  id: number;
  companyName: string;
  subdomain: string;
  ownerName: string;
  ownerEmail: string;
  plan: string;
  status: number;
  joinedAt: string;
  expiryDate: string;
  maxEmployees: number;
  activeEmployeeCount: number;
  adminCount: number;
  hrCount: number;
  financeCount: number;
  staffCount: number;
}

interface MasterDashboardProps {
  actorEmail: string;
  onLogout: () => void;
  lang: Language;
  changeLang: (l: Language) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
}

const masterTranslations = {
  id: {
    title: 'SaaS Master Admin Portal',
    subTitle: 'Kelola penyewa (tenant), kuota karyawan, tagihan, dan inisialisasi akun klien.',
    totalTenants: 'Total Perusahaan',
    activeTenants: 'Perusahaan Aktif',
    totalUsers: 'Total Pegawai SaaS',
    estRevenue: 'Estimasi Pendapatan Bulanan',
    registerNew: 'Daftarkan Tenant Baru',
    searchPlaceholder: 'Cari perusahaan atau subdomain...',
    colCompany: 'Perusahaan / Subdomain',
    colOwner: 'Kontak Administrator',
    colPlan: 'Paket',
    colEmployees: 'Karyawan / Batas',
    colExpiry: 'Masa Berlaku',
    colStatus: 'Status',
    colActions: 'Aksi',
    btnAlert: 'Kirim Tagihan',
    alertSuccess: 'Notifikasi tagihan berhasil dikirim ke pemilik tenant!',
    modalTitle: 'Pendaftaran Tenant Baru & Delegasi Akun',
    modalSub: 'Masukkan data perusahaan baru beserta akun perwakilan awal untuk Admin, HR, dan Finance.',
    companyName: 'Nama Legal Perusahaan',
    subdomain: 'Subdomain Perusahaan',
    planType: 'Tipe Paket Layanan',
    maxEmployees: 'Batas Karyawan',
    adminSection: 'Utusan 1: Administrator (Owner)',
    hrSection: 'Utusan 2: HR Admin (Opsional)',
    finSection: 'Utusan 3: Finance Admin (Opsional)',
    fullName: 'Nama Lengkap',
    email: 'Email Kerja',
    btnCancel: 'Batal',
    btnSubmit: 'Simpan & Seeding Data',
    saveSuccess: 'Tenant berhasil terdaftar! Default settings, departments, dan 3 akun utusan berhasil dibuat.',
    logout: 'Keluar',
  },
  en: {
    title: 'SaaS Master Admin Portal',
    subTitle: 'Manage tenants, employee quotas, billing, and initialize client delegate accounts.',
    totalTenants: 'Total Companies',
    activeTenants: 'Active Companies',
    totalUsers: 'Total SaaS Employees',
    estRevenue: 'Est. Monthly Revenue',
    registerNew: 'Register New Tenant',
    searchPlaceholder: 'Search company or subdomain...',
    colCompany: 'Company / Subdomain',
    colOwner: 'Administrator Contact',
    colPlan: 'Plan',
    colEmployees: 'Employees / Limit',
    colExpiry: 'Expiry Date',
    colStatus: 'Status',
    colActions: 'Actions',
    btnAlert: 'Send Invoice Alert',
    alertSuccess: 'Billing alert email sent successfully to the tenant owner!',
    modalTitle: 'New Tenant Registration & Delegate Accounts',
    modalSub: 'Enter the new company profile and delegate initial admin roles for Admin, HR, and Finance.',
    companyName: 'Company Legal Name',
    subdomain: 'Company Subdomain',
    planType: 'Service Plan Type',
    maxEmployees: 'Max Employee Limit',
    adminSection: 'Delegate 1: Administrator (Owner)',
    hrSection: 'Delegate 2: HR Admin (Optional)',
    finSection: 'Delegate 3: Finance Admin (Optional)',
    fullName: 'Full Name',
    email: 'Work Email',
    btnCancel: 'Cancel',
    btnSubmit: 'Save & Seed Data',
    saveSuccess: 'Tenant registered successfully! Default settings, departments, and 3 delegate accounts initialized.',
    logout: 'Logout',
  }
};

export const MasterDashboard: React.FC<MasterDashboardProps> = ({
  actorEmail,
  onLogout,
  lang,
  changeLang,
  theme,
  setTheme
}) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [subdomain, setSubdomain] = useState<string>('');
  const [plan, setPlan] = useState<string>('TRIAL');
  
  // Delegates
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerEmail, setOwnerEmail] = useState<string>('');
  const [hrName, setHrName] = useState<string>('');
  const [hrEmail, setHrEmail] = useState<string>('');
  const [financeName, setFinanceName] = useState<string>('');
  const [financeEmail, setFinanceEmail] = useState<string>('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);

  const t = masterTranslations[lang];

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ data: Tenant[] }>('/tenants');
      if (res && res.data) {
        setTenants(res.data);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSendAlert = async (id: number) => {
    try {
      await apiRequest(`/tenants/${id}/alert`, { method: 'POST' });
      showNotification('success', t.alertSuccess);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to trigger alert');
    }
  };

  const handleRegisterTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        companyName,
        subdomain: subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
        ownerName,
        ownerEmail,
        hrName: hrName.trim() ? hrName : null,
        hrEmail: hrEmail.trim() ? hrEmail : null,
        financeName: financeName.trim() ? financeName : null,
        financeEmail: financeEmail.trim() ? financeEmail : null
      };

      await apiRequest('/tenants/register', {
        method: 'POST',
        body: payload
      });

      showNotification('success', t.saveSuccess);
      setIsModalOpen(false);
      
      // Reset form
      setCompanyName('');
      setSubdomain('');
      setPlan('TRIAL');
      setOwnerName('');
      setOwnerEmail('');
      setHrName('');
      setHrEmail('');
      setFinanceName('');
      setFinanceEmail('');
      
      fetchTenants();
    } catch (err: any) {
      showNotification('error', err.message || 'Registration failed');
    }
  };

  // Stats calculation
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(tenant => tenant.status === 1).length;
  const totalEmployees = tenants.reduce((acc, curr) => acc + curr.activeEmployeeCount, 0);
  
  // Role-Based Pricing Rates
  const PRICE_ADMIN = 30;
  const PRICE_FINANCE = 25;
  const PRICE_HR = 15;
  const PRICE_STAFF = 2;

  // Dynamic Role-Based Revenue calculation
  const estRevenue = tenants.reduce((acc, curr) => {
    if (curr.status !== 1) return acc; // Hanya tenant aktif yang menghasilkan revenue
    const tenantRevenue = 
      ((curr.adminCount || 0) * PRICE_ADMIN) +
      ((curr.financeCount || 0) * PRICE_FINANCE) +
      ((curr.hrCount || 0) * PRICE_HR) +
      ((curr.staffCount || 0) * PRICE_STAFF);
    return acc + tenantRevenue;
  }, 0);

  const filteredTenants = tenants.filter(t => 
    t.companyName.toLowerCase().includes(search.toLowerCase()) ||
    t.subdomain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="master-container">
      {/* Navbar */}
      <nav className="master-nav glass-panel">
        <div className="nav-brand">
          <div className="nav-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="nav-title">
            <h1>{t.title}</h1>
            <p>{t.subTitle}</p>
          </div>
        </div>

        <div className="nav-controls">
          <button 
            className="btn-theme" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="lang-selector">
            <button className={lang === 'id' ? 'active' : ''} onClick={() => changeLang('id')}>ID</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => changeLang('en')}>EN</button>
          </div>
          <div className="user-profile">
            <span>{actorEmail}</span>
            <button className="btn-logout" onClick={() => setIsLogoutConfirmOpen(true)}>{t.logout}</button>
          </div>
        </div>
      </nav>

      {/* Notifications */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="toast-icon">
            {notification.type === 'success' ? '✓' : '✗'}
          </div>
          <div className="toast-text">{notification.message}</div>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="stats-row">
        <div className="stat-card glass-panel gradient-border">
          <div className="stat-icon purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{t.totalTenants}</h3>
            <h2>{totalTenants}</h2>
          </div>
        </div>

        <div className="stat-card glass-panel gradient-border">
          <div className="stat-icon green">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{t.activeTenants}</h3>
            <h2>{activeTenants}</h2>
          </div>
        </div>

        <div className="stat-card glass-panel gradient-border">
          <div className="stat-icon blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{t.totalUsers}</h3>
            <h2>{totalEmployees}</h2>
          </div>
        </div>

        <div className="stat-card glass-panel gradient-border">
          <div className="stat-icon gold">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{t.estRevenue}</h3>
            <h2>${estRevenue} /mo</h2>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="master-panel glass-panel">
        <div className="panel-header">
          <div className="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <button className="btn-add-tenant" onClick={() => setIsModalOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {t.registerNew}
          </button>
        </div>

        {/* Table Grid */}
        <div className="table-responsive">
          {loading ? (
            <div className="loader-box">
              <div className="master-spinner"></div>
            </div>
          ) : (
            <table className="master-table">
              <thead>
                <tr>
                  <th>{t.colCompany}</th>
                  <th>{t.colOwner}</th>
                  <th>{t.colPlan}</th>
                  <th>{t.colEmployees}</th>
                  <th>{t.colExpiry}</th>
                  <th>{t.colStatus}</th>
                  <th>{t.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                      {lang === 'id' ? 'Tidak ada data tenant ditemukan.' : 'No tenant data found.'}
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td>
                        <div className="company-cell">
                          <span className="c-name">{tenant.companyName}</span>
                          <span className="c-subdomain">{tenant.subdomain}.hrms.com</span>
                        </div>
                      </td>
                      <td>
                        <div className="owner-cell">
                          <span className="o-name">{tenant.ownerName}</span>
                          <span className="o-email">{tenant.ownerEmail}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`plan-badge ${tenant.plan.toLowerCase()}`}>
                          {tenant.plan}
                        </span>
                      </td>
                      <td>
                        <div className="emp-count-cell">
                          <strong>{tenant.activeEmployeeCount}</strong>
                          <span>/ {tenant.maxEmployees} Limit</span>
                          <span className="role-breakdown">
                            Admin: {tenant.adminCount || 0} | HR: {tenant.hrCount || 0} | Fin: {tenant.financeCount || 0} | Staff: {tenant.staffCount || 0}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="expiry-text">
                          {new Date(tenant.expiryDate).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${tenant.status === 1 ? 'active' : 'inactive'}`}>
                          {tenant.status === 1 ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td>
                        <button className="btn-table-alert" onClick={() => handleSendAlert(tenant.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                          {t.btnAlert}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Register Tenant Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel gradient-border">
            <div className="modal-header">
              <div>
                <h2>{t.modalTitle}</h2>
                <p>{t.modalSub}</p>
              </div>
              <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleRegisterTenant} className="modal-form">
              <div className="modal-grid">
                
                {/* Section: Company Profile */}
                <div className="form-column">
                  <h3 className="section-title">🏢 Profil Perusahaan</h3>
                  
                  <div className="form-group">
                    <label>{t.companyName}</label>
                    <input 
                      type="text" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)} 
                      placeholder="e.g. PT. Indonesia Makmur"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>{t.subdomain}</label>
                    <div className="subdomain-input-group">
                      <input 
                        type="text" 
                        value={subdomain} 
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                        placeholder="e.g. indonesia-makmur"
                        required 
                      />
                      <span>.hrms.com</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t.planType}</label>
                    <select value={plan} onChange={(e) => setPlan(e.target.value)}>
                      <option value="TRIAL">TRIAL (30 Days, 50 Users)</option>
                      <option value="PROFESSIONAL">PROFESSIONAL (100 Users)</option>
                      <option value="ENTERPRISE">ENTERPRISE (200 Users)</option>
                    </select>
                  </div>
                </div>

                {/* Section: Delegates */}
                <div className="form-column">
                  <h3 className="section-title">👥 Utusan & Delegasi Peran</h3>
                  
                  {/* Delegate 1: Admin */}
                  <div className="delegate-block">
                    <h4>{t.adminSection}</h4>
                    <div className="form-row">
                      <input 
                        type="text" 
                        placeholder={t.fullName}
                        value={ownerName} 
                        onChange={(e) => setOwnerName(e.target.value)} 
                        required 
                      />
                      <input 
                        type="email" 
                        placeholder={t.email}
                        value={ownerEmail} 
                        onChange={(e) => setOwnerEmail(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  {/* Delegate 2: HR */}
                  <div className="delegate-block">
                    <h4>{t.hrSection}</h4>
                    <div className="form-row">
                      <input 
                        type="text" 
                        placeholder={t.fullName}
                        value={hrName} 
                        onChange={(e) => setHrName(e.target.value)} 
                      />
                      <input 
                        type="email" 
                        placeholder={t.email}
                        value={hrEmail} 
                        onChange={(e) => setHrEmail(e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* Delegate 3: Finance */}
                  <div className="delegate-block">
                    <h4>{t.finSection}</h4>
                    <div className="form-row">
                      <input 
                        type="text" 
                        placeholder={t.fullName}
                        value={financeName} 
                        onChange={(e) => setFinanceName(e.target.value)} 
                      />
                      <input 
                        type="email" 
                        placeholder={t.email}
                        value={financeEmail} 
                        onChange={(e) => setFinanceEmail(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  {t.btnCancel}
                </button>
                <button type="submit" className="btn-submit">
                  {t.btnSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG KONFIRMASI LOGOUT KUSTOM */}
      {isLogoutConfirmOpen && (
        <div className="modal-backdrop">
          <div className="modal-content confirm-modal glass-panel">
            <div className="confirm-icon-wrapper confirm-warning-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--error)' }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <div className="confirm-body">
              <h3>{lang === 'id' ? 'Konfirmasi Keluar' : 'Confirm Logout'}</h3>
              <p>{lang === 'id' ? 'Apakah Anda benar-benar yakin ingin keluar dari sesi master admin saat ini?' : 'Are you absolutely sure you want to log out from the current master admin session?'}</p>
              <span className="confirm-subtext">{lang === 'id' ? 'Anda perlu login kembali untuk mengakses data master dashboard.' : 'You will need to log in again to access the master dashboard data.'}</span>
            </div>
            <div className="modal-actions confirm-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setIsLogoutConfirmOpen(false)}
              >
                {lang === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                className="btn-submit"
                style={{ backgroundColor: 'var(--error)' }}
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
