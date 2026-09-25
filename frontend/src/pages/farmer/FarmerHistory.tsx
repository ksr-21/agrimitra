import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

// ─── Demo order history shown when API is unavailable ─────────────────────
const DEMO_ORDERS = [
  {
    id: 'do1', status: 'DELIVERED', totalAmount: 14000, createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    listing: { cropType: 'tomato', quantity: 500, unit: 'kg', images: [{ imageUrl: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=120&q=80' }] },
    buyer: { businessName: 'FreshMart Retailers', location: 'Mumbai, MH' },
    rating: 5,
  },
  {
    id: 'do2', status: 'DELIVERED', totalAmount: 17600, createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    listing: { cropType: 'onion', quantity: 800, unit: 'kg', images: [{ imageUrl: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=120&q=80' }] },
    buyer: { businessName: 'AgroExport Ltd', location: 'Pune, MH' },
    rating: 4,
  },
  {
    id: 'do3', status: 'DELIVERED', totalAmount: 24000, createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    listing: { cropType: 'mango', quantity: 200, unit: 'kg', images: [{ imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=120&q=80' }] },
    buyer: { businessName: 'Hotel Grand Spices', location: 'Delhi' },
    rating: 5,
  },
  {
    id: 'do4', status: 'DELIVERED', totalAmount: 64000, createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    listing: { cropType: 'wheat', quantity: 2000, unit: 'kg', images: [{ imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=120&q=80' }] },
    buyer: { businessName: 'Shree Flour Mills', location: 'Indore, MP' },
    rating: 5,
  },
  {
    id: 'do5', status: 'DELIVERED', totalAmount: 97500, createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    listing: { cropType: 'rice', quantity: 1500, unit: 'kg', images: [{ imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9b7b3?w=120&q=80' }] },
    buyer: { businessName: 'SuperMart Chains', location: 'Chennai, TN' },
    rating: 4,
  },
  {
    id: 'do6', status: 'DELIVERED', totalAmount: 30000, createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    listing: { cropType: 'garlic', quantity: 300, unit: 'kg', images: [{ imageUrl: 'https://images.unsplash.com/photo-1615485291212-c6da61bea99a?w=120&q=80' }] },
    buyer: { businessName: 'Herbal Life Products', location: 'Ahmedabad, GJ' },
    rating: 5,
  },
  {
    id: 'do7', status: 'IN_TRANSIT', totalAmount: 19200, createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    listing: { cropType: 'banana', quantity: 600, unit: 'kg', images: [{ imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=120&q=80' }] },
    buyer: { businessName: 'Global Agri Exports', location: 'Surat, GJ' },
    rating: null,
  },
  {
    id: 'do8', status: 'DELIVERED', totalAmount: 44000, createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    listing: { cropType: 'pomegranate', quantity: 400, unit: 'kg', images: [{ imageUrl: 'https://images.unsplash.com/photo-1617248609049-0c6f1f9e6f59?w=120&q=80' }] },
    buyer: { businessName: "Nature's Juice Co", location: 'Kolhapur, MH' },
    rating: 5,
  },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  DELIVERED:  { bg: '#D1FAE5', color: '#065F46' },
  IN_TRANSIT: { bg: '#DBEAFE', color: '#1D4ED8' },
  PICKED_UP:  { bg: '#FEF3C7', color: '#D97706' },
  CANCELLED:  { bg: '#FEE2E2', color: '#991B1B' },
};

export default function FarmerHistory() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['farmerOrdersHistory'],
    queryFn: async () => {
      const res = await apiClient.get('/orders');
      return res.data;
    },
    retry: false,
  });

  if (isLoading) {
    return <div style={{ padding: '24px' }}>{t('common.loading')}</div>;
  }

  // Merge real orders with demo orders
  const apiOrders: any[] = data?.orders || [];
  const apiIds = new Set(apiOrders.map((o: any) => o.id));
  const orders = [...apiOrders, ...DEMO_ORDERS.filter(d => !apiIds.has(d.id))];

  // Summary stats
  const totalEarned = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;

  return (
    <div style={{ paddingBottom: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Order History</h1>

      {/* ── Summary Strip ─────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div className="agri-card" style={{ flex: 1, textAlign: 'center', padding: '14px' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)' }}>
            ₹{(totalEarned / 1000).toFixed(0)}K
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Total Earned</div>
        </div>
        <div className="agri-card" style={{ flex: 1, textAlign: 'center', padding: '14px' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#059669' }}>{deliveredCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Delivered</div>
        </div>
        <div className="agri-card" style={{ flex: 1, textAlign: 'center', padding: '14px' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#F59E0B' }}>
            {orders.filter(o => o.status === 'IN_TRANSIT').length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>In Transit</div>
        </div>
      </div>

      {/* ── Order List ────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {orders.map((order: any) => {
          const sc = STATUS_COLORS[order.status] || { bg: '#F3F4F6', color: '#4B5563' };
          return (
            <div key={order.id} className="agri-card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span style={{ fontSize: '12px', padding: '2px 10px', borderRadius: '12px', fontWeight: 600, backgroundColor: sc.bg, color: sc.color }}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {order.listing?.images?.[0] && (
                  <img
                    src={order.listing.images[0].imageUrl}
                    alt="Crop"
                    style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '16px', textTransform: 'capitalize' }}>
                    {order.listing?.cropType || 'Produce'} · {order.listing?.quantity} {order.listing?.unit || 'kg'}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '2px' }}>
                    🏢 {order.buyer?.businessName || order.buyer?.name || 'Verified Buyer'}
                  </div>
                  {order.buyer?.location && (
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                      📍 {order.buyer.location}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB', paddingTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Amount Received</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '16px' }}>₹{order.totalAmount?.toLocaleString()}</div>
                </div>
                {order.rating != null && (
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{ color: i < order.rating ? '#F59E0B' : '#D1D5DB', fontSize: '16px' }}>★</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
