import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

export default function DeliveryDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['deliveryDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/delivery/dashboard');
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      // Simple status update for now (in real life, needs multipart form with photo)
      const res = await apiClient.post(`/delivery/orders/${orderId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryDashboard'] });
    }
  });

  if (isLoading) return <div style={{ padding: '24px' }}>Loading jobs...</div>;
  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="agri-card" style={{ background: '#D97706', color: 'white' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Find Available Jobs</h2>
          <p style={{ opacity: 0.9, marginBottom: '16px' }}>Browse available delivery jobs in your area and start earning.</p>
          <button className="agri-btn agri-btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/delivery/available')}>
            🚚 View Available Jobs
          </button>
        </div>
        <div className="agri-card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚚</div>
          <p>No active deliveries right now.</p>
        </div>
      </div>
    );
  }

  const { activeOrders, profile } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          width: '64px', height: '64px', 
          borderRadius: '32px', 
          background: '#FEF3C7', 
          color: '#D97706',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: 700 
        }}>
          {profile.fullName.charAt(0)}
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--color-primary-dark)' }}>
            {profile.fullName}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
              {profile.vehicleType.replace('_', ' ')} • {profile.vehicleNumber}
            </span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#D97706', marginTop: '4px' }}>
            ⭐ {profile.avgRating.toFixed(1)} ({profile.totalDeliveries} Deliveries)
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Active Jobs</h2>
        </div>

        {activeOrders.length === 0 ? (
          <div className="agri-card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p>You don't have any active deliveries right now.</p>
            <button className="agri-btn agri-btn-primary" style={{ backgroundColor: '#D97706' }} onClick={() => navigate('/delivery/available')}>
              Find Available Jobs
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeOrders.map((order: any) => (
              <div key={order.id} className="agri-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                    Order #{order.id.slice(0, 8)}
                  </h3>
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '4px 8px', 
                    borderRadius: '12px',
                    fontWeight: 700,
                    backgroundColor: order.status === 'IN_TRANSIT' ? '#DBEAFE' : '#FEF3C7',
                    color: order.status === 'IN_TRANSIT' ? '#1D4ED8' : '#D97706'
                  }}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ color: 'var(--color-text-muted)' }}>📦 Package:</div>
                    <div style={{ fontWeight: 600 }}>{order.listing.cropType} ({order.listing.quantity}{order.listing.unit})</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', borderLeft: '2px solid #E5E7EB', paddingLeft: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Pickup From:</span>
                      <strong style={{ fontSize: '16px' }}>{order.farmer.fullName}</strong>
                      <span>{order.farmer.location}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderLeft: '2px solid #D97706', paddingLeft: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Deliver To:</span>
                      <strong style={{ fontSize: '16px' }}>{order.buyer.businessName}</strong>
                      <span>{order.buyer.location}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {order.status === 'PICKUP_SCHEDULED' && (
                    <button 
                      className="agri-btn agri-btn-primary" 
                      style={{ flex: 1, backgroundColor: '#D97706' }}
                      onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'PICKED_UP' })}
                      disabled={updateStatusMutation.isPending}
                    >
                      Confirm Pickup
                    </button>
                  )}
                  {order.status === 'PICKED_UP' && (
                    <button 
                      className="agri-btn agri-btn-primary" 
                      style={{ flex: 1, backgroundColor: '#2563EB' }}
                      onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'IN_TRANSIT' })}
                      disabled={updateStatusMutation.isPending}
                    >
                      Start Transit
                    </button>
                  )}
                  {order.status === 'IN_TRANSIT' && (
                    <button 
                      className="agri-btn agri-btn-primary" 
                      style={{ flex: 1, backgroundColor: '#059669' }}
                      onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'DELIVERED' })}
                      disabled={updateStatusMutation.isPending}
                    >
                      Mark Delivered
                    </button>
                  )}
                  <button className="agri-btn agri-btn-secondary" style={{ flex: 1 }}>
                    View Map
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
