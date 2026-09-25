import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

export default function AdminBuyersList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminBuyers'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/buyers');
      return res.data.buyers;
    },
  });

  if (isLoading) return <div style={{ padding: '24px' }}>Loading buyers...</div>;
  if (error) return <div style={{ color: 'red', padding: '16px' }}>Error loading buyers</div>;

  const buyers = data || [];

  return (
    <div style={{ paddingBottom: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Buyers List</h1>

      {buyers.length === 0 ? (
        <div className="agri-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No buyers found</h2>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {buyers.map((buyer: any) => (
            <div key={buyer.id} className="agri-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>
                    {buyer.buyerProfile?.name || 'Unnamed Buyer'}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                    Phone: {buyer.phone}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                    Email: {buyer.email || 'N/A'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>KYC Status</div>
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    backgroundColor: buyer.buyerProfile?.kycStatus === 'APPROVED' ? '#D1FAE5' : (buyer.buyerProfile?.kycStatus === 'REJECTED' ? '#FEE2E2' : '#FEF3C7'),
                    color: buyer.buyerProfile?.kycStatus === 'APPROVED' ? '#065F46' : (buyer.buyerProfile?.kycStatus === 'REJECTED' ? '#991B1B' : '#92400E'),
                    fontWeight: 600
                  }}>
                    {buyer.buyerProfile?.kycStatus || 'UNKNOWN'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
