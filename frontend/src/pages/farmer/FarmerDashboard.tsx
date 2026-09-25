import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['farmerDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/farmer/dashboard');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
        <div className="skeleton" style={{ height: '100px', borderRadius: '12px' }}></div>
        <div className="skeleton" style={{ height: '200px', borderRadius: '12px' }}></div>
      </div>
    );
  }

  if (error || !data || !data.profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="agri-card" style={{ background: 'var(--color-primary)', color: 'white' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Ready to sell?</h2>
          <p style={{ opacity: 0.9, marginBottom: '16px' }}>Upload a photo and let our AI analyze your crop for the best price.</p>
          <button className="agri-btn agri-btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/farmer/new')}>
            📸 {t('farmer.newListing')}
          </button>
        </div>
        <div className="agri-card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌾</div>
          <p>No listings yet. Tap above to get started!</p>
        </div>
      </div>
    );
  }

  const { stats, profile, recentListings } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Profile Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          width: '64px', height: '64px', 
          borderRadius: '32px', 
          background: 'var(--color-primary-light)', 
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: 700 
        }}>
          {(profile?.fullName || 'F').charAt(0)}
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--color-primary-dark)' }}>
            {profile?.fullName || 'Farmer'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            📍 {profile?.location || 'Your Farm'} • {profile?.landSize} {profile?.landSizeUnit}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <span>⭐ {profile?.avgRating?.toFixed(1) ?? '—'}</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
              ({profile?.totalTransactions ?? 0} {t('farmer.totalTransactions')})
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
        <div className="agri-card" style={{ flex: '1 0 140px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/farmer/listings')}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary)' }}>{stats.activeListings}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Active Listings</div>
        </div>
        <div className="agri-card" style={{ flex: '1 0 140px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/farmer/bids')}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-accent)' }}>{stats.pendingOrders}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Pending Orders/Bids</div>
        </div>
      </div>

      {/* Action Area */}
      <div className="agri-card" style={{ background: 'var(--color-primary)', color: 'white' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Ready to sell?</h2>
        <p style={{ opacity: 0.9, marginBottom: '16px' }}>Upload a photo and let our AI analyze your crop for the best price.</p>
        <button 
          className="agri-btn agri-btn-secondary" 
          style={{ width: '100%' }}
          onClick={() => navigate('/farmer/new')}
        >
          📸 {t('farmer.newListing')}
        </button>
      </div>

      {/* Recent Listings */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Recent Listings</h2>
          <Link to="/farmer/listings" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            {t('common.viewAll')}
          </Link>
        </div>

        {recentListings.length === 0 ? (
          <div className="agri-card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No listings yet. Tap 'Sell Produce' to get started!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentListings.map((listing: any) => (
              <div key={listing.id} className="agri-card" style={{ display: 'flex', gap: '16px', padding: '12px' }}>
                <div style={{ 
                  width: '80px', height: '80px', 
                  borderRadius: '8px', 
                  backgroundColor: '#E5E7EB',
                  backgroundImage: `url(${listing.images[0]?.imageUrl || ''})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, textTransform: 'capitalize', margin: 0 }}>
                    {listing.cropType} {listing.variety ? `(${listing.variety})` : ''}
                  </h3>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
                    {listing.quantity} {listing.unit}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      ₹{listing.finalPrice}{t('common.perUnit')}
                    </span>
                    <span style={{ 
                      fontSize: '12px', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      backgroundColor: listing.status === 'ACTIVE' ? '#D1FAE5' : '#FEF3C7',
                      color: listing.status === 'ACTIVE' ? '#065F46' : '#92400E'
                    }}>
                      {listing.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
