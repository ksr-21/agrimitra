import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

export default function FarmerBids() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['farmerBids'],
    queryFn: async () => {
      const res = await apiClient.get('/farmer/bids');
      return res.data.bids;
    },
  });

  const acceptBidMutation = useMutation({
    mutationFn: async (bidId: string) => {
      const res = await apiClient.post(`/farmer/bids/${bidId}/accept`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerBids'] });
      alert('Bid accepted! Order created.');
    }
  });

  const rejectBidMutation = useMutation({
    mutationFn: async (bidId: string) => {
      const res = await apiClient.post(`/farmer/bids/${bidId}/reject`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerBids'] });
    }
  });

  if (isLoading) return <div style={{ padding: '24px' }}>Loading bids...</div>;

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="agri-card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <p>No bids to review right now.</p>
        </div>
      </div>
    );
  }

  const pendingBids = data?.filter((b: any) => b.status === 'PENDING') || [];
  const otherBids = data?.filter((b: any) => b.status !== 'PENDING') || [];

  return (
    <div style={{ paddingBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <Link to="/farmer" style={{ textDecoration: 'none', fontSize: '24px' }}>&larr;</Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Review Bids</h1>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Action Required ({pendingBids.length})</h2>
      {pendingBids.length === 0 ? (
        <div className="agri-card" style={{ color: 'var(--color-text-muted)' }}>No new bids to review.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {pendingBids.map((bid: any) => (
            <div key={bid.id} className="agri-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{bid.buyer?.businessName || bid.buyer?.fullName || 'Unknown Buyer'}</h3>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Location: {bid.buyer?.location || 'Unknown'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)' }}>₹{bid.bidPrice}/kg</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{bid.quantity} kg</div>
                  {bid.listing.analysis && (
                    <div style={{ 
                      display: 'inline-block',
                      marginTop: '4px',
                      fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                      backgroundColor: bid.listing.analysis.sellOrWait === 'sell' ? '#ECFDF5' : '#FFFBEB',
                      color: bid.listing.analysis.sellOrWait === 'sell' ? '#065F46' : '#92400E',
                      border: `1px solid ${bid.listing.analysis.sellOrWait === 'sell' ? '#A7F3D0' : '#FDE68A'}`
                    }}>
                      {bid.listing.analysis.sellOrWait === 'sell' ? `📈 Sell Now` : `⏳ Wait`}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: '#F3F4F6', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                <strong>Produce:</strong> <span style={{ textTransform: 'capitalize' }}>{bid.listing.cropType} {bid.listing.variety ? `(${bid.listing.variety})` : ''}</span>
                <br/>
                <strong>Message:</strong> {bid.message || 'No message'}
              </div>

              {bid.listing.analysis && (
                <div className="agri-card" style={{ border: '2px solid var(--color-primary-light)', padding: '16px', marginBottom: '16px', boxShadow: 'none' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--color-primary)', margin: '0 0 12px 0' }}>AI Analysis for this Produce</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className={`grade-${bid.listing.analysis.grade.toLowerCase()}`} style={{ padding: '2px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '12px' }}>
                      Grade {bid.listing.analysis.grade}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Score: {bid.listing.analysis.qualityScore}/5
                    </span>
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', padding: '8px', borderRadius: '4px', fontSize: '12px', marginBottom: '12px' }}>
                    {bid.listing.analysis.notes}
                  </div>
                  <div style={{ 
                    padding: '12px', borderRadius: '8px',
                    backgroundColor: bid.listing.analysis.sellOrWait === 'sell' ? '#ECFDF5' : '#FFFBEB',
                    border: `1px solid ${bid.listing.analysis.sellOrWait === 'sell' ? '#A7F3D0' : '#FDE68A'}`
                  }}>
                    <div style={{ fontWeight: 700, color: bid.listing.analysis.sellOrWait === 'sell' ? '#065F46' : '#92400E', fontSize: '14px' }}>
                      {bid.listing.analysis.sellOrWait === 'sell' ? `📈 Sell Now` : `⏳ Wait to Sell`}
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', marginTop: '4px', color: '#4B5563' }}>
                      {bid.listing.analysis.sellOrWaitReason}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="agri-btn agri-btn-primary" 
                  style={{ flex: 1 }}
                  onClick={() => acceptBidMutation.mutate(bid.id)}
                  disabled={acceptBidMutation.isPending}
                >
                  Accept & Sell
                </button>
                <button 
                  className="agri-btn agri-btn-secondary" 
                  style={{ flex: 1, backgroundColor: '#FEE2E2', color: '#991B1B', border: 'none' }}
                  onClick={() => rejectBidMutation.mutate(bid.id)}
                  disabled={rejectBidMutation.isPending}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Past Bids</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {otherBids.map((bid: any) => (
          <div key={bid.id} className="agri-card" style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{bid.buyer?.businessName || bid.buyer?.fullName || 'Unknown Buyer'}</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{bid.listing.cropType} • {bid.quantity}kg @ ₹{bid.bidPrice}</div>
            </div>
            <div style={{ 
              fontWeight: 700, 
              color: bid.status === 'ACCEPTED' ? '#059669' : '#DC2626'
            }}>
              {bid.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
