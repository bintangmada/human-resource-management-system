import React, { useState, useEffect } from 'react';
import { TrainingResponse, TrainingEnrollmentResponse } from '../types';
import { translations } from '../utils/i18n';

interface Props {
  tenantId: string;
  actorEmail: string;
  lang: 'id' | 'en';
  theme: 'light' | 'dark';
}

const API_BASE = 'http://localhost:8020/api/v1/training';

export function TrainingManagement({ tenantId, actorEmail, lang }: Props) {
  const t = translations[lang];
  const isHR = /hrd|admin|owner|manager/.test(actorEmail.toLowerCase());

  const [activeTab, setActiveTab] = useState<'available_courses' | 'my_enrollments' | 'manage_courses'>('available_courses');
  const [courses, setCourses] = useState<TrainingResponse[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<TrainingEnrollmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states (Create Course)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trainer, setTrainer] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [capacity, setCapacity] = useState('');

  // Form states (Submit feedback & certificate)
  const [submittingCompletion, setSubmittingCompletion] = useState<{ courseId: number; enrollmentId: number } | null>(null);
  const [feedback, setFeedback] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');

  // Form states (Update Course Status)
  const [processingCourse, setProcessingCourse] = useState<TrainingResponse | null>(null);
  const [courseStatus, setCourseStatus] = useState<'UPCOMING' | 'ONGOING' | 'COMPLETED'>('UPCOMING');

  useEffect(() => {
    fetchCourses();
    fetchMyEnrollments();
  }, [tenantId]);

  const getHeaders = () => ({
    'X-Tenant-ID': tenantId,
    'X-User-Email': actorEmail,
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}?size=100`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setCourses(data.data?.content || data.data || []);
      }
    } catch {
      setErrorMsg('Failed to load training programs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEnrollments = async () => {
    try {
      const res = await fetch(`${API_BASE}/my-enrollments`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setMyEnrollments(data.data || []);
      }
    } catch {
      // fail silently
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title,
          description,
          trainer,
          scheduleDate,
          durationHours: Number(durationHours),
          capacity: Number(capacity)
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Program pelatihan berhasil dibuat!' : 'Training program successfully scheduled!');
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        setTrainer('');
        setScheduleDate('');
        setDurationHours('');
        setCapacity('');
        fetchCourses();
      } else {
        setErrorMsg(data.message || 'Creation failed.');
      }
    } catch {
      setErrorMsg('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE}/${courseId}/enroll`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          employeeId: 9999, // default placeholder
          employeeName: actorEmail.split('@')[0]
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Pendaftaran berhasil dikirim!' : 'Enrolled in training program successfully!');
        fetchMyEnrollments();
        fetchCourses();
      } else {
        setErrorMsg(data.message);
      }
    } catch {
      setErrorMsg('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingCourse) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/${processingCourse.id}/process`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: courseStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Status program pelatihan berhasil diperbarui!' : 'Training status updated successfully!');
        setProcessingCourse(null);
        fetchCourses();
        fetchMyEnrollments();
      } else {
        setErrorMsg(data.message);
      }
    } catch {
      setErrorMsg('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingCompletion) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/${submittingCompletion.courseId}/enrollments/${submittingCompletion.enrollmentId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          status: 'COMPLETED',
          feedback,
          certificateUrl: certificateUrl || 'http://localhost/mock-certificate.pdf'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(lang === 'id' ? 'Sertifikat & feedback berhasil disimpan!' : 'Certificate & feedback submitted successfully!');
        setSubmittingCompletion(null);
        setFeedback('');
        setCertificateUrl('');
        fetchMyEnrollments();
        fetchCourses();
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
      case 'UPCOMING': return '#3b82f6';
      case 'ONGOING': return '#f59e0b';
      case 'COMPLETED': return '#10b981';
      case 'ENROLLED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
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

  const isEnrolledInCourse = (courseId: number) => {
    return myEnrollments.some(e => e.status !== 'CANCELLED' && courses.find(c => c.id === courseId)?.enrollments?.some(ce => ce.employeeEmail === actorEmail));
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Banner */}
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.05))' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🎓 {t.training}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '800px' }}>
          {t.trainingDesc}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '20px' }}>
        <button style={buttonStyle(activeTab === 'available_courses')} onClick={() => setActiveTab('available_courses')}>
          🌐 {lang === 'id' ? 'Semua Pelatihan' : 'All Courses'}
        </button>
        <button style={buttonStyle(activeTab === 'my_enrollments')} onClick={() => setActiveTab('my_enrollments')}>
          🔖 {lang === 'id' ? 'Pelatihan Saya' : 'My Enrollments'}
        </button>
        {isHR && (
          <button style={buttonStyle(activeTab === 'manage_courses')} onClick={() => setActiveTab('manage_courses')}>
            ⚙️ {lang === 'id' ? 'Kelola Kelas L&D' : 'Manage Courses'}
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

      {/* TAB 1: ALL AVAILABLE COURSES */}
      {activeTab === 'available_courses' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {courses.length === 0 ? (
            <div style={{ ...cardStyle, gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>
              No training programs available.
            </div>
          ) : (
            courses.map((course) => {
              const activeEnrollCount = course.enrollments?.filter(e => e.status !== 'CANCELLED').length || 0;
              const hasEnrolled = course.enrollments?.some(e => e.employeeEmail === actorEmail && e.status !== 'CANCELLED');

              return (
                <div key={course.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-bright)' }}>📚 {course.title}</h3>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700, background: `${getStatusColor(course.status)}20`, color: getStatusColor(course.status) }}>
                      {course.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', minHeight: '40px', lineHeight: '1.5' }}>
                    {course.description || 'No description provided.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-bright)', marginBottom: '20px', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.15)' }}>
                    <div>👨‍🏫 Trainer: <strong>{course.trainer}</strong></div>
                    <div>📅 Schedule: <strong>{new Date(course.scheduleDate).toLocaleDateString()}</strong> ({course.durationHours} Hours)</div>
                    <div>👥 Capacity: <strong>{activeEnrollCount} / {course.capacity} participants</strong></div>
                  </div>

                  {course.status === 'UPCOMING' && (
                    <button
                      disabled={hasEnrolled || activeEnrollCount >= course.capacity}
                      style={{
                        ...buttonStyle(true),
                        width: '100%',
                        background: hasEnrolled ? 'rgba(255,255,255,0.08)' : activeEnrollCount >= course.capacity ? '#ef444420' : 'var(--primary-color)',
                        color: hasEnrolled ? 'var(--text-muted)' : activeEnrollCount >= course.capacity ? '#ef4444' : '#fff',
                        cursor: hasEnrolled || activeEnrollCount >= course.capacity ? 'not-allowed' : 'pointer'
                      }}
                      onClick={() => handleEnroll(course.id)}
                    >
                      {hasEnrolled ? '✓ Enrolled' : activeEnrollCount >= course.capacity ? 'Class Full' : `✍️ ${t.enrollTraining}`}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: MY ENROLLMENTS */}
      {activeTab === 'my_enrollments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {courses.filter(c => c.enrollments?.some(e => e.employeeEmail === actorEmail && e.status !== 'CANCELLED')).length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', color: 'var(--text-muted)' }}>
              You are not enrolled in any training courses.
            </div>
          ) : (
            courses.filter(c => c.enrollments?.some(e => e.employeeEmail === actorEmail && e.status !== 'CANCELLED')).map((course) => {
              const myEnr = course.enrollments.find(e => e.employeeEmail === actorEmail);
              if (!myEnr) return null;

              return (
                <div key={course.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '14px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-bright)' }}>📚 {course.title}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Instructor: <strong>{course.trainer}</strong> | Duration: {course.durationHours} Hours
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: `${getStatusColor(myEnr.status)}20`, color: getStatusColor(myEnr.status) }}>
                        {myEnr.status}
                      </span>
                      {myEnr.status === 'ENROLLED' && course.status === 'COMPLETED' && (
                        <button style={{ ...buttonStyle(true), padding: '4px 8px', fontSize: '11px' }} onClick={() => setSubmittingCompletion({ courseId: course.id, enrollmentId: myEnr.id })}>
                          🏆 Submit Certificate
                        </button>
                      )}
                    </div>
                  </div>

                  {myEnr.certificateUrl && (
                    <div style={{ marginBottom: '10px', fontSize: '13px' }}>
                      🎓 <strong>Certificate:</strong> <a href={myEnr.certificateUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>View Document</a>
                    </div>
                  )}

                  {myEnr.feedback && (
                    <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.15)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <strong>Your Feedback:</strong> {myEnr.feedback}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: MANAGE COURSES (HR ONLY) */}
      {activeTab === 'manage_courses' && isHR && (
        <div>
          <button style={{ ...buttonStyle(true), marginBottom: '20px' }} onClick={() => setShowCreateModal(true)}>
            ➕ {t.createTraining}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {courses.map((course) => {
              const activeParticipants = course.enrollments || [];

              return (
                <div key={course.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', marginBottom: '14px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-bright)' }}>📚 {course.title}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Trainer: <strong>{course.trainer}</strong> | Schedule: {new Date(course.scheduleDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: `${getStatusColor(course.status)}20`, color: getStatusColor(course.status) }}>
                        {course.status}
                      </span>
                      {course.status !== 'COMPLETED' && (
                        <button style={{ ...buttonStyle(true), padding: '4px 8px', fontSize: '11px' }} onClick={() => { setProcessingCourse(course); setCourseStatus(course.status as any); }}>
                          ⚙️ Edit Status
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Registered participants */}
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px' }}>
                      👥 Registered Participants ({activeParticipants.length})
                    </h4>
                    {activeParticipants.length === 0 ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No participants enrolled yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {activeParticipants.map((p) => (
                          <div key={p.id} style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: 'var(--text-bright)' }}>
                            👤 {p.employeeName} ({p.status})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: CREATE TRAINING COURSE */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ ...cardStyle, width: '90%', maxWidth: '500px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>➕ {t.createTraining}</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleCreateCourse}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.trainingTitle} *</label>
              <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} required />

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Description</label>
              <textarea style={{ ...inputStyle, fontFamily: 'inherit' }} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.trainingTrainer} *</label>
              <input style={inputStyle} value={trainer} onChange={(e) => setTrainer(e.target.value)} required />

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Schedule Date *</label>
                  <input style={inputStyle} type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.trainingDuration} *</label>
                  <input style={inputStyle} type="number" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} required />
                </div>
              </div>

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.trainingCapacity} *</label>
              <input style={inputStyle} type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />

              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? '⏳ ...' : `💾 Save Course`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT COMPLETION FEEDBACK & CERTIFICATE */}
      {submittingCompletion && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ ...cardStyle, width: '90%', maxWidth: '450px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>🏆 {t.uploadCertificate}</h3>
              <button onClick={() => setSubmittingCompletion(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleSubmitCompletion}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.certificateLink} *</label>
              <input style={inputStyle} value={certificateUrl} onChange={(e) => setCertificateUrl(e.target.value)} required placeholder="e.g. http://imgur.com/cert-xyz.pdf" />

              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.trainingFeedback} *</label>
              <textarea style={{ ...inputStyle, fontFamily: 'inherit' }} rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} required placeholder="Bagaimana materi dan pengajar pelatihan ini?" />

              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? '⏳ ...' : `💾 Submit Certification`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TRAINING STATUS (HR ONLY) */}
      {processingCourse && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ ...cardStyle, width: '90%', maxWidth: '450px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>⚙️ Edit Course Status</h3>
              <button onClick={() => setProcessingCourse(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleProcessCourse}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Select Status *</label>
              <select style={inputStyle} value={courseStatus} onChange={(e) => setCourseStatus(e.target.value as any)}>
                <option value="UPCOMING">🔵 UPCOMING</option>
                <option value="ONGOING">🟡 ONGOING</option>
                <option value="COMPLETED">🟢 COMPLETED</option>
              </select>

              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {loading ? '⏳ ...' : `💾 Save Changes`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
