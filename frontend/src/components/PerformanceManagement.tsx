import React, { useState, useEffect } from 'react';
import { ApiResponse, PerformanceReviewResponse, EmployeeResponse } from '../types';
import { translations } from '../utils/i18n';

interface PerformanceManagementProps {
  tenantId: string;
  actorEmail: string;
  lang: 'id' | 'en';
  theme: 'light' | 'dark';
}

export function PerformanceManagement({ tenantId, actorEmail, lang, theme }: PerformanceManagementProps) {
  const t = translations[lang];

  // Tabs: 'list' | 'create'
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  // Loading & Alerts
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Core Data Lists
  const [reviews, setReviews] = useState<PerformanceReviewResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);

  // Appraisal Form States
  const [evalEmployeeId, setEvalEmployeeId] = useState<number | ''>('');
  const [evalPeriod, setEvalPeriod] = useState('Annual 2026');
  const [scoreJobKnowledge, setScoreJobKnowledge] = useState<number>(3);
  const [scoreWorkQuality, setScoreWorkQuality] = useState<number>(3);
  const [scorePunctuality, setScorePunctuality] = useState<number>(3);
  const [scoreTeamwork, setScoreTeamwork] = useState<number>(3);
  const [scoreCommunication, setScoreCommunication] = useState<number>(3);
  const [evalFeedback, setEvalFeedback] = useState('');

  // Live Score Calculator
  const [liveFinalScore, setLiveFinalScore] = useState<number>(3.00);

  // Detail Modal view
  const [selectedReview, setSelectedReview] = useState<PerformanceReviewResponse | null>(null);

  const API_BASE = 'http://localhost:8020/api/v1/performance';
  const EMPLOYEES_API = 'http://localhost:8020/api/v1/employees';

  // Role Checker (HR/Manager check)
  const isHR = actorEmail.includes('hrd') || actorEmail.includes('admin') || actorEmail.includes('owner') || actorEmail.includes('manager');

  useEffect(() => {
    fetchReviews();
    if (isHR) {
      fetchEmployees();
    }
  }, [tenantId, activeTab]);

  // Recalculate live final score preview
  useEffect(() => {
    const average = (scoreJobKnowledge + scoreWorkQuality + scorePunctuality + scoreTeamwork + scoreCommunication) / 5.0;
    setLiveFinalScore(Number(average.toFixed(2)));
  }, [scoreJobKnowledge, scoreWorkQuality, scorePunctuality, scoreTeamwork, scoreCommunication]);

  const fetchReviews = async () => {
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
      const data: ApiResponse<{ content: PerformanceReviewResponse[] }> = await res.json();
      if (data.success) {
        const content = (data.data as any).content || data.data;
        setReviews(Array.isArray(content) ? content : []);
      }
    } catch (err) {
      console.error('Error fetching performance appraisals:', err);
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
      console.error('Error fetching employee directory:', err);
    }
  };

  // Submit assessment (Draft or Final)
  const handleSaveAppraisal = async (isSubmit: boolean) => {
    if (!evalEmployeeId) {
      setErrorMsg(lang === 'id' ? 'Karyawan wajib dipilih' : 'Employee must be selected');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      employeeId: Number(evalEmployeeId),
      reviewPeriod: evalPeriod,
      scoreJobKnowledge,
      scoreWorkQuality,
      scorePunctuality,
      scoreTeamwork,
      scoreCommunication,
      feedback: evalFeedback
    };

    const endpoint = isSubmit ? `${API_BASE}/submit` : `${API_BASE}/draft`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<PerformanceReviewResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(
          isSubmit
            ? (lang === 'id' ? 'Evaluasi berhasil disubmit untuk approval!' : 'Appraisal submitted successfully!')
            : (lang === 'id' ? 'Draft evaluasi berhasil disimpan' : 'Draft assessment saved successfully')
        );
        // Reset Form
        setEvalEmployeeId('');
        setScoreJobKnowledge(3);
        setScoreWorkQuality(3);
        setScorePunctuality(3);
        setScoreTeamwork(3);
        setScoreCommunication(3);
        setEvalFeedback('');
        setActiveTab('list');
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Masalah koneksi server' : 'Server connection issue');
    } finally {
      setLoading(false);
    }
  };

  // Approve appraisal (HR finalize)
  const handleApproveAppraisal = async (id: number) => {
    if (!confirm(lang === 'id' ? 'Setujui & finalisasi nilai KPI ini?' : 'Approve and finalize this KPI evaluation?')) return;
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
      const data: ApiResponse<PerformanceReviewResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Evaluasi kinerja berhasil difinalisasi!' : 'Performance evaluation finalized!');
        fetchReviews();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Koneksi bermasalah' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Get qualitative text based on KPI score
  const getRatingCategoryText = (score: number) => {
    if (score >= 4.5) return lang === 'id' ? 'Istimewa (A)' : 'Outstanding (A)';
    if (score >= 3.5) return lang === 'id' ? 'Baik (B)' : 'Good (B)';
    if (score >= 2.5) return lang === 'id' ? 'Cukup (C)' : 'Satisfactory (C)';
    return lang === 'id' ? 'Perlu Peningkatan (D)' : 'Needs Improvement (D)';
  };

  const getRatingCategoryColor = (score: number) => {
    if (score >= 4.5) return '#10b981'; // Green
    if (score >= 3.5) return '#3b82f6'; // Blue
    if (score >= 2.5) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="performance-module-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      
      {/* Banner */}
      <div className="module-banner glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🎯 {t.performance}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '800px' }}>
          {t.performanceDesc}
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-menu" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'list' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
        >
          📁 {t.performanceReviews}
        </button>
        {isHR && (
          <button
            className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'create' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
          >
            ✍️ {t.createReview}
          </button>
        )}
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

      {/* TAB 1: PERFORMANCE LISTING */}
      {activeTab === 'list' && (
        <div className="table-container glass-panel" style={{ background: 'rgba(30, 30, 40, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>{t.employee}</th>
                <th style={{ padding: '12px' }}>{t.reviewPeriod}</th>
                <th style={{ padding: '12px' }}>{t.reviewerName}</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>{t.finalScore}</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Rating Category</th>
                <th style={{ padding: '12px' }}>{t.reviewStatus}</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Appraisal Card</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>{lang === 'id' ? 'Aksi' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    {lang === 'id' ? 'Belum ada penilaian kinerja' : 'No performance appraisals found'}
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: '500', color: 'var(--text-bright)' }}>
                      {rev.employeeName} <br />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rev.employeeNumber}</span>
                    </td>
                    <td style={{ padding: '12px' }}>{rev.reviewPeriod}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{rev.reviewerName || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', fontSize: '14px', color: getRatingCategoryColor(rev.finalScore) }}>
                      {rev.finalScore.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: getRatingCategoryColor(rev.finalScore) }}>
                      {getRatingCategoryText(rev.finalScore)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: rev.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : rev.status === 'SUBMITTED' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: rev.status === 'APPROVED' ? '#10b981' : rev.status === 'SUBMITTED' ? '#3b82f6' : 'var(--text-muted)'
                      }}>
                        {rev.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedReview(rev)}
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        📋 View KPIs
                      </button>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {isHR && rev.status === 'SUBMITTED' ? (
                        <button
                          onClick={() => handleApproveAppraisal(rev.id)}
                          style={{ padding: '6px 10px', borderRadius: '6px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px' }}
                        >
                          ✓ Finalize
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: CREATE / EDIT APPRAISAL */}
      {activeTab === 'create' && (
        <div className="card glass-panel" style={{ maxWidth: '700px', margin: '0 auto', padding: '24px', borderRadius: '16px', background: 'rgba(30, 30, 40, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text-bright)', marginBottom: '20px' }}>
            ✍️ {t.createReview}
          </h3>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.employee} *</label>
              <select
                value={evalEmployeeId}
                onChange={(e) => setEvalEmployeeId(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                required
              >
                <option value="">{lang === 'id' ? '-- Pilih Karyawan --' : '-- Select Employee --'}</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeNumber})</option>
                ))}
              </select>
            </div>
            
            <div style={{ width: '200px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.reviewPeriod} *</label>
              <select
                value={evalPeriod}
                onChange={(e) => setEvalPeriod(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                required
              >
                <option value="Q1 2026">Q1 2026</option>
                <option value="Q2 2026">Q2 2026</option>
                <option value="Q3 2026">Q3 2026</option>
                <option value="Q4 2026">Q4 2026</option>
                <option value="Annual 2026">Annual 2026</option>
              </select>
            </div>
          </div>

          {/* SLIDERS FOR RATING PARAMETERS */}
          <div className="ratings-sliders-box" style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '13px', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              📊 Core KPI Ratings (Scale 1 - 5)
            </h4>

            {[
              { label: t.scoreJobKnowledge, value: scoreJobKnowledge, setter: setScoreJobKnowledge },
              { label: t.scoreWorkQuality, value: scoreWorkQuality, setter: setScoreWorkQuality },
              { label: t.scorePunctuality, value: scorePunctuality, setter: setScorePunctuality },
              { label: t.scoreTeamwork, value: scoreTeamwork, setter: setScoreTeamwork },
              { label: t.scoreCommunication, value: scoreCommunication, setter: setScoreCommunication },
            ].map((p, idx) => (
              <div key={idx} style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{p.label}</span>
                  <span style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{p.value} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={p.value}
                  onChange={(e) => p.setter(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary-color)' }}
                />
              </div>
            ))}
          </div>

          {/* LIVE SCORE GAUGE PREVIEW */}
          <div className="live-score-gauge glass-panel" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                ⭐ Computed KPI Score
              </span>
              <span style={{ fontSize: '24px', fontWeight: '800', color: getRatingCategoryColor(liveFinalScore) }}>
                {liveFinalScore.toFixed(2)}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                ( {getRatingCategoryText(liveFinalScore)} )
              </span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    fontSize: '20px',
                    color: star <= Math.round(liveFinalScore) ? '#f59e0b' : 'rgba(255,255,255,0.1)'
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              {t.performanceFeedback} *
            </label>
            <textarea
              value={evalFeedback}
              onChange={(e) => setEvalFeedback(e.target.value)}
              rows={4}
              placeholder={lang === 'id' ? 'Tulis evaluasi tertulis, kelebihan, dan bidang pengembangan karyawan...' : 'Write assessment comments, strengths, and areas for improvement...'}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => handleSaveAppraisal(false)}
              disabled={loading}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
            >
              💾 Save Draft
            </button>
            <button
              onClick={() => handleSaveAppraisal(true)}
              disabled={loading}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
            >
              🚀 Submit Appraisal
            </button>
          </div>
        </div>
      )}

      {/* DETAIL OVERLAY MODAL */}
      {selectedReview && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '550px', background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: '700' }}>📊 KPI Appraisal Detail</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {selectedReview.employeeName} ({selectedReview.employeeNumber}) - Period: {selectedReview.reviewPeriod}
                </p>
              </div>
              <button onClick={() => setSelectedReview(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Score breakdown card */}
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>Parameters Rating</h4>
                {[
                  { label: t.scoreJobKnowledge, val: selectedReview.scoreJobKnowledge },
                  { label: t.scoreWorkQuality, val: selectedReview.scoreWorkQuality },
                  { label: t.scorePunctuality, val: selectedReview.scorePunctuality },
                  { label: t.scoreTeamwork, val: selectedReview.scoreTeamwork },
                  { label: t.scoreCommunication, val: selectedReview.scoreCommunication },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${(item.val / 5.0) * 100}%`, height: '100%', background: 'var(--primary-color)' }}></div>
                      </div>
                      <span style={{ fontWeight: '700', color: '#fff' }}>{item.val} / 5</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total KPI gauge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FINAL AVERAGE KPI</span>
                  <p style={{ fontSize: '20px', fontWeight: '800', color: getRatingCategoryColor(selectedReview.finalScore), margin: 0 }}>
                    {selectedReview.finalScore.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>STATUS</span>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#fff', margin: 0 }}>
                    {selectedReview.status}
                  </p>
                </div>
              </div>

              {/* Written Comments */}
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>FEEDBACK NOTES</span>
                <p style={{ fontSize: '12px', color: '#fff', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>
                  {selectedReview.feedback || 'No written feedback comments provided.'}
                </p>
              </div>

            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedReview(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '12px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
