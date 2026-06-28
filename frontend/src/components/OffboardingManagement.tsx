import React, { useState, useEffect } from 'react';
import { OffboardingRequestResponse, ClearanceChecklistResponse } from '../types';
import { translations } from '../utils/i18n';

interface Props {
  tenantId: string;
  actorEmail: string;
  lang: 'id' | 'en';
  theme: 'light' | 'dark';
}

const API_BASE = 'http://localhost:8020/api/v1/offboarding';

const DEPT_BADGE_STYLE: Record<string, React.CSSProperties> = {
  IT: { background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  HR: { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  OFFICE_MANAGER: { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  FINANCE: { background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' },
};

export function OffboardingManagement({ tenantId, actorEmail, lang }: Props) {
  const t = translations[lang];
  const isHR = /hrd|admin|owner|manager/.test(actorEmail.toLowerCase());

  const [activeTab, setActiveTab] = useState<'my_request' | 'all_requests'>('my_request');
  const [requests, setRequests] = useState<OffboardingRequestResponse[]>([]);
  const [myRequests, setMyRequests] = useState<OffboardingRequestResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form submission states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [resignationDate, setResignationDate] = useState('');
  const [reason, setReason] = useState('');

  // Evaluation states
  const [evaluatingRequest, setEvaluatingRequest] = useState<OffboardingRequestResponse | null>(null);
  const [evalStatus, setEvalStatus] = useState<'APPROVED' | 'REJECTED' | 'COMPLETED'>('APPROVED');
  const [evalNotes, setEvalNotes] = useState('');

  // Checklist updates state
  const [selectedItem, setSelectedItem] = useState<{ reqId: number; item: ClearanceChecklistResponse } | null>(null);
  const [itemStatus, setItemStatus] = useState<'PENDING' | 'COMPLETED'>('COMPLETED');
  const [itemRemarks, setItemRemarks] = useState('');

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
      setErrorMsg('Failed to load offboarding requests.');
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
          resignationDate,
          reason
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Pengajuan resign berhasil dikirim!' : 'Resignation request submitted successfully!');
        setShowSubmitModal(false);
        setEmployeeId('');
        setEmployeeName('');
        setResignationDate('');
        setReason('');
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
    if (!evaluatingRequest) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/requests/${evaluatingRequest.id}/process`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          status: evalStatus,
          adminNotes: evalNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Status pengajuan berhasil diperbarui!' : 'Resignation request processed successfully!');
        setEvaluatingRequest(null);
        setEvalNotes('');
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

  const handleUpdateChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/requests/${selectedItem.reqId}/items/${selectedItem.item.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          status: itemStatus,
          remarks: itemRemarks
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Status clearance berhasil diperbarui!' : 'Clearance checklist updated successfully!');
        setSelectedItem(null);
        setItemRemarks('');
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
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(59, 130, 246, 0.05))' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🚪 {t.offboarding}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '800px' }}>
          {t.offboardingDesc}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '20px' }}>
        <button style={buttonStyle(activeTab === 'my_request')} onClick={() => setActiveTab('my_request')}>
          👤 {lang === 'id' ? 'Pengajuan Saya' : 'My Requests'}
        </button>
        {isHR && (
          <button style={buttonStyle(activeTab === 'all_requests')} onClick={() => setActiveTab('all_requests')}>
            📂 {lang === 'id' ? 'Seluruh Pengajuan Karyawan' : 'All Employee Requests'}
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

      {/* MY REQUEST TAB */}
      {activeTab === 'my_request' && (
        <div>
          <button style={{ ...buttonStyle(true), marginBottom: '20px' }} onClick={() => setShowSubmitModal(true)}>
            📝 {t.submitResignation}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {myRequests.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', color: 'var(--text-muted)' }}>
                {lang === 'id' ? 'Anda belum memiliki pengajuan resign.' : 'You have not submitted any resignation requests.'}
              </div>
            ) : (
              myRequests.map((req) => (
                <div key={req.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginBottom: '14px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-bright)' }}>{req.employeeName}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        📅 Last Day: <strong>{new Date(req.resignationDate).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                      </p>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: `${getStatusColor(req.status)}20`, color: getStatusColor(req.status) }}>
                      {req.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-bright)', lineHeight: '1.5' }}>
                    <strong>{t.resignationReason}:</strong> {req.reason}
                  </p>
                  {req.adminNotes && (
                    <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #6b7280', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <strong>Admin Notes:</strong> {req.adminNotes}
                    </div>
                  )}

                  {/* Clearance Checklist */}
                  {req.clearanceChecklists && req.clearanceChecklists.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '12px' }}>
                        📋 {t.clearanceChecklist}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                        {req.clearanceChecklists.map((item) => (
                          <div key={item.id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, ...DEPT_BADGE_STYLE[item.department] }}>
                                {item.department}
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: item.status === 'COMPLETED' ? '#10b981' : '#f59e0b' }}>
                                {item.status}
                              </span>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-bright)', fontWeight: 600 }}>{item.itemName}</p>
                            {item.remarks && (
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                                "{item.remarks}"
                              </p>
                            )}
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

      {/* ALL REQUESTS TAB (HR ADMIN VIEW) */}
      {activeTab === 'all_requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', color: 'var(--text-muted)' }}>
              No resignation requests registered.
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-bright)' }}>{req.employeeName}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email: {req.employeeEmail}</span>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      📅 Last Working Day: <strong>{new Date(req.resignationDate).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: `${getStatusColor(req.status)}20`, color: getStatusColor(req.status) }}>
                      {req.status}
                    </span>
                    {req.status === 'PENDING' && (
                      <button style={{ ...buttonStyle(true), background: 'var(--primary-color)' }} onClick={() => setEvaluatingRequest(req)}>
                        ✏️ {t.processRequest}
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-bright)', marginBottom: '10px' }}>
                  <strong>{t.resignationReason}:</strong> {req.reason}
                </p>

                {/* Clearance Checklist Tracker */}
                {req.clearanceChecklists && req.clearanceChecklists.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '12px' }}>
                      ⚙️ Department Clearance Tracking
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                      {req.clearanceChecklists.map((item) => (
                        <div key={item.id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, ...DEPT_BADGE_STYLE[item.department] }}>
                              {item.department}
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: item.status === 'COMPLETED' ? '#10b981' : '#f59e0b' }}>
                                {item.status}
                              </span>
                              {req.status === 'APPROVED' && (
                                <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '11px' }} onClick={() => setSelectedItem({ reqId: req.id, item })}>
                                  ⚙️
                                </button>
                              )}
                            </div>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-bright)', fontWeight: 600 }}>{item.itemName}</p>
                          {item.remarks && (
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                              "{item.remarks}"
                            </p>
                          )}
                          {item.checkedBy && (
                            <p style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px' }}>
                              Approved by: {item.checkedBy}
                            </p>
                          )}
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

      {/* MODAL: SUBMIT RESIGNATION */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ ...cardStyle, width: '90%', maxWidth: '500px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>📝 {t.submitResignation}</h3>
              <button onClick={() => setShowSubmitModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleSubmitRequest}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lang === 'id' ? 'Nama Karyawan' : 'Employee Name'} *</label>
              <input style={inputStyle} value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} required />

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lang === 'id' ? 'ID Karyawan' : 'Employee ID'} *</label>
              <input style={inputStyle} type="number" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.resignationDate} *</label>
              <input style={inputStyle} type="date" value={resignationDate} onChange={(e) => setResignationDate(e.target.value)} required />

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.resignationReason} *</label>
              <textarea style={{ ...inputStyle, fontFamily: 'inherit' }} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} required />

              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? '⏳ ...' : `🚀 ${lang === 'id' ? 'Kirim Pengajuan' : 'Submit'}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROCESS REQUEST (HR ADMIN) */}
      {evaluatingRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ ...cardStyle, width: '90%', maxWidth: '450px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>⚙️ {t.processResignation}</h3>
              <button onClick={() => setEvaluatingRequest(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleProcessRequest}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Evaluating resignation request for <strong>{evaluatingRequest.employeeName}</strong>.
              </p>

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Action Decision *</label>
              <select style={inputStyle} value={evalStatus} onChange={(e) => setEvalStatus(e.target.value as any)}>
                <option value="APPROVED">🟢 APPROVE (Start Clearance)</option>
                <option value="REJECTED">🔴 REJECT</option>
              </select>

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Admin Evaluation Notes</label>
              <textarea style={{ ...inputStyle, fontFamily: 'inherit' }} rows={3} value={evalNotes} onChange={(e) => setEvalNotes(e.target.value)} />

              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? '⏳ ...' : `💾 Save Decision`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE CHECKLIST ITEM */}
      {selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ ...cardStyle, width: '90%', maxWidth: '400px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>⚙️ Update Clearance Status</h3>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleUpdateChecklistItem}>
              <p style={{ fontSize: '13px', color: 'var(--text-bright)', fontWeight: 600, marginBottom: '4px' }}>
                {selectedItem.item.itemName}
              </p>
              <span style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, ...DEPT_BADGE_STYLE[selectedItem.item.department] }}>
                {selectedItem.item.department}
              </span>

              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '16px' }}>Status *</label>
              <select style={inputStyle} value={itemStatus} onChange={(e) => setItemStatus(e.target.value as any)}>
                <option value="PENDING">🟡 PENDING</option>
                <option value="COMPLETED">🟢 COMPLETED</option>
              </select>

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Remarks</label>
              <input style={inputStyle} value={itemRemarks} onChange={(e) => setItemRemarks(e.target.value)} placeholder="e.g. Returned laptop serial SN-889" />

              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? '⏳ ...' : `💾 Save Item Status`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
