import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  EmployeeResponse,
  ApiResponse,
  LeaveTypeResponse,
  LeaveBalanceResponse,
  LeaveRequestResponse
} from '../types';
import { Language, translations } from '../utils/i18n';

interface LeaveManagementProps {
  tenantId: string;
  actorEmail: string;
  lang: Language;
  theme: 'dark' | 'light';
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({ tenantId, actorEmail, lang, theme }) => {
  const t = translations[lang] as any;
  const actorRole = localStorage.getItem('hrms_actor_role') || 'Staff';
  const isAdminOrHR = actorRole === 'HR' || actorRole === 'ADMIN';

  // State
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeResponse | null>(null);
  const [allEmployees, setAllEmployees] = useState<EmployeeResponse[]>([]);
  const [balances, setBalances] = useState<LeaveBalanceResponse[]>([]);
  const [requests, setRequests] = useState<LeaveRequestResponse[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeResponse[]>([]);
  
  // Tab within leave module: 'my-leave' or 'admin'
  const [subTab, setSubTab] = useState<'my-leave' | 'admin'>(isAdminOrHR ? 'admin' : 'my-leave');
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states - Request Leave
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formLeaveTypeId, setFormLeaveTypeId] = useState<string>('');
  const [formStartDate, setFormStartDate] = useState<string>('');
  const [formEndDate, setFormEndDate] = useState<string>('');
  const [formReason, setFormReason] = useState<string>('');

  // Form states - Leave Type Config (Admin)
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<LeaveTypeResponse | null>(null);
  const [typeName, setTypeName] = useState('');
  const [typeEntitlement, setTypeEntitlement] = useState(12);
  const [typeRequiresApproval, setTypeRequiresApproval] = useState(true);

  // Form states - Balance Allocation (Admin)
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [allocEmployeeId, setAllocEmployeeId] = useState('');
  const [allocLeaveTypeId, setAllocLeaveTypeId] = useState('');
  const [allocEntitlement, setAllocEntitlement] = useState(12);
  const [allocYear, setAllocYear] = useState(new Date().getFullYear());

  // Form states - Reject/Approve popover notes
  const [showApprovalNotesModal, setShowApprovalNotesModal] = useState(false);
  const [actionRequest, setActionRequest] = useState<LeaveRequestResponse | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Pagination & Filter for Admin Requests list
  const [adminFilterStatus, setAdminFilterStatus] = useState<string>('');
  const [adminRequestsPage, setAdminRequestsPage] = useState(0);
  const [adminRequestsTotalPages, setAdminRequestsTotalPages] = useState(1);

  // Fetch logged in employee on mount
  useEffect(() => {
    fetchCurrentEmployee();
    if (isAdminOrHR) {
      fetchEmployees();
    }
    fetchLeaveTypes();
  }, [tenantId, actorEmail]);

  // If current employee resolves, fetch their balances & requests
  useEffect(() => {
    if (currentEmployee) {
      fetchMyBalances();
      fetchMyRequests();
    }
  }, [currentEmployee]);

  // Fetch data depending on subTab choice
  useEffect(() => {
    if (subTab === 'admin' && isAdminOrHR) {
      fetchAdminRequests();
    }
  }, [subTab, adminFilterStatus, adminRequestsPage]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const fetchCurrentEmployee = async () => {
    try {
      const res = await apiRequest<ApiResponse<EmployeeResponse[]>>(`/employees?email=${actorEmail}`);
      if (res && res.data && res.data.length > 0) {
        setCurrentEmployee(res.data[0]);
      } else {
        // Fallback or create mock employee if none exists
        console.warn("No employee found matching actor email " + actorEmail);
      }
    } catch (e) {
      console.error("Error fetching current employee", e);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await apiRequest<ApiResponse<EmployeeResponse[]>>('/employees?size=1000');
      if (res && res.data) {
        setAllEmployees(res.data);
      }
    } catch (e) {
      console.error("Error fetching employee list", e);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await apiRequest<ApiResponse<LeaveTypeResponse[]>>('/leave/types/active');
      if (res && res.data) {
        setLeaveTypes(res.data);
      }
    } catch (e) {
      console.error("Error fetching leave types", e);
    }
  };

  const fetchMyBalances = async () => {
    if (!currentEmployee) return;
    try {
      const res = await apiRequest<ApiResponse<LeaveBalanceResponse[]>>(`/leave/balances?employeeId=${currentEmployee.id}`);
      if (res && res.data) {
        setBalances(res.data);
      }
    } catch (e) {
      console.error("Error fetching balances", e);
    }
  };

  const fetchMyRequests = async () => {
    if (!currentEmployee) return;
    try {
      const res = await apiRequest<ApiResponse<LeaveRequestResponse[]>>(`/leave/requests?employeeId=${currentEmployee.id}&size=50`);
      if (res && res.data) {
        // JpaPage returns content inside data or is list directly
        const list = Array.isArray(res.data) ? res.data : (res.data as any).content || [];
        setRequests(list);
      }
    } catch (e) {
      console.error("Error fetching my requests", e);
    }
  };

  const fetchAdminRequests = async () => {
    setLoading(true);
    try {
      let url = `/leave/requests?page=${adminRequestsPage}&size=10`;
      if (adminFilterStatus) {
        url += `&status=${adminFilterStatus}`;
      }
      const res = await apiRequest<ApiResponse<any>>(url);
      if (res && res.data) {
        const content = res.data.content || [];
        setRequests(content);
        if (res.pagination) {
          setAdminRequestsTotalPages(res.pagination.totalPages);
        }
      }
    } catch (e) {
      console.error("Error fetching admin requests", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) {
      showToast('error', 'Employee information not loaded yet');
      return;
    }
    if (!formLeaveTypeId || !formStartDate || !formEndDate) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        leaveTypeId: Long(formLeaveTypeId),
        startDate: formStartDate,
        endDate: formEndDate,
        reason: formReason
      };

      const res = await apiRequest<ApiResponse<LeaveRequestResponse>>(`/leave/requests?employeeId=${currentEmployee.id}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        showToast('success', t.saveSuccess || 'Leave request submitted successfully');
        setIsApplyModalOpen(false);
        // Reset form
        setFormLeaveTypeId('');
        setFormStartDate('');
        setFormEndDate('');
        setFormReason('');
        // Refresh
        fetchMyBalances();
        fetchMyRequests();
      } else {
        showToast('error', res?.message || 'Failed to submit leave request');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Error occurred while processing request');
    }
  };

  const handleCancelRequest = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      const res = await apiRequest<ApiResponse<LeaveRequestResponse>>(`/leave/requests/${id}/cancel`, {
        method: 'PUT'
      });
      if (res && res.success) {
        showToast('success', 'Leave request cancelled successfully');
        fetchMyBalances();
        fetchMyRequests();
      } else {
        showToast('error', res?.message || 'Failed to cancel request');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Error cancelling request');
    }
  };

  // Helper utility to safely parse numbers
  const Long = (val: string) => parseInt(val, 10);

  // Admin approval / rejection
  const openApprovalModal = (req: LeaveRequestResponse, type: 'approve' | 'reject') => {
    setActionRequest(req);
    setActionType(type);
    setApprovalNotes('');
    setShowApprovalNotesModal(true);
  };

  const submitActionRequest = async () => {
    if (!actionRequest) return;
    try {
      const url = `/leave/requests/${actionRequest.id}/${actionType}`;
      const res = await apiRequest<ApiResponse<LeaveRequestResponse>>(url, {
        method: 'PUT',
        body: JSON.stringify({ notes: approvalNotes })
      });

      if (res && res.success) {
        showToast('success', `Request has been successfully ${actionType}d`);
        setShowApprovalNotesModal(false);
        setActionRequest(null);
        fetchAdminRequests();
      } else {
        showToast('error', res?.message || 'Action failed');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Error processing action');
    }
  };

  // Leave Type Config management
  const handleSaveLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName) {
      showToast('error', 'Name is required');
      return;
    }
    try {
      const payload = {
        name: typeName,
        defaultEntitlement: typeEntitlement,
        requiresApproval: typeRequiresApproval
      };
      
      let res;
      if (selectedType) {
        res = await apiRequest<ApiResponse<LeaveTypeResponse>>(`/leave/types/${selectedType.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest<ApiResponse<LeaveTypeResponse>>('/leave/types', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res && res.success) {
        showToast('success', 'Leave type saved successfully');
        setIsTypeModalOpen(false);
        setSelectedType(null);
        setTypeName('');
        setTypeEntitlement(12);
        setTypeRequiresApproval(true);
        fetchLeaveTypes();
      } else {
        showToast('error', res?.message || 'Failed to save leave type');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Error saving leave type');
    }
  };

  const handleEditType = (type: LeaveTypeResponse) => {
    setSelectedType(type);
    setTypeName(type.name);
    setTypeEntitlement(type.defaultEntitlement);
    setTypeRequiresApproval(type.requiresApproval);
    setIsTypeModalOpen(true);
  };

  const handleDeleteType = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this leave type?')) return;
    try {
      const res = await apiRequest<ApiResponse<void>>(`/leave/types/${id}/delete`, {
        method: 'POST'
      });
      if (res && res.success) {
        showToast('success', 'Leave type deleted successfully');
        fetchLeaveTypes();
      } else {
        showToast('error', res?.message || 'Failed to delete leave type');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Error deleting leave type');
    }
  };

  // Balance Allocation Management
  const handleAllocateBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocEmployeeId || !allocLeaveTypeId) {
      showToast('error', 'Employee and Leave Type are required');
      return;
    }
    try {
      const res = await apiRequest<ApiResponse<LeaveBalanceResponse>>(
        `/leave/balances/allocate?employeeId=${allocEmployeeId}&leaveTypeId=${allocLeaveTypeId}&entitlement=${allocEntitlement}&year=${allocYear}`,
        { method: 'POST' }
      );
      if (res && res.success) {
        showToast('success', 'Balance allocated successfully');
        setIsAllocateModalOpen(false);
        setAllocEmployeeId('');
        setAllocLeaveTypeId('');
        setAllocEntitlement(12);
      } else {
        showToast('error', res?.message || 'Failed to allocate balance');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Error allocating balance');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'badge-success';
      case 'REJECTED': return 'badge-danger';
      case 'CANCELLED': return 'badge-secondary';
      default: return 'badge-warning'; // PENDING
    }
  };

  // Helper to map employee ID to Name
  const getEmployeeName = (id: number) => {
    const emp = allEmployees.find(e => e.id === id);
    return emp ? emp.fullName : `Employee #${id}`;
  };

  return (
    <div className="leave-management-container">
      {/* Messages */}
      {successMessage && <div className="toast success-toast">{successMessage}</div>}
      {errorMessage && <div className="toast error-toast">{errorMessage}</div>}

      {/* Header Panel */}
      <div className="dashboard-content-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="dashboard-title">{t.leave}</h1>
          <p className="dashboard-subtitle">{t.leaveDesc}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isAdminOrHR && (
            <div className="glass-tabs" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
              <button
                className={`tab-btn ${subTab === 'admin' ? 'active' : ''}`}
                onClick={() => { setSubTab('admin'); fetchAdminRequests(); }}
                style={{ padding: '8px 16px', border: 'none', background: 'none', color: '#fff', cursor: 'pointer', borderRadius: '6px' }}
              >
                {lang === 'id' ? 'Administrasi Cuti' : 'Leave Administration'}
              </button>
              <button
                className={`tab-btn ${subTab === 'my-leave' ? 'active' : ''}`}
                onClick={() => { setSubTab('my-leave'); fetchMyBalances(); fetchMyRequests(); }}
                style={{ padding: '8px 16px', border: 'none', background: 'none', color: '#fff', cursor: 'pointer', borderRadius: '6px' }}
              >
                {lang === 'id' ? 'Cuti Saya' : 'My Leave'}
              </button>
            </div>
          )}
          <button
            className="action-btn primary-btn"
            onClick={() => setIsApplyModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {t.applyLeave}
          </button>
        </div>
      </div>

      {/* SUBTAB: MY LEAVE (Karyawan View) */}
      {subTab === 'my-leave' && (
        <>
          {/* Entitlement Balances Cards */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>{t.leaveBalances}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {balances.length === 0 ? (
                <div className="glass-panel" style={{ padding: '20px', gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  {lang === 'id' ? 'Tidak ada kuota cuti dialokasikan untuk tahun ini.' : 'No leave quota allocated for this year.'}
                </div>
              ) : (
                balances.map(b => {
                  const percent = Math.min(100, Math.max(0, (b.used / b.entitlement) * 100));
                  return (
                    <div className="glass-panel card-glow" key={b.id} style={{ padding: '20px', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {b.leaveTypeName} ({b.year})
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        {b.remaining}
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>/ {b.entitlement} {lang === 'id' ? 'Hari' : 'Days'}</span>
                      </div>
                      
                      {/* Mini Bar */}
                      <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', marginBottom: '8px', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--primary-color)', width: `${percent}%`, height: '100%', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>{t.used}: {b.used}</span>
                        <span>{t.pending}: {b.pending}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* My Leave Requests Table */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>{t.leaveRequests}</h3>
            
            <div className="table-responsive">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>{t.leaveType}</th>
                    <th>{t.startDate}</th>
                    <th>{t.endDate}</th>
                    <th>{t.totalDays}</th>
                    <th>{t.reason}</th>
                    <th>{t.leaveStatus}</th>
                    <th>{lang === 'id' ? 'Keterangan / Catatan' : 'Approver Notes'}</th>
                    <th>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.4)' }}>
                        {t.noData}
                      </td>
                    </tr>
                  ) : (
                    requests.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 500 }}>{r.leaveTypeName}</td>
                        <td>{r.startDate}</td>
                        <td>{r.endDate}</td>
                        <td><span className="badge-item badge-info" style={{ fontWeight: 600 }}>{r.totalDays} {lang === 'id' ? 'Hari' : 'Days'}</span></td>
                        <td><div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.reason}>{r.reason || '-'}</div></td>
                        <td>
                          <span className={`badge-item ${getStatusBadgeClass(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px' }}>
                            {r.approvedBy && <span style={{ display: 'block', color: 'var(--primary-color)', fontSize: '11px' }}>By: {r.approvedBy}</span>}
                            <span>{r.notes || '-'}</span>
                          </div>
                        </td>
                        <td>
                          {r.status === 'PENDING' && (
                            <button
                              className="action-btn danger-btn"
                              onClick={() => handleCancelRequest(r.id)}
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                            >
                              {t.cancel}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* SUBTAB: ADMINISTRASI CUTI (Manager / HR View) */}
      {subTab === 'admin' && isAdminOrHR && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Shortcuts / Quick Actions Card */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{lang === 'id' ? 'Manajemen Konfigurasi Cuti' : 'Leave Configuration Management'}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {lang === 'id' ? 'Kelola kuota default untuk jenis-jenis cuti dan atur entitas master kuota pegawai.' : 'Manage default rules for leave types and assign individual employee entitlements.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button className="action-btn secondary-btn" onClick={() => setIsTypeModalOpen(true)}>
                ⚙️ {lang === 'id' ? 'Kelola Jenis Cuti' : 'Manage Leave Types'}
              </button>
              <button className="action-btn secondary-btn" onClick={() => setIsAllocateModalOpen(true)}>
                👤 {lang === 'id' ? 'Alokasikan Kuota Karyawan' : 'Allocate Employee Balance'}
              </button>
            </div>
          </div>

          {/* Admin Leave Requests Table */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{lang === 'id' ? 'Persetujuan Pengajuan Cuti Karyawan' : 'Employee Leave Approvals'}</h3>
              
              {/* Filter */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={adminFilterStatus}
                  onChange={(e) => { setAdminFilterStatus(e.target.value); setAdminRequestsPage(0); }}
                  className="hrms-input-select"
                  style={{ width: '150px', padding: '6px' }}
                >
                  <option value="">{lang === 'id' ? '-- Semua Status --' : '-- All Status --'}</option>
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>{t.loading}</div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="hrms-table">
                    <thead>
                      <tr>
                        <th>{t.employee}</th>
                        <th>{t.leaveType}</th>
                        <th>{t.startDate}</th>
                        <th>{t.endDate}</th>
                        <th>{t.totalDays}</th>
                        <th>{t.reason}</th>
                        <th>{t.leaveStatus}</th>
                        <th>{t.notes}</th>
                        <th>{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.4)' }}>
                            {t.noData}
                          </td>
                        </tr>
                      ) : (
                        requests.map(r => (
                          <tr key={r.id}>
                            <td style={{ fontWeight: 600 }}>{getEmployeeName(r.employeeId)}</td>
                            <td>{r.leaveTypeName}</td>
                            <td>{r.startDate}</td>
                            <td>{r.endDate}</td>
                            <td><span className="badge-item badge-info" style={{ fontWeight: 600 }}>{r.totalDays} {lang === 'id' ? 'Hari' : 'Days'}</span></td>
                            <td><div style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.reason}>{r.reason || '-'}</div></td>
                            <td>
                              <span className={`badge-item ${getStatusBadgeClass(r.status)}`}>
                                {r.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {r.approvedBy && <span style={{ display: 'block', color: 'var(--primary-color)' }}>By: {r.approvedBy}</span>}
                                {r.notes || '-'}
                              </div>
                            </td>
                            <td>
                              {r.status === 'PENDING' ? (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    className="action-btn success-btn"
                                    onClick={() => openApprovalModal(r, 'approve')}
                                    style={{ padding: '4px 8px', fontSize: '11px' }}
                                  >
                                    {t.approve}
                                  </button>
                                  <button
                                    className="action-btn danger-btn"
                                    onClick={() => openApprovalModal(r, 'reject')}
                                    style={{ padding: '4px 8px', fontSize: '11px' }}
                                  >
                                    {t.reject}
                                  </button>
                                </div>
                              ) : '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {adminRequestsTotalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '8px' }}>
                    <button
                      className="action-btn secondary-btn"
                      disabled={adminRequestsPage === 0}
                      onClick={() => setAdminRequestsPage(prev => Math.max(0, prev - 1))}
                      style={{ padding: '4px 10px' }}
                    >
                      &larr; Prev
                    </button>
                    <span style={{ alignSelf: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      Page {adminRequestsPage + 1} of {adminRequestsTotalPages}
                    </span>
                    <button
                      className="action-btn secondary-btn"
                      disabled={adminRequestsPage + 1 >= adminRequestsTotalPages}
                      onClick={() => setAdminRequestsPage(prev => prev + 1)}
                      style={{ padding: '4px 10px' }}
                    >
                      Next &rarr;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: SUBMIT NEW LEAVE REQUEST */}
      {isApplyModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ width: '450px' }}>
            <div className="modal-header">
              <h3>{t.applyLeave}</h3>
              <button className="close-btn" onClick={() => setIsApplyModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleApplyLeave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div>
                  <label className="form-label">{t.leaveType} *</label>
                  <select
                    value={formLeaveTypeId}
                    onChange={(e) => setFormLeaveTypeId(e.target.value)}
                    className="hrms-input-select"
                    required
                  >
                    <option value="">-- {lang === 'id' ? 'Pilih Jenis Cuti' : 'Select Leave Type'} --</option>
                    {leaveTypes.map(lt => (
                      <option key={lt.id} value={lt.id}>{lt.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">{t.startDate} *</label>
                    <input
                      type="date"
                      className="hrms-input"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">{t.endDate} *</label>
                    <input
                      type="date"
                      className="hrms-input"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">{t.reason}</label>
                  <textarea
                    className="hrms-input"
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    placeholder={lang === 'id' ? 'Tuliskan alasan pengajuan cuti...' : 'Brief description / reason...'}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="action-btn secondary-btn" onClick={() => setIsApplyModalOpen(false)}>
                  {t.cancel}
                </button>
                <button type="submit" className="action-btn primary-btn">
                  🚀 {lang === 'id' ? 'Kirim Pengajuan' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LEAVE TYPES CONFIGURATION (ADMIN) */}
      {isTypeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ width: '600px' }}>
            <div className="modal-header">
              <h3>{lang === 'id' ? 'Konfigurasi Jenis Cuti' : 'Leave Types Configuration'}</h3>
              <button className="close-btn" onClick={() => setIsTypeModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Type List Left */}
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>{lang === 'id' ? 'Daftar Aktif' : 'Active List'}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                  {leaveTypes.map(lt => (
                    <div key={lt.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
                      <span>{lt.name} ({lt.defaultEntitlement}d)</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" onClick={() => handleEditType(lt)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                        <button type="button" onClick={() => handleDeleteType(lt.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>❌</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Right */}
              <form onSubmit={handleSaveLeaveType} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600 }}>{selectedType ? 'Edit Type' : 'Add New Type'}</h4>
                <div>
                  <label className="form-label">{lang === 'id' ? 'Nama Jenis Cuti' : 'Leave Type Name'} *</label>
                  <input
                    type="text"
                    className="hrms-input"
                    value={typeName}
                    onChange={(e) => setTypeName(e.target.value)}
                    placeholder="e.g. Cuti Tahunan"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">{lang === 'id' ? 'Kuota Default (Hari)' : 'Default Entitlement (Days)'}</label>
                  <input
                    type="number"
                    className="hrms-input"
                    value={typeEntitlement}
                    onChange={(e) => setTypeEntitlement(parseInt(e.target.value, 10))}
                    required
                    min={0}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    checked={typeRequiresApproval}
                    onChange={(e) => setTypeRequiresApproval(e.target.checked)}
                  />
                  <label htmlFor="requiresApproval" style={{ fontSize: '13px', color: '#fff', cursor: 'pointer' }}>
                    {lang === 'id' ? 'Membutuhkan Persetujuan' : 'Requires Approval'}
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  {selectedType && (
                    <button
                      type="button"
                      className="action-btn secondary-btn"
                      onClick={() => { setSelectedType(null); setTypeName(''); setTypeEntitlement(12); setTypeRequiresApproval(true); }}
                    >
                      Reset
                    </button>
                  )}
                  <button type="submit" className="action-btn primary-btn" style={{ padding: '6px 12px' }}>
                    {t.save}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ALLOCATE CUSTOM BALANCE (ADMIN) */}
      {isAllocateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ width: '450px' }}>
            <div className="modal-header">
              <h3>{lang === 'id' ? 'Alokasikan Kuota Cuti Karyawan' : 'Allocate Employee Leave Balance'}</h3>
              <button className="close-btn" onClick={() => setIsAllocateModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAllocateBalance}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div>
                  <label className="form-label">{t.employee} *</label>
                  <select
                    value={allocEmployeeId}
                    onChange={(e) => setAllocEmployeeId(e.target.value)}
                    className="hrms-input-select"
                    required
                  >
                    <option value="">-- {lang === 'id' ? 'Pilih Karyawan' : 'Select Employee'} --</option>
                    {allEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">{t.leaveType} *</label>
                  <select
                    value={allocLeaveTypeId}
                    onChange={(e) => setAllocLeaveTypeId(e.target.value)}
                    className="hrms-input-select"
                    required
                  >
                    <option value="">-- {lang === 'id' ? 'Pilih Jenis Cuti' : 'Select Leave Type'} --</option>
                    {leaveTypes.map(lt => (
                      <option key={lt.id} value={lt.id}>{lt.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">{lang === 'id' ? 'Kuota (Hari)' : 'Entitlement (Days)'} *</label>
                    <input
                      type="number"
                      className="hrms-input"
                      value={allocEntitlement}
                      onChange={(e) => setAllocEntitlement(parseInt(e.target.value, 10))}
                      required
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="form-label">{lang === 'id' ? 'Tahun' : 'Year'} *</label>
                    <input
                      type="number"
                      className="hrms-input"
                      value={allocYear}
                      onChange={(e) => setAllocYear(parseInt(e.target.value, 10))}
                      required
                    />
                  </div>
                </div>

              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="action-btn secondary-btn" onClick={() => setIsAllocateModalOpen(false)}>
                  {t.cancel}
                </button>
                <button type="submit" className="action-btn primary-btn">
                  Allocate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: APPROVAL NOTES DIALOG */}
      {showApprovalNotesModal && actionRequest && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ width: '400px' }}>
            <div className="modal-header">
              <h3>
                {actionType === 'approve' 
                  ? (lang === 'id' ? 'Setujui Pengajuan' : 'Approve Request')
                  : (lang === 'id' ? 'Tolak Pengajuan' : 'Reject Request')
                }
              </h3>
              <button className="close-btn" onClick={() => setShowApprovalNotesModal(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                {lang === 'id' ? 'Karyawan:' : 'Employee:'} <strong>{getEmployeeName(actionRequest.employeeId)}</strong><br />
                {lang === 'id' ? 'Jenis Cuti:' : 'Leave Type:'} <strong>{actionRequest.leaveTypeName}</strong><br />
                {lang === 'id' ? 'Durasi:' : 'Duration:'} <strong>{actionRequest.totalDays} {lang === 'id' ? 'Hari' : 'Days'} ({actionRequest.startDate} to {actionRequest.endDate})</strong>
              </p>
              <div>
                <label className="form-label">{t.notes || 'Catatan'}</label>
                <textarea
                  className="hrms-input"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder={actionType === 'reject' ? t.rejectNotesPlaceholder : (lang === 'id' ? 'Tuliskan catatan persetujuan...' : 'Optional approval notes...')}
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" className="action-btn secondary-btn" onClick={() => setShowApprovalNotesModal(false)}>
                {t.cancel}
              </button>
              <button
                type="button"
                className={`action-btn ${actionType === 'approve' ? 'success-btn' : 'danger-btn'}`}
                onClick={submitActionRequest}
              >
                {actionType === 'approve' ? t.approve : t.reject}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
