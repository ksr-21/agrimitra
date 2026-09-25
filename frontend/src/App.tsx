import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import FarmerLayout from './pages/farmer/FarmerLayout';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import MyListings from './pages/farmer/MyListings';
import NewListing from './pages/farmer/NewListing';
import FarmerBids from './pages/farmer/FarmerBids';
import FarmerHistory from './pages/farmer/FarmerHistory';
import FarmerBuyers from './pages/farmer/FarmerBuyers';
import BuyerLayout from './pages/buyer/BuyerLayout';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import Market from './pages/buyer/Market';
import MyBids from './pages/buyer/MyBids';
import DeliveryLayout from './pages/delivery/DeliveryLayout';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import AvailableJobs from './pages/delivery/AvailableJobs';
import OrderDetails from './pages/common/OrderDetails';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBuyersList from './pages/admin/AdminBuyersList';
import KycApprovals from './pages/admin/KycApprovals';
import DisputesPanel from './pages/admin/DisputesPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

// ─── Language Switcher ───────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिन्दी', short: 'हि' },
  { code: 'mr', label: 'मराठी', short: 'मर' },
  { code: 'kn', label: 'ಕನ್ನಡ', short: 'ಕ' },
  { code: 'ta', label: 'தமிழ்', short: 'த' },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div style={{
      position: 'fixed',
      top: '12px',
      right: '12px',
      zIndex: 1000,
      display: 'flex',
      gap: '4px',
      background: 'white',
      padding: '4px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    }}>
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => {
            i18n.changeLanguage(lang.code);
            localStorage.setItem('agrimitra-language', lang.code);
          }}
          title={lang.label}
          style={{
            minHeight: '36px',
            minWidth: '36px',
            padding: '4px 8px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: i18n.language === lang.code ? 700 : 400,
            background: i18n.language === lang.code ? '#2D6A4F' : 'transparent',
            color: i18n.language === lang.code ? 'white' : '#1B1B1B',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {lang.short}
        </button>
      ))}
    </div>
  );
}

// ─── Protected Route Wrapper ─────────────────────────────
function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Or a "Not Authorized" page
  }

  return children;
}

// ─── Landing Page ────────────────────────────────────────
function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2>Welcome back!</h2>
        <p>Logged in as {user.phone} ({user.role})</p>
        <button onClick={() => logout()} className="agri-btn agri-btn-outline" style={{ marginTop: '16px' }}>
          {t('auth.logout')}
        </button>
        <br />
        <br />
        <button 
          onClick={() => navigate(`/${user.role.toLowerCase()}`)} 
          className="agri-btn agri-btn-primary"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌾</div>
      <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#2D6A4F', marginBottom: '8px' }}>
        {t('common.appName')}
      </h1>
      <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '32px', maxWidth: '400px' }}>
        {t('common.tagline')}
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => navigate('/login')} className="agri-btn agri-btn-primary agri-btn-large">
          {t('auth.login')}
        </button>
        <button onClick={() => navigate('/signup')} className="agri-btn agri-btn-outline agri-btn-large">
          {t('auth.signup')}
        </button>
      </div>

      <div style={{ marginTop: '48px', display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { icon: '👨‍🌾', label: t('auth.farmer') },
          { icon: '🛒', label: t('auth.buyer') }
        ].map(role => (
          <div
            key={role.label}
            className="agri-card"
            style={{ width: '140px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => navigate('/signup')}
          >
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>{role.icon}</div>
            <div style={{ fontWeight: 600, color: '#2D6A4F' }}>{role.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Placeholder Dashboards ──────────────────────────────
function PlaceholderDashboard({ role }: { role: string }) {
  const { logout } = useAuth();
  return (
    <div style={{ padding: '24px' }}>
      <h1>{role} Dashboard</h1>
      <p>This is a placeholder for Phase 3+.</p>
      <button onClick={logout} className="agri-btn agri-btn-outline">Logout</button>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <LanguageSwitcher />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route path="/farmer" element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <FarmerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<FarmerDashboard />} />
              <Route path="listings" element={<MyListings />} />
              <Route path="new" element={<NewListing />} />
              <Route path="bids" element={<FarmerBids />} />
              <Route path="history" element={<FarmerHistory />} />
              <Route path="buyers" element={<FarmerBuyers />} />
            </Route>

            <Route path="/buyer" element={
              <ProtectedRoute allowedRoles={['BUYER']}>
                <BuyerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<BuyerDashboard />} />
              <Route path="market" element={<Market />} />
              <Route path="bids" element={<MyBids />} />
            </Route>
            <Route path="/delivery" element={
              <ProtectedRoute allowedRoles={['DELIVERY']}>
                <DeliveryLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DeliveryDashboard />} />
              <Route path="available" element={<AvailableJobs />} />
            </Route>
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="buyers" element={<AdminBuyersList />} />
              <Route path="kyc" element={<KycApprovals />} />
              <Route path="disputes" element={<DisputesPanel />} />
            </Route>

            <Route path="/orders/:id" element={
              <ProtectedRoute allowedRoles={['FARMER', 'BUYER', 'DELIVERY']}>
                <OrderDetails />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
