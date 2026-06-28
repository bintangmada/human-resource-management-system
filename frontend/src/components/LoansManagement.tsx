import React, { useState, useEffect } from 'react';
import { ApiResponse, LoanRequestResponse, LoanInstallmentResponse, EmployeeResponse } from '../types';
import { translations } from '../utils/i18n';

interface LoansManagementProps {
  tenantId: string;
  actorEmail: string;
  lang: 'id' | 'en';
  theme: 'light' | 'dark';
}

export function LoansManagement({ tenantId, actorEmail, lang, theme }: LoansManagementProps) {
  const t = translations[lang];

  // Tabs: 'list' | 'apply'
  const [activeTab, setActiveTab] = useState<'list' | 'apply'>('list');

  // Loading & Alerts
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Core data lists
  const [loans, setLoans] = useState<LoanRequestResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);

  // Apply form states
  const [loanEmployeeId, setLoanEmployeeId] = useState<number | ''>('');
  const [loanAmountInput, setLoanAmountInput] = useState('');
  const [loanInterestInput, setLoanInterestInput] = useState('0'); // default 0% flat
  const [loanTenorInput, setLoanTenorInput] = useState('12'); // default 12 months
  const [loanReasonInput, setLoanReasonInput] = useState('');

  // Live calculator helper states
  const [calculatedInstallment, setCalculatedInstallment] = useState<number>(0);

  // Selected loan for amortization modal view
  const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState<LoanRequestResponse | null>(null);

  // Rejection notes modal states
  const [rejectingLoanId, setRejectingLoanId] = useState<number | null>(null);
  const [rejectionNotesText, setRejectionNotesText] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const API_BASE = 'http://localhost:8020/api/v1/loans';
  const EMPLOYEES_API = 'http://localhost:8020/api/v1/employees';

  // Check if role is admin/hr (to toggle approval buttons)
  const isHR = actorEmail.includes('hrd') || actorEmail.includes('admin') || actorEmail.includes('owner');

  useEffect(() => {
    fetchLoans();
    if (isHR) {
      fetchEmployees();
    }
  }, [tenantId, activeTab]);

  // Recalculate live amortization whenever values change
  useEffect(() => {
    const amt = parseFloat(loanAmountInput) || 0;
    const rate = parseFloat(loanInterestInput) || 0;
    const tenor = parseInt(loanTenorInput) || 1;

    if (amt > 0 && tenor > 0) {
      const rateDecimal = rate / 100;
      const totalInterest = amt * rateDecimal * tenor;
      const totalPayable = amt + totalInterest;
      const monthly = Math.round(totalPayable / tenor);
      setCalculatedInstallment(monthly);
    } else {
      setCalculatedInstallment(0);
    }
  }, [loanAmountInput, loanInterestInput, loanTenorInput]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const url = isHR ? `${API_BASE}/all?size=100` : `${API_BASE}/my?size=100`;
      const res = await fetch(url, {
        headers: {
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<{ content: LoanRequestResponse[] }> = await res.json();
      if (data.success) {
        const content = (data.data as any).content || data.data;
        setLoans(Array.isArray(content) ? content : []);
      }
    } catch (err) {
      console.error('Error fetching loan registry:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(EMPLOYEES_API, {
        headers: {
          'X-Tenant-ID': tenantId,
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

  // Submit loan application
  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanAmountInput || !loanTenorInput) {
      setErrorMsg(lang === 'id' ? 'Nominal dan Tenor wajib diisi' : 'Amount and Tenor are required');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      employeeId: loanEmployeeId ? Number(loanEmployeeId) : null,
      amount: parseFloat(loanAmountInput),
      interestRate: parseFloat(loanInterestInput) || 0,
      tenorMonths: parseInt(loanTenorInput),
      reason: loanReasonInput || null
    };

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<LoanRequestResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Pengajuan pinjaman berhasil dikirim!' : 'Loan request submitted successfully!');
        setLoanAmountInput('');
        setLoanInterestInput('0');
        setLoanTenorInput('12');
        setLoanReasonInput('');
        setLoanEmployeeId('');
        setActiveTab('list');
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Gagal menghubungi server' : 'Failed to contact server');
    } finally {
      setLoading(false);
    }
  };

  // Approve Loan (Generates schedule)
  const handleApproveLoan = async (id: number) => {
    if (!confirm(lang === 'id' ? 'Setujui pinjaman ini dan cairkan dana?' : 'Approve this loan and disburse funds?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${id}/approve`, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<LoanRequestResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Pinjaman disetujui & cicilan amortisasi diaktifkan!' : 'Loan approved & amortization schedule active!');
        fetchLoans();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Koneksi bermasalah' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Open Reject Modal
  const openRejectModal = (id: number) => {
    setRejectingLoanId(id);
    setRejectionNotesText('');
    setIsRejectModalOpen(true);
  };

  // Reject Loan
  const handleRejectLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingLoanId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${rejectingLoanId}/reject?notes=${encodeURIComponent(rejectionNotesText)}`, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<LoanRequestResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Pengajuan pinjaman ditolak' : 'Loan request rejected');
        setIsRejectModalOpen(false);
        fetchLoans();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Koneksi bermasalah' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Cancel Loan Request (Employee ESS)
  const handleCancelLoan = async (id: number) => {
    if (!confirm(lang === 'id' ? 'Batalkan pengajuan pinjaman ini?' : 'Cancel this loan request?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${id}/cancel`, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<LoanRequestResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Pinjaman berhasil dibatalkan' : 'Loan cancelled successfully');
        fetchLoans();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Koneksi bermasalah' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Mark Installment / Repayment installment as Paid
  const handlePayInstallment = async (installmentId: number) => {
    if (!confirm(lang === 'id' ? 'Tandai cicilan ini sudah LUNAS?' : 'Mark this installment as PAID?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/installments/${installmentId}/pay`, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<LoanInstallmentResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Cicilan ditandai lunas!' : 'Installment marked as paid!');
        
        // Refresh detail modal and listing
        fetchLoans();
        if (selectedLoanForSchedule) {
          // Re-fetch loans and find updated version
          const updatedRes = await fetch(isHR ? `${API_BASE}/all?size=100` : `${API_BASE}/my?size=100`, {
            headers: {
              'X-Tenant-ID': tenantId,
              'X-User-Email': actorEmail,
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const updatedData: ApiResponse<{ content: LoanRequestResponse[] }> = await updatedRes.json();
          if (updatedData.success) {
            const content = (updatedData.data as any).content || updatedData.data;
            const updatedLoan = content.find((l: any) => l.id === selectedLoanForSchedule.id);
            if (updatedLoan) {
              setSelectedLoanForSchedule(updatedLoan);
            }
          }
        }
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Koneksi bermasalah' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Helper formatter currency IDR
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="loan-module-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      
      {/* Banner */}
      <div className="module-banner glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🏦 {t.loans}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '800px' }}>
          {t.loansDesc}
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-menu" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'list' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
        >
          📁 {t.loanRequests}
        </button>
        <button
          className={`tab-btn ${activeTab === 'apply' ? 'active' : ''}`}
          onClick={() => setActiveTab('apply')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'apply' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
        >
          ✍️ {t.applyLoan}
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="alert alert-success glass-panel" style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', marginBottom: '16px', fontSize: '13px', display: 'flex', justifyContent: 'between' }}>
          <span>✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '16px', marginLeft: 'auto' }}>×</button>
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger glass-panel" style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', marginBottom: '16px', fontSize: '13px', display: 'flex', justifyContent: 'between' }}>
          <span>❌ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', marginLeft: 'auto' }}>×</button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px' }}></div>
          <span>{lang === 'id' ? 'Memproses...' : 'Processing...'}</span>
        </div>
      )}

      {/* TAB 1: LOANS REGISTRY LIST */}
      {activeTab === 'list' && (
        <div className="table-container glass-panel" style={{ background: 'rgba(30, 30, 40, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>{t.employee}</th>
                <th style={{ padding: '12px' }}>{t.loanAmount}</th>
                <th style={{ padding: '12px' }}>{t.interestRate}</th>
                <th style={{ padding: '12px' }}>{t.tenorMonths}</th>
                <th style={{ padding: '12px' }}>{t.monthlyInstallment}</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>{t.loanReason}</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>{t.amortizationSchedule}</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>{lang === 'id' ? 'Aksi' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    {lang === 'id' ? 'Belum ada data pinjaman' : 'No loan records found'}
                  </td>
                </tr>
              ) : (
                loans.map((loan) => {
                  // Calculate payment progress if ACTIVE/PAID
                  const totalInstallments = loan.installments?.length || 0;
                  const paidInstallments = loan.installments?.filter(i => i.status === 'PAID').length || 0;
                  const progressPct = totalInstallments > 0 ? Math.round((paidInstallments / totalInstallments) * 100) : 0;

                  return (
                    <tr key={loan.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: '500', color: 'var(--text-bright)' }}>
                        {loan.employeeName} <br />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{loan.employeeNumber}</span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{formatIDR(loan.amount)}</td>
                      <td style={{ padding: '12px' }}>{loan.interestRate}%</td>
                      <td style={{ padding: '12px' }}>{loan.tenorMonths} mths</td>
                      <td style={{ padding: '12px', fontWeight: '600', color: 'var(--primary-color)' }}>{formatIDR(loan.monthlyInstallment)}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textAlign: 'center',
                            alignSelf: 'start',
                            background: loan.status === 'ACTIVE' ? 'rgba(59, 130, 246, 0.15)' : loan.status === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : loan.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: loan.status === 'ACTIVE' ? '#3b82f6' : loan.status === 'PAID' ? '#10b981' : loan.status === 'PENDING' ? '#f59e0b' : '#ef4444'
                          }}>
                            {loan.status}
                          </span>
                          {(loan.status === 'ACTIVE' || loan.status === 'PAID') && totalInstallments > 0 && (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              Paid: {paidInstallments}/{totalInstallments} ({progressPct}%)
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={loan.reason}>
                        {loan.reason || '-'}
                        {loan.rejectionNotes && <p style={{ fontSize: '11px', color: '#ef4444', margin: '2px 0 0' }}>💡 {loan.rejectionNotes}</p>}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {loan.status === 'ACTIVE' || loan.status === 'PAID' ? (
                          <button
                            onClick={() => setSelectedLoanForSchedule(loan)}
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}
                          >
                            📅 View ({loan.installments?.length || 0})
                          </button>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {isHR && loan.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApproveLoan(loan.id)}
                                style={{ padding: '6px 10px', borderRadius: '6px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px' }}
                              >
                                ✓ {lang === 'id' ? 'Setujui' : 'Approve'}
                              </button>
                              <button
                                onClick={() => openRejectModal(loan.id)}
                                style={{ padding: '6px 10px', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px' }}
                              >
                                ✗ {lang === 'id' ? 'Tolak' : 'Reject'}
                              </button>
                            </>
                          )}
                          {!isHR && loan.status === 'PENDING' && (
                            <button
                              onClick={() => handleCancelLoan(loan.id)}
                              style={{ padding: '6px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '11px' }}
                            >
                              Cancel
                            </button>
                          )}
                          {loan.status !== 'PENDING' && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Processed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: APPLY FOR LOAN (With LIVE dynamically calculated amortization schedule) */}
      {activeTab === 'apply' && (
        <div className="card glass-panel" style={{ maxWidth: '650px', margin: '0 auto', padding: '24px', borderRadius: '16px', background: 'rgba(30, 30, 40, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-bright)', marginBottom: '20px' }}>
            ✍️ {t.applyLoan}
          </h3>
          <form onSubmit={handleApplyLoan}>
            
            {isHR && (
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {t.employee} *
                </label>
                <select
                  value={loanEmployeeId}
                  onChange={(e) => setLoanEmployeeId(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                >
                  <option value="">{lang === 'id' ? '-- Pilih Karyawan --' : '-- Select Employee --'}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeNumber})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {t.loanAmount} *
              </label>
              <input
                type="number"
                value={loanAmountInput}
                onChange={(e) => setLoanAmountInput(e.target.value)}
                placeholder="contoh: 5000000"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {t.interestRate} *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={loanInterestInput}
                  onChange={(e) => setLoanInterestInput(e.target.value)}
                  placeholder="contoh: 1.5"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {t.tenorMonths} *
                </label>
                <select
                  value={loanTenorInput}
                  onChange={(e) => setLoanTenorInput(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                >
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                </select>
              </div>
            </div>

            {/* LIVE CALCULATOR RESULT WIDGET */}
            {calculatedInstallment > 0 && (
              <div className="calculator-widget glass-panel" style={{ padding: '16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    📊 Live Amortization Estimate
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                    {formatIDR(calculatedInstallment)}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>/ month</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Principal: {formatIDR(parseFloat(loanAmountInput))}</span> <br />
                  <span>Total Int: {formatIDR((parseFloat(loanAmountInput) * (parseFloat(loanInterestInput) / 100)) * parseInt(loanTenorInput))}</span>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {t.loanReason} *
              </label>
              <textarea
                value={loanReasonInput}
                onChange={(e) => setLoanReasonInput(e.target.value)}
                rows={3}
                placeholder={lang === 'id' ? 'Tulis keperluan dana pinjaman atau kasbon...' : 'Write purpose of cash advance/loan...'}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
            >
              🚀 {lang === 'id' ? 'Kirim Pengajuan Pinjaman' : 'Submit Loan Application'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL A: AMORTIZATION SCHEDULE PREVIEW & CHECKLIST */}
      {selectedLoanForSchedule && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '650px', background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: '700' }}>📅 {t.amortizationSchedule}</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {selectedLoanForSchedule.employeeName} ({selectedLoanForSchedule.employeeNumber}) - Total: {formatIDR(selectedLoanForSchedule.amount)} (Rate: {selectedLoanForSchedule.interestRate}%)
                </p>
              </div>
              <button onClick={() => setSelectedLoanForSchedule(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px' }}>{t.installmentNo}</th>
                    <th style={{ padding: '8px' }}>Amount (IDR)</th>
                    <th style={{ padding: '8px' }}>{t.dueDate}</th>
                    <th style={{ padding: '8px' }}>Status</th>
                    <th style={{ padding: '8px' }}>{t.paidDate}</th>
                    {isHR && <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {selectedLoanForSchedule.installments?.map((inst) => (
                    <tr key={inst.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: inst.status === 'PAID' ? 'rgba(16, 185, 129, 0.02)' : 'none' }}>
                      <td style={{ padding: '10px', fontWeight: '600' }}>{inst.installmentNumber} / {selectedLoanForSchedule.tenorMonths}</td>
                      <td style={{ padding: '10px', fontWeight: '500' }}>{formatIDR(inst.amount)}</td>
                      <td style={{ padding: '10px' }}>{inst.dueDate}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: '600',
                          background: inst.status === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: inst.status === 'PAID' ? '#10b981' : '#ef4444'
                        }}>
                          {inst.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{inst.paidDate || '-'}</td>
                      {isHR && (
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {inst.status === 'UNPAID' ? (
                            <button
                              onClick={() => handlePayInstallment(inst.id)}
                              style={{ padding: '4px 8px', borderRadius: '4px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '10px' }}
                            >
                              ✓ Pay
                            </button>
                          ) : (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Paid</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedLoanForSchedule(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '12px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL B: REJECTION NOTES MODAL */}
      {isRejectModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '400px', background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '700' }}>❌ {lang === 'id' ? 'Alasan Penolakan' : 'Rejection Notes'}</h3>
              <button onClick={() => setIsRejectModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleRejectLoan}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{lang === 'id' ? 'Tulis Alasan Penolakan' : 'Write Rejection Reason'} *</label>
                <textarea
                  value={rejectionNotesText}
                  onChange={(e) => setRejectionNotesText(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsRejectModalOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Reject Loan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
