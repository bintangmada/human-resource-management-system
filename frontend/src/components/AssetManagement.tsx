import React, { useState, useEffect } from 'react';
import { ApiResponse, AssetResponse, AssetRequestResponse, EmployeeResponse } from '../types';
import { translations } from '../utils/i18n';

interface AssetManagementProps {
  tenantId: string;
  actorEmail: string;
  lang: 'id' | 'en';
  theme: 'light' | 'dark';
}

export function AssetManagement({ tenantId, actorEmail, lang, theme }: AssetManagementProps) {
  const t = translations[lang];

  // Tabs: 'assets' | 'my_assets' | 'requests'
  const [activeTab, setActiveTab] = useState<'assets' | 'my_assets' | 'requests'>('assets');

  // Loading & Alerts
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data lists
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [myAssets, setMyAssets] = useState<AssetResponse[]>([]);
  const [requests, setRequests] = useState<AssetRequestResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);

  // Register Asset Form states
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [assetNameInput, setAssetNameInput] = useState('');
  const [serialNumberInput, setSerialNumberInput] = useState('');
  const [assetCategoryInput, setAssetCategoryInput] = useState('ELECTRONICS');
  const [purchaseDateInput, setPurchaseDateInput] = useState('');
  const [assigneeEmpId, setAssigneeEmpId] = useState<number | ''>('');

  // Request Asset/Repair Form states
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestAssetId, setRequestAssetId] = useState<number | ''>('');
  const [requestAssetName, setRequestAssetName] = useState('');
  const [requestTypeInput, setRequestTypeInput] = useState<'REQUISITION' | 'REPAIR' | 'RETURN'>('REQUISITION');
  const [requestReasonInput, setRequestReasonInput] = useState('');

  // Action Process Modal states
  const [selectedRequest, setSelectedRequest] = useState<AssetRequestResponse | null>(null);
  const [processStatus, setProcessStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [adminNotesInput, setAdminNotesInput] = useState('');

  const API_BASE = 'http://localhost:8020/api/v1/assets';
  const EMPLOYEES_API = 'http://localhost:8020/api/v1/employees';

  const isHR = actorEmail.includes('hrd') || actorEmail.includes('admin') || actorEmail.includes('owner') || actorEmail.includes('manager');

  useEffect(() => {
    fetchAssets();
    fetchMyAssets();
    fetchRequests();
    if (isHR) {
      fetchEmployees();
    }
  }, [tenantId, activeTab]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}?size=100`, {
        headers: {
          'X-Tenant-ID': tenantId,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<{ content: AssetResponse[] }> = await res.json();
      if (data.success) {
        const content = (data.data as any).content || data.data;
        setAssets(Array.isArray(content) ? content : []);
      }
    } catch (err) {
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAssets = async () => {
    try {
      const res = await fetch(`${API_BASE}/my`, {
        headers: {
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<AssetResponse[]> = await res.json();
      if (data.success) {
        setMyAssets(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching my assets:', err);
    }
  };

  const fetchRequests = async () => {
    const url = isHR ? `${API_BASE}/requests?size=100` : `${API_BASE}/requests/my?size=100`;
    try {
      const res = await fetch(url, {
        headers: {
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<{ content: AssetRequestResponse[] }> = await res.json();
      if (data.success) {
        const content = (data.data as any).content || data.data;
        setRequests(Array.isArray(content) ? content : []);
      }
    } catch (err) {
      console.error('Error fetching asset requests:', err);
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

  // Register Asset
  const handleRegisterAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const resolvedEmp = employees.find(emp => emp.id === Number(assigneeEmpId));

    const payload = {
      assetName: assetNameInput,
      serialNumber: serialNumberInput,
      category: assetCategoryInput,
      purchaseDate: purchaseDateInput || null,
      employeeId: assigneeEmpId ? Number(assigneeEmpId) : null,
      employeeName: resolvedEmp ? resolvedEmp.name : null
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
      const data: ApiResponse<AssetResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Aset baru berhasil didaftarkan!' : 'New asset registered successfully!');
        setAssetNameInput('');
        setSerialNumberInput('');
        setPurchaseDateInput('');
        setAssigneeEmpId('');
        setShowRegisterForm(false);
        fetchAssets();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Gagal menghubungkan ke server' : 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Submit Request Asset/Repair
  const handleRequestAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // If REQUISITION, employeeId is the current actor. Let's lookup current employee id.
    // To simplify: we find the employee object matching current actorEmail or prompt user
    let resolvedEmployeeId = 999; 
    const currentEmp = employees.find(emp => emp.email === actorEmail);
    if (currentEmp) resolvedEmployeeId = currentEmp.id;

    const resolvedAsset = assets.find(a => a.id === Number(requestAssetId));

    const payload = {
      assetId: requestAssetId ? Number(requestAssetId) : null,
      assetName: resolvedAsset ? resolvedAsset.assetName : requestAssetName,
      employeeId: resolvedEmployeeId,
      requestType: requestTypeInput,
      reason: requestReasonInput
    };

    try {
      const res = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<AssetRequestResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Pengajuan aset berhasil dikirim!' : 'Asset request submitted successfully!');
        setRequestAssetId('');
        setRequestAssetName('');
        setRequestReasonInput('');
        setShowRequestForm(false);
        fetchRequests();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Masalah koneksi' : 'Connection problem');
    } finally {
      setLoading(false);
    }
  };

  // Process Request (Approve/Reject)
  const handleProcessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      status: processStatus,
      adminNotes: adminNotesInput
    };

    try {
      const res = await fetch(`${API_BASE}/requests/${selectedRequest.id}/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<AssetRequestResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Pengajuan aset berhasil diproses!' : 'Asset request processed!');
        setSelectedRequest(null);
        setAdminNotesInput('');
        fetchRequests();
        fetchAssets();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Gagal memproses pengajuan' : 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#10b981'; // Green
      case 'ASSIGNED': return '#3b82f6'; // Blue
      case 'UNDER_REPAIR': return '#f59e0b'; // Amber
      case 'RETIRED': return '#ef4444'; // Red
      case 'APPROVED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      case 'PENDING': return '#8b5cf6';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="asset-module-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      
      {/* Banner */}
      <div className="module-banner glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📦 {t.assets}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '800px' }}>
          {t.assetsDesc}
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-menu" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', marginBottom: '20px' }}>
        {isHR && (
          <button
            className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'assets' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
          >
            🏢 {lang === 'id' ? 'Direktori Aset' : 'Asset Directory'}
          </button>
        )}
        <button
          className={`tab-btn ${activeTab === 'my_assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_assets')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'my_assets' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
        >
          🔑 {t.myAssets}
        </button>
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'requests' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
        >
          🎫 {t.assetRequests}
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

      {/* TAB 1: ASSET DIRECTORY (HR ONLY) */}
      {activeTab === 'assets' && isHR && (
        <div>
          <button
            onClick={() => setShowRegisterForm(true)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', marginBottom: '20px', fontSize: '13px', fontWeight: '600' }}
          >
            ➕ {t.registerAsset}
          </button>

          {/* REGISTER ASSET FORM */}
          {showRegisterForm && (
            <form onSubmit={handleRegisterAsset} className="card glass-panel" style={{ maxWidth: '600px', padding: '24px', borderRadius: '16px', background: 'rgba(30, 30, 40, 0.5)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '700' }}>📢 {t.registerAsset}</h3>
                <button type="button" onClick={() => setShowRegisterForm(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.assetName} *</label>
                  <input
                    type="text"
                    value={assetNameInput}
                    onChange={(e) => setAssetNameInput(e.target.value)}
                    placeholder="e.g. Dell XPS 15 Laptop"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.serialNumber} *</label>
                  <input
                    type="text"
                    value={serialNumberInput}
                    onChange={(e) => setSerialNumberInput(e.target.value)}
                    placeholder="e.g. SN-XYZ987"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.assetCategory} *</label>
                  <select
                    value={assetCategoryInput}
                    onChange={(e) => setAssetCategoryInput(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    <option value="ELECTRONICS">ELECTRONICS</option>
                    <option value="FURNITURE">FURNITURE</option>
                    <option value="VEHICLE">VEHICLE</option>
                    <option value="STATIONERY">STATIONERY</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.purchaseDate}</label>
                  <input
                    type="date"
                    value={purchaseDateInput}
                    onChange={(e) => setPurchaseDateInput(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{lang === 'id' ? 'Alokasikan Ke Karyawan' : 'Allocate to Employee'}</label>
                <select
                  value={assigneeEmpId}
                  onChange={(e) => setAssigneeEmpId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  <option value="">{lang === 'id' ? '-- Simpan Sebagai Tersedia (Available) --' : '-- Leave as Available --'}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeNumber})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
              >
                💾 Save Asset Registry
              </button>
            </form>
          )}

          {/* ASSET DIRECTORY TABLE */}
          <div className="table-container glass-panel" style={{ background: 'rgba(30, 30, 40, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>{t.assetName}</th>
                  <th style={{ padding: '12px' }}>{t.serialNumber}</th>
                  <th style={{ padding: '12px' }}>{t.assetCategory}</th>
                  <th style={{ padding: '12px' }}>{t.assetStatus}</th>
                  <th style={{ padding: '12px' }}>{lang === 'id' ? 'Penanggung Jawab' : 'Allocated To'}</th>
                  <th style={{ padding: '12px' }}>{lang === 'id' ? 'Tgl Alokasi' : 'Allocated Date'}</th>
                </tr>
              </thead>
              <tbody>
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No assets registered yet.
                    </td>
                  </tr>
                ) : (
                  assets.map(asset => (
                    <tr key={asset.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: 'var(--text-bright)' }}>{asset.assetName}</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>{asset.serialNumber}</td>
                      <td style={{ padding: '12px' }}>{asset.category}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: `${getStatusBadgeColor(asset.status)}25`,
                          color: getStatusBadgeColor(asset.status)
                        }}>
                          {asset.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{asset.employeeName || '-'}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                        {asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MY ALLOCATED ASSETS (EMPLOYEE PROFILE VIEW) */}
      {activeTab === 'my_assets' && (
        <div style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '700' }}>🔑 {t.myAssets}</h3>
            <button
              onClick={() => {
                setShowRequestForm(true);
                setRequestTypeInput('REQUISITION');
              }}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
            >
              🙋 {t.requestAsset}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {myAssets.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                {lang === 'id' ? 'Anda belum memiliki aset kantor yang dialokasikan.' : 'No company assets allocated to your account.'}
              </div>
            ) : (
              myAssets.map(asset => (
                <div key={asset.id} className="card glass-panel" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(30, 30, 40, 0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
                      {asset.category}
                    </span>
                    <span style={{ fontSize: '11px', color: getStatusBadgeColor(asset.status) }}>{asset.status}</span>
                  </div>
                  <h4 style={{ fontSize: '15px', color: '#fff', fontWeight: '700', marginBottom: '4px' }}>{asset.assetName}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '14px' }}>SN: {asset.serialNumber}</p>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => {
                        setRequestAssetId(asset.id);
                        setRequestAssetName(asset.assetName);
                        setRequestTypeInput('REPAIR');
                        setShowRequestForm(true);
                      }}
                      style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'none', color: '#f59e0b', fontSize: '11px', cursor: 'pointer' }}
                    >
                      🔧 Report Repair
                    </button>
                    <button
                      onClick={() => {
                        setRequestAssetId(asset.id);
                        setRequestAssetName(asset.assetName);
                        setRequestTypeInput('RETURN');
                        setShowRequestForm(true);
                      }}
                      style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}
                    >
                      ↩️ Return Asset
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ASSET REQUESTS & TICKETS */}
      {activeTab === 'requests' && (
        <div className="table-container glass-panel" style={{ background: 'rgba(30, 30, 40, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>{lang === 'id' ? 'Karyawan' : 'Employee'}</th>
                <th style={{ padding: '12px' }}>{t.assetName}</th>
                <th style={{ padding: '12px' }}>{t.requestType}</th>
                <th style={{ padding: '12px' }}>{t.requestReason}</th>
                <th style={{ padding: '12px' }}>Status</th>
                {isHR && <th style={{ padding: '12px', textAlign: 'center' }}>{lang === 'id' ? 'Aksi' : 'Action'}</th>}
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No asset requests filed.
                  </td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: '500', color: 'var(--text-bright)' }}>{req.employeeName}</td>
                    <td style={{ padding: '12px' }}>{req.assetName}</td>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{req.requestType}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{req.reason}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: `${getStatusBadgeColor(req.status)}25`,
                        color: getStatusBadgeColor(req.status)
                      }}>
                        {req.status}
                      </span>
                    </td>
                    {isHR && (
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {req.status === 'PENDING' ? (
                          <button
                            onClick={() => setSelectedRequest(req)}
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}
                          >
                            ⚙️ Process Request
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Processed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* REQUEST ASSET FORM MODAL OVERLAY */}
      {showRequestForm && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleRequestAsset} className="modal-content glass-panel" style={{ width: '90%', maxWidth: '480px', background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '700' }}>🙋 {t.requestAsset}</h3>
              <button type="button" onClick={() => setShowRequestForm(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            {requestTypeInput === 'REQUISITION' ? (
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.assetName} *</label>
                <input
                  type="text"
                  value={requestAssetName}
                  onChange={(e) => setRequestAssetName(e.target.value)}
                  placeholder="e.g. Ergonomic Office Chair"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                />
              </div>
            ) : (
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Selected Asset</label>
                <input
                  type="text"
                  value={requestAssetName}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  disabled
                />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.requestType}</label>
              <select
                value={requestTypeInput}
                onChange={(e) => setRequestTypeInput(e.target.value as any)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                disabled={requestTypeInput !== 'REQUISITION'}
              >
                <option value="REQUISITION">REQUISITION (Permintaan Baru)</option>
                <option value="REPAIR">REPAIR (Laporan Kerusakan)</option>
                <option value="RETURN">RETURN (Pengembalian Aset)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.requestReason} *</label>
              <textarea
                value={requestReasonInput}
                onChange={(e) => setRequestReasonInput(e.target.value)}
                rows={4}
                placeholder={lang === 'id' ? 'Masukkan alasan pengajuan atau detail kerusakan aset...' : 'Provide context or details about the asset damage/issue...'}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit' }}
                required
              />
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
            >
              🚀 Submit Ticket
            </button>
          </form>
        </div>
      )}

      {/* PROCESS REQUEST MODAL OVERLAY (HR ONLY) */}
      {selectedRequest && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleProcessRequest} className="modal-content glass-panel" style={{ width: '90%', maxWidth: '480px', background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '700' }}>⚙️ {t.processRequest}</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Ticket #{selectedRequest.id} - Type: {selectedRequest.requestType}</p>
              </div>
              <button type="button" onClick={() => setSelectedRequest(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Decision *</label>
              <select
                value={processStatus}
                onChange={(e) => setProcessStatus(e.target.value as any)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              >
                <option value="APPROVED">APPROVE (Setujui)</option>
                <option value="REJECTED">REJECT (Tolak)</option>
              </select>
            </div>

            {processStatus === 'APPROVED' && selectedRequest.requestType === 'REQUISITION' && (
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {lang === 'id' ? 'Pilih Aset Fisik Untuk Dialokasikan *' : 'Select Inventory Asset to Allocate *'}
                </label>
                <select
                  value={requestAssetId}
                  onChange={(e) => setRequestAssetId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                >
                  <option value="">-- Select Available Asset --</option>
                  {assets.filter(a => a.status === 'AVAILABLE').map(a => (
                    <option key={a.id} value={a.id}>{a.assetName} (SN: {a.serialNumber})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>HR Admin Notes</label>
              <textarea
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                rows={3}
                placeholder={lang === 'id' ? 'Masukkan catatan alasan persetujuan/penolakan...' : 'Enter response comments...'}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit' }}
              />
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
            >
              ✓ Save Decision
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
