import React, { useState } from 'react';
import './Login.css';

/**
 * Interface LoginProps:
 * Menentukan parameter fungsi (props) yang harus dikirim oleh komponen induk (App.tsx).
 * Di sini kita memerlukan fungsi callback 'onLoginSuccess' untuk memberitahu App.tsx 
 * jika user berhasil masuk.
 */
interface LoginProps {
  onLoginSuccess: (tenantId: string, actorEmail: string) => void;
}

/**
 * Komponen Fungsional Login (Functional Component):
 * Menggunakan React.FC dengan deklarasi generic tipe parameter props <LoginProps>.
 */
export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  
  /**
   * State Management menggunakan React Hook `useState`:
   * 1. tenantId: Menyimpan ID tenant yang dipilih (default '1')
   * 2. email: Menyimpan email aktor yang diketik (default 'admin@tenant1.com')
   * 3. error: Menyimpan pesan error validasi input form
   */
  const [tenantId, setTenantId] = useState<string>('1');
  const [email, setEmail] = useState<string>('admin@tenant1.com');
  const [error, setError] = useState<string>('');

  /**
   * Fungsi handleTenantChange:
   * Dipanggil saat user mengklik salah satu opsi Tenant (PT. Teknologi Nusantara / PT. Finance Mandiri).
   * Fungsi ini memperbarui state tenantId dan menyesuaikan email default agar mempermudah pengujian.
   */
  const handleTenantChange = (id: string) => {
    setTenantId(id);
    if (id === '1') {
      setEmail('admin@tenant1.com');
    } else {
      setEmail('admin@tenant2.com');
    }
  };

  /**
   * Fungsi handleLogin:
   * Berfungsi meng-handle event submit pada form login.
   * Parameter `e: React.FormEvent` mewakili event form submission di browser.
   */
  const handleLogin = (e: React.FormEvent) => {
    // Mencegah reload halaman bawaan browser saat form dikirim
    e.preventDefault();

    // Validasi sederhana: pastikan email tidak kosong dan mengandung karakter '@'
    if (!email.trim() || !email.includes('@')) {
      setError('Silakan masukkan format email yang valid!');
      return;
    }
    setError(''); // Hapus pesan error jika validasi lolos

    // 1. Simpan kredensial tenant & email secara lokal di browser
    localStorage.setItem('hrms_tenant_id', tenantId);
    localStorage.setItem('hrms_actor_email', email);

    // 2. Trigger fungsi callback yang dikirim dari App.tsx untuk mengubah status login utama
    onLoginSuccess(tenantId, email);
  };

  return (
    // Wrapper luar halaman login
    <div className="login-container">
      
      {/* Box Login menggunakan class styling Glassmorphism (.glass-panel) */}
      <div className="login-card glass-panel">
        
        {/* Bagian Header Logo dan Judul Aplikasi */}
        <div className="login-header">
          <div className="logo-icon">🏢</div>
          <h2>HRMS Enterprise</h2>
          <p>Portal Sistem Informasi Kepegawaian Multi-Tenant</p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="login-form">
          
          {/* Group 1: Pilihan Perusahaan/Tenant */}
          <div className="form-group">
            <label className="form-label">Pilih Perusahaan / Tenant:</label>
            <div className="tenant-selector">
              
              {/* Opsi Tenant 1: PT. Teknologi Nusantara */}
              <div 
                // Mengatur class 'active' secara dinamis jika tenantId bernilai '1'
                className={`tenant-option ${tenantId === '1' ? 'active' : ''}`}
                onClick={() => handleTenantChange('1')}
              >
                <div className="tenant-icon">🚀</div>
                <div className="tenant-info">
                  <span className="tenant-name">PT. Teknologi Nusantara</span>
                  <span className="tenant-desc">Tenant ID: 1 (Tech Company)</span>
                </div>
              </div>

              {/* Opsi Tenant 2: PT. Finance Mandiri */}
              <div 
                // Mengatur class 'active' secara dinamis jika tenantId bernilai '2'
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

          {/* Group 2: Input Email Karyawan */}
          <div className="form-group">
            <label className="form-label" htmlFor="actor-email">Email Aktor (Audit Log):</label>
            <input 
              type="email" 
              id="actor-email"
              className="custom-input"
              value={email} // Mengikat input value ke state 'email' (Two-way data binding)
              onChange={(e) => setEmail(e.target.value)} // Memperbarui state saat diketik
              placeholder="Masukkan email Anda"
              required
            />
          </div>

          {/* Menampilkan blok pesan kesalahan jika state 'error' tidak kosong */}
          {error && <div className="login-error-msg">{error}</div>}

          {/* Tombol Masuk */}
          <button type="submit" className="btn-primary btn-block">
            Masuk Ke Dashboard ➔
          </button>
        </form>

        {/* Footer info database */}
        <div className="login-footer">
          <p>Keamanan database terisolasi ketat per Tenant ID di PostgreSQL.</p>
        </div>
      </div>
    </div>
  );
};
