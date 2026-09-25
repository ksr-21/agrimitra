import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { useState } from 'react';

export default function FarmerBuyers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: requirementsData, isLoading: isReqsLoading, error: reqsError } = useQuery({
    queryKey: ['farmerBuyers'],
    queryFn: async () => {
      const res = await apiClient.get('/farmer/buyers');
      return res.data.buyers; // these are actually requirements
    },
  });

  const { data: bidsData, isLoading: isBidsLoading, error: bidsError } = useQuery({
    queryKey: ['farmerBids'],
    queryFn: async () => {
      const res = await apiClient.get('/farmer/bids');
      return res.data.bids;
    },
  });

  const [activeTab, setActiveTab] = useState<'bids' | 'requests'>('bids');
  const [quotingId, setQuotingId] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({ price: '', quantity: '', message: '' });

  const quoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiClient.post(`/farmer/requirements/${id}/bid`, {
        bidPrice: data.price,
        quantity: data.quantity,
        message: data.message
      });
      return res.data;
    },
    onSuccess: () => {
      alert('Quote sent successfully!');
      setQuotingId(null);
      setQuoteForm({ price: '', quantity: '', message: '' });
      // Optionally invalidate bids or requirements
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to send quote');
    }
  });

  if (isReqsLoading || isBidsLoading) return <div style={{ padding: '24px' }}>{t('common.loading')}</div>;

  const requirements = requirementsData || [];
  const bids = bidsData || [];

  return (
    <div style={{ paddingBottom: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Connect with Buyers</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('bids')}
          className={`agri-btn ${activeTab === 'bids' ? 'agri-btn-primary' : 'agri-btn-outline'}`}
          style={{ flex: 1 }}
        >
          Interested in my Produce
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`agri-btn ${activeTab === 'requests' ? 'agri-btn-primary' : 'agri-btn-outline'}`}
          style={{ flex: 1 }}
        >
          Market Requests
        </button>
      </div>

      {activeTab === 'bids' && (
        <>
          {bids.length === 0 ? (
            <div className="agri-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No bids yet</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>You haven't received any bids on your listings.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {bids.map((bid: any) => (
                <div key={bid.id} className="agri-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-primary)' }}>
                      ₹{bid.bidPrice} / {bid.listing?.unit || 'kg'}
                    </div>
                    <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', backgroundColor: '#F3F4F6', fontWeight: 600 }}>
                      {bid.status}
                    </span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 600, textTransform: 'capitalize' }}>{bid.listing?.cropType}</span>
                      {bid.listing?.analysis && (
                        <span style={{ 
                          fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                          backgroundColor: bid.listing.analysis.sellOrWait === 'sell' ? '#ECFDF5' : '#FFFBEB',
                          color: bid.listing.analysis.sellOrWait === 'sell' ? '#065F46' : '#92400E',
                          border: `1px solid ${bid.listing.analysis.sellOrWait === 'sell' ? '#A7F3D0' : '#FDE68A'}`
                        }}>
                          {bid.listing.analysis.sellOrWait === 'sell' ? `📈 Sell Now` : `⏳ Wait`}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Qty requested: {bid.quantity} {bid.listing?.unit || 'kg'}</div>
                  </div>
                  <div style={{ fontSize: '14px', backgroundColor: '#F9FAFB', padding: '8px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 600 }}>Buyer: {bid.buyer?.businessName || bid.buyer?.contactPerson || 'Unknown'}</div>
                  </div>
                  
                  {/* Mock Profit Estimator */}
                  <div style={{ padding: '12px', backgroundColor: '#ECFDF5', borderRadius: '8px', border: '1px solid #D1FAE5' }}>
                    <div style={{ fontSize: '12px', color: '#065F46', fontWeight: 600, marginBottom: '8px' }}>PROFIT ESTIMATOR (PROTOTYPE)</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#064E3B', marginBottom: '4px' }}>
                      <span>Gross Revenue:</span>
                      <span>₹{bid.bidPrice * bid.quantity}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#B91C1C', marginBottom: '4px' }}>
                      <span>Platform Fee (2%):</span>
                      <span>-₹{(bid.bidPrice * bid.quantity * 0.02).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#B91C1C', marginBottom: '8px' }}>
                      <span>Est. Transport:</span>
                      <span>-₹{(bid.quantity * 2.5).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#065F46', fontWeight: 700, borderTop: '1px solid #A7F3D0', paddingTop: '8px' }}>
                      <span>Net Profit:</span>
                      <span>₹{(bid.bidPrice * bid.quantity - (bid.bidPrice * bid.quantity * 0.02) - (bid.quantity * 2.5)).toFixed(2)}</span>
                    </div>
                  </div>

                  <button 
                    className="agri-btn agri-btn-outline" 
                    style={{ width: '100%', marginTop: 'auto' }}
                    onClick={() => alert('Accepting/Rejecting bids can be done in the Order management flow.')}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'requests' && (
        <>
          {requirements.length === 0 ? (
            <div className="agri-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No requests found</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>Check back later for new buyer requests.</p>
            </div>
          ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {requirements.map((req: any) => (
            <div key={req.id} className="agri-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '18px', textTransform: 'capitalize', color: 'var(--color-primary)' }}>
                    {req.cropType} - {req.quantityNeeded}{req.unit}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Buyer: {req.buyer?.name || req.buyer?.businessName || 'Verified Buyer'}
                  </div>
                </div>
                {req.location && (
                  <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#F3F4F6', borderRadius: '12px', fontWeight: 600, color: '#4B5563' }}>
                    📍 {req.location}
                  </span>
                )}
              </div>

              {req.maxBudgetPerUnit && (
                <div style={{ fontSize: '14px', backgroundColor: '#ECFDF5', padding: '8px', borderRadius: '8px', color: '#065F46', fontWeight: 600 }}>
                  Max Budget: ₹{req.maxBudgetPerUnit} / {req.unit}
                </div>
              )}

              {quotingId === req.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                  <input type="number" className="agri-input" placeholder="Your Price (₹)" value={quoteForm.price} onChange={e => setQuoteForm({...quoteForm, price: e.target.value})} />
                  <input type="number" className="agri-input" placeholder={`Quantity you can provide (${req.unit})`} value={quoteForm.quantity} onChange={e => setQuoteForm({...quoteForm, quantity: e.target.value})} />
                  
                  {quoteForm.price && quoteForm.quantity && (
                    <div style={{ padding: '12px', backgroundColor: '#ECFDF5', borderRadius: '8px', border: '1px solid #D1FAE5', margin: '4px 0' }}>
                      <div style={{ fontSize: '12px', color: '#065F46', fontWeight: 600, marginBottom: '8px' }}>ESTIMATED PROFIT</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#064E3B', marginBottom: '4px' }}>
                        <span>Gross:</span>
                        <span>₹{(Number(quoteForm.price) * Number(quoteForm.quantity)).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#B91C1C', marginBottom: '4px' }}>
                        <span>Fees & Transport:</span>
                        <span>-₹{((Number(quoteForm.price) * Number(quoteForm.quantity) * 0.02) + (Number(quoteForm.quantity) * 2.5)).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#065F46', fontWeight: 700, borderTop: '1px solid #A7F3D0', paddingTop: '8px' }}>
                        <span>Net Profit:</span>
                        <span>₹{(Number(quoteForm.price) * Number(quoteForm.quantity) - (Number(quoteForm.price) * Number(quoteForm.quantity) * 0.02) - (Number(quoteForm.quantity) * 2.5)).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <textarea className="agri-input" placeholder="Message to buyer (optional)" value={quoteForm.message} onChange={e => setQuoteForm({...quoteForm, message: e.target.value})} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="agri-btn agri-btn-outline" style={{ flex: 1 }} onClick={() => setQuotingId(null)}>Cancel</button>
                    <button className="agri-btn agri-btn-primary" style={{ flex: 1 }} disabled={!quoteForm.price || !quoteForm.quantity || quoteMutation.isPending} onClick={() => quoteMutation.mutate({ id: req.id, data: quoteForm })}>
                      {quoteMutation.isPending ? 'Sending...' : 'Send Quote'}
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="agri-btn agri-btn-primary" 
                  style={{ width: '100%', marginTop: 'auto' }}
                  onClick={() => {
                    setQuotingId(req.id);
                    setQuoteForm({ price: '', quantity: req.quantityNeeded.toString(), message: '' });
                  }}
                >
                  Send Quote
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}
