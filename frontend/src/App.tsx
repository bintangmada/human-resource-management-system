import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

/**
 * Komponen Utama Aplikasi (App):
 * Mengatur alur navigasi global antara halaman Login Simulator 
 * dan halaman Dashboard Administrator.
 */
function App() {
  // State session: Menyimpan tenantId dan email aktor aktif yang sedang 'login'
  // Nilainya berupa objek { tenantId, actorEmail } atau null (jika belum masuk)
  const [session, setSession] = useState<{ tenantId: string; actorEmail: string } | null>(null);

  /**
   * React Hook `useEffect`:
   * Dipanggil tepat satu kali saat aplikasi pertama kali dimuat di browser.
   * Berfungsi untuk membaca sisa session login sebelumnya yang tersimpan di LocalStorage 
   * agar pengguna tidak perlu login ulang saat halaman direfresh.
   */
  useEffect(() => {
    const savedTenant = localStorage.getItem('hrms_tenant_id');
    const savedEmail = localStorage.getItem('hrms_actor_email');
    
    // Jika data session ditemukan di LocalStorage, langsung arahkan ke Dashboard
    if (savedTenant && savedEmail) {
      setSession({ tenantId: savedTenant, actorEmail: savedEmail });
    }
  }, []);

  /**
   * Fungsi handleLoginSuccess:
   * Callback yang akan dipanggil dari komponen anak (Login.tsx) setelah validasi login sukses.
   */
  const handleLoginSuccess = (tenantId: string, actorEmail: string) => {
    setSession({ tenantId, actorEmail });
  };

  /**
   * Fungsi handleLogout:
   * Menghapus seluruh data session yang disimpan di LocalStorage browser 
   * dan mereset state session kembali ke null (menampilkan halaman login).
   */
  const handleLogout = () => {
    localStorage.removeItem('hrms_tenant_id');
    localStorage.removeItem('hrms_actor_email');
    setSession(null);
  };

  return (
    // Kontainer utama aplikasi (didefinisikan di App.css)
    <div className="app-root">
      
      {/* 
        LOGIKA NAVIGASI / ROUTING SEDERHANA (Conditional Rendering):
        - Jika state 'session' terisi objek (tidak null), render komponen <Dashboard />
        - Jika state 'session' bernilai null, render komponen <Login />
      */}
      {session ? (
        <Dashboard 
          tenantId={session.tenantId} 
          actorEmail={session.actorEmail} 
          onLogout={handleLogout} 
        />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
