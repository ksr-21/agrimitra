import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { Link } from 'react-router-dom';

export default function FarmerHistory() {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['farmerOrdersHistory'],
    queryFn: async () => {
      const res = await apiClient.get('/orders');
      return res.data;
    },
  });

  if (isLoading) {
    return <div style={{ padding: '24px' }}>{t('common.loading')}</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '16px' }}>{t('common.error')}</div>;
  }

  const orders = data?.orders || [];

  return (
    <div style={{ paddingBottom: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Order History</h1>

      {orders.length === 0 ? (
        <div className="agri-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No history yet</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>You haven't completed any orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order: any) => (
            <Link to={`/orders/${order.id}`} key={order.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="agri-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    backgroundColor: '#F3F4F6',
                    color: '#4B5563',
                    fontWeight: 600
                  }}>
                    {order.status}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {order.listing?.images?.[0] && (
                    <img 
                      src={order.listing.images[0].imageUrl} 
                      alt="Crop" 
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} 
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px', textTransform: 'capitalize' }}>
                      {order.listing?.cropType || 'Unknown crop'}
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                      Buyer: {order.buyer?.name || 'Unknown Buyer'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Total Amount</div>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{order.totalAmount}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
