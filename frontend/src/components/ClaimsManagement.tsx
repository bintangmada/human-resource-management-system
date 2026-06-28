import React, { useState, useEffect } from 'react';
import { ApiResponse, ClaimCategoryResponse, ClaimBalanceResponse, ClaimRequestResponse, EmployeeResponse } from '../types';
import { translations } from '../utils/i18n';

interface ClaimsManagementProps {
  tenantId: string;
  actorEmail: string;
  lang: 'id' | 'en';
  theme: 'light' | 'dark';
}

export function ClaimsManagement({ tenantId, actorEmail, lang, theme }: ClaimsManagementProps) {
  const t = translations[lang];

  // Tabs: 'requests' | 'balances' | 'categories' | 'apply'
  const [activeTab, setActiveTab] = useState<'requests' | 'balances' | 'categories' | 'apply'>('requests');

  // Loading & Alerts
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Core data lists
  const [categories, setCategories] = useState<ClaimCategoryResponse[]>([]);
  const [balances, setBalances] = useState<ClaimBalanceResponse[]>([]);
  const [claims, setClaims] = useState<ClaimRequestResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);

  // Apply claim form states
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [claimTitle, setClaimTitle] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimDesc, setClaimDesc] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  // Category creation form states
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [categoryLimit, setCategoryLimit] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Quota allocation form states
  const [allocEmployeeId, setAllocEmployeeId] = useState<number | ''>('');
  const [allocCategoryId, setAllocCategoryId] = useState<number | ''>('');
  const [allocAmount, setAllocAmount] = useState('');
  const [allocYear, setAllocYear] = useState<number>(new Date().getFullYear());
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);

  // Rejection notes modal states
  const [rejectingClaimId, setRejectingClaimId] = useState<number | null>(null);
  const [rejectionNotesText, setRejectionNotesText] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Receipt image preview modal
  const [previewingReceiptUrl, setPreviewingReceiptUrl] = useState<string | null>(null);

  const API_BASE = 'http://localhost:8020/api/v1/claims';
  const EMPLOYEES_API = 'http://localhost:8020/api/v1/employees';

  // Check if role is admin/hr (to toggle approval buttons)
  const isHR = actorEmail.includes('hrd') || actorEmail.includes('admin') || actorEmail.includes('owner');

  useEffect(() => {
    fetchCategories();
    fetchBalances();
    fetchClaims();
    if (isHR) {
      fetchEmployees();
    }
  }, [tenantId, activeTab]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        headers: {
          'X-Tenant-ID': tenantId,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<ClaimCategoryResponse[]> = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error fetching claim categories:', err);
    }
  };

  const fetchBalances = async () => {
    try {
      const url = isHR ? `${API_BASE}/balances` : `${API_BASE}/balances?employeeId=1`; // Simulated ESS
      const res = await fetch(url, {
        headers: {
          'X-Tenant-ID': tenantId,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<ClaimBalanceResponse[]> = await res.json();
      if (data.success) {
        setBalances(data.data);
      }
    } catch (err) {
      console.error('Error fetching claim balances:', err);
    }
  };

  const fetchClaims = async () => {
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
      const data: ApiResponse<{ content: ClaimRequestResponse[] }> = await res.json();
      if (data.success) {
        const content = (data.data as any).content || data.data;
        setClaims(Array.isArray(content) ? content : []);
      }
    } catch (err) {
      console.error('Error fetching claim requests:', err);
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

  // Submit new reimbursement request
  const handleApplyClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId || !claimTitle || !claimAmount) {
      setErrorMsg(lang === 'id' ? 'Kategori, Judul, dan Nominal wajib diisi' : 'Category, Title, and Amount are required');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      categoryId: Number(selectedCategoryId),
      title: claimTitle,
      amount: parseFloat(claimAmount),
      description: claimDesc || null,
      receiptUrl: receiptUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500' // Mock standard receipt image
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
      const data: ApiResponse<ClaimRequestResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Pengajuan reimbursement berhasil diajukan!' : 'Reimbursement request submitted successfully!');
        setClaimTitle('');
        setClaimAmount('');
        setClaimDesc('');
        setReceiptUrl('');
        setSelectedCategoryId('');
        setActiveTab('requests');
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Gagal menghubungi server' : 'Failed to contact server');
    } finally {
      setLoading(false);
    }
  };

  // Save new category (Admin)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName || !categoryLimit) return;
    setLoading(true);

    const payload = {
      name: categoryName,
      description: categoryDesc,
      maxLimit: parseFloat(categoryLimit),
      status: 1
    };

    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<ClaimCategoryResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Kategori klaim baru disimpan' : 'New claim category saved');
        setIsCategoryModalOpen(false);
        setCategoryName('');
        setCategoryDesc('');
        setCategoryLimit('');
        fetchCategories();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Koneksi gagal' : 'Network failure');
    } finally {
      setLoading(false);
    }
  };

  // Allocate custom balance to employee (Admin)
  const handleAllocateBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocEmployeeId || !allocCategoryId || !allocAmount) return;
    setLoading(true);

    const payload = {
      employeeId: Number(allocEmployeeId),
      categoryId: Number(allocCategoryId),
      year: allocYear,
      allocatedAmount: parseFloat(allocAmount)
    };

    try {
      const res = await fetch(`${API_BASE}/balances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<ClaimBalanceResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Kuota alokasi berhasil disimpan' : 'Quota allocation saved successfully');
        setIsAllocModalOpen(false);
        setAllocEmployeeId('');
        setAllocCategoryId('');
        setAllocAmount('');
        fetchBalances();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Koneksi gagal' : 'Network failure');
    } finally {
      setLoading(false);
    }
  };

  // Approve claim
  const handleApproveClaim = async (id: number) => {
    if (!confirm(lang === 'id' ? 'Setujui klaim reimburse ini?' : 'Approve this reimbursement claim?')) return;
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
      const data: ApiResponse<ClaimRequestResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Klaim disetujui sukses!' : 'Claim approved successfully!');
        fetchClaims();
        fetchBalances();
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
    setRejectingClaimId(id);
    setRejectionNotesText('');
    setIsRejectModalOpen(true);
  };

  // Reject claim (submit notes)
  const handleRejectClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingClaimId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${rejectingClaimId}/reject?notes=${encodeURIComponent(rejectionNotesText)}`, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<ClaimRequestResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Klaim berhasil ditolak' : 'Claim rejected successfully');
        setIsRejectModalOpen(false);
        fetchClaims();
        fetchBalances();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Koneksi bermasalah' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Cancel claim (Employee ESS)
  const handleCancelClaim = async (id: number) => {
    if (!confirm(lang === 'id' ? 'Batalkan pengajuan klaim ini?' : 'Cancel this claim request?')) return;
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
      const data: ApiResponse<ClaimRequestResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Klaim berhasil dibatalkan' : 'Claim cancelled successfully');
        fetchClaims();
        fetchBalances();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Koneksi bermasalah' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Formatter Currency IDR
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="claim-module-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      
      {/* Banner */}
      <div className="module-banner glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🩺 {t.claims}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '800px' }}>
          {t.claimsDesc}
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-menu" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'requests' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
        >
          📁 {t.claimRequests}
        </button>
        <button
          className={`tab-btn ${activeTab === 'balances' ? 'active' : ''}`}
          onClick={() => setActiveTab('balances')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'balances' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
        >
          💰 {t.claimBalances}
        </button>
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'categories' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
        >
          🏷️ {t.claimCategory}
        </button>
        <button
          className={`tab-btn ${activeTab === 'apply' ? 'active' : ''}`}
          onClick={() => setActiveTab('apply')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'apply' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
        >
          ✍️ {t.applyClaim}
        </button>
      </div>

      {/* Alert panels */}
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

      {/* TAB 1: CLAIM REQUESTS LIST */}
      {activeTab === 'requests' && (
        <div className="table-container glass-panel" style={{ background: 'rgba(30, 30, 40, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>{t.employee}</th>
                <th style={{ padding: '12px' }}>{t.claimCategory}</th>
                <th style={{ padding: '12px' }}>{t.claimTitle}</th>
                <th style={{ padding: '12px' }}>{t.claimAmount}</th>
                <th style={{ padding: '12px' }}>{t.date}</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Nota</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>{lang === 'id' ? 'Aksi' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {claims.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    {lang === 'id' ? 'Belum ada pengajuan klaim' : 'No claim requests found'}
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: '500', color: 'var(--text-bright)' }}>
                      {claim.employeeName} <br />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{claim.employeeNumber}</span>
                    </td>
                    <td style={{ padding: '12px' }}>{claim.categoryName}</td>
                    <td style={{ padding: '12px' }}>
                      <strong>{claim.title}</strong>
                      {claim.description && <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{claim.description}</p>}
                      {claim.rejectionNotes && <p style={{ fontSize: '11px', color: '#ef4444', margin: '2px 0 0' }}>💡 {claim.rejectionNotes}</p>}
                    </td>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{formatIDR(claim.amount)}</td>
                    <td style={{ padding: '12px' }}>{claim.requestDate}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: claim.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : claim.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: claim.status === 'APPROVED' ? '#10b981' : claim.status === 'PENDING' ? '#f59e0b' : '#ef4444'
                      }}>
                        {claim.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {claim.receiptUrl ? (
                        <button
                          onClick={() => setPreviewingReceiptUrl(claim.receiptUrl || null)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                          title={t.receiptPreview}
                        >
                          🖼️
                        </button>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        {isHR && claim.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveClaim(claim.id)}
                              style={{ padding: '6px 10px', borderRadius: '6px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px' }}
                            >
                              ✓ {t.approve}
                            </button>
                            <button
                              onClick={() => openRejectModal(claim.id)}
                              style={{ padding: '6px 10px', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px' }}
                            >
                              ✗ {t.reject}
                            </button>
                          </>
                        )}
                        {!isHR && claim.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelClaim(claim.id)}
                            style={{ padding: '6px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '11px' }}
                          >
                            Cancel
                          </button>
                        )}
                        {claim.status !== 'PENDING' && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Processed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: CLAIM BALANCES / LIMITS */}
      {activeTab === 'balances' && (
        <div className="table-container glass-panel" style={{ background: 'rgba(30, 30, 40, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-bright)' }}>
              💰 {t.claimBalances}
            </h3>
            {isHR && (
              <button
                onClick={() => setIsAllocModalOpen(true)}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--primary-color)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
              >
                + {lang === 'id' ? 'Alokasikan Kuota' : 'Allocate Custom Balance'}
              </button>
            )}
          </div>

          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>{t.employee}</th>
                <th style={{ padding: '12px' }}>{t.claimCategory}</th>
                <th style={{ padding: '12px' }}>{lang === 'id' ? 'Tahun' : 'Year'}</th>
                <th style={{ padding: '12px' }}>{t.allocatedAmount}</th>
                <th style={{ padding: '12px' }}>{t.utilizedAmount}</th>
                <th style={{ padding: '12px' }}>{t.pendingAmount}</th>
                <th style={{ padding: '12px', color: '#10b981' }}>{t.remaining}</th>
                <th style={{ padding: '12px', width: '150px' }}>{lang === 'id' ? 'Penggunaan' : 'Usage'}</th>
              </tr>
            </thead>
            <tbody>
              {balances.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    {lang === 'id' ? 'Tidak ada data saldo klaim' : 'No claim balances found'}
                  </td>
                </tr>
              ) : (
                balances.map((bal) => {
                  const usedPct = bal.allocatedAmount > 0 
                    ? Math.min(100, Math.round(((bal.utilizedAmount + bal.pendingAmount) / bal.allocatedAmount) * 100)) 
                    : 0;

                  return (
                    <tr key={bal.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: '500', color: 'var(--text-bright)' }}>
                        {bal.employeeName} <br />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bal.employeeNumber}</span>
                      </td>
                      <td style={{ padding: '12px' }}>{bal.categoryName}</td>
                      <td style={{ padding: '12px' }}>{bal.year}</td>
                      <td style={{ padding: '12px' }}>{formatIDR(bal.allocatedAmount)}</td>
                      <td style={{ padding: '12px', color: '#ef4444' }}>{formatIDR(bal.utilizedAmount)}</td>
                      <td style={{ padding: '12px', color: '#f59e0b' }}>{formatIDR(bal.pendingAmount)}</td>
                      <td style={{ padding: '12px', color: '#10b981', fontWeight: '700' }}>{formatIDR(bal.remainingAmount)}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${usedPct}%`, height: '100%', background: usedPct > 85 ? '#ef4444' : usedPct > 50 ? '#f59e0b' : '#10b981', borderRadius: '3px' }}></div>
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }}>{usedPct}%</span>
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

      {/* TAB 3: CLAIM CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="table-container glass-panel" style={{ background: 'rgba(30, 30, 40, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-bright)' }}>
              🏷️ {t.claimCategory}
            </h3>
            {isHR && (
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--primary-color)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
              >
                + {lang === 'id' ? 'Buat Kategori Baru' : 'Create Claim Category'}
              </button>
            )}
          </div>

          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>{lang === 'id' ? 'Nama Kategori' : 'Category Name'}</th>
                <th style={{ padding: '12px' }}>{lang === 'id' ? 'Deskripsi' : 'Description'}</th>
                <th style={{ padding: '12px' }}>{lang === 'id' ? 'Limit Standar Tahunan' : 'Standard Annual Limit'}</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: '600', color: 'var(--text-bright)' }}>{cat.name}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{cat.description || '-'}</td>
                  <td style={{ padding: '12px' }}>{formatIDR(cat.maxLimit)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: cat.status === 1 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: cat.status === 1 ? '#10b981' : '#ef4444'
                    }}>
                      {cat.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: APPLY REIMBURSEMENT FORM */}
      {activeTab === 'apply' && (
        <div className="card glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', borderRadius: '16px', background: 'rgba(30, 30, 40, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-bright)', marginBottom: '20px' }}>
            ✍️ {t.applyClaim}
          </h3>
          <form onSubmit={handleApplyClaim}>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {t.claimCategory} *
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                required
              >
                <option value="">{lang === 'id' ? '-- Pilih Kategori Klaim --' : '-- Select Claim Category --'}</option>
                {categories.filter(c => c.status === 1).map(c => (
                  <option key={c.id} value={c.id}>{c.name} (Limit: {formatIDR(c.maxLimit)})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {t.claimTitle} *
              </label>
              <input
                type="text"
                value={claimTitle}
                onChange={(e) => setClaimTitle(e.target.value)}
                placeholder={lang === 'id' ? 'contoh: Kwitansi Pembelian Kacamata Minus' : 'example: Medical Prescription Receipt'}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {t.claimAmount} *
              </label>
              <input
                type="number"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                placeholder="contoh: 1200000"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {lang === 'id' ? 'Catatan / Deskripsi Tambahan' : 'Additional Description/Notes'}
              </label>
              <textarea
                value={claimDesc}
                onChange={(e) => setClaimDesc(e.target.value)}
                rows={3}
                placeholder={lang === 'id' ? 'Tulis rincian pembelian atau keperluan perjalanan dinas...' : 'Write breakdown details of purchase or corporate travel reasons...'}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit' }}
              />
            </div>

            {/* Simulated file upload URL */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {t.receiptFile} ({lang === 'id' ? 'Lampirkan URL Gambar' : 'Attach Receipt Image URL'})
              </label>
              <input
                type="text"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                placeholder="https://example.com/receipt.jpg"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                * {lang === 'id' ? 'Untuk keperluan demo portfolio, sistem akan menyisipkan lampiran mock otomatis jika dikosongkan.' : 'For demo purposes, a standard mock receipt attachment is provided if left blank.'}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
            >
              🚀 {lang === 'id' ? 'Kirim Pengajuan Reimbursement' : 'Submit Reimbursement Request'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL A: CREATE CLAIM CATEGORY */}
      {isCategoryModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '500px', background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: '700' }}>🏷️ {lang === 'id' ? 'Buat Kategori Klaim Baru' : 'New Claim Category'}</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{lang === 'id' ? 'Nama Kategori' : 'Category Name'} *</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{lang === 'id' ? 'Deskripsi Kategori' : 'Category Description'}</label>
                <input
                  type="text"
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{lang === 'id' ? 'Limit Kuota Tahunan (IDR)' : 'Annual Quota Limit (IDR)'} *</label>
                <input
                  type="number"
                  value={categoryLimit}
                  onChange={(e) => setCategoryLimit(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL B: ALLOCATE BALANCE CUSTOM */}
      {isAllocModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '500px', background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: '700' }}>💰 {lang === 'id' ? 'Alokasikan Kuota Saldo Klaim' : 'Allocate Custom Claim Quota'}</h3>
              <button onClick={() => setIsAllocModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleAllocateBalance}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.employee} *</label>
                <select
                  value={allocEmployeeId}
                  onChange={(e) => setAllocEmployeeId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                >
                  <option value="">{lang === 'id' ? '-- Pilih Karyawan --' : '-- Select Employee --'}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeNumber})</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.claimCategory} *</label>
                <select
                  value={allocCategoryId}
                  onChange={(e) => setAllocCategoryId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                >
                  <option value="">{lang === 'id' ? '-- Pilih Kategori --' : '-- Select Category --'}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{lang === 'id' ? 'Tahun Saldo' : 'Balance Year'} *</label>
                  <input
                    type="number"
                    value={allocYear}
                    onChange={(e) => setAllocYear(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{lang === 'id' ? 'Nominal Kuota' : 'Quota Amount'} *</label>
                  <input
                    type="number"
                    value={allocAmount}
                    onChange={(e) => setAllocAmount(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsAllocModalOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Allocate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL C: REJECTION NOTES MODAL */}
      {isRejectModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '400px', background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '700' }}>❌ {t.rejectionNotes}</h3>
              <button onClick={() => setIsRejectModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleRejectClaim}>
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
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Reject Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL D: RECEIPT ATTACHMENT PREVIEW */}
      {previewingReceiptUrl && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setPreviewingReceiptUrl(null)}>
          <div className="modal-content glass-panel" style={{ position: 'relative', width: '90%', maxWidth: '600px', background: 'rgba(20,20,30,0.95)', padding: '24px', borderRadius: '16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '700' }}>🖼️ {t.receiptPreview}</h3>
              <button onClick={() => setPreviewingReceiptUrl(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ maxHeight: '70vh', overflow: 'hidden', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#000' }}>
              <img src={previewingReceiptUrl} alt="Receipt Attachment" style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
