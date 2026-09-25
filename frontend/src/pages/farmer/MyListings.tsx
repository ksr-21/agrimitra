import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useState } from 'react';

export default function MyListings() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['farmerListings'],
    queryFn: async () => {
      const res = await apiClient.get('/farmer/listings');
      return res.data;
    },
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiClient.put(`/listings/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerListings'] });
      setEditingId(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to update listing');
    }
  });

  const handleEditClick = (listing: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(listing.id);
    setEditForm({
      cropType: listing.cropType,
      variety: listing.variety,
      quantity: listing.quantity,
      unit: listing.unit,
      description: listing.description || '',
      finalPrice: listing.finalPrice,
      location: listing.location || '',
      deliveryAvailable: listing.deliveryAvailable,
    });
    setExpandedId(listing.id); // Ensure details view is open
  };

  const handleSave = () => {
    if (!editingId) return;
    updateMutation.mutate({ id: editingId, data: editForm });
  };


  if (isLoading) {
    return <div style={{ padding: '24px' }}>{t('common.loading')}</div>;
  }

  if (error || !data) {
    return (
      <div style={{ paddingBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>{t('farmer.myListings')}</h1>
          <button
            onClick={() => navigate('/farmer/new')}
            style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '24px', width: '44px', height: '44px', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >+</button>
        </div>
        <div className="agri-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌾</div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No listings yet</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Start selling your produce to verified buyers.</p>
          <button onClick={() => navigate('/farmer/new')} className="agri-btn agri-btn-primary">
            {t('farmer.newListing')}
          </button>
        </div>
      </div>
    );
  }

  const listings = data?.listings || [];

  return (
    <div style={{ paddingBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>{t('farmer.myListings')}</h1>
        <button 
          onClick={() => navigate('/farmer/new')}
          style={{ 
            background: 'var(--color-primary)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '24px',
            width: '44px', height: '44px',
            fontSize: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          +
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="agri-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌾</div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No listings yet</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Start selling your produce to verified buyers.</p>
          <button onClick={() => navigate('/farmer/new')} className="agri-btn agri-btn-primary">
            {t('farmer.newListing')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {listings.map((listing: any) => (
            <div key={listing.id} className="agri-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', padding: '16px', gap: '16px' }}>
                <img 
                  src={listing.images[0]?.imageUrl} 
                  style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', backgroundColor: '#E5E7EB' }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>
                      {listing.cropType} {listing.variety ? `(${listing.variety})` : ''}
                    </h3>
                    <span style={{ 
                      fontSize: '12px', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      backgroundColor: listing.status === 'ACTIVE' ? '#D1FAE5' : '#F3F4F6',
                      color: listing.status === 'ACTIVE' ? '#065F46' : '#4B5563',
                      fontWeight: 600
                    }}>
                      {listing.status}
                    </span>
                  </div>
                  
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
                    {listing.quantity} {listing.unit}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Your Price</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>
                        ₹{listing.finalPrice}{t('common.perUnit')}
                      </div>
                    </div>
                    {listing.analysis && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div className={`grade-${listing.analysis.grade.toLowerCase()}`} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                          Grade {listing.analysis.grade}
                        </div>
                        <div style={{ 
                          fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                          backgroundColor: listing.analysis.sellOrWait === 'sell' ? '#ECFDF5' : '#FFFBEB',
                          color: listing.analysis.sellOrWait === 'sell' ? '#065F46' : '#92400E',
                          border: `1px solid ${listing.analysis.sellOrWait === 'sell' ? '#A7F3D0' : '#FDE68A'}`
                        }}>
                          {listing.analysis.sellOrWait === 'sell' ? `📈 Sell Now` : `⏳ Wait`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div 
                style={{ backgroundColor: '#F9FAFB', padding: '12px 16px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setExpandedId(expandedId === listing.id ? null : listing.id)}
              >
                <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
                <div>
                  <button 
                    onClick={(e) => handleEditClick(listing, e)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', marginRight: '16px' }}
                  >
                    Edit
                  </button>
                  <span style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: 600 }}>
                    {expandedId === listing.id ? 'Hide Details' : 'View Details \u2192'}
                  </span>
                </div>
              </div>
              {expandedId === listing.id && (
                <div style={{ padding: '16px', borderTop: '1px solid #E5E7EB', backgroundColor: 'white' }}>
                  {editingId === listing.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label className="agri-label">Quantity</label>
                          <input type="number" className="agri-input" value={editForm.quantity} onChange={e => setEditForm({...editForm, quantity: e.target.value})} />
                        </div>
                        <div style={{ width: '100px' }}>
                          <label className="agri-label">Unit</label>
                          <select className="agri-input" value={editForm.unit} onChange={e => setEditForm({...editForm, unit: e.target.value})}>
                            <option value="kg">kg</option>
                            <option value="ton">ton</option>
                            <option value="quintal">quintal</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="agri-label">Price per Unit (₹)</label>
                        <input type="number" className="agri-input" value={editForm.finalPrice} onChange={e => setEditForm({...editForm, finalPrice: e.target.value})} />
                      </div>
                      <div>
                        <label className="agri-label">Description</label>
                        <textarea className="agri-input" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                      </div>
                      <div>
                        <label className="agri-label">Location</label>
                        <input type="text" className="agri-input" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                        <button className="agri-btn agri-btn-outline" onClick={() => setEditingId(null)} disabled={updateMutation.isPending}>Cancel</button>
                        <button className="agri-btn agri-btn-primary" onClick={handleSave} disabled={updateMutation.isPending}>
                          {updateMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p><strong>Description:</strong> {listing.description || 'No description provided'}</p>
                      <p><strong>Location:</strong> {listing.location || 'Not specified'}</p>
                      <p><strong>Delivery Available:</strong> {listing.deliveryAvailable ? 'Yes' : 'No'}</p>
                      {listing.analysis && (
                        <div className="agri-card" style={{ border: '2px solid var(--color-primary-light)', padding: '16px', marginTop: '16px', boxShadow: 'none' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--color-primary)', margin: '0 0 12px 0' }}>AI Analysis for this Produce</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className={`grade-${listing.analysis.grade.toLowerCase()}`} style={{ padding: '2px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '12px' }}>
                              Grade {listing.analysis.grade}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                              Score: {listing.analysis.qualityScore}/5
                            </span>
                          </div>
                          <div style={{ backgroundColor: '#F9FAFB', padding: '8px', borderRadius: '4px', fontSize: '12px', marginBottom: '12px' }}>
                            {listing.analysis.notes}
                          </div>
                          <div style={{ 
                            padding: '12px', borderRadius: '8px',
                            backgroundColor: listing.analysis.sellOrWait === 'sell' ? '#ECFDF5' : '#FFFBEB',
                            border: `1px solid ${listing.analysis.sellOrWait === 'sell' ? '#A7F3D0' : '#FDE68A'}`
                          }}>
                            <div style={{ fontWeight: 700, color: listing.analysis.sellOrWait === 'sell' ? '#065F46' : '#92400E', fontSize: '14px' }}>
                              {listing.analysis.sellOrWait === 'sell' ? `📈 Sell Now` : `⏳ Wait to Sell`}
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', marginTop: '4px', color: '#4B5563' }}>
                              {listing.analysis.sellOrWaitReason}
                            </p>
                          </div>
                          
                          {/* Net Profit */}
                          {listing.analysis.netProfit != null && (
                            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', marginTop: '12px', border: '1px solid #E2E8F0' }}>
                               <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Estimated Net Profit</div>
                               <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>₹{listing.analysis.netProfit}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
