import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

// ─── Demo profile & listings shown when API is unavailable ────────────────
const DEMO_PROFILE = {
  fullName: 'Ramesh Patil',
  location: 'Nashik, Maharashtra',
  landSize: 12,
  landSizeUnit: 'acres',
  avgRating: 4.7,
  totalTransactions: 38,
};

const DEMO_STATS = { activeListings: 4, pendingOrders: 3 };

const DEMO_RECENT = [
  { id: 'dl1', cropType: 'tomato',     variety: 'Hybrid',   quantity: 500,  unit: 'kg', finalPrice: 28,  status: 'ACTIVE',   images: [{ imageUrl: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=200&q=80' }] },
  { id: 'dl2', cropType: 'onion',      variety: 'Red',      quantity: 800,  unit: 'kg', finalPrice: 22,  status: 'ACTIVE',   images: [{ imageUrl: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=200&q=80' }] },
  { id: 'dl5', cropType: 'mango',      variety: 'Alphonso', quantity: 300,  unit: 'kg', finalPrice: 120, status: 'ACTIVE',   images: [{ imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&q=80' }] },
  { id: 'dl4', cropType: 'wheat',      variety: 'Sharbati', quantity: 2000, unit: 'kg', finalPrice: 32,  status: 'PENDING',  images: [{ imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&q=80' }] },
];

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['farmerDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/farmer/dashboard');
      return res.data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
        <div className="skeleton" style={{ height: '100px', borderRadius: '12px' }}></div>
        <div className="skeleton" style={{ height: '200px', borderRadius: '12px' }}></div>
      </div>
    );
  }

  // Use real data if available, else fall back to demo
  const profile = data?.profile ?? { ...DEMO_PROFILE, fullName: user?.profile?.fullName || DEMO_PROFILE.fullName };
  const stats = data?.stats ?? DEMO_STATS;
  const recentListings: any[] = data?.recentListings?.length ? data.recentListings : DEMO_RECENT;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── My Farm Profile Card ─────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #1a4d35 100%)',
        borderRadius: '16px',
        padding: '20px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '64px', height: '64px',
          borderRadius: '32px',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontWeight: 700, flexShrink: 0,
        }}>
          {(profile?.fullName || 'F').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile?.fullName || 'My Farm'}
          </div>
          <div style={{ opacity: 0.85, fontSize: '13px', marginTop: '2px' }}>
            📍 {profile?.location || 'Your Farm'}
          </div>
          <div style={{ opacity: 0.85, fontSize: '13px' }}>
            🌾 {profile?.landSize} {profile?.landSizeUnit} &nbsp;•&nbsp; ⭐ {profile?.avgRating?.toFixed(1) ?? '4.5'}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '22px', fontWeight: 700 }}>{profile?.totalTransactions ?? 0}</div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>Orders Done</div>
        </div>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div
          className="agri-card"
          style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '16px' }}
          onClick={() => navigate('/farmer/listings')}
        >
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary)' }}>{stats.activeListings}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Active Listings</div>
        </div>
        <div
          className="agri-card"
          style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '16px' }}
          onClick={() => navigate('/farmer/bids')}
        >
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-accent)' }}>{stats.pendingOrders}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Pending Bids</div>
        </div>
        <div
          className="agri-card"
          style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '16px' }}
          onClick={() => navigate('/farmer/buyers')}
        >
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#F59E0B' }}>10</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Buyer Requests</div>
        </div>
      </div>

      {/* ── Sell CTA ─────────────────────────────────────────── */}
      <div className="agri-card" style={{ background: 'var(--color-primary)', color: 'white' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '6px' }}>Ready to sell?</h2>
        <p style={{ opacity: 0.9, marginBottom: '14px', fontSize: '14px' }}>
          Upload a photo and let our AI analyze your crop for the best price.
        </p>
        <button
          className="agri-btn agri-btn-secondary"
          style={{ width: '100%' }}
          onClick={() => navigate('/farmer/new')}
        >
          📸 {t('farmer.newListing')}
        </button>
      </div>

      {/* ── Recent Listings ──────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Recent Listings</h2>
          <Link to="/farmer/listings" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>
            {t('common.viewAll')}
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recentListings.slice(0, 4).map((listing: any) => (
            <div
              key={listing.id}
              className="agri-card"
              style={{ display: 'flex', gap: '12px', padding: '12px', cursor: 'pointer' }}
              onClick={() => navigate('/farmer/listings')}
            >
              <div style={{
                width: '72px', height: '72px', flexShrink: 0,
                borderRadius: '10px',
                backgroundColor: '#E5E7EB',
                backgroundImage: `url(${listing.images?.[0]?.imageUrl || ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, textTransform: 'capitalize', margin: 0 }}>
                    {listing.cropType} {listing.variety ? `(${listing.variety})` : ''}
                  </h3>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '12px', flexShrink: 0, marginLeft: '8px',
                    backgroundColor: listing.status === 'ACTIVE' ? '#D1FAE5' : '#FEF3C7',
                    color: listing.status === 'ACTIVE' ? '#065F46' : '#92400E',
                    fontWeight: 600,
                  }}>
                    {listing.status}
                  </span>
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '3px' }}>
                  {listing.quantity} {listing.unit}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '15px', marginTop: '4px' }}>
                  ₹{listing.finalPrice}{t('common.perUnit')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
