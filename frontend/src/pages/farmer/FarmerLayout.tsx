import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

export default function FarmerLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/farmer', label: t('farmer.dashboard'), icon: '📊' },
    { path: '/farmer/listings', label: t('farmer.myListings'), icon: '🌾' },
    { path: '/farmer/history', label: 'History', icon: '📜' },
    { path: '/farmer/buyers', label: 'Buyers', icon: '🛒' },
  ];

  return (
    <div style={{ paddingBottom: '80px', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Top Bar */}
      <header style={{
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontWeight: 700, fontSize: '18px' }}>🌱 {t('common.appName')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', opacity: 0.9 }}>{user?.profile?.fullName || user?.phone}</span>
          <button 
            onClick={logout}
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              color: 'white', 
              padding: '6px 12px', 
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {t('auth.logout')}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="agri-container" style={{ paddingTop: '24px' }}>
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        zIndex: 50,
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                padding: '8px',
                flex: 1,
              }}
            >
              <span style={{ fontSize: '24px', marginBottom: '4px', opacity: isActive ? 1 : 0.6 }}>
                {item.icon}
              </span>
              <span style={{ fontSize: '12px', fontWeight: isActive ? 700 : 500 }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
