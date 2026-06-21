import React, { useState, useEffect } from 'react';
import './Login.css';
import { Language, translations } from '../utils/i18n';
import { apiRequest } from '../utils/api';

interface LoginProps {
  onLoginSuccess: (tenantId: string, actorEmail: string) => void;
  lang: Language;
  changeLang: (l: Language) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  initialStep?: 'domain' | 'register';
  onBackToLanding?: () => void;
}

interface TenantMetadata {
  id: number;
  companyName: string;
  subdomain: string;
  status: string;
}

type LoginStep = 'domain' | 'login' | 'register';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="9" y1="22" x2="9" y2="16"></line>
    <line x1="15" y1="22" x2="15" y2="16"></line>
    <line x1="9" y1="16" x2="15" y2="16"></line>
    <path d="M8 6h.01"></path>
    <path d="M16 6h.01"></path>
    <path d="M8 10h.01"></path>
    <path d="M16 10h.01"></path>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const CrossIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', flexShrink: 0 }}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', flexShrink: 0 }}>
    <line x1="12" y1="2" x2="12" y2="6"></line>
    <line x1="12" y1="18" x2="12" y2="22"></line>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
    <line x1="2" y1="12" x2="6" y2="12"></line>
    <line x1="18" y1="12" x2="22" y2="12"></line>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
);

export const Login: React.FC<LoginProps> = ({ 
  onLoginSuccess, 
  lang, 
  changeLang, 
  theme, 
  setTheme,
  initialStep = 'domain',
  onBackToLanding
}) => {
  const [step, setStep] = useState<LoginStep>(initialStep);
  const [resolvedTenant, setResolvedTenant] = useState<TenantMetadata | null>(null);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);
  
  // Input States
  const [inputSubdomain, setInputSubdomain] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Registration Form States
  const [companyName, setCompanyName] = useState<string>('');
  const [newSubdomain, setNewSubdomain] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerEmail, setOwnerEmail] = useState<string>('');
  const [plan, setPlan] = useState<string>('TRIAL');
  const [hrName, setHrName] = useState<string>('');
  const [hrEmail, setHrEmail] = useState<string>('');
  const [financeName, setFinanceName] = useState<string>('');
  const [financeEmail, setFinanceEmail] = useState<string>('');
  const [showDelegates, setShowDelegates] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Custom Dropdown States & Refs
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState<boolean>(false);
  const planDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (planDropdownRef.current && !planDropdownRef.current.contains(event.target as Node)) {
        setIsPlanDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const t = translations[lang];

  // Helper to extract subdomain from hostname (e.g. teknologi-nusantara.localhost)
  const detectSubdomain = (): string | null => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // If hostname is "company.localhost" or "company.domain.com"
    if (parts.length > 1 && parts[parts.length - 1] === 'localhost') {
      return parts[0];
    }
    if (parts.length > 2 && parts[parts.length - 1] !== 'localhost' && !hostname.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
      return parts[0];
    }
    return null;
  };

  // Run domain lookup on mount if subdomain is detected in URL
  useEffect(() => {
    const subdomainInUrl = detectSubdomain();
    if (subdomainInUrl) {
      handleLookup(subdomainInUrl, true);
    }
  }, []);

  // Auto-dismiss error alerts after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Clear error message when user modifies input fields
  useEffect(() => {
    setError('');
  }, [inputSubdomain, email, companyName, newSubdomain, ownerName, ownerEmail]);

  // Check subdomain availability for registration form
  useEffect(() => {
    if (!newSubdomain.trim() || step !== 'register') {
      setSubdomainStatus('idle');
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSubdomainStatus('checking');
      try {
        const formatted = newSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
        const response = await apiRequest<{ data: any }>(`/tenants/lookup?subdomain=${formatted}`);
        if (response && response.data) {
          setSubdomainStatus('taken');
        } else {
          setSubdomainStatus('available');
        }
      } catch (err) {
        setSubdomainStatus('available');
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [newSubdomain, step]);

  const handleLookup = async (sub: string, isAutoDetected = false) => {
    setError('');
    const formatted = sub.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!formatted) {
      if (!isAutoDetected) {
        setError(lang === 'id' ? 'Masukkan kode perusahaan yang valid!' : 'Please enter a valid company code!');
      }
      return;
    }

    // Intersepsi portal Master Admin / SaaS Owner
    if (formatted === 'admin' || formatted === 'system') {
      const adminTenant: TenantMetadata = {
        id: 0,
        companyName: 'SaaS Owner Administration',
        subdomain: formatted,
        status: 'ACTIVE'
      };
      setResolvedTenant(adminTenant);
      setEmail('admin@hrms.com');
      setStep('login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest<{ data: TenantMetadata }>(`/tenants/lookup?subdomain=${formatted}`);
      if (response && response.data) {
        setResolvedTenant(response.data);
        setEmail(response.data.id === 1 ? 'admin@tenant1.com' : 'budi.santoso@tenant2.com');
        setStep('login');
      }
    } catch (err: any) {
      if (!isAutoDetected) {
        setError(lang === 'id' ? 'Kode perusahaan tidak ditemukan!' : 'Company code not found!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedTenant) return;

    if (!email.trim() || !email.includes('@')) {
      setError(t.loginError);
      return;
    }
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // Store active tenant and email in LocalStorage
      localStorage.setItem('hrms_tenant_id', resolvedTenant.id.toString());
      localStorage.setItem('hrms_actor_email', email);
      setIsLoading(false);
      onLoginSuccess(resolvedTenant.id.toString(), email);
    }, 450);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!companyName.trim()) {
      setError(lang === 'id' ? 'Nama perusahaan wajib diisi!' : 'Company legal name is required!');
      return;
    }
    if (!newSubdomain.trim()) {
      setError(lang === 'id' ? 'Kode perusahaan wajib diisi!' : 'Company code is required!');
      return;
    }
    if (!ownerName.trim()) {
      setError(lang === 'id' ? 'Nama administrator wajib diisi!' : 'Administrator name is required!');
      return;
    }
    if (!ownerEmail.trim()) {
      setError(lang === 'id' ? 'Email administrator wajib diisi!' : 'Administrator email is required!');
      return;
    }
    if (!ownerEmail.includes('@')) {
      setError(lang === 'id' ? 'Format email administrator tidak valid!' : 'Invalid administrator email format!');
      return;
    }

    if (subdomainStatus === 'taken') {
      setError(t.subdomainTaken);
      return;
    }

    setIsLoading(true);
    try {
      const formatted = newSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
      const payload = {
        companyName,
        subdomain: formatted,
        ownerName,
        ownerEmail,
        plan,
        hrName: hrName.trim() ? hrName : null,
        hrEmail: hrEmail.trim() ? hrEmail : null,
        financeName: financeName.trim() ? financeName : null,
        financeEmail: financeEmail.trim() ? financeEmail : null
      };

      await apiRequest('/tenants/register', {
        method: 'POST',
        body: payload
      });

      setSuccess(t.registerSuccess);
      
      // Reset form
      setCompanyName('');
      setNewSubdomain('');
      setOwnerName('');
      setOwnerEmail('');
      setPlan('TRIAL');
      setHrName('');
      setHrEmail('');
      setFinanceName('');
      setFinanceEmail('');
      
      setTimeout(() => {
        setStep('domain');
        setSuccess('');
      }, 2500);

    } catch (err: any) {
      setError(err.message || (lang === 'id' ? 'Pendaftaran gagal!' : 'Registration failed!'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Floating Language Switcher */}
      {/* Floating Language & Theme Controls */}
      <div className="login-top-controls">
        <div className="login-lang-switch">
          <button 
            type="button" 
            className={`lang-toggle-btn ${lang === 'id' ? 'active' : ''}`}
            onClick={() => changeLang('id')}
          >
            🇮🇩 ID
          </button>
          <button 
            type="button" 
            className={`lang-toggle-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => changeLang('en')}
          >
            🇬🇧 EN
          </button>
        </div>

        <button 
          type="button" 
          className="login-theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div className={`login-card glass-panel ${step === 'register' ? 'register-wide' : ''}`}>
        {onBackToLanding && (
          <button 
            type="button" 
            className="btn-back-to-landing" 
            onClick={() => {
              if (step === 'login') {
                setStep('domain');
                setResolvedTenant(null);
                setError('');
              } else {
                onBackToLanding();
              }
            }}
            title={lang === 'id' ? 'Kembali' : 'Back'}
          >
            <span className="back-arrow">←</span> {lang === 'id' ? 'Kembali' : 'Back'}
          </button>
        )}

        {isLoading && (
          <div className="card-loading-overlay">
            <div className="premium-spinner"></div>
            <p className="loading-text">
              {lang === 'id' ? 'Memproses permintaan...' : 'Processing request...'}
            </p>
          </div>
        )}
        
        {/* --- STEP 1: ENTER SUBDOMAIN --- */}
        {step === 'domain' && (
          <>
            <div className="login-header">
              <div className="logo-icon"><BuildingIcon /></div>
              <h2>HRMS Enterprise</h2>
              <p>{t.portalTitle}</p>
            </div>

            {error && <div className="login-error-msg">{error}</div>}

            <form onSubmit={(e) => { e.preventDefault(); handleLookup(inputSubdomain); }} className="login-form" noValidate>
              <div className="form-group">
                <label className="form-label">
                  {lang === 'id' ? 'Kode Perusahaan Anda' : 'Your Company Code'}
                </label>
                <div className="subdomain-input-wrapper">
                  <input 
                    type="text" 
                    className="custom-input subdomain-input"
                    value={inputSubdomain}
                    onChange={(e) => setInputSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder={lang === 'id' ? 'contoh: teknologi-nusantara' : 'example: teknologi-nusantara'}
                  />
                  <span className="subdomain-suffix">.hrms.com</span>
                </div>
              </div>

              <button type="submit" className="btn-primary btn-block">
                {lang === 'id' ? 'Lanjutkan ➔' : 'Continue ➔'}
              </button>

              <div className="register-toggle-link" onClick={() => { setStep('register'); setError(''); }}>
                {t.noAccountYet}
              </div>

              <div className="owner-portal-link" onClick={() => handleLookup('admin')}>
                🔑 {lang === 'id' ? 'Masuk sebagai SaaS Owner (Platform Admin)' : 'Login as SaaS Owner (Platform Admin)'}
              </div>
            </form>
          </>
        )}

        {/* --- STEP 2: EMAIL PASSWORD LOGIN (Resolved Company) --- */}
        {step === 'login' && resolvedTenant && (
          <>
            <div className="login-header">
              <div className="logo-icon"><BuildingIcon /></div>
              <h2>{resolvedTenant.companyName}</h2>
              <p>{resolvedTenant.subdomain}.hrms.com</p>
            </div>

            {error && <div className="login-error-msg">{error}</div>}

            <form onSubmit={handleLogin} className="login-form" noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="actor-email">{t.emailActor}</label>
                <input 
                  type="email" 
                  id="actor-email"
                  className="custom-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.enterEmail}
                />
              </div>

              <button type="submit" className="btn-primary btn-block">
                {t.enterDashboard}
              </button>

              <div className="register-toggle-link" onClick={() => { setStep('domain'); setResolvedTenant(null); setError(''); }}>
                {lang === 'id' ? '← Ganti Perusahaan' : '← Change Company'}
              </div>
            </form>
          </>
        )}

        {/* --- STEP 3: REGISTER NEW TENANT --- */}
        {step === 'register' && (
          <>
            <div className="login-header">
              <div className="logo-icon"><BuildingIcon /></div>
              <h2>HRMS Enterprise</h2>
              <p>{t.registerTenant}</p>
            </div>

            {error && <div className="login-error-msg">{error}</div>}
            {success && <div className="login-success-msg">{success}</div>}

            <form onSubmit={handleRegister} className="login-form" noValidate>
              <div className="form-group">
                <label className="form-label">{t.companyLegalName}</label>
                <input 
                  type="text" 
                  className="custom-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t.enterCompanyName}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.subdomainPrefix}</label>
                <div className="subdomain-input-wrapper">
                  <input 
                    type="text" 
                    className="custom-input subdomain-input"
                    value={newSubdomain}
                    onChange={(e) => setNewSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder={t.enterSubdomain}
                  />
                  <span className="subdomain-suffix">.hrms.com</span>
                </div>
                
                {newSubdomain.trim() && (
                  <div className={`subdomain-status-indicator ${subdomainStatus}`}>
                    {subdomainStatus === 'checking' && <span className="status-item"><SpinnerIcon /> {t.subdomainChecking}</span>}
                    {subdomainStatus === 'available' && <span className="status-item text-success"><CheckIcon /> {t.subdomainChecked}</span>}
                    {subdomainStatus === 'taken' && <span className="status-item text-danger"><CrossIcon /> {t.subdomainTaken}</span>}
                  </div>
                )}
              </div>

              <div className="form-group" ref={planDropdownRef} style={{ position: 'relative' }}>
                <label className="form-label">{lang === 'id' ? 'Pilih Paket Layanan' : 'Choose Service Plan'}</label>
                <div 
                  className={`custom-select-trigger ${isPlanDropdownOpen ? 'open' : ''}`}
                  onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
                >
                  <span>
                    {plan === 'TRIAL' && (lang === 'id' ? 'TRIAL (30 Hari, 50 User)' : 'TRIAL (30 Days, 50 Users)')}
                    {plan === 'PROFESSIONAL' && (lang === 'id' ? 'PROFESSIONAL (100 User)' : 'PROFESSIONAL (100 Users)')}
                    {plan === 'ENTERPRISE' && (lang === 'id' ? 'ENTERPRISE (200 User)' : 'ENTERPRISE (200 Users)')}
                  </span>
                  <svg className="custom-select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                
                {isPlanDropdownOpen && (
                  <div className="custom-select-dropdown">
                    <div 
                      className={`custom-select-option ${plan === 'TRIAL' ? 'selected' : ''}`}
                      onClick={() => {
                        setPlan('TRIAL');
                        setIsPlanDropdownOpen(false);
                      }}
                    >
                      {lang === 'id' ? 'TRIAL (30 Hari, 50 User)' : 'TRIAL (30 Days, 50 Users)'}
                    </div>
                    <div 
                      className={`custom-select-option ${plan === 'PROFESSIONAL' ? 'selected' : ''}`}
                      onClick={() => {
                        setPlan('PROFESSIONAL');
                        setIsPlanDropdownOpen(false);
                      }}
                    >
                      {lang === 'id' ? 'PROFESSIONAL (100 User)' : 'PROFESSIONAL (100 Users)'}
                    </div>
                    <div 
                      className={`custom-select-option ${plan === 'ENTERPRISE' ? 'selected' : ''}`}
                      onClick={() => {
                        setPlan('ENTERPRISE');
                        setIsPlanDropdownOpen(false);
                      }}
                    >
                      {lang === 'id' ? 'ENTERPRISE (200 User)' : 'ENTERPRISE (200 Users)'}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '8px' }}>
                <label className="form-label">{t.ownerFullName}</label>
                <input 
                  type="text" 
                  className="custom-input"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder={t.enterOwnerName}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.ownerWorkEmail}</label>
                <input 
                  type="email" 
                  className="custom-input"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder={t.enterOwnerEmail}
                />
              </div>

              {/* Toggle optional delegates */}
              <div className="delegate-toggle-wrapper">
                <label className="checkbox-toggle-label">
                  <input 
                    type="checkbox" 
                    checked={showDelegates} 
                    onChange={(e) => setShowDelegates(e.target.checked)} 
                  />
                  <span className="checkbox-toggle-text">
                    {lang === 'id' ? '👥 Daftarkan Utusan HR & Finance (Opsional)' : '👥 Add HR & Finance Delegates (Optional)'}
                  </span>
                </label>
              </div>

              {showDelegates && (
                <div className="delegate-collapsible-panel">
                  {/* HR Delegate */}
                  <div className="delegate-field-group">
                    <label className="form-label">{lang === 'id' ? 'Utusan HR Admin' : 'HR Admin Delegate'}</label>
                    <div className="dual-inputs">
                      <input 
                        type="text" 
                        className="custom-input" 
                        placeholder={lang === 'id' ? 'Nama Lengkap HR' : 'HR Full Name'} 
                        value={hrName} 
                        onChange={(e) => setHrName(e.target.value)} 
                      />
                      <input 
                        type="email" 
                        className="custom-input" 
                        placeholder={lang === 'id' ? 'Email Kerja HR' : 'HR Work Email'} 
                        value={hrEmail} 
                        onChange={(e) => setHrEmail(e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* Finance Delegate */}
                  <div className="delegate-field-group" style={{ marginTop: '14px' }}>
                    <label className="form-label">{lang === 'id' ? 'Utusan Finance Admin' : 'Finance Admin Delegate'}</label>
                    <div className="dual-inputs">
                      <input 
                        type="text" 
                        className="custom-input" 
                        placeholder={lang === 'id' ? 'Nama Lengkap Finance' : 'Finance Full Name'} 
                        value={financeName} 
                        onChange={(e) => setFinanceName(e.target.value)} 
                      />
                      <input 
                        type="email" 
                        className="custom-input" 
                        placeholder={lang === 'id' ? 'Email Kerja Finance' : 'Finance Work Email'} 
                        value={financeEmail} 
                        onChange={(e) => setFinanceEmail(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pricing-notice-box-simple">
                <span className="info-icon">💡</span>
                <span className="info-text">
                  {lang === 'id' 
                    ? 'Tarif Lisensi Bulanan: Admin ($30), Finance ($25), HR ($15), Staff ($2)' 
                    : 'Monthly License Pricing: Admin ($30), Finance ($25), HR ($15), Staff ($2)'}
                </span>
              </div>

              <div className="register-actions-simple">
                <button type="submit" className="btn-primary btn-block">
                  {lang === 'id' ? 'Daftarkan Perusahaan ➔' : 'Register Company ➔'}
                </button>

                <div className="register-toggle-link" style={{ marginTop: '12px' }} onClick={() => { setStep('domain'); setError(''); }}>
                  {t.alreadyHaveAccount}
                </div>
              </div>
            </form>
          </>
        )}

        <div className="login-footer">
          <p>{t.dbSecurity}</p>
        </div>
      </div>
    </div>
  );
};
