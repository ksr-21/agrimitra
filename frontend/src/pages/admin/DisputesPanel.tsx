import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

export default function DisputesPanel() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDisputes'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/disputes');
      return res.data.disputes;
    },
  });

  const resolveDispute = useMutation({
    mutationFn: async ({ id, resolution }: { id: string, resolution: string }) => {
      const res = await apiClient.post(`/admin/disputes/${id}/resolve`, { resolution, adminNotes: 'Resolved via dashboard' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDisputes'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error loading disputes</div>;

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: '#1E293B' }}>Dispute Resolution</h1>
      
      {data.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', color: '#64748B' }}>
          No open disputes! Everything is running smoothly.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.map((dispute: any) => (
            <div key={dispute.id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }}>
                      {dispute.reason.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '14px', color: '#64748B' }}>
                      Order #{dispute.order.id.slice(0,8)}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#1E293B' }}>{dispute.description}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Raised by:</div>
                  <div style={{ fontWeight: 600 }}>{dispute.raisedBy.phone} ({dispute.raisedBy.role})</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                    {new Date(dispute.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Order Context */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><strong>Farmer:</strong> {dispute.order.farmer.fullName}</div>
                  <div><strong>Buyer:</strong> {dispute.order.buyer.businessName}</div>
                  <div><strong>Amount:</strong> ₹{dispute.order.totalAmount}</div>
                  <div><strong>Order Status:</strong> {dispute.order.status}</div>
                </div>
              </div>

              {/* Resolution Actions */}
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                <button 
                  onClick={() => resolveDispute.mutate({ id: dispute.id, resolution: 'REFUND_APPROVED' })}
                  style={{ padding: '8px 16px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Issue Refund
                </button>
                <button 
                  onClick={() => resolveDispute.mutate({ id: dispute.id, resolution: 'FARMER_COMPENSATED' })}
                  style={{ padding: '8px 16px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Compensate Farmer
                </button>
                <button 
                  onClick={() => resolveDispute.mutate({ id: dispute.id, resolution: 'DISMISSED' })}
                  style={{ padding: '8px 16px', backgroundColor: '#64748B', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Dismiss Dispute
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
