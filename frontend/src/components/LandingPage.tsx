import React from 'react';
import './LandingPage.css';

// SVG Icons
const BuildingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M4 21V5a2 2 0 012-2h12a2 2 0 012 2v16M9 9h0M9 13h0M9 17h0M15 9h0M15 13h0M15 17h0" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const PayrollIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="19" x2="20" y2="19" />
    <rect x="5" y="5" width="14" height="10" rx="1" />
    <path d="M9 9h6M9 12h3" />
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: (planName?: 'TRIAL' | 'PROFESSIONAL' | 'ENTERPRISE') => void;
  lang: 'id' | 'en';
  changeLang: (lang: 'id' | 'en') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
  lang,
  changeLang,
  theme,
  setTheme,
}) => {
  const [activeSection, setActiveSection] = React.useState<string>('home');
  const [isScrolled, setIsScrolled] = React.useState<boolean>(false);

  // Currency & Billing Cycle State
  const [currency, setCurrency] = React.useState<'USD' | 'IDR'>('USD');
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'semi-annually' | 'yearly' | 'custom'>('monthly');
  const [customDays, setCustomDays] = React.useState<number>(45);

  // Pricing Calculator State
  const [calcAdmins, setCalcAdmins] = React.useState<number>(1);
  const [calcFinance, setCalcFinance] = React.useState<number>(1);
  const [calcHr, setCalcHr] = React.useState<number>(1);
  const [calcStaff, setCalcStaff] = React.useState<number>(5);

  const formatPrice = (value: number, curr: 'USD' | 'IDR') => {
    if (curr === 'USD') {
      return `$${value.toLocaleString()}`;
    } else {
      return `Rp ${value.toLocaleString('id-ID')}`;
    }
  };

  const getBaseMonthlyRate = () => {
    if (currency === 'USD') {
      return (calcAdmins * 30) + (calcFinance * 25) + (calcHr * 15) + (calcStaff * 2);
    } else {
      return (calcAdmins * 450000) + (calcFinance * 375000) + (calcHr * 225000) + (calcStaff * 30000);
    }
  };

  const getBillingDetails = () => {
    const monthlyRate = getBaseMonthlyRate();
    let multiplier = 1;
    let discount = 0; // percentage
    let periodLabel = lang === 'id' ? '/ Bulan' : '/ Month';
    
    if (billingCycle === 'semi-annually') {
      multiplier = 6;
      discount = 0.10; // 10%
      periodLabel = lang === 'id' ? '/ 6 Bulan' : '/ 6 Months';
    } else if (billingCycle === 'yearly') {
      multiplier = 12;
      discount = 0.20; // 20%
      periodLabel = lang === 'id' ? '/ Tahun' : '/ Year';
    } else if (billingCycle === 'custom') {
      multiplier = customDays / 30;
      // Dynamic discount based on duration (in days)
      if (customDays >= 365) {
        discount = 0.20; // 20%
      } else if (customDays >= 180) {
        discount = 0.10; // 10%
      } else if (customDays >= 90) {
        discount = 0.05; // 5%
      } else {
        discount = 0;
      }
      periodLabel = lang === 'id' ? `/ ${customDays} Hari` : `/ ${customDays} Days`;
    }

    const totalRaw = monthlyRate * multiplier;
    const totalDiscounted = Math.round(totalRaw * (1 - discount));
    const effectiveMonthly = Math.round(totalDiscounted / multiplier);

    return {
      total: totalDiscounted,
      effectiveMonthly,
      periodLabel,
      discountPercent: Math.round(discount * 100),
    };
  };

  const billingDetails = getBillingDetails();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Check if we are at the bottom of the page
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        setActiveSection('about');
        return;
      }

      const sections = ['home', 'features', 'solutions', 'resources', 'about'];
      const scrollPosition = window.scrollY + 200; // offset

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-container">
      {/* Background decorations */}
      <div className="landing-bg-decorations">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Navbar */}
      <header className={`landing-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="landing-logo" onClick={() => window.location.reload()}>
          <div className="landing-logo-icon">
            <BuildingIcon />
          </div>
          <span className="landing-logo-text">HRMS</span>
        </div>

        <nav className="nav-menu">
          <a href="#home" className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}>Home</a>
          <a href="#features" className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}>Features</a>
          <a href="#solutions" className={`nav-link ${activeSection === 'solutions' ? 'active' : ''}`}>Solutions</a>
          <a href="#resources" className={`nav-link ${activeSection === 'resources' ? 'active' : ''}`}>Resources</a>
          <a href="#about" className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}>About Us</a>
        </nav>

        <div className="nav-actions">
          {/* Theme & Language Selectors */}
          <button 
            type="button" 
            className="landing-theme-toggle" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <div className="landing-lang-selector">
            <button className={lang === 'id' ? 'active' : ''} onClick={() => changeLang('id')}>ID</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => changeLang('en')}>EN</button>
          </div>

          <button className="btn-login-flat" onClick={onNavigateToLogin}>
            {lang === 'id' ? 'Log In' : 'Log In'}
          </button>
          <button className="btn-get-started" onClick={() => onNavigateToRegister('TRIAL')}>
            {lang === 'id' ? 'Get Started' : 'Get Started'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main id="home" className="landing-hero-section">
        <div className="hero-left">
          <div className="hero-badge">
            <span className="badge-line"></span>
            <span className="badge-text">Human Resource Management System</span>
          </div>

          <h1 className="hero-title">
            {lang === 'id' ? (
              <>
                Empower <span className="highlight-blue">People</span>. <br />
                Elevate <span className="highlight-blue">Performance</span>.
              </>
            ) : (
              <>
                Empower <span className="highlight-blue">People</span>. <br />
                Elevate <span className="highlight-blue">Performance</span>.
              </>
            )}
          </h1>

          <p className="hero-subtitle">
            {lang === 'id' 
              ? 'HRMS adalah solusi terintegrasi untuk mengelola karyawan, meningkatkan kinerja, dan mendorong pertumbuhan perusahaan.'
              : 'HRMS is an integrated solution to manage employees, improve performance, and drive company growth.'}
          </p>

          <div className="hero-ctas">
            <button className="btn-cta-primary" onClick={() => onNavigateToRegister('TRIAL')}>
              {lang === 'id' ? 'Get Started' : 'Get Started'} <span className="arrow">➔</span>
            </button>
            <button className="btn-cta-secondary" onClick={() => alert('Simulasi Video Demo')}>
              <span className="play-icon-wrapper"><PlayIcon /></span>
              {lang === 'id' ? 'Watch Video' : 'Watch Video'}
            </button>
          </div>

          {/* Floating features card */}
          <div className="features-floating-card">
            <div className="feature-item">
              <span className="feature-icon blue"><UserIcon /></span>
              <span className="feature-label">
                {lang === 'id' ? 'Employee Management' : 'Employee Management'}
              </span>
            </div>
            <div className="feature-item">
              <span className="feature-icon green"><CalendarIcon /></span>
              <span className="feature-label">
                {lang === 'id' ? 'Attendance Tracking' : 'Attendance Tracking'}
              </span>
            </div>
            <div className="feature-item">
              <span className="feature-icon purple"><ChartIcon /></span>
              <span className="feature-label">
                {lang === 'id' ? 'Performance Evaluation' : 'Performance Evaluation'}
              </span>
            </div>
            <div className="feature-item">
              <span className="feature-icon orange"><PayrollIcon /></span>
              <span className="feature-label">
                {lang === 'id' ? 'Payroll Management' : 'Payroll Management'}
              </span>
            </div>
          </div>
        </div>

        {/* Right side illustration */}
        <div className="hero-right">
          <div className="hero-illustration-wrapper">
            <img 
              src="/landing-hero.jpg" 
              alt="HRMS Corporate Illustration" 
              className="hero-illustration"
            />
            <div className="glass-reflection-overlay"></div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="landing-section features-section">
        <div className="section-header">
          <div className="section-badge">{lang === 'id' ? 'PILAR UTAMA' : 'CORE PILLARS'}</div>
          <h2 className="section-title">
            {lang === 'id' ? 'Fitur Unggulan Enterprise' : 'Core Enterprise Features'}
          </h2>
          <p className="section-subtitle">
            {lang === 'id' 
              ? 'Kelola operasional HR perusahaan Anda secara terpusat dengan sistem keamanan multi-tenant yang terisolasi ketat.' 
              : 'Centralize your HR operations with strict multi-tenant schema isolation and enterprise security.'}
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="card-icon blue"><UserIcon /></div>
            <h3>{lang === 'id' ? 'Manajemen Karyawan' : 'Employee Directory'}</h3>
            <p>
              {lang === 'id' 
                ? 'Kelola data profil, departemen default (IT, HRD, FIN), jabatan, dan tingkat lisensi karyawan secara real-time.'
                : 'Manage profile data, default departments (IT, HRD, FIN), job levels, and employee license tiers in real-time.'}
            </p>
          </div>

          <div className="feature-card glass-panel">
            <div className="card-icon green"><CalendarIcon /></div>
            <h3>{lang === 'id' ? 'Pencatatan Kehadiran' : 'Smart Attendance'}</h3>
            <p>
              {lang === 'id' 
                ? 'Sistem absensi mandiri karyawan yang terintegrasi dengan penghitungan jam kerja otomatis dan ringkasan bulanan.'
                : 'Self-service employee attendance integrated with automatic work hour calculations and monthly logs.'}
            </p>
          </div>

          <div className="feature-card glass-panel">
            <div className="card-icon purple"><ChartIcon /></div>
            <h3>{lang === 'id' ? 'Evaluasi Kinerja' : 'Performance Tracking'}</h3>
            <p>
              {lang === 'id' 
                ? 'Pantau produktivitas, pencapaian target kerja, departemen, serta visualisasi data karyawan melalui dashboard.'
                : 'Monitor productivity, target completion rates, departments, and visualize employee records via dashboard.'}
            </p>
          </div>

          <div className="feature-card glass-panel">
            <div className="card-icon orange"><PayrollIcon /></div>
            <h3>{lang === 'id' ? 'Kalkulasi Gaji & Lisensi' : 'Automated Payroll'}</h3>
            <p>
              {lang === 'id' 
                ? 'Perhitungan otomatis biaya lisensi per peran (Admin $30, Finance $25, HR $15, Staff $2) secara transparan.'
                : 'Automatic role-based license billing (Admin $30, Finance $25, HR $15, Staff $2) computed transparently.'}
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="landing-section solutions-section">
        <div className="solutions-container-inner">
          <div className="solutions-text">
            <div className="section-badge">{lang === 'id' ? 'ARSITEKTUR & KEAMANAN' : 'SECURITY & ARCHITECTURE'}</div>
            <h2 className="section-title">
              {lang === 'id' ? 'Isolasi Data Tingkat Tinggi' : 'High-Grade Multi-Tenant Isolation'}
            </h2>
            <p className="section-desc">
              {lang === 'id'
                ? 'HRMS dibangun menggunakan arsitektur cloud-native yang memisahkan data antar penyewa (tenant) menggunakan isolasi data PostgreSQL ketat. Setiap tenant mendaftar mandiri tanpa campur tangan master admin.'
                : 'HRMS is built using cloud-native patterns that isolate data per tenant using PostgreSQL schema separation. Tenants register self-service without master admin intervention.'}
            </p>

            <ul className="solutions-list">
              <li>
                <span className="list-icon">🔒</span>
                <div>
                  <strong>{lang === 'id' ? 'Federated Email Login Filter' : 'Federated Email Login Filter'}</strong>
                  <p>{lang === 'id' ? 'Validasi login terintegrasi melalui header X-Tenant-ID untuk memastikan isolasi akses karyawan.' : 'Integrated validation via X-Tenant-ID header to guarantee isolated employee access.'}</p>
                </div>
              </li>
              <li>
                <span className="list-icon">🚀</span>
                <div>
                  <strong>{lang === 'id' ? 'Automated Database Seeding' : 'Automated Database Seeding'}</strong>
                  <p>{lang === 'id' ? 'Pendaftaran perusahaan baru secara otomatis men-seed data departemen, jabatan, dan akun admin owner.' : 'New tenant registration automatically seeds departments, job titles, and the owner admin account.'}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="solutions-visual glass-panel">
            <div className="visual-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
              <span className="visual-title">Tenant Security Validator</span>
            </div>
            <div className="visual-body">
              <div className="flow-step active">
                <span className="step-num">1</span>
                <span>User Input Email & Company Code</span>
              </div>
              <div className="flow-connector"></div>
              <div className="flow-step active">
                <span className="step-num">2</span>
                <span>Lookup Tenant Metadata API & Verify X-Tenant-ID</span>
              </div>
              <div className="flow-connector"></div>
              <div className="flow-step success">
                <span className="step-num">✓</span>
                <span>Isolated PostgreSQL Schema Access Approved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources & Pricing Section */}
      <section id="resources" className="landing-section pricing-section">
        <div className="section-header">
          <div className="section-badge">{lang === 'id' ? 'BIAYA BERLANGGANAN' : 'PRICING PACKAGES'}</div>
          <h2 className="section-title">
            {lang === 'id' ? 'Paket Layanan Transparan' : 'Transparent Role-Based Pricing'}
          </h2>
          <p className="section-subtitle">
            {lang === 'id'
              ? 'Daftar sekarang dengan uji coba gratis 15 hari, atau gunakan simulator interaktif untuk menghitung tagihan Anda.'
              : 'Get started with a 15-day free trial, or use our interactive calculator to compute your license cost.'}
          </p>
        </div>

        {/* Toggle Controls */}
        <div className="pricing-toggles">
          {/* Currency Toggle */}
          <div className="toggle-group glass-panel">
            <button 
              className={`toggle-btn ${currency === 'USD' ? 'active' : ''}`}
              onClick={() => setCurrency('USD')}
            >
              USD ($)
            </button>
            <button 
              className={`toggle-btn ${currency === 'IDR' ? 'active' : ''}`}
              onClick={() => setCurrency('IDR')}
            >
              IDR (Rp)
            </button>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="toggle-group glass-panel">
            <button 
              className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              {lang === 'id' ? 'Bulanan' : 'Monthly'}
            </button>
            <button 
              className={`toggle-btn ${billingCycle === 'semi-annually' ? 'active' : ''}`}
              onClick={() => setBillingCycle('semi-annually')}
            >
              {lang === 'id' ? '6 Bulanan' : '6 Months'}
              <span className="discount-badge">10% Off</span>
            </button>
            <button 
              className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('yearly')}
            >
              {lang === 'id' ? '1 Tahunan' : 'Yearly'}
              <span className="discount-badge">20% Off</span>
            </button>
            <button 
              className={`toggle-btn ${billingCycle === 'custom' ? 'active' : ''}`}
              onClick={() => setBillingCycle('custom')}
            >
              {lang === 'id' ? 'Kustom' : 'Custom'}
            </button>
          </div>
        </div>

        {/* Custom Days Input Panel */}
        {billingCycle === 'custom' && (
          <div className="custom-days-container glass-panel">
            <div className="custom-days-header">
              <span className="custom-days-label">
                {lang === 'id' ? 'Tentukan Durasi Layanan (Hari):' : 'Specify Service Duration (Days):'}
              </span>
            </div>
            <div className="custom-days-control">
              <input 
                type="range" 
                min="1" 
                max="730" 
                value={customDays} 
                onChange={(e) => setCustomDays(parseInt(e.target.value) || 30)}
                className="custom-days-slider"
              />
              <div className="custom-days-input-wrapper">
                <input 
                  type="number" 
                  min="1" 
                  max="730" 
                  value={customDays} 
                  onChange={(e) => setCustomDays(Math.max(1, Math.min(730, parseInt(e.target.value) || 1)))}
                  className="custom-days-input"
                />
                <span className="custom-days-unit">{lang === 'id' ? 'Hari' : 'Days'}</span>
              </div>
            </div>
            <div className="custom-days-hint">
              {customDays >= 365 ? (
                <span className="discount-applied text-success">✓ {lang === 'id' ? 'Diskon 20% otomatis aktif (≥ 365 hari)' : 'Auto 20% discount active (≥ 365 days)'}</span>
              ) : customDays >= 180 ? (
                <span className="discount-applied text-success">✓ {lang === 'id' ? 'Diskon 10% otomatis aktif (≥ 180 hari)' : 'Auto 10% discount active (≥ 180 days)'}</span>
              ) : customDays >= 90 ? (
                <span className="discount-applied text-success">✓ {lang === 'id' ? 'Diskon 5% otomatis aktif (≥ 90 hari)' : 'Auto 5% discount active (≥ 90 days)'}</span>
              ) : (
                <span className="text-muted">{lang === 'id' ? 'Diskon aktif setelah 90 hari atau lebih.' : 'Discounts apply at 90 days or more.'}</span>
              )}
            </div>
          </div>
        )}

        <div className="pricing-grid">
          {/* Trial Card */}
          <div className="pricing-card glass-panel">
            <div className="pricing-header">
              <h3>{lang === 'id' ? 'Paket Uji Coba (Trial)' : 'Lite Trial'}</h3>
              <div className="price-tag">
                <span className="amount">{currency === 'USD' ? '$0' : 'Rp 0'}</span>
                <span className="period">/ 15 {lang === 'id' ? 'Hari' : 'Days'}</span>
              </div>
            </div>
            <p className="pricing-desc">
              {lang === 'id' ? 'Coba seluruh fitur utama secara gratis untuk 10 karyawan pertama.' : 'Try all core features for free for your first 10 employees.'}
            </p>
            <ul className="pricing-features">
              <li>✓ 1 Company Code (.hrms.com)</li>
              <li>✓ Up to 10 Employees</li>
              <li>✓ Default Department Seeding</li>
              <li>✓ Attendance & Work Logs</li>
            </ul>
            <button className="btn-pricing-action" onClick={() => onNavigateToRegister('TRIAL')}>
              {lang === 'id' ? 'Coba Gratis Sekarang' : 'Start Free Trial'}
            </button>
          </div>

          {/* Interactive Calculator Card */}
          <div className="pricing-card glass-panel premium-border">
            <div className="pricing-badge">{lang === 'id' ? 'REKOMENDASI SAAS' : 'INTERACTIVE SIMULATOR'}</div>
            <div className="pricing-header">
              <h3>{lang === 'id' ? 'Simulasi Biaya Pro' : 'Pro SaaS Calculator'}</h3>
              <div className="price-tag" style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span className="amount" style={{ fontSize: currency === 'IDR' ? '2.5rem' : '3.5rem' }}>
                  {formatPrice(billingDetails.total, currency)}
                </span>
                <span className="period" style={{ marginLeft: '6px' }}>{billingDetails.periodLabel}</span>
              </div>
              {billingCycle !== 'monthly' && (
                <div className="price-subtext" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>
                    {lang === 'id' ? 'Setara' : 'Equiv.'} {formatPrice(billingDetails.effectiveMonthly, currency)}/{lang === 'id' ? 'bln' : 'mo'}
                  </span>
                  <span className="discount-badge">
                    {billingDetails.discountPercent}% Off
                  </span>
                </div>
              )}
            </div>

            <div className="calculator-inputs">
              <div className="calc-row">
                <div className="calc-label">
                  <strong>Super Admin ({currency === 'USD' ? '$30/mo' : 'Rp 450.000/bln'})</strong>
                  <span>{lang === 'id' ? 'Akses penuh owner' : 'Full access owner'}</span>
                </div>
                <div className="calc-control">
                  <button onClick={() => setCalcAdmins(Math.max(1, calcAdmins - 1))}>-</button>
                  <span>{calcAdmins}</span>
                  <button onClick={() => setCalcAdmins(calcAdmins + 1)}>+</button>
                </div>
              </div>

              <div className="calc-row">
                <div className="calc-label">
                  <strong>Finance Role ({currency === 'USD' ? '$25/mo' : 'Rp 375.000/bln'})</strong>
                  <span>{lang === 'id' ? 'Kelola penggajian' : 'Payroll admin'}</span>
                </div>
                <div className="calc-control">
                  <button onClick={() => setCalcFinance(Math.max(0, calcFinance - 1))}>-</button>
                  <span>{calcFinance}</span>
                  <button onClick={() => setCalcFinance(calcFinance + 1)}>+</button>
                </div>
              </div>

              <div className="calc-row">
                <div className="calc-label">
                  <strong>HR Admin Role ({currency === 'USD' ? '$15/mo' : 'Rp 225.000/bln'})</strong>
                  <span>{lang === 'id' ? 'Kelola karyawan' : 'Recruitment & logs'}</span>
                </div>
                <div className="calc-control">
                  <button onClick={() => setCalcHr(Math.max(0, calcHr - 1))}>-</button>
                  <span>{calcHr}</span>
                  <button onClick={() => setCalcHr(calcHr + 1)}>+</button>
                </div>
              </div>

              <div className="calc-row">
                <div className="calc-label">
                  <strong>Employee/Staff ({currency === 'USD' ? '$2/mo' : 'Rp 30.000/bln'})</strong>
                  <span>{lang === 'id' ? 'Absensi mandiri' : 'Self-service logs'}</span>
                </div>
                <div className="calc-control">
                  <button onClick={() => setCalcStaff(Math.max(0, calcStaff - 1))}>-</button>
                  <span>{calcStaff}</span>
                  <button onClick={() => setCalcStaff(calcStaff + 1)}>+</button>
                </div>
              </div>
            <button 
              className="btn-pricing-action primary" 
              onClick={() => {
                const totalUsers = calcAdmins + calcFinance + calcHr + calcStaff;
                onNavigateToRegister(totalUsers > 100 ? 'ENTERPRISE' : 'PROFESSIONAL');
              }}
            >
              {lang === 'id' ? 'Daftar Perusahaan Mandiri' : 'Register Now'}
            </button>
          </div>
        </div>
      </div>
    </section>

      {/* About Us Section */}
      <section id="about" className="landing-section about-section">
        <div className="about-container-inner glass-panel">
          <div className="about-content">
            <h2 className="section-title">
              {lang === 'id' ? 'Meningkatkan Efisiensi Operasional' : 'Driving Operational Excellence'}
            </h2>
            <p>
              {lang === 'id'
                ? 'HRMS Enterprise adalah platform SaaS kepegawaian modern yang dirancang untuk mempercepat administrasi personalia, mengotomatiskan penggajian, dan memberikan visibilitas penuh bagi manajemen. Dengan teknologi PostgreSQL Schema Isolation, Redis cache, dan Spring Boot microservices, kami menjamin keamanan data setingkat bank untuk perusahaan Anda.'
                : 'HRMS Enterprise is a modern staffing SaaS platform designed to accelerate personnel administration, automate payroll, and provide full visibility for management. Backed by PostgreSQL Schema Isolation, Redis cache, and Spring Boot microservices, we guarantee bank-grade data security for your organization.'}
            </p>
            <div className="about-tech-badges">
              <span className="tech-badge">Spring Boot</span>
              <span className="tech-badge">React & Vite</span>
              <span className="tech-badge">PostgreSQL Schema</span>
              <span className="tech-badge">Redis Caching</span>
              <span className="tech-badge">Kafka Streams</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom statistics bar */}
      <footer className="landing-stats-bar">
        <div className="stat-box">
          <div className="stat-icon-wrapper">👤</div>
          <div className="stat-content">
            <span className="stat-number">10K+</span>
            <span className="stat-desc">{lang === 'id' ? 'Karyawan Dikelola' : 'Employees Managed'}</span>
          </div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-box">
          <div className="stat-icon-wrapper">🏢</div>
          <div className="stat-content">
            <span className="stat-number">500+</span>
            <span className="stat-desc">{lang === 'id' ? 'Perusahaan Terdaftar' : 'Companies'}</span>
          </div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-box">
          <div className="stat-icon-wrapper">📈</div>
          <div className="stat-content">
            <span className="stat-number">98%</span>
            <span className="stat-desc">{lang === 'id' ? 'Tingkat Kepuasan' : 'Satisfaction Rate'}</span>
          </div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-box">
          <div className="stat-icon-wrapper">🎧</div>
          <div className="stat-content">
            <span className="stat-number">24/7</span>
            <span className="stat-desc">{lang === 'id' ? 'Dukungan Layanan' : 'Support'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
