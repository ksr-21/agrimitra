import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/buyers', label: 'Buyers' },
    { path: '/admin/kyc', label: 'KYC Approvals' },
    { path: '/admin/disputes', label: 'Disputes' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: '#1E293B',
        color: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '24px', fontSize: '20px', fontWeight: 700, borderBottom: '1px solid #334155' }}>
          🛡️ Agrimitra Admin
        </div>
        
        <nav style={{ flex: 1, padding: '24px 0' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'block',
                  padding: '12px 24px',
                  color: isActive ? 'white' : '#94A3B8',
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#334155' : 'transparent',
                  fontWeight: isActive ? 600 : 400
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid #334155' }}>
          <div style={{ fontSize: '14px', marginBottom: '12px', opacity: 0.8 }}>{user?.email || user?.phone}</div>
          <button 
            onClick={logout}
            style={{ 
              width: '100%',
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              color: 'white', 
              padding: '8px', 
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
