import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

export default function AvailableJobs() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['deliveryDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/delivery/dashboard');
      return res.data;
    },
  });

  const acceptJobMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await apiClient.post(`/delivery/orders/${orderId}/accept`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryDashboard'] });
      alert('Job accepted!');
      navigate('/delivery');
    }
  });

  if (isLoading) return <div style={{ padding: '24px' }}>Loading available jobs...</div>;
  if (error) return <div style={{ color: 'red', padding: '16px' }}>Error loading jobs</div>;

  const { availableOrders } = data;

  return (
    <div style={{ paddingBottom: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Available Jobs</h1>
      
      {availableOrders.length === 0 ? (
        <div className="agri-card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No jobs available in your area right now.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {availableOrders.map((order: any) => (
            <div key={order.id} className="agri-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>
                  ₹{(order.totalAmount * 0.1).toFixed(0)} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)' }}>Estimated Earnings</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#D97706' }}>
                  {order.listing.quantity} {order.listing.unit}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span>🟢</span>
                  <span><strong>Pickup:</strong> {order.farmer.location}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span>🔴</span>
                  <span><strong>Dropoff:</strong> {order.buyer.location}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span>📦</span>
                  <span><strong>Crop:</strong> {order.listing.cropType}</span>
                </div>
              </div>

              <button 
                className="agri-btn agri-btn-primary" 
                style={{ width: '100%', backgroundColor: '#D97706' }}
                onClick={() => acceptJobMutation.mutate(order.id)}
                disabled={acceptJobMutation.isPending}
              >
                Accept Job
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
