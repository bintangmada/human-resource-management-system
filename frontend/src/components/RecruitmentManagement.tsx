import React, { useState, useEffect } from 'react';
import { ApiResponse, JobPostingResponse, JobApplicationResponse, DepartmentResponse } from '../types';
import { translations } from '../utils/i18n';

interface RecruitmentManagementProps {
  tenantId: string;
  actorEmail: string;
  lang: 'id' | 'en';
  theme: 'light' | 'dark';
}

export function RecruitmentManagement({ tenantId, actorEmail, lang, theme }: RecruitmentManagementProps) {
  const t = translations[lang];

  // Tabs: 'jobs' | 'applications'
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');

  // Loading & alerts
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data lists
  const [jobs, setJobs] = useState<JobPostingResponse[]>([]);
  const [applications, setApplications] = useState<JobApplicationResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);

  // Post Vacancy Form states
  const [showCreateJobForm, setShowCreateJobForm] = useState(false);
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [jobDeptId, setJobDeptId] = useState<number | ''>('');
  const [jobDescInput, setJobDescInput] = useState('');
  const [jobReqInput, setJobReqInput] = useState('');
  const [jobLocationInput, setJobLocationInput] = useState('Jakarta, Indonesia (Hybrid)');
  const [jobEmploymentType, setJobEmploymentType] = useState<'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'>('FULL_TIME');

  // Apply Form states
  const [selectedJobToApply, setSelectedJobToApply] = useState<JobPostingResponse | null>(null);
  const [candidateNameInput, setCandidateNameInput] = useState('');
  const [candidateEmailInput, setCandidateEmailInput] = useState('');
  const [candidatePhoneInput, setCandidatePhoneInput] = useState('');
  const [candidateResumeUrl, setCandidateResumeUrl] = useState('https://drive.google.com/resume_mock_pdf');
  const [candidateCoverLetter, setCandidateCoverLetter] = useState('');

  // Application Pipeline update details modal
  const [selectedApplication, setSelectedApplication] = useState<JobApplicationResponse | null>(null);
  const [newStage, setNewStage] = useState<'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED'>('SCREENING');
  const [stageNotes, setStageNotes] = useState('');

  const API_BASE = 'http://localhost:8020/api/v1/recruitment';
  const DEPARTMENTS_API = 'http://localhost:8020/api/v1/departments';

  const isHR = actorEmail.includes('hrd') || actorEmail.includes('admin') || actorEmail.includes('owner') || actorEmail.includes('manager');

  useEffect(() => {
    fetchJobs();
    if (isHR) {
      fetchApplications();
      fetchDepartments();
    }
  }, [tenantId, activeTab]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/jobs?size=100`, {
        headers: {
          'X-Tenant-ID': tenantId,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<{ content: JobPostingResponse[] }> = await res.json();
      if (data.success) {
        const content = (data.data as any).content || data.data;
        setJobs(Array.isArray(content) ? content : []);
      }
    } catch (err) {
      console.error('Error fetching job postings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE}/applications?size=100`, {
        headers: {
          'X-Tenant-ID': tenantId,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<{ content: JobApplicationResponse[] }> = await res.json();
      if (data.success) {
        const content = (data.data as any).content || data.data;
        setApplications(Array.isArray(content) ? content : []);
      }
    } catch (err) {
      console.error('Error fetching applicant records:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(DEPARTMENTS_API, {
        headers: {
          'X-Tenant-ID': tenantId,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data: ApiResponse<DepartmentResponse[]> = await res.json();
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  // Create Job Vacancy
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const resolvedDept = departments.find(d => d.id === Number(jobDeptId));

    const payload = {
      title: jobTitleInput,
      departmentId: jobDeptId ? Number(jobDeptId) : null,
      departmentName: resolvedDept ? resolvedDept.name : null,
      description: jobDescInput,
      requirements: jobReqInput,
      location: jobLocationInput,
      employmentType: jobEmploymentType,
      status: 'ACTIVE'
    };

    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<JobPostingResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Lowongan kerja berhasil dipublikasikan!' : 'Job vacancy successfully posted!');
        setJobTitleInput('');
        setJobDeptId('');
        setJobDescInput('');
        setJobReqInput('');
        setShowCreateJobForm(false);
        fetchJobs();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Koneksi server bermasalah' : 'Server connection issue');
    } finally {
      setLoading(false);
    }
  };

  // Apply for Job Posting
  const handleApplyJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobToApply) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      jobPostingId: selectedJobToApply.id,
      candidateName: candidateNameInput,
      candidateEmail: candidateEmailInput,
      candidatePhone: candidatePhoneInput,
      resumeUrl: candidateResumeUrl,
      coverLetter: candidateCoverLetter
    };

    try {
      const res = await fetch(`${API_BASE}/applications/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<JobApplicationResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(t.applySuccess);
        setSelectedJobToApply(null);
        setCandidateNameInput('');
        setCandidateEmailInput('');
        setCandidatePhoneInput('');
        setCandidateCoverLetter('');
        fetchApplications();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Masalah koneksi' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  // Update Recruitment Stage
  const handleUpdateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      status: newStage,
      recruitmentNotes: stageNotes
    };

    try {
      const res = await fetch(`${API_BASE}/applications/${selectedApplication.id}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-User-Email': actorEmail,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<JobApplicationResponse> = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Tahapan seleksi berhasil diubah!' : 'Recruitment stage updated!');
        setSelectedApplication(null);
        setStageNotes('');
        fetchApplications();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(lang === 'id' ? 'Kesalahan server' : 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'HIRED': return '#10b981'; // Green
      case 'REJECTED': return '#ef4444'; // Red
      case 'OFFERED': return '#f59e0b'; // Amber
      case 'INTERVIEW': return '#3b82f6'; // Blue
      case 'SCREENING': return '#8b5cf6'; // Purple
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="recruitment-module-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      
      {/* Banner */}
      <div className="module-banner glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          💼 {t.recruitment}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '800px' }}>
          {t.recruitmentDesc}
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-menu" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'jobs' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
        >
          📰 {t.jobVacancies}
        </button>
        {isHR && (
          <button
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'applications' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
          >
            📋 {t.candidateApplications}
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

      {/* TAB 1: JOB VACANCIES LIST */}
      {activeTab === 'jobs' && (
        <div>
          {isHR && !showCreateJobForm && (
            <button
              onClick={() => setShowCreateJobForm(true)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', marginBottom: '20px', fontSize: '13px', fontWeight: '600' }}
            >
              ➕ {t.createJobPosting}
            </button>
          )}

          {/* CREATE JOB VACANCY FORM */}
          {showCreateJobForm && (
            <form onSubmit={handlePostJob} className="card glass-panel" style={{ maxWidth: '650px', padding: '24px', borderRadius: '16px', background: 'rgba(30, 30, 40, 0.5)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '700' }}>📢 {t.createJobPosting}</h3>
                <button type="button" onClick={() => setShowCreateJobForm(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.jobTitle} *</label>
                  <input
                    type="text"
                    value={jobTitleInput}
                    onChange={(e) => setJobTitleInput(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    required
                  />
                </div>
                <div style={{ width: '220px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.department}</label>
                  <select
                    value={jobDeptId}
                    onChange={(e) => setJobDeptId(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    <option value="">{lang === 'id' ? '-- Pilih Departemen --' : '-- Select Dept --'}</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.jobLocation} *</label>
                  <input
                    type="text"
                    value={jobLocationInput}
                    onChange={(e) => setJobLocationInput(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    required
                  />
                </div>
                <div style={{ width: '220px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Employment Type</label>
                  <select
                    value={jobEmploymentType}
                    onChange={(e) => setJobEmploymentType(e.target.value as any)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    <option value="FULL_TIME">FULL TIME</option>
                    <option value="PART_TIME">PART TIME</option>
                    <option value="CONTRACT">CONTRACT</option>
                    <option value="INTERN">INTERN</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{lang === 'id' ? 'Deskripsi Pekerjaan *' : 'Job Description *'}</label>
                <textarea
                  value={jobDescInput}
                  onChange={(e) => setJobDescInput(e.target.value)}
                  rows={4}
                  placeholder={lang === 'id' ? 'Tulis tanggung jawab utama posisi ini...' : 'Describe core responsibilities...'}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.jobRequirements}</label>
                <textarea
                  value={jobReqInput}
                  onChange={(e) => setJobReqInput(e.target.value)}
                  rows={4}
                  placeholder={lang === 'id' ? 'Tulis kualifikasi wajib (misal: 3 tahun pengalaman Java/React)...' : 'List key technical requirements...'}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit' }}
                />
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
              >
                🚀 Post Vacancy Listing
              </button>
            </form>
          )}

          {/* VACANCIES DIRECTORY */}
          <div className="jobs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {jobs.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                {lang === 'id' ? 'Belum ada lowongan pekerjaan aktif' : 'No active job vacancies published'}
              </div>
            ) : (
              jobs.map(job => (
                <div key={job.id} className="card glass-panel" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(30, 30, 40, 0.3)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
                        {job.employmentType}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{job.location}</span>
                    </div>
                    <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: '700', marginBottom: '4px' }}>{job.title}</h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>Dept: {job.departmentName || 'General'}</p>
                    
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.description}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedJobToApply(job)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#fff', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    📝 Apply Now
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPLICANT PIPELINE (HR VIEW) */}
      {activeTab === 'applications' && (
        <div className="table-container glass-panel" style={{ background: 'rgba(30, 30, 40, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>{lang === 'id' ? 'Kandidat' : 'Candidate'}</th>
                <th style={{ padding: '12px' }}>{t.jobTitle}</th>
                <th style={{ padding: '12px' }}>{t.recruitmentStage}</th>
                <th style={{ padding: '12px' }}>{lang === 'id' ? 'Tautan CV' : 'CV / Resume'}</th>
                <th style={{ padding: '12px' }}>{lang === 'id' ? 'Tanggal Daftar' : 'Applied Date'}</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>{lang === 'id' ? 'Aksi' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    {lang === 'id' ? 'Belum ada berkas lamaran masuk' : 'No job applications submitted yet'}
                  </td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: '500', color: 'var(--text-bright)' }}>
                      {app.candidateName} <br />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{app.candidateEmail}</span>
                    </td>
                    <td style={{ padding: '12px' }}>{app.jobTitle || 'Vacant Position'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: `${getStageBadgeColor(app.status)}25`,
                        color: getStageBadgeColor(app.status)
                      }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <a href={app.resumeUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                        📄 View PDF CV
                      </a>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setSelectedApplication(app);
                          setNewStage(app.status as any);
                        }}
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        ⚙️ Process Candidate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* QUICK APPLY MODAL OVERLAY */}
      {selectedJobToApply && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleApplyJob} className="modal-content glass-panel" style={{ width: '90%', maxWidth: '520px', background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '700' }}>📝 Submit Job Application</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Applying for: {selectedJobToApply.title}</p>
              </div>
              <button type="button" onClick={() => setSelectedJobToApply(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.candidateName} *</label>
              <input
                type="text"
                value={candidateNameInput}
                onChange={(e) => setCandidateNameInput(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.candidateEmail} *</label>
                <input
                  type="email"
                  value={candidateEmailInput}
                  onChange={(e) => setCandidateEmailInput(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.candidatePhone}</label>
                <input
                  type="text"
                  value={candidatePhoneInput}
                  onChange={(e) => setCandidatePhoneInput(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.resumeUrl} *</label>
              <input
                type="url"
                value={candidateResumeUrl}
                onChange={(e) => setCandidateResumeUrl(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.coverLetter}</label>
              <textarea
                value={candidateCoverLetter}
                onChange={(e) => setCandidateCoverLetter(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit' }}
              />
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
            >
              🚀 Send Application
            </button>
          </form>
        </div>
      )}

      {/* PROCESS CANDIDATE STAGE MODAL OVERLAY */}
      {selectedApplication && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleUpdateStage} className="modal-content glass-panel" style={{ width: '90%', maxWidth: '480px', background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '700' }}>⚙️ Process Candidate Application</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Candidate: {selectedApplication.candidateName}</p>
              </div>
              <button type="button" onClick={() => setSelectedApplication(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.recruitmentStage} *</label>
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value as any)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              >
                <option value="APPLIED">APPLIED</option>
                <option value="SCREENING">SCREENING</option>
                <option value="INTERVIEW">INTERVIEW</option>
                <option value="OFFERED">OFFERED</option>
                <option value="HIRED">HIRED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.recruitmentNotes}</label>
              <textarea
                value={stageNotes}
                onChange={(e) => setStageNotes(e.target.value)}
                rows={3}
                placeholder={lang === 'id' ? 'Masukkan catatan interview, hasil tes teknis, atau feedback HR...' : 'Enter interview notes, coding test results, etc...'}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'inherit' }}
              />
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
            >
              ✓ Update Candidate Status
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
