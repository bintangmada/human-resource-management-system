import React, { useState, useEffect } from 'react';
import { ApiResponse, SalarySettingResponse, PayrollResponse, EmployeeResponse } from '../types';
import { translations } from '../utils/i18n';

interface PayrollManagementProps {
  tenantId: string;
  actorEmail: string;
  lang: 'id' | 'en';
  theme: 'light' | 'dark';
}

export default function PayrollManagement({ tenantId, actorEmail, lang, theme }: PayrollManagementProps) {
  const t = translations[lang];

  // Tabs: 'settings' | 'process' | 'list' | 'my-payslips'
  const [activeTab, setActiveTab] = useState<'settings' | 'process' | 'list' | 'my-payslips'>('list');

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data states
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [salarySettings, setSalarySettings] = useState<SalarySettingResponse[]>([]);
  const [payrolls, setPayrolls] = useState<PayrollResponse[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollResponse | null>(null);

  // Forms states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
  const [baseSalary, setBaseSalary] = useState('');
  const [allowanceFood, setAllowanceFood] = useState('');
  const [allowanceTransport, setAllowanceTransport] = useState('');
  const [allowanceCommunication, setAllowanceCommunication] = useState('');
  const [bpjsEnabled, setBpjsEnabled] = useState(true);
  const [npwp, setNpwp] = useState('');
  const [ptkpStatus, setPtkpStatus] = useState('TK/0');

  // Payroll processing form
  const [processEmployeeId, setProcessEmployeeId] = useState<number | ''>('');
  const [processMonth, setProcessMonth] = useState<number>(new Date().getMonth() + 1);
  const [processYear, setProcessYear] = useState<number>(new Date().getFullYear());
  const [bonus, setBonus] = useState('');
  const [lateDeductions, setLateDeductions] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');

  // Modals
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  const API_BASE = 'http://localhost:8020/api/v1';

  // Load Initial Data
  useEffect(() => {
    fetchEmployees();
    fetchSalarySettings();
    fetchPayrolls();
  }, [tenantId]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        headers: {
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<EmployeeResponse[]> = await res.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchSalarySettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/payroll/settings`, {
        headers: {
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<SalarySettingResponse[]> = await res.json();
      if (data.success) {
        setSalarySettings(data.data);
      }
    } catch (err) {
      console.error('Error fetching salary settings:', err);
    }
  };

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payroll/all?size=100`, {
        headers: {
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<{ content: PayrollResponse[] }> = await res.json();
      // Spring Data Page yields data.data.content or direct content
      if (data.success) {
        // Handle both raw Page list and content wrapping
        const content = (data.data as any).content || data.data;
        setPayrolls(Array.isArray(content) ? content : []);
      }
    } catch (err) {
      console.error('Error fetching payrolls:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open setting form for creation/editing
  const openSettingModal = (setting?: SalarySettingResponse) => {
    if (setting) {
      setSelectedEmployeeId(setting.employeeId);
      setBaseSalary(setting.baseSalary.toString());
      setAllowanceFood(setting.allowanceFood.toString());
      setAllowanceTransport(setting.allowanceTransport.toString());
      setAllowanceCommunication(setting.allowanceCommunication.toString());
      setBpjsEnabled(setting.bpjsEnabled);
      setNpwp(setting.npwp || '');
      setPtkpStatus(setting.ptkpStatus);
    } else {
      setSelectedEmployeeId('');
      setBaseSalary('');
      setAllowanceFood('0');
      setAllowanceTransport('0');
      setAllowanceCommunication('0');
      setBpjsEnabled(true);
      setNpwp('');
      setPtkpStatus('TK/0');
    }
    setIsSettingModalOpen(true);
  };

  // Save Salary Setting
  const handleSaveSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !baseSalary) {
      setErrorMsg(lang === 'id' ? 'Karyawan dan Gaji Pokok wajib diisi' : 'Employee and Base Salary are required');
      return;
    }

    const matchedEmp = employees.find(emp => emp.id === Number(selectedEmployeeId));

    const payload = {
      employeeId: Number(selectedEmployeeId),
      employeeName: matchedEmp?.fullName || '',
      employeeNumber: matchedEmp?.employeeNumber || '',
      baseSalary: parseFloat(baseSalary),
      allowanceFood: parseFloat(allowanceFood || '0'),
      allowanceTransport: parseFloat(allowanceTransport || '0'),
      allowanceCommunication: parseFloat(allowanceCommunication || '0'),
      bpjsEnabled,
      npwp: npwp || null,
      ptkpStatus
    };

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE}/payroll/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<SalarySettingResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(t.salarySettings + ' ' + (lang === 'id' ? 'berhasil disimpan' : 'saved successfully'));
        setIsSettingModalOpen(false);
        fetchSalarySettings();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Koneksi gagal' : 'Network failure');
    } finally {
      setLoading(false);
    }
  };

  // Calculate & Process Payroll Run
  const handleProcessPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      employeeId: processEmployeeId ? Number(processEmployeeId) : null,
      month: processMonth,
      year: processYear,
      bonus: parseFloat(bonus || '0'),
      lateDeductions: parseFloat(lateDeductions || '0'),
      otherDeductions: parseFloat(otherDeductions || '0')
    };

    try {
      const res = await fetch(`${API_BASE}/payroll/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<PayrollResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(t.processPayrollSuccess);
        // Clear fields
        setBonus('');
        setLateDeductions('');
        setOtherDeductions('');
        setProcessEmployeeId('');
        // Switch tab to list
        setActiveTab('list');
        fetchPayrolls();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Gagal memproses kalkulasi' : 'Failed to process calculation');
    } finally {
      setLoading(false);
    }
  };

  // Approve Payroll Payout
  const handleApprove = async (id: number) => {
    if (!confirm(lang === 'id' ? 'Setujui slip gaji ini?' : 'Approve this payslip?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payroll/${id}/approve`, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<PayrollResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(t.approvePayrollSuccess);
        fetchPayrolls();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Koneksi bermasalah' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Pay Payroll Payout
  const handlePay = async (id: number) => {
    if (!confirm(lang === 'id' ? 'Tandai gaji telah dibayarkan (PAID)?' : 'Mark payroll as PAID?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payroll/${id}/pay`, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<PayrollResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(t.payPayrollSuccess);
        fetchPayrolls();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Koneksi bermasalah' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Draft Payroll
  const handleDeleteDraft = async (id: number) => {
    if (!confirm(lang === 'id' ? 'Hapus draft kalkulasi ini?' : 'Delete this draft calculation?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payroll/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<void> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Draft berhasil dihapus' : 'Draft deleted successfully');
        fetchPayrolls();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Koneksi bermasalah' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // View Payslip Modal detail
  const viewPayslip = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payroll/${id}`, {
        headers: {
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<PayrollResponse> = await res.json();
      if (data.success) {
        setSelectedPayroll(data.data);
        setIsPayslipModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching payslip details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Currency Formatter
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const getMonthName = (m: number) => {
    const months = [
      'Januari / January', 'Februari / February', 'Maret / March', 'April / April',
      'Mei / May', 'Juni / June', 'Juli / July', 'Agustus / August',
      'September / September', 'Oktober / October', 'November / November', 'Desember / December'
    ];
    return months[m - 1];
  };

  // Split payrolls for self service ESS vs HR lists
  // Filter payrolls based on actor email if ESS (my-payslips) is selected
  // We can filter by checking if employee's email matches actorEmail (or show all in demo/sandbox)
  const isEmployeeRole = payrolls.length > 0 && !actorEmail.includes('hrd') && !actorEmail.includes('admin');
  const filteredPayrolls = activeTab === 'my-payslips'
    ? payrolls.filter(p => p.status === 'PAID') // ESS can only view paid slips
    : payrolls;

  return (
    <div className="payroll-module-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      
      {/* Top Banner / Description */}
      <div className="module-banner glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🪙 {t.payroll}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '800px' }}>
          {t.payrollDesc}
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="tab-menu" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'list' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
        >
          📄 {lang === 'id' ? 'Daftar Slip Gaji' : 'Payslips List'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'process' ? 'active' : ''}`}
          onClick={() => setActiveTab('process')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'process' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
        >
          ⚙️ {t.calculatePayroll}
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'settings' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
        >
          🛠️ {t.salarySettings}
        </button>
        <button
          className={`tab-btn ${activeTab === 'my-payslips' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-payslips')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'my-payslips' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
        >
          🔐 ESS: {lang === 'id' ? 'Gaji Saya' : 'My Payslips'}
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="alert alert-success glass-panel" style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', marginBottom: '16px', fontSize: '13px', display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
          <span>✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '16px', marginLeft: 'auto' }}>×</button>
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger glass-panel" style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', marginBottom: '16px', fontSize: '13px', display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
          <span>❌ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', marginLeft: 'auto' }}>×</button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px' }}></div>
          <span>{lang === 'id' ? 'Memuat data...' : 'Processing...'}</span>
        </div>
      )}

      {/* SECTION A: PAYSLIP LIST TAB */}
      {activeTab === 'list' && (
        <div className="table-container glass-panel" style={{ background: 'rgba(30, 30, 40, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-bright)', marginBottom: '16px' }}>
            📋 {lang === 'id' ? 'Seluruh Transaksi Gaji' : 'All Payroll Transactions'}
          </h3>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>{t.employee}</th>
                <th style={{ padding: '12px' }}>NIK</th>
                <th style={{ padding: '12px' }}>{lang === 'id' ? 'Periode' : 'Period'}</th>
                <th style={{ padding: '12px' }}>{t.basicSalary}</th>
                <th style={{ padding: '12px' }}>PPh 21</th>
                <th style={{ padding: '12px' }}>{lang === 'id' ? 'Gaji Bersih' : 'Net Salary'}</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>{lang === 'id' ? 'Aksi' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayrolls.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    {lang === 'id' ? 'Tidak ada data gaji ditemukan' : 'No payroll data found'}
                  </td>
                </tr>
              ) : (
                filteredPayrolls.map((payroll) => (
                  <tr key={payroll.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', hover: { background: 'rgba(255,255,255,0.02)' } }}>
                    <td style={{ padding: '12px', fontWeight: '500', color: 'var(--text-bright)' }}>{payroll.employeeName}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{payroll.employeeNumber}</td>
                    <td style={{ padding: '12px' }}>{getMonthName(payroll.month)} {payroll.year}</td>
                    <td style={{ padding: '12px' }}>{formatIDR(payroll.basicSalary)}</td>
                    <td style={{ padding: '12px', color: '#f59e0b' }}>{formatIDR(payroll.taxPPh21)}</td>
                    <td style={{ padding: '12px', color: '#10b981', fontWeight: '600' }}>{formatIDR(payroll.netSalary)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: payroll.status === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : payroll.status === 'APPROVED' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                        color: payroll.status === 'PAID' ? '#10b981' : payroll.status === 'APPROVED' ? '#3b82f6' : '#9ca3af'
                      }}>
                        {payroll.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => viewPayslip(payroll.id)}
                        style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '11px' }}
                      >
                        👁️ {lang === 'id' ? 'Lihat Slip' : 'View Payslip'}
                      </button>
                      {payroll.status === 'DRAFT' && (
                        <>
                          <button
                            className="btn-primary"
                            onClick={() => handleApprove(payroll.id)}
                            style={{ padding: '6px 12px', borderRadius: '6px', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px' }}
                          >
                            ✓ {lang === 'id' ? 'Setujui' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleDeleteDraft(payroll.id)}
                            style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '11px' }}
                          >
                            🗑️
                          </button>
                        </>
                      )}
                      {payroll.status === 'APPROVED' && (
                        <button
                          onClick={() => handlePay(payroll.id)}
                          style={{ padding: '6px 12px', borderRadius: '6px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px' }}
                        >
                          💰 {lang === 'id' ? 'Bayar Gaji' : 'Pay Payout'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION B: CALCULATE/PROCESS PAYROLL TAB */}
      {activeTab === 'process' && (
        <div className="card glass-panel" style={{ maxWidth: '650px', margin: '0 auto', padding: '24px', borderRadius: '16px', background: 'rgba(30, 30, 40, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-bright)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚙️ {lang === 'id' ? 'Kalkulasi Payroll Baru' : 'Calculate New Payroll Run'}
          </h3>
          <form onSubmit={handleProcessPayroll} className="custom-form">
            
            {/* Target Employee Selection */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {lang === 'id' ? 'Target Karyawan (Kosongkan untuk Semua Karyawan)' : 'Target Employee (Leave empty for All Employees)'}
              </label>
              <select
                className="custom-input"
                value={processEmployeeId}
                onChange={(e) => setProcessEmployeeId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              >
                <option value="">{lang === 'id' ? '-- Jalankan untuk Semua Karyawan --' : '-- Run for All Employees --'}</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Period Selection */}
            <div className="form-grid-2col" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {lang === 'id' ? 'Bulan Gaji' : 'Payroll Month'}
                </label>
                <select
                  className="custom-input"
                  value={processMonth}
                  onChange={(e) => setProcessMonth(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{getMonthName(m)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {lang === 'id' ? 'Tahun Gaji' : 'Payroll Year'}
                </label>
                <input
                  type="number"
                  className="custom-input"
                  value={processYear}
                  onChange={(e) => setProcessYear(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  min="2020"
                  max="2030"
                />
              </div>
            </div>

            {/* Dynamic Adjustments (Bonus/Deductions) */}
            <div className="adjustment-header" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '16px', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--text-bright)' }}>
                ➕ {lang === 'id' ? 'Penyesuaian Manual Periode Ini (Opsional)' : 'Manual Period Adjustments (Optional)'}
              </h4>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {lang === 'id' ? 'Bonus / Insentif (IDR)' : 'Bonus / Incentives (IDR)'}
              </label>
              <input
                type="number"
                className="custom-input"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                placeholder="contoh: 1500000"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
            </div>

            <div className="form-grid-2col" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {lang === 'id' ? 'Denda Terlambat (IDR)' : 'Late Deductions (IDR)'}
                </label>
                <input
                  type="number"
                  className="custom-input"
                  value={lateDeductions}
                  onChange={(e) => setLateDeductions(e.target.value)}
                  placeholder="contoh: 150000"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {lang === 'id' ? 'Potongan Lainnya (IDR)' : 'Other Deductions (IDR)'}
                </label>
                <input
                  type="number"
                  className="custom-input"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(e.target.value)}
                  placeholder="contoh: 300000"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--primary-color)', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              🔄 {lang === 'id' ? 'Proses & Simpan Kalkulasi Gaji' : 'Process & Save Payroll Calculation'}
            </button>
          </form>
        </div>
      )}

      {/* SECTION C: SALARY SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="table-container glass-panel" style={{ background: 'rgba(30, 30, 40, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-bright)' }}>
              🛠️ {t.salarySettings}
            </h3>
            <button
              className="btn-primary"
              onClick={() => openSettingModal()}
              style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--primary-color)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
            >
              + {lang === 'id' ? 'Atur Gaji Karyawan' : 'Configure Employee Compensation'}
            </button>
          </div>

          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>{t.employee}</th>
                <th style={{ padding: '12px' }}>NIK</th>
                <th style={{ padding: '12px' }}>{t.basicSalary}</th>
                <th style={{ padding: '12px' }}>{t.allowanceFood}</th>
                <th style={{ padding: '12px' }}>{t.allowanceTransport}</th>
                <th style={{ padding: '12px' }}>BPJS</th>
                <th style={{ padding: '12px' }}>{t.ptkpStatus}</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>{lang === 'id' ? 'Aksi' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {salarySettings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    {lang === 'id' ? 'Belum ada pengaturan gaji terkonfigurasi' : 'No salary settings configured yet'}
                  </td>
                </tr>
              ) : (
                salarySettings.map((set) => (
                  <tr key={set.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: '500', color: 'var(--text-bright)' }}>{set.employeeName}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{set.employeeNumber}</td>
                    <td style={{ padding: '12px' }}>{formatIDR(set.baseSalary)}</td>
                    <td style={{ padding: '12px' }}>{formatIDR(set.allowanceFood)}</td>
                    <td style={{ padding: '12px' }}>{formatIDR(set.allowanceTransport)}</td>
                    <td style={{ padding: '12px' }}>{set.bpjsEnabled ? '✅ Active' : '❌ Disabled'}</td>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{set.ptkpStatus}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => openSettingModal(set)}
                        style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '11px' }}
                      >
                        ✏️ {lang === 'id' ? 'Edit Pengaturan' : 'Edit Settings'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION D: MY PAYSLIPS TAB (Self-service Employee portal) */}
      {activeTab === 'my-payslips' && (
        <div className="table-container glass-panel" style={{ background: 'rgba(30, 30, 40, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-bright)', marginBottom: '16px' }}>
            🔐 {lang === 'id' ? 'Riwayat Slip Gaji Saya (ESS Portal)' : 'My Payout Slips History (ESS)'}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {lang === 'id' ? 'Menampilkan riwayat slip gaji bulanan Anda yang telah resmi dibayarkan.' : 'Displaying your monthly payout slips that have been successfully paid by corporate HR.'}
          </p>

          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>{lang === 'id' ? 'Periode Bulan/Tahun' : 'Period Month/Year'}</th>
                <th style={{ padding: '12px' }}>{t.basicSalary}</th>
                <th style={{ padding: '12px' }}>{t.totalAllowances}</th>
                <th style={{ padding: '12px' }}>{t.totalDeductions}</th>
                <th style={{ padding: '12px' }}>PPh 21 Tax</th>
                <th style={{ padding: '12px', color: '#10b981' }}>{lang === 'id' ? 'Gaji Bersih Diterima' : 'Net Take Home Pay'}</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>{lang === 'id' ? 'Dokumen' : 'Document'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayrolls.filter(p => p.status === 'PAID').length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    {lang === 'id' ? 'Belum ada slip gaji yang dirilis untuk Anda' : 'No payslips have been released to you yet'}
                  </td>
                </tr>
              ) : (
                filteredPayrolls.filter(p => p.status === 'PAID').map((payroll) => (
                  <tr key={payroll.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: '500', color: 'var(--text-bright)' }}>{getMonthName(payroll.month)} {payroll.year}</td>
                    <td style={{ padding: '12px' }}>{formatIDR(payroll.basicSalary)}</td>
                    <td style={{ padding: '12px', color: '#10b981' }}>+ {formatIDR(payroll.totalAllowances)}</td>
                    <td style={{ padding: '12px', color: '#ef4444' }}>- {formatIDR(payroll.totalDeductions)}</td>
                    <td style={{ padding: '12px', color: '#f59e0b' }}>- {formatIDR(payroll.taxPPh21)}</td>
                    <td style={{ padding: '12px', color: '#10b981', fontWeight: '700' }}>{formatIDR(payroll.netSalary)}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        className="btn-primary"
                        onClick={() => viewPayslip(payroll.id)}
                        style={{ padding: '6px 14px', borderRadius: '6px', background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                      >
                        📥 {lang === 'id' ? 'Buka Slip Gaji' : 'Open Payslip'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: SALARY SETTINGS CONFIGURATION */}
      {isSettingModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '550px', background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--text-bright)', fontWeight: '700' }}>
                ⚙️ {lang === 'id' ? 'Konfigurasi Gaji Karyawan' : 'Configure Compensation'}
              </h3>
              <button onClick={() => setIsSettingModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleSaveSetting}>
              {/* Employee Selection */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {t.employee} *
                </label>
                <select
                  className="custom-input"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                >
                  <option value="">{lang === 'id' ? '-- Pilih Karyawan --' : '-- Select Employee --'}</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeNumber})</option>
                  ))}
                </select>
              </div>

              {/* Base Salary */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {t.basicSalary} (IDR) *
                </label>
                <input
                  type="number"
                  className="custom-input"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  required
                  placeholder="contoh: 8000000"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              {/* Allowances grid */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.allowanceFood} (IDR)</label>
                  <input
                    type="number"
                    value={allowanceFood}
                    onChange={(e) => setAllowanceFood(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.allowanceTransport} (IDR)</label>
                  <input
                    type="number"
                    value={allowanceTransport}
                    onChange={(e) => setAllowanceTransport(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.allowanceCommunication} (IDR)</label>
                  <input
                    type="number"
                    value={allowanceCommunication}
                    onChange={(e) => setAllowanceCommunication(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.ptkpStatus} *</label>
                  <select
                    value={ptkpStatus}
                    onChange={(e) => setPtkpStatus(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    {['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'].map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* NPWP Tax Number */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {t.npwp} ({lang === 'id' ? 'Isi jika ada' : 'Leave empty if none'})
                </label>
                <input
                  type="text"
                  className="custom-input"
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
                  placeholder="00.000.000.0-000.000"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              {/* BPJS Enabled checkbox */}
              <div className="form-group" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="bpjsCheck"
                  checked={bpjsEnabled}
                  onChange={(e) => setBpjsEnabled(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="bpjsCheck" style={{ fontSize: '12px', color: 'var(--text-bright)', cursor: 'pointer' }}>
                  {t.bpjsEnabled} (Indonesian JHT, JP, Kesehatan)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsSettingModalOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#fff', cursor: 'pointer' }}
                >
                  {lang === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  💾 {lang === 'id' ? 'Simpan' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VISUAL DIGITAL PAYSLIP DOCUMENT MODAL */}
      {isPayslipModalOpen && selectedPayroll && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '750px', background: 'rgba(20, 20, 30, 0.98)', border: '1px solid rgba(255,255,255,0.15)', padding: '30px', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--text-bright)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📄 {t.payslipDigital}
              </h3>
              <button onClick={() => setIsPayslipModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            {/* Payslip Document Body */}
            <div className="payslip-document" id="payslip-print-area" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px dashed rgba(255,255,255,0.1)', padding: '24px', borderRadius: '12px', fontFamily: 'Courier New, monospace', color: 'var(--text-bright)' }}>
              
              {/* Company Logo Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '12px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px', margin: 0 }}>HRIS ENTERPRISE SYSTEMS</h2>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Multi-Tenant Secure Payroll Service Hub</p>
              </div>

              {/* Employee and Payroll Metadata Grid */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', lineHeight: '1.6', marginBottom: '20px' }}>
                <div>
                  <div><strong>{lang === 'id' ? 'NAMA KARYAWAN' : 'EMPLOYEE NAME'}:</strong> {selectedPayroll.employeeName}</div>
                  <div><strong>NIK (ID):</strong> {selectedPayroll.employeeNumber}</div>
                  <div><strong>{lang === 'id' ? 'STATUS PTKP' : 'PTKP STATUS'}:</strong> {ptkpStatus || 'TK/0'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div><strong>{lang === 'id' ? 'PERIODE GAJI' : 'PAYROLL PERIOD'}:</strong> {getMonthName(selectedPayroll.month).toUpperCase()} {selectedPayroll.year}</div>
                  <div><strong>STATUS:</strong> <span style={{ color: selectedPayroll.status === 'PAID' ? '#10b981' : '#f59e0b' }}>{selectedPayroll.status}</span></div>
                  <div><strong>{lang === 'id' ? 'NPWP REG' : 'NPWP NO'}:</strong> {npwp || '-'}</div>
                </div>
              </div>

              {/* Financial Itemizations: Allowances vs Deductions */}
              <div className="payslip-grids" style={{ display: 'flex', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginBottom: '20px' }}>
                
                {/* Earnings Column */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', pb: '4px', margin: '0 0 10px', fontSize: '13px', color: '#10b981' }}>
                    [+] PENDAPATAN / EARNINGS
                  </h4>
                  {selectedPayroll.details?.filter(d => d.itemType === 'ALLOWANCE').map(d => (
                    <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: '6px 0' }}>
                      <span>{d.itemName}</span>
                      <span>{formatIDR(d.amount)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
                    <span>Total Pendapatan:</span>
                    <span style={{ color: '#10b981' }}>{formatIDR(selectedPayroll.totalAllowances + selectedPayroll.basicSalary)}</span>
                  </div>
                </div>

                {/* Deductions Column */}
                <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '20px' }}>
                  <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', pb: '4px', margin: '0 0 10px', fontSize: '13px', color: '#ef4444' }}>
                    [-] POTONGAN & PAJAK / DEDUCTIONS
                  </h4>
                  {selectedPayroll.details?.filter(d => d.itemType === 'DEDUCTION' || d.itemType === 'TAX').map(d => (
                    <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: '6px 0' }}>
                      <span>{d.itemName}</span>
                      <span>{formatIDR(d.amount)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
                    <span>Total Potongan:</span>
                    <span style={{ color: '#ef4444' }}>{formatIDR(selectedPayroll.totalDeductions + selectedPayroll.bpjsEmployee + selectedPayroll.taxPPh21)}</span>
                  </div>
                </div>
              </div>

              {/* Take Home Pay Box */}
              <div style={{ background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  {lang === 'id' ? 'GAJI BERSIH DITERIMA (TAKE HOME PAY):' : 'NET SALARY RECEIVED (TAKE HOME PAY):'}
                </span>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#10b981' }}>
                  {formatIDR(selectedPayroll.netSalary)}
                </span>
              </div>

              {/* Informative corporate footnotes */}
              <div style={{ marginTop: '24px', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
                * Ini adalah dokumen slip gaji elektronik resmi yang dihasilkan oleh modul sistem payroll multi-tenant. *<br />
                * Seluruh data pemotongan PPh 21 dan BPJS dihitung sesuai kepatuhan hukum perpajakan Republik Indonesia. *
              </div>
            </div>

            {/* Print/Download button Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  const printContents = document.getElementById('payslip-print-area')?.innerHTML;
                  const originalContents = document.body.innerHTML;
                  if (printContents) {
                    document.body.innerHTML = printContents;
                    window.print();
                    // Restore original body
                    window.location.reload();
                  }
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#fff', cursor: 'pointer', fontWeight: '500' }}
              >
                🖨️ {lang === 'id' ? 'Cetak Slip Gaji' : 'Print Payslip'}
              </button>
              <button
                onClick={() => setIsPayslipModalOpen(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
              >
                {lang === 'id' ? 'Tutup Dokumen' : 'Close Document'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
