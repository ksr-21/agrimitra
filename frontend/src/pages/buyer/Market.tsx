import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

export default function Market() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState<any>(null);

  // Bidding State
  const [bidQuantity, setBidQuantity] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [bidError, setBidError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['marketListings', search],
    queryFn: async () => {
      const res = await apiClient.get('/buyer/market', { params: { cropType: search } });
      return res.data;
    },
  });

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    
    setIsBidding(true);
    setBidError('');

    try {
      await apiClient.post('/buyer/bids', {
        listingId: selectedListing.id,
        quantity: bidQuantity,
        bidPrice,
        message: bidMessage,
      });
      alert('Bid placed successfully!');
      setSelectedListing(null);
      // Reset form
      setBidQuantity('');
      setBidPrice('');
      setBidMessage('');
    } catch (err: any) {
      setBidError(err.response?.data?.error || 'Failed to place bid');
    } finally {
      setIsBidding(false);
    }
  };

  if (isLoading && !data) {
    return <div style={{ padding: '24px' }}>{t('common.loading')}</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '16px' }}>{t('common.error')}</div>;
  }

  const listings = data?.listings || [];

  return (
    <div style={{ paddingBottom: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>{t('buyer.browse')}</h1>

      <input
        type="text"
        className="agri-input"
        placeholder="Search crop type (e.g., onion, tomato)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: '24px' }}
      />

      {selectedListing ? (
        <div className="agri-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button onClick={() => setSelectedListing(null)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            &larr; Back to Market
          </button>
          
          <img src={selectedListing.images[0]?.imageUrl} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', backgroundColor: '#E5E7EB' }} />
          
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, textTransform: 'capitalize', margin: 0 }}>
              {selectedListing.cropType} {selectedListing.variety ? `(${selectedListing.variety})` : ''}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              {selectedListing.farmer?.fullName} • 📍 {selectedListing.location}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Asking Price</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>₹{selectedListing.finalPrice}/kg</div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Available</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{selectedListing.quantity} kg</div>
            </div>
            {selectedListing.analysis && (
              <div style={{ flex: 1, backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>AI Grade</div>
                <div className={`grade-${selectedListing.analysis.grade.toLowerCase()}`} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  {selectedListing.analysis.grade}
                </div>
              </div>
            )}
          </div>

          <p style={{ fontSize: '14px', lineHeight: 1.5 }}>{selectedListing.description}</p>

          <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '8px 0' }} />

          <form onSubmit={handleBidSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Place your Bid</h3>
            
            {bidError && (
              <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '8px' }}>
                {bidError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label className="agri-label">Price (₹/kg)</label>
                <input 
                  type="number" 
                  className="agri-input" 
                  required step="0.1"
                  value={bidPrice}
                  onChange={e => setBidPrice(e.target.value)}
                  placeholder={`Suggest ₹${selectedListing.finalPrice}`}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="agri-label">Quantity (kg)</label>
                <input 
                  type="number" 
                  className="agri-input" 
                  required max={selectedListing.quantity}
                  value={bidQuantity}
                  onChange={e => setBidQuantity(e.target.value)}
                  placeholder={`Max ${selectedListing.quantity}`}
                />
              </div>
            </div>
            
            <div>
              <label className="agri-label">Message (Optional)</label>
              <textarea 
                className="agri-input" 
                rows={2}
                value={bidMessage}
                onChange={e => setBidMessage(e.target.value)}
                placeholder="e.g. Need weekly supply..."
              />
            </div>

            <button type="submit" className="agri-btn agri-btn-primary agri-btn-large" disabled={isBidding}>
              {isBidding ? t('common.loading') : 'Submit Bid'}
            </button>
          </form>

        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {listings.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
              No listings found for your search.
            </div>
          ) : (
            listings.map((listing: any) => (
              <div key={listing.id} className="agri-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s ease' }} onClick={() => setSelectedListing(listing)} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <img src={listing.images[0]?.imageUrl} style={{ width: '100%', height: '160px', objectFit: 'cover', backgroundColor: '#E5E7EB' }} />
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>
                      {listing.cropType} {listing.variety ? `(${listing.variety})` : ''}
                    </h3>
                    {listing.analysis && (
                      <span className={`grade-${listing.analysis.grade.toLowerCase()}`} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                        Grade {listing.analysis.grade}
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
                    📍 {listing.location}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)' }}>
                        ₹{listing.finalPrice}<span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>/kg</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>
                      {listing.quantity} kg
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
