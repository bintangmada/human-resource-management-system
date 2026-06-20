import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onLoginSuccess: (tenantId: string, actorEmail: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [tenantId, setTenantId] = useState<string>('1');
  const [email, setEmail] = useState<string>('admin@tenant1.com');
  const [error, setError] = useState<string>('');

  const handleTenantChange = (id: string) => {
    setTenantId(id);
    if (id === '1') {
      setEmail('admin@tenant1.com');
    } else {
      setEmail('admin@tenant2.com');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Silakan masukkan format email yang valid!');
      return;
    }
    setError('');

    // Simpan ke local storage
    localStorage.setItem('hrms_tenant_id', tenantId);
    localStorage.setItem('hrms_actor_email', email);

    // Kirim callback sukses
    onLoginSuccess(tenantId, email);
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="logo-icon">🏢</div>
          <h2>HRMS Enterprise</h2>
          <p>Portal Sistem Informasi Kepegawaian Multi-Tenant</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">Pilih Perusahaan / Tenant:</label>
            <div className="tenant-selector">
              <div 
                className={`tenant-option ${tenantId === '1' ? 'active' : ''}`}
                onClick={() => handleTenantChange('1')}
              >
                <div className="tenant-icon">🚀</div>
                <div className="tenant-info">
                  <span className="tenant-name">PT. Teknologi Nusantara</span>
                  <span className="tenant-desc">Tenant ID: 1 (Tech Company)</span>
                </div>
              </div>

              <div 
                className={`tenant-option ${tenantId === '2' ? 'active' : ''}`}
                onClick={() => handleTenantChange('2')}
              >
                <div className="tenant-icon">💵</div>
                <div className="tenant-info">
                  <span className="tenant-name">PT. Finance Mandiri</span>
                  <span className="tenant-desc">Tenant ID: 2 (Financial Services)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="actor-email">Email Aktor (Audit Log):</label>
            <input 
              type="email" 
              id="actor-email"
              className="custom-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email Anda"
              required
            />
          </div>

          {error && <div className="login-error-msg">{error}</div>}

          <button type="submit" className="btn-primary btn-block">
            Masuk Ke Dashboard ➔
          </button>
        </form>

        <div className="login-footer">
          <p>Keamanan database terisolasi ketat per Tenant ID di PostgreSQL.</p>
        </div>
      </div>
    </div>
  );
};
