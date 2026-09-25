import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/dashboard');
      return res.data.stats;
    },
  });

  if (isLoading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'red' }}>Error loading dashboard</div>;

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: '#1E293B' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#64748B', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Total Farmers</div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#10B981', marginTop: '8px' }}>{data.totalFarmers}</div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#64748B', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Total Buyers</div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#3B82F6', marginTop: '8px' }}>{data.totalBuyers}</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#64748B', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Pending KYC</div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#F59E0B', marginTop: '8px' }}>{data.pendingKYC}</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#64748B', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Open Disputes</div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#EF4444', marginTop: '8px' }}>{data.openDisputes}</div>
        </div>
      </div>
    </div>
  );
}
