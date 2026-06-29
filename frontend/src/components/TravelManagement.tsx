import React, { useState, useEffect } from 'react';
import { TravelRequestResponse, TravelExpenseResponse } from '../types';
import { translations } from '../utils/i18n';

interface Props {
  tenantId: string;
  actorEmail: string;
  lang: 'id' | 'en';
  theme: 'light' | 'dark';
}

const API_BASE = 'http://localhost:8020/api/v1/travel';

const EXPENSE_ICONS: Record<string, string> = {
  FLIGHT: '✈️ Flight',
  HOTEL: '🏨 Accommodation',
  MEALS: '🍔 Meals',
  TRANSPORT: '🚕 Local Transport',
  OTHER: '📄 Miscellaneous'
};

export function TravelManagement({ tenantId, actorEmail, lang }: Props) {
  const t = translations[lang];
  const isHR = /hrd|admin|owner|manager/.test(actorEmail.toLowerCase());

  const [activeTab, setActiveTab] = useState<'my_trips' | 'all_trips'>('my_trips');
  const [requests, setRequests] = useState<TravelRequestResponse[]>([]);
  const [myRequests, setMyRequests] = useState<TravelRequestResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form submission states (Trip)
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');

  // Form submission states (Expense)
  const [activeRequestForExpense, setActiveRequestForExpense] = useState<TravelRequestResponse | null>(null);
  const [expenseType, setExpenseType] = useState<'FLIGHT' | 'HOTEL' | 'MEALS' | 'TRANSPORT' | 'OTHER'>('FLIGHT');
  const [amount, setAmount] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [description, setDescription] = useState('');

  // Evaluation states (Trip)
  const [evaluatingTrip, setEvaluatingTrip] = useState<TravelRequestResponse | null>(null);
  const [evalStatus, setEvalStatus] = useState<'APPROVED' | 'REJECTED' | 'COMPLETED'>('APPROVED');
  const [approvedBudget, setApprovedBudget] = useState('');
  const [evalNotes, setEvalNotes] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchMyRequests();
  }, [tenantId]);

  const getHeaders = () => ({
    'X-Tenant-ID': tenantId,
    'X-User-Email': actorEmail,
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/requests?size=100`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data?.content || data.data || []);
      }
    } catch {
      setErrorMsg('Failed to load travel requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/requests/my`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setMyRequests(data.data || []);
      }
    } catch {
      // fail silently
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          employeeId: Number(employeeId),
          employeeName,
          destination,
          purpose,
          startDate,
          endDate,
          estimatedBudget: Number(estimatedBudget)
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Pengajuan perjalanan dinas berhasil dikirim!' : 'Travel request submitted successfully!');
        setShowSubmitModal(false);
        setEmployeeId('');
        setEmployeeName('');
        setDestination('');
        setPurpose('');
        setStartDate('');
        setEndDate('');
        setEstimatedBudget('');
        fetchMyRequests();
        fetchRequests();
      } else {
        setErrorMsg(data.message || 'Submission failed.');
      }
    } catch {
      setErrorMsg('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingTrip) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/requests/${evaluatingTrip.id}/process`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          status: evalStatus,
          approvedBudget: approvedBudget ? Number(approvedBudget) : null,
          adminNotes: evalNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Pengajuan perjalanan dinas berhasil diproses!' : 'Travel request processed successfully!');
        setEvaluatingTrip(null);
        setEvalNotes('');
        setApprovedBudget('');
        fetchRequests();
        fetchMyRequests();
      } else {
        setErrorMsg(data.message);
      }
    } catch {
      setErrorMsg('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequestForExpense) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/requests/${activeRequestForExpense.id}/expenses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          expenseType,
          amount: Number(amount),
          receiptUrl: receiptUrl || 'http://localhost/mock-receipt.png',
          description
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Klaim nota perjalanan dinas berhasil dikirim!' : 'Expense receipt submitted successfully!');
        setActiveRequestForExpense(null);
        setAmount('');
        setReceiptUrl('');
        setDescription('');
        fetchMyRequests();
        fetchRequests();
      } else {
        setErrorMsg(data.message);
      }
    } catch {
      setErrorMsg('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessExpense = async (reqId: number, expId: number, status: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/requests/${reqId}/expenses/${expId}/process`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Klaim biaya berhasil diperbarui!' : 'Expense status processed successfully!');
        fetchRequests();
        fetchMyRequests();
      } else {
        setErrorMsg(data.message);
      }
    } catch {
      setErrorMsg('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'APPROVED': return '#3b82f6';
      case 'REJECTED': return '#ef4444';
      case 'COMPLETED': return '#10b981';
      default: return '#6b7280';
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(30, 30, 45, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    backdropFilter: 'blur(10px)'
  };

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px',
    transition: 'all 0.2s ease'
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    marginTop: '6px',
    marginBottom: '16px',
    fontSize: '13px'
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Banner */}
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(16, 185, 129, 0.05))' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          ✈️ {t.travel}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '800px' }}>
          {t.travelDesc}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '20px' }}>
        <button style={buttonStyle(activeTab === 'my_trips')} onClick={() => setActiveTab('my_trips')}>
          👤 {lang === 'id' ? 'Dinas Saya' : 'My Trips'}
        </button>
        {isHR && (
          <button style={buttonStyle(activeTab === 'all_trips')} onClick={() => setActiveTab('all_trips')}>
            📂 {lang === 'id' ? 'Persetujuan Dinas & Biaya' : 'All Travel & Expenses'}
          </button>
        )}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', marginBottom: '20px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
          <span>✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', marginBottom: '20px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
          <span>❌ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>
      )}

      {/* MY TRIPS TAB */}
      {activeTab === 'my_trips' && (
        <div>
          <button style={{ ...buttonStyle(true), marginBottom: '20px' }} onClick={() => setShowSubmitModal(true)}>
            📝 {t.submitTravel}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {myRequests.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', color: 'var(--text-muted)' }}>
                {lang === 'id' ? 'Anda belum memiliki pengajuan perjalanan dinas.' : 'You have not submitted any business travel requests.'}
              </div>
            ) : (
              myRequests.map((req) => (
                <div key={req.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginBottom: '14px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-bright)' }}>🛫 {req.destination}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        📅 <strong>{new Date(req.startDate).toLocaleDateString()}</strong> s/d <strong>{new Date(req.endDate).toLocaleDateString()}</strong>
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: `${getStatusColor(req.status)}20`, color: getStatusColor(req.status) }}>
                        {req.status}
                      </span>
                      {req.status === 'APPROVED' && (
                        <button style={{ ...buttonStyle(true), padding: '4px 10px', fontSize: '11px' }} onClick={() => setActiveRequestForExpense(req)}>
                          ➕ {t.addReceipt}
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-bright)', marginBottom: '12px' }}>
                    <strong>{t.travelPurpose}:</strong> {req.purpose}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.travelEstimatedBudget}</span>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>{formatCurrency(req.estimatedBudget)}</p>
                    </div>
                    {req.approvedBudget && (
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.travelApprovedBudget}</span>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>{formatCurrency(req.approvedBudget)}</p>
                      </div>
                    )}
                  </div>

                  {req.adminNotes && (
                    <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #6b7280', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <strong>Notes:</strong> {req.adminNotes}
                    </div>
                  )}

                  {/* Expense list */}
                  {req.travelExpenses && req.travelExpenses.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '10px' }}>
                        💵 Biaya Dinas Realisasikan ({req.travelExpenses.length} Nota)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {req.travelExpenses.map((exp) => (
                          <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-bright)' }}>{EXPENSE_ICONS[exp.expenseType] || exp.expenseType}</span>
                              {exp.description && <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{exp.description}</p>}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{formatCurrency(exp.amount)}</span>
                              <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: getStatusColor(exp.status), marginTop: '2px' }}>
                                {exp.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ALL TRIPS TAB (HR ADMIN VIEW) */}
      {activeTab === 'all_trips' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', color: 'var(--text-muted)' }}>
              No travel requests registered.
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-bright)' }}>🛫 Destination: {req.destination}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Karyawan: <strong>{req.employeeName}</strong> ({req.employeeEmail})
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      📅 <strong>{new Date(req.startDate).toLocaleDateString()}</strong> s/d <strong>{new Date(req.endDate).toLocaleDateString()}</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: `${getStatusColor(req.status)}20`, color: getStatusColor(req.status) }}>
                      {req.status}
                    </span>
                    {req.status === 'PENDING' && (
                      <button style={{ ...buttonStyle(true), background: 'var(--primary-color)' }} onClick={() => setEvaluatingTrip(req)}>
                        ⚙️ {t.processTravel}
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-bright)', marginBottom: '10px' }}>
                  <strong>{t.travelPurpose}:</strong> {req.purpose}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Estimated Cost</span>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>{formatCurrency(req.estimatedBudget)}</p>
                  </div>
                  {req.approvedBudget && (
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Approved Budget</span>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>{formatCurrency(req.approvedBudget)}</p>
                    </div>
                  )}
                </div>

                {/* Expense Receipts pending approvals */}
                {req.travelExpenses && req.travelExpenses.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '10px' }}>
                      📋 Expense Receipts Pipeline
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {req.travelExpenses.map((exp) => (
                        <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-bright)' }}>{EXPENSE_ICONS[exp.expenseType] || exp.expenseType}</span>
                            <span style={{ fontSize: '12px', color: '#10b981', marginLeft: '12px', fontWeight: 700 }}>{formatCurrency(exp.amount)}</span>
                            {exp.description && <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{exp.description}</p>}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {exp.status === 'PENDING' ? (
                              <>
                                <button style={{ ...buttonStyle(true), background: '#10b981', padding: '4px 8px', fontSize: '11px' }} onClick={() => handleProcessExpense(req.id, exp.id, 'APPROVED')}>
                                  Approve
                                </button>
                                <button style={{ ...buttonStyle(true), background: '#ef4444', padding: '4px 8px', fontSize: '11px' }} onClick={() => handleProcessExpense(req.id, exp.id, 'REJECTED')}>
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span style={{ fontSize: '11px', fontWeight: 700, color: getStatusColor(exp.status) }}>
                                {exp.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: SUBMIT TRAVEL REQUEST */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ ...cardStyle, width: '90%', maxWidth: '500px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>📝 {t.submitTravel}</h3>
              <button onClick={() => setShowSubmitModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleSubmitRequest}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lang === 'id' ? 'Nama Karyawan' : 'Employee Name'} *</label>
              <input style={inputStyle} value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} required />

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lang === 'id' ? 'ID Karyawan' : 'Employee ID'} *</label>
              <input style={inputStyle} type="number" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.travelDestination} *</label>
              <input style={inputStyle} value={destination} onChange={(e) => setDestination(e.target.value)} required placeholder="e.g. Jakarta Office / Bali Summit" />

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.travelPurpose} *</label>
              <textarea style={{ ...inputStyle, fontFamily: 'inherit' }} rows={3} value={purpose} onChange={(e) => setPurpose(e.target.value)} required />

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lang === 'id' ? 'Tgl Mulai' : 'Start Date'} *</label>
                  <input style={inputStyle} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lang === 'id' ? 'Tgl Selesai' : 'End Date'} *</label>
                  <input style={inputStyle} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.travelEstimatedBudget} (IDR) *</label>
              <input style={inputStyle} type="number" value={estimatedBudget} onChange={(e) => setEstimatedBudget(e.target.value)} required />

              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? '⏳ ...' : `🚀 ${lang === 'id' ? 'Kirim Pengajuan' : 'Submit'}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT EXPENSE RECEIPT */}
      {activeRequestForExpense && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ ...cardStyle, width: '90%', maxWidth: '450px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>💵 {t.addReceipt}</h3>
              <button onClick={() => setActiveRequestForExpense(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleSubmitExpense}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Add travel expense receipt for trip to <strong>{activeRequestForExpense.destination}</strong>.
              </p>

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.expenseType} *</label>
              <select style={inputStyle} value={expenseType} onChange={(e) => setExpenseType(e.target.value as any)}>
                <option value="FLIGHT">✈️ FLIGHT</option>
                <option value="HOTEL">🏨 ACCOMMODATION</option>
                <option value="MEALS">🍔 MEALS</option>
                <option value="TRANSPORT">🚕 LOCAL TRANSPORT</option>
                <option value="OTHER">📄 OTHER</option>
              </select>

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.expenseAmount} (IDR) *</label>
              <input style={inputStyle} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.receiptLink}</label>
              <input style={inputStyle} value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} placeholder="e.g. http://imgur.com/receipt-xyz.png" />

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Description / Remarks</label>
              <input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. taxi receipt to airport" />

              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? '⏳ ...' : `💾 Submit Receipt`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROCESS TRAVEL BUDGET (HR ADMIN) */}
      {evaluatingTrip && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ ...cardStyle, width: '90%', maxWidth: '450px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>⚙️ {t.processTravel}</h3>
              <button onClick={() => setEvaluatingTrip(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleProcessRequest}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Review travel request for <strong>{evaluatingTrip.employeeName}</strong> to <strong>{evaluatingTrip.destination}</strong>.
              </p>

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Action Decision *</label>
              <select style={inputStyle} value={evalStatus} onChange={(e) => setEvalStatus(e.target.value as any)}>
                <option value="APPROVED">🟢 APPROVE</option>
                <option value="REJECTED">🔴 REJECT</option>
              </select>

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Approved Budget (IDR)</label>
              <input style={inputStyle} type="number" value={approvedBudget} onChange={(e) => setApprovedBudget(e.target.value)} placeholder={`Estimasi: ${evaluatingTrip.estimatedBudget}`} />

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Admin Evaluation Notes</label>
              <textarea style={{ ...inputStyle, fontFamily: 'inherit' }} rows={3} value={evalNotes} onChange={(e) => setEvalNotes(e.target.value)} />

              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? '⏳ ...' : `💾 Save Decision`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
