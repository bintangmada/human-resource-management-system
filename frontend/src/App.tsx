import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

function App() {
  const [session, setSession] = useState<{ tenantId: string; actorEmail: string } | null>(null);

  // Check if session already exists on load
  useEffect(() => {
    const savedTenant = localStorage.getItem('hrms_tenant_id');
    const savedEmail = localStorage.getItem('hrms_actor_email');
    if (savedTenant && savedEmail) {
      setSession({ tenantId: savedTenant, actorEmail: savedEmail });
    }
  }, []);

  const handleLoginSuccess = (tenantId: string, actorEmail: string) => {
    setSession({ tenantId, actorEmail });
  };

  const handleLogout = () => {
    localStorage.removeItem('hrms_tenant_id');
    localStorage.removeItem('hrms_actor_email');
    setSession(null);
  };

  return (
    <div className="app-root">
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
