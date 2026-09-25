import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useState } from 'react';

// ─── Demo listings shown when API is unavailable ──────────────────────────
const DEMO_LISTINGS = [
  { id: 'dl1',  cropType: 'tomato',     variety: 'Hybrid',    quantity: 500,  unit: 'kg', finalPrice: 28,  status: 'ACTIVE',   location: 'Nashik, MH',    createdAt: new Date(Date.now() - 1*86400000).toISOString(), deliveryAvailable: true,  description: 'Fresh hybrid tomatoes. Well irrigated, premium quality.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=200&q=80' }], analysis: { grade: 'A', qualityScore: 4.5, sellOrWait: 'sell', notes: 'Premium quality, deep red colour.', sellOrWaitReason: 'High market demand right now.', netProfit: 12400 } },
  { id: 'dl2',  cropType: 'onion',      variety: 'Red',       quantity: 800,  unit: 'kg', finalPrice: 22,  status: 'ACTIVE',   location: 'Lasalgaon, MH', createdAt: new Date(Date.now() - 2*86400000).toISOString(), deliveryAvailable: true,  description: 'Famous Lasalgaon red onions. Low moisture, long shelf life.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=200&q=80' }], analysis: { grade: 'A', qualityScore: 4.7, sellOrWait: 'sell', notes: 'Large bulbs, excellent dry outer skin.', sellOrWaitReason: 'Prices stable, good demand.', netProfit: 15600 } },
  { id: 'dl3',  cropType: 'potato',     variety: 'Jyoti',     quantity: 1200, unit: 'kg', finalPrice: 18,  status: 'ACTIVE',   location: 'Agra, UP',     createdAt: new Date(Date.now() - 3*86400000).toISOString(), deliveryAvailable: false, description: 'Jyoti variety potatoes. Bulk quantity available immediately.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&q=80' }], analysis: { grade: 'B', qualityScore: 3.8, sellOrWait: 'wait', notes: 'Uniform sizing, slight greening on some.', sellOrWaitReason: 'Prices may improve next week.', netProfit: 18900 } },
  { id: 'dl4',  cropType: 'wheat',      variety: 'Sharbati',  quantity: 2000, unit: 'kg', finalPrice: 32,  status: 'ACTIVE',   location: 'Bhopal, MP',   createdAt: new Date(Date.now() - 4*86400000).toISOString(), deliveryAvailable: true,  description: 'Premium Sharbati wheat. High protein, clean sorted lot.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&q=80' }], analysis: { grade: 'A', qualityScore: 4.9, sellOrWait: 'sell', notes: 'Best Sharbati variety, premium milling wheat.', sellOrWaitReason: 'Festival season demand is high.', netProfit: 56000 } },
  { id: 'dl5',  cropType: 'mango',      variety: 'Alphonso',  quantity: 300,  unit: 'kg', finalPrice: 120, status: 'ACTIVE',   location: 'Ratnagiri, MH', createdAt: new Date(Date.now() - 5*86400000).toISOString(), deliveryAvailable: true,  description: 'GI-tagged Alphonso mangoes. Export quality, intense aroma.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&q=80' }], analysis: { grade: 'A', qualityScore: 5.0, sellOrWait: 'sell', notes: 'Perfect ripeness, golden yellow skin.', sellOrWaitReason: 'Peak season - sell immediately.', netProfit: 32400 } },
  { id: 'dl6',  cropType: 'rice',       variety: 'Basmati',   quantity: 1500, unit: 'kg', finalPrice: 65,  status: 'ACTIVE',   location: 'Dehradun, UK',  createdAt: new Date(Date.now() - 6*86400000).toISOString(), deliveryAvailable: true,  description: '1-year aged Dehradun Basmati. Aromatic and fluffy.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9b7b3?w=200&q=80' }], analysis: { grade: 'A', qualityScore: 4.8, sellOrWait: 'sell', notes: 'Long grain, aged, fragrant.', sellOrWaitReason: 'Year-round premium demand.', netProfit: 87000 } },
  { id: 'dl7',  cropType: 'capsicum',   variety: 'Green',     quantity: 150,  unit: 'kg', finalPrice: 55,  status: 'ACTIVE',   location: 'Shimla, HP',    createdAt: new Date(Date.now() - 7*86400000).toISOString(), deliveryAvailable: false, description: 'Thick-walled green capsicum from high altitude farms.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&q=80' }], analysis: { grade: 'A', qualityScore: 4.6, sellOrWait: 'sell', notes: 'Crisp, fresh, naturally sweet.', sellOrWaitReason: 'Strong urban market demand.', netProfit: 7200 } },
  { id: 'dl8',  cropType: 'banana',     variety: 'Grand Nain', quantity: 600, unit: 'kg', finalPrice: 30,  status: 'ACTIVE',   location: 'Jalgaon, MH',   createdAt: new Date(Date.now() - 8*86400000).toISOString(), deliveryAvailable: true,  description: 'Grand Nain bananas. Best bunch weight, export quality.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=200&q=80' }], analysis: { grade: 'A', qualityScore: 4.4, sellOrWait: 'sell', notes: 'Yellow-green, ideal transit stage.', sellOrWaitReason: 'Export market conditions are good.', netProfit: 15600 } },
  { id: 'dl9',  cropType: 'garlic',     variety: 'Desi',      quantity: 700,  unit: 'kg', finalPrice: 95,  status: 'PENDING',  location: 'Mandsaur, MP',  createdAt: new Date(Date.now() - 9*86400000).toISOString(), deliveryAvailable: true,  description: 'Famous Mandsaur garlic. Strong aroma, good shelf life.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1615485291212-c6da61bea99a?w=200&q=80' }], analysis: { grade: 'A', qualityScore: 4.8, sellOrWait: 'sell', notes: 'Large bulbs, pungent, dry outer skin.', sellOrWaitReason: 'Prices peaking — ideal time to sell.', netProfit: 60200 } },
  { id: 'dl10', cropType: 'soybean',    variety: 'JS-335',    quantity: 1500, unit: 'kg', finalPrice: 55,  status: 'ACTIVE',   location: 'Indore, MP',    createdAt: new Date(Date.now() - 10*86400000).toISOString(), deliveryAvailable: false, description: 'JS-335 soybean. Large lot available for oil mills.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1635348729200-bd85af9b2ee1?w=200&q=80' }], analysis: { grade: 'B', qualityScore: 3.9, sellOrWait: 'wait', notes: 'Moisture slightly high, needs drying.', sellOrWaitReason: 'Prices may improve after drying.', netProfit: 73500 } },
  { id: 'dl11', cropType: 'pomegranate', variety: 'Bhagwa',   quantity: 400,  unit: 'kg', finalPrice: 110, status: 'ACTIVE',   location: 'Solapur, MH',   createdAt: new Date(Date.now() - 11*86400000).toISOString(), deliveryAvailable: true,  description: 'Bhagwa pomegranate. Export graded, zero rejects.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1617248609049-0c6f1f9e6f59?w=200&q=80' }], analysis: { grade: 'A', qualityScore: 4.9, sellOrWait: 'sell', notes: 'Deep red arils, 80% juice content.', sellOrWaitReason: 'Export season — premium prices.', netProfit: 39600 } },
  { id: 'dl12', cropType: 'maize',      variety: 'Yellow',    quantity: 2500, unit: 'kg', finalPrice: 22,  status: 'SOLD',     location: 'Karnataka',     createdAt: new Date(Date.now() - 15*86400000).toISOString(), deliveryAvailable: true,  description: 'Yellow maize. Ideal for poultry and starch industry.', images: [{ imageUrl: 'https://images.unsplash.com/photo-1504194104404-433180773017?w=200&q=80' }], analysis: { grade: 'A', qualityScore: 4.1, sellOrWait: 'sell', notes: 'Bold grain, low aflatoxin, good test weight.', sellOrWaitReason: 'Poultry feed demand is strong.', netProfit: 48500 } },
];

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

  // Merge real listings with demo data (real API data takes priority)
  const apiListings: any[] = data?.listings || [];
  const apiIds = new Set(apiListings.map((l: any) => l.id));
  const listings = [
    ...apiListings,
    ...DEMO_LISTINGS.filter(d => !apiIds.has(d.id)),
  ];

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
