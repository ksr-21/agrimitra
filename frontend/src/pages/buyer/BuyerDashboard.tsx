import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

export default function BuyerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['buyerDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/buyer/dashboard');
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

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="agri-card" style={{ background: 'var(--color-primary)', color: 'white' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Looking for fresh produce?</h2>
          <p style={{ opacity: 0.9, marginBottom: '16px' }}>Browse the market to find directly sourced produce from verified farmers.</p>
          <button className="agri-btn agri-btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/buyer/market')}>
            🛒 Browse Market
          </button>
        </div>
        <div className="agri-card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
          <p>No bids placed yet. Browse the market to get started!</p>
        </div>
      </div>
    );
  }

  const { stats, profile, recentBids } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '24px' }}>
      
      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          width: '64px', height: '64px', 
          borderRadius: '32px', 
          background: 'var(--color-secondary-light)', 
          color: 'var(--color-primary-dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: 700 
        }}>
          {profile.businessName.charAt(0)}
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--color-primary-dark)' }}>
            {profile.businessName}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ 
              fontSize: '12px', padding: '2px 8px', borderRadius: '12px', fontWeight: 600,
              backgroundColor: profile.kycStatus === 'APPROVED' ? '#D1FAE5' : '#FEF3C7',
              color: profile.kycStatus === 'APPROVED' ? '#065F46' : '#92400E'
            }}>
              {profile.kycStatus === 'APPROVED' ? t('buyer.kycApproved') : t('buyer.kycPending')}
            </span>
          </div>
        </div>
      </div>

      {/* KYC Warning (if not approved) */}
      {profile.kycStatus !== 'APPROVED' && (
        <div style={{ padding: '16px', backgroundColor: '#FEF3C7', borderRadius: '8px', color: '#92400E', border: '1px solid #FDE68A' }}>
          <strong>Action Required:</strong> Please complete your KYC verification to start placing bids on produce.
          <br/>
          <button className="agri-btn agri-btn-secondary" style={{ marginTop: '12px', padding: '8px 16px', minHeight: 'auto' }}>
            Complete KYC
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
        <div className="agri-card" style={{ flex: '1 0 140px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary)' }}>{stats.activeBids}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Active Bids</div>
        </div>
        <div className="agri-card" style={{ flex: '1 0 140px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-accent)' }}>{stats.pendingOrders}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Pending Orders</div>
        </div>
      </div>

      {/* Action Area */}
      <div className="agri-card" style={{ background: 'var(--color-primary)', color: 'white' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Looking for fresh produce?</h2>
        <p style={{ opacity: 0.9, marginBottom: '16px' }}>Browse the market to find directly sourced produce from verified farmers.</p>
        <button 
          className="agri-btn agri-btn-secondary" 
          style={{ width: '100%' }}
          onClick={() => navigate('/buyer/market')}
        >
          🛒 Browse Market
        </button>
      </div>

      {/* Recent Bids */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Recent Bids</h2>
          <Link to="/buyer/bids" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            {t('common.viewAll')}
          </Link>
        </div>

        {recentBids.length === 0 ? (
          <div className="agri-card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No bids placed yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentBids.map((bid: any) => (
              <div key={bid.id} className="agri-card" style={{ display: 'flex', gap: '16px', padding: '12px' }}>
                <div style={{ 
                  width: '80px', height: '80px', 
                  borderRadius: '8px', 
                  backgroundColor: '#E5E7EB',
                  backgroundImage: `url(${bid.listing.images[0]?.imageUrl || ''})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, textTransform: 'capitalize', margin: 0 }}>
                    {bid.listing.cropType} {bid.listing.variety ? `(${bid.listing.variety})` : ''}
                  </h3>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
                    Bid: {bid.quantity} kg @ ₹{bid.bidPrice}/kg
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      Total: ₹{bid.bidPrice * bid.quantity}
                    </span>
                    <span style={{ 
                      fontSize: '12px', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      backgroundColor: bid.status === 'PENDING' ? '#FEF3C7' : (bid.status === 'ACCEPTED' ? '#D1FAE5' : '#FEE2E2'),
                      color: bid.status === 'PENDING' ? '#92400E' : (bid.status === 'ACCEPTED' ? '#065F46' : '#991B1B')
                    }}>
                      {bid.status}
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
