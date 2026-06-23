import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { MasterDashboard } from './components/MasterDashboard';
import { LandingPage } from './components/LandingPage';
import { Language } from './utils/i18n';

/**
 * Komponen Utama Aplikasi (App):
 * Mengatur alur navigasi global antara halaman Landing Page, Login,
 * dan halaman Dashboard Administrator/Master.
 */
function App() {
  // State session: Menyimpan tenantId dan email aktor aktif yang sedang 'login'
  const [session, setSession] = useState<{ tenantId: string; actorEmail: string } | null>(null);

  // State navigasi halaman ketika belum login
  const [view, setView] = useState<'landing' | 'login' | 'register'>('landing');
  const [initialPlan, setInitialPlan] = useState<'TRIAL' | 'PROFESSIONAL' | 'ENTERPRISE'>('TRIAL');
  const [initialSubdomain, setInitialSubdomain] = useState<string>('');

  // State Bahasa (Language State) - Persisten di LocalStorage
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('hrms_lang') as Language) || 'id';
  });

  // State Tema (Theme State) - Persisten di LocalStorage
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('hrms_lang', newLang);
  };

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
   * dan mereset state session kembali ke null (menampilkan halaman landing).
   */
  const handleLogout = () => {
    localStorage.removeItem('hrms_tenant_id');
    localStorage.removeItem('hrms_actor_email');
    setSession(null);
    setView('landing');
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
        session.tenantId === '0' ? (
          <MasterDashboard 
            actorEmail={session.actorEmail} 
            onLogout={handleLogout} 
            lang={lang}
            changeLang={changeLang}
            theme={theme}
            setTheme={setTheme}
          />
        ) : (
          <Dashboard 
            tenantId={session.tenantId} 
            actorEmail={session.actorEmail} 
            onLogout={handleLogout} 
            lang={lang}
            changeLang={changeLang}
            theme={theme}
            setTheme={setTheme}
          />
        )
      ) : view === 'landing' ? (
        <LandingPage 
          onNavigateToLogin={() => setView('login')}
          onNavigateToRegister={(plan) => {
            if (plan) setInitialPlan(plan);
            setView('register');
          }}
          lang={lang}
          changeLang={changeLang}
          theme={theme}
          setTheme={setTheme}
          onMasterAdminSecretLogin={() => {
            setInitialSubdomain('admin');
            setView('login');
          }}
        />
      ) : (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          lang={lang}
          changeLang={changeLang}
          theme={theme}
          setTheme={setTheme}
          initialStep={view === 'register' ? 'register' : 'domain'}
          initialPlan={initialPlan}
          initialSubdomain={initialSubdomain}
          onBackToLanding={() => {
            setInitialSubdomain('');
            setView('landing');
          }}
        />
      )}
    </div>
  );
}

export default App;
