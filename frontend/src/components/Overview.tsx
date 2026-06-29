import React from 'react';

interface Props {
  tenantName: string;
  actorEmail: string;
  lang: 'id' | 'en';
  theme: 'light' | 'dark';
  onNavigate: (tab: any) => void;
}

export function Overview({ tenantName, actorEmail, lang, onNavigate }: Props) {
  const actorName = actorEmail.split('@')[0];

  const cardStyle: React.CSSProperties = {
    background: 'rgba(30, 30, 45, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '20px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
  };

  const statCardStyle = (color: string): React.CSSProperties => ({
    ...cardStyle,
    background: `linear-gradient(135deg, ${color}10, rgba(30, 30, 45, 0.45))`,
    borderLeft: `4px solid ${color}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '120px'
  });

  const quickLinkStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    textAlign: 'left',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(16, 185, 129, 0.08))', padding: '30px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
          {lang === 'id' ? `Selamat Datang Kembali, ${actorName}! 👋` : `Welcome Back, ${actorName}! 👋`}
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', maxWidth: '700px' }}>
          {lang === 'id' 
            ? `Anda masuk ke dalam portal administrasi ${tenantName}. Pantau kehadiran karyawan, kelola payroll, cuti, serta reimbursement dinas secara real-time.`
            : `You are logged into the administration portal for ${tenantName}. Monitor employee attendance, manage payroll, leaves, and business travel reimbursements in real-time.`}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={statCardStyle('#3b82f6')}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>👤 TOTAL EMPLOYEES</span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginTop: '8px' }}>148</h2>
          </div>
          <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600 }}>Active members across 6 departments</span>
        </div>

        <div style={statCardStyle('#10b981')}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>⏱️ TODAY'S ATTENDANCE</span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginTop: '8px' }}>96.4%</h2>
          </div>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>142 checked in within geofence limits</span>
        </div>

        <div style={statCardStyle('#f59e0b')}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>🌴 PENDING LEAVE REQUESTS</span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginTop: '8px' }}>3</h2>
          </div>
          <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>Awaiting manager verification</span>
        </div>

        <div style={statCardStyle('#ec4899')}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>💵 REIMBURSEMENT PIPELINE</span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginTop: '8px' }}>Rp 5.4M</h2>
          </div>
          <span style={{ fontSize: '11px', color: '#ec4899', fontWeight: 600 }}>6 pending claim receipts to audit</span>
        </div>
      </div>

      {/* Main Layout split */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Side: Dynamic Activity Log & Announcements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📢 {lang === 'id' ? 'Pengumuman Terbaru' : 'Latest Announcements'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--primary-color)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>29 June 2026</span>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>Quarterly Performance Review Kickoff</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Please complete your self-reviews under the Performance tab before Friday afternoon.</p>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid #10b981' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>25 June 2026</span>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>Geofence Update - West Office Wing</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>The geofencing radius has been expanded to 100 meters to accommodate new outdoor lounge checkins.</p>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              🎓 {lang === 'id' ? 'Program Pelatihan Mendatang' : 'Upcoming L&D Courses'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.15)' }}>
                <span style={{ padding: '2px 6px', borderRadius: '8px', fontSize: '9px', fontWeight: 700, background: 'rgba(59,130,246,0.2)', color: '#3b82f6' }}>UPCOMING</span>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '8px' }}>Microservices with Spring Boot</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Date: July 5, 2026 (10 Hours)</p>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.15)' }}>
                <span style={{ padding: '2px 6px', borderRadius: '8px', fontSize: '9px', fontWeight: 700, background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>ONGOING</span>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '8px' }}>React Native for Mobile Apps</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Date: June 30, 2026 (12 Hours)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Links */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            ⚡ {lang === 'id' ? 'Tindakan Cepat' : 'Quick Actions'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={quickLinkStyle} onClick={() => onNavigate('attendance')}>
              <span>⏰</span> {lang === 'id' ? 'Lakukan Presensi' : 'Check Attendance'}
            </button>
            <button style={quickLinkStyle} onClick={() => onNavigate('leave')}>
              <span>🌴</span> {lang === 'id' ? 'Ajukan Cuti' : 'Request Leave'}
            </button>
            <button style={quickLinkStyle} onClick={() => onNavigate('claims')}>
              <span>💵</span> {lang === 'id' ? 'Klaim Reimbursement' : 'Submit Claim'}
            </button>
            <button style={quickLinkStyle} onClick={() => onNavigate('travel')}>
              <span>✈️</span> {lang === 'id' ? 'Pengajuan Dinas' : 'Business Travel'}
            </button>
            <button style={quickLinkStyle} onClick={() => onNavigate('training')}>
              <span>🎓</span> {lang === 'id' ? 'Daftar Pelatihan' : 'Browse Trainings'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
