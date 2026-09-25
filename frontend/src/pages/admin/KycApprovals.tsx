import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

export default function KycApprovals() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminKyc'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/kyc');
      return res.data.profiles;
    },
  });

  const resolveKyc = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await apiClient.post(`/admin/kyc/${id}/resolve`, { status, notes: `Resolved by admin` });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminKyc'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error loading KYC profiles</div>;

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: '#1E293B' }}>KYC Approvals</h1>
      
      {data.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', color: '#64748B' }}>
          No pending KYC requests.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.map((profile: any) => (
            <div key={profile.id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>{profile.businessName}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '14px', color: '#475569' }}>
                  <strong>Contact Person:</strong> <span>{profile.contactPerson}</span>
                  <strong>Phone:</strong> <span>{profile.user.phone}</span>
                  <strong>GST Number:</strong> <span>{profile.gstNumber || 'N/A'}</span>
                  <strong>Location:</strong> <span>{profile.location || 'Unknown'}</span>
                </div>
                {profile.kycDocuments && profile.kycDocuments !== '[]' && (
                  <div style={{ marginTop: '16px' }}>
                    <strong style={{ fontSize: '14px' }}>Documents:</strong>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {JSON.parse(profile.kycDocuments).map((doc: string, idx: number) => (
                        <a key={idx} href={doc} target="_blank" rel="noreferrer" style={{ padding: '4px 12px', backgroundColor: '#F1F5F9', borderRadius: '4px', textDecoration: 'none', color: '#0F172A', fontSize: '14px' }}>
                          View Document {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => resolveKyc.mutate({ id: profile.id, status: 'APPROVED' })}
                  style={{ padding: '8px 16px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Approve
                </button>
                <button 
                  onClick={() => resolveKyc.mutate({ id: profile.id, status: 'REJECTED' })}
                  style={{ padding: '8px 16px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
