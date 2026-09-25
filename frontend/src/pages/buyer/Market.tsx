import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

// ─── 18 Demo Listings (always visible, merged with real API data) ──────────
const DEMO_LISTINGS = [
  { id: 'd1',  cropType: 'tomato',      variety: 'Hybrid',     quantity: 500,  finalPrice: 28,  location: 'Nashik, MH',       analysis: { grade: 'A', qualityScore: 4.5, sellOrWait: 'sell', notes: 'Premium hybrid tomatoes, firm texture, deep red.', sellOrWaitReason: 'Market demand is high now.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400&q=80' }], farmer: { fullName: 'Ramesh Patil' }, description: 'Fresh hybrid tomatoes, ideal for wholesale. Well-irrigated farm.' },
  { id: 'd2',  cropType: 'onion',        variety: 'Red',        quantity: 800,  finalPrice: 22,  location: 'Lasalgaon, MH',    analysis: { grade: 'A', qualityScore: 4.7, sellOrWait: 'sell', notes: 'Large red onions, low moisture, long shelf life.', sellOrWaitReason: 'Prices are stable and slightly rising.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400&q=80' }], farmer: { fullName: 'Suresh Jadhav' }, description: 'Lasalgaon famous red onions. Sorted and bagged. Ready for dispatch.' },
  { id: 'd3',  cropType: 'potato',       variety: 'Jyoti',      quantity: 1200, finalPrice: 18,  location: 'Agra, UP',         analysis: { grade: 'B', qualityScore: 3.8, sellOrWait: 'wait', notes: 'Uniform sizing, slight greening on some tubers.', sellOrWaitReason: 'Prices expected to rise next week.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80' }], farmer: { fullName: 'Vijay Kumar' }, description: 'Jyoti variety potatoes from Agra. Bulk quantity available.' },
  { id: 'd4',  cropType: 'wheat',        variety: 'Sharbati',   quantity: 2000, finalPrice: 32,  location: 'Bhopal, MP',       analysis: { grade: 'A', qualityScore: 4.9, sellOrWait: 'sell', notes: 'Premium Sharbati wheat, high protein content.', sellOrWaitReason: 'Festival season demand is high.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80' }], farmer: { fullName: 'Ajay Sharma' }, description: 'Renowned Sharbati wheat from MP. Clean, sorted, ready for mill.' },
  { id: 'd5',  cropType: 'mango',        variety: 'Alphonso',   quantity: 300,  finalPrice: 120, location: 'Ratnagiri, MH',    analysis: { grade: 'A', qualityScore: 5.0, sellOrWait: 'sell', notes: 'GI-tagged Alphonso. Perfect ripeness, intense aroma.', sellOrWaitReason: 'Peak season, sell immediately.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80' }], farmer: { fullName: 'Ganesh Sawant' }, description: 'Authentic GI-tagged Alphonso mangoes. Export quality available.' },
  { id: 'd6',  cropType: 'rice',         variety: 'Basmati',    quantity: 3000, finalPrice: 65,  location: 'Dehradun, UK',     analysis: { grade: 'A', qualityScore: 4.8, sellOrWait: 'sell', notes: 'Long grain Basmati, fragrant, aged 1 year.', sellOrWaitReason: 'Consistent demand year round.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9b7b3?w=400&q=80' }], farmer: { fullName: 'Harpal Singh' }, description: 'Dehradun Basmati rice, 1-year aged. Aromatic and fluffy when cooked.' },
  { id: 'd7',  cropType: 'brinjal',      variety: 'Round',      quantity: 200,  finalPrice: 25,  location: 'Varanasi, UP',     analysis: { grade: 'B', qualityScore: 3.5, sellOrWait: 'sell', notes: 'Round variety, good size, some minor surface marks.', sellOrWaitReason: 'Perishable, sell quickly.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&q=80' }], farmer: { fullName: 'Mohan Das' }, description: 'Round brinjal, fresh harvest. Good for curries and fry preparations.' },
  { id: 'd8',  cropType: 'capsicum',     variety: 'Green',      quantity: 150,  finalPrice: 55,  location: 'Shimla, HP',       analysis: { grade: 'A', qualityScore: 4.6, sellOrWait: 'sell', notes: 'Thick-walled green capsicum, crisp and fresh.', sellOrWaitReason: 'Urban market demand is strong.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80' }], farmer: { fullName: 'Dinesh Thakur' }, description: 'Premium Shimla capsicum. Grown at high altitude, naturally sweet.' },
  { id: 'd9',  cropType: 'banana',       variety: 'Grand Nain', quantity: 600,  finalPrice: 30,  location: 'Jalgaon, MH',     analysis: { grade: 'A', qualityScore: 4.4, sellOrWait: 'sell', notes: 'Uniform bunch size, yellow-green, ideal transit stage.', sellOrWaitReason: 'Good export market conditions.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&q=80' }], farmer: { fullName: 'Prakash Chaudhari' }, description: 'Grand Nain bananas from Jalgaon. Best bunch weight, export quality.' },
  { id: 'd10', cropType: 'cauliflower',  variety: 'Snowball',   quantity: 400,  finalPrice: 35,  location: 'Pune, MH',         analysis: { grade: 'A', qualityScore: 4.3, sellOrWait: 'sell', notes: 'Tight curds, pure white, no yellowing.', sellOrWaitReason: 'Winter vegetable in high demand.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1568584711271-6c929fb49b60?w=400&q=80' }], farmer: { fullName: 'Anil Bhosle' }, description: 'Snowball cauliflower, freshly harvested. Pre-cooled and packed.' },
  { id: 'd11', cropType: 'carrot',       variety: 'Nantes',     quantity: 350,  finalPrice: 40,  location: 'Ooty, TN',         analysis: { grade: 'A', qualityScore: 4.5, sellOrWait: 'sell', notes: 'Sweet Nantes carrots, deep orange, no forking.', sellOrWaitReason: 'Steady retail demand.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400&q=80' }], farmer: { fullName: 'Muthu Rajan' }, description: 'Ooty Nantes carrots. Naturally sweet due to cool climate.' },
  { id: 'd12', cropType: 'spinach',      variety: 'Palak',      quantity: 100,  finalPrice: 30,  location: 'Delhi NCR',         analysis: { grade: 'A', qualityScore: 4.2, sellOrWait: 'sell', notes: 'Dark green, tender leaves, no yellowing.', sellOrWaitReason: 'High demand in urban markets.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80' }], farmer: { fullName: 'Ravi Gupta' }, description: 'Fresh palak from NCR farms. Same-day harvest and dispatch.' },
  { id: 'd13', cropType: 'garlic',       variety: 'Desi',       quantity: 700,  finalPrice: 95,  location: 'Mandsaur, MP',     analysis: { grade: 'A', qualityScore: 4.8, sellOrWait: 'sell', notes: 'Pungent desi garlic, large bulbs, dry outer skin.', sellOrWaitReason: 'Prices peaking - ideal time to sell.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1615485291212-c6da61bea99a?w=400&q=80' }], farmer: { fullName: 'Santosh Verma' }, description: 'Famous Mandsaur garlic. Strong aroma, good shelf life.' },
  { id: 'd14', cropType: 'ginger',       variety: 'Fresh',      quantity: 250,  finalPrice: 85,  location: 'Kerala',           analysis: { grade: 'A', qualityScore: 4.6, sellOrWait: 'sell', notes: 'Fibrous fresh ginger, strong aroma, clean roots.', sellOrWaitReason: 'Monsoon season boosts demand.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&q=80' }], farmer: { fullName: 'Thomas Mathew' }, description: 'Kerala fresh ginger. Harvested at 8 months for best quality.' },
  { id: 'd15', cropType: 'soybean',      variety: 'JS-335',     quantity: 1500, finalPrice: 55,  location: 'Indore, MP',       analysis: { grade: 'B', qualityScore: 3.9, sellOrWait: 'wait', notes: 'Moisture slightly high at 13%. Needs drying.', sellOrWaitReason: 'Prices may improve after drying.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1635348729200-bd85af9b2ee1?w=400&q=80' }], farmer: { fullName: 'Mahesh Patel' }, description: 'JS-335 soybean. Large lot available for oil mills.' },
  { id: 'd16', cropType: 'maize',        variety: 'Yellow',     quantity: 2500, finalPrice: 22,  location: 'Karnataka',         analysis: { grade: 'A', qualityScore: 4.1, sellOrWait: 'sell', notes: 'Bold yellow grain, low aflatoxin, good test weight.', sellOrWaitReason: 'Poultry feed demand is strong.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1504194104404-433180773017?w=400&q=80' }], farmer: { fullName: 'Basavraj Patil' }, description: 'Yellow maize from Karnataka. Ideal for poultry and starch industry.' },
  { id: 'd17', cropType: 'cotton',       variety: 'Bt',         quantity: 800,  finalPrice: 68,  location: 'Vidarbha, MH',     analysis: { grade: 'A', qualityScore: 4.4, sellOrWait: 'sell', notes: 'Good staple length, low trash content.', sellOrWaitReason: 'Textile mills are buying actively.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1562887086-7e8c4e4b9be6?w=400&q=80' }], farmer: { fullName: 'Bhimrao Deshmukh' }, description: 'Bt cotton from Vidarbha. Clean picked, good ginning outturn.' },
  { id: 'd18', cropType: 'pomegranate',  variety: 'Bhagwa',     quantity: 400,  finalPrice: 110, location: 'Solapur, MH',      analysis: { grade: 'A', qualityScore: 4.9, sellOrWait: 'sell', notes: 'Deep red arils, 80% juice content, sweet-tart balance.', sellOrWaitReason: 'Export season, premium prices available.' }, images: [{ imageUrl: 'https://images.unsplash.com/photo-1617248609049-0c6f1f9e6f59?w=400&q=80' }], farmer: { fullName: 'Rajendra Mane' }, description: 'Bhagwa pomegranate from Solapur. Export graded, zero rejects.' },
];

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
  const [bidSuccess, setBidSuccess] = useState(false);

  const { data } = useQuery({
    queryKey: ['marketListings', search],
    queryFn: async () => {
      const res = await apiClient.get('/buyer/market', { params: { cropType: search } });
      return res.data;
    },
    // Don't throw on error — we'll fall back to demo data
    retry: false,
  });

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    setIsBidding(true);
    setBidError('');
    setBidSuccess(false);

    try {
      await apiClient.post('/buyer/bids', {
        listingId: selectedListing.id,
        quantity: bidQuantity,
        bidPrice,
        message: bidMessage,
      });
      setBidSuccess(true);
      setBidQuantity('');
      setBidPrice('');
      setBidMessage('');
    } catch {
      // Backend unavailable — show local confirmation for demo listings
      if (selectedListing.id?.startsWith('d')) {
        setBidSuccess(true);
        setBidQuantity('');
        setBidPrice('');
        setBidMessage('');
      } else {
        setBidError('Failed to place bid. Please try again.');
      }
    } finally {
      setIsBidding(false);
    }
  };

  // Merge real API listings with demo listings (demo shown if API is down or empty)
  const apiListings: any[] = data?.listings || [];
  const apiIds = new Set(apiListings.map((l: any) => l.id));
  const allListings = [
    ...apiListings,
    ...DEMO_LISTINGS.filter(d => !apiIds.has(d.id)),
  ];

  const filtered = search
    ? allListings.filter(l => l.cropType.toLowerCase().includes(search.toLowerCase()))
    : allListings;

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
          <button
            onClick={() => { setSelectedListing(null); setBidSuccess(false); }}
            style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            ← Back to Market
          </button>

          <img
            src={selectedListing.images?.[0]?.imageUrl}
            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', backgroundColor: '#E5E7EB' }}
            onError={(e: any) => { e.target.style.display = 'none'; }}
          />

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

          {selectedListing.analysis && (
            <div style={{
              padding: '12px', borderRadius: '8px',
              backgroundColor: selectedListing.analysis.sellOrWait === 'sell' ? '#ECFDF5' : '#FFFBEB',
              border: `1px solid ${selectedListing.analysis.sellOrWait === 'sell' ? '#A7F3D0' : '#FDE68A'}`
            }}>
              <div style={{ fontWeight: 700, color: selectedListing.analysis.sellOrWait === 'sell' ? '#065F46' : '#92400E', fontSize: '14px' }}>
                {selectedListing.analysis.sellOrWait === 'sell' ? '📈 Good time to buy' : '⏳ Price may drop soon'}
              </div>
              <p style={{ margin: 0, fontSize: '12px', marginTop: '4px', color: '#4B5563' }}>
                {selectedListing.analysis.sellOrWaitReason}
              </p>
            </div>
          )}

          <p style={{ fontSize: '14px', lineHeight: 1.5 }}>{selectedListing.description}</p>

          <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '8px 0' }} />

          {bidSuccess ? (
            <div style={{ padding: '16px', backgroundColor: '#D1FAE5', borderRadius: '8px', textAlign: 'center', color: '#065F46' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>Bid Placed Successfully!</div>
              <p style={{ margin: '4px 0 16px 0', fontSize: '14px' }}>The farmer will review your bid shortly.</p>
              <button className="agri-btn agri-btn-primary" onClick={() => { setSelectedListing(null); setBidSuccess(false); }}>
                Browse More Produce
              </button>
            </div>
          ) : (
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
                    type="number" className="agri-input" required step="0.1"
                    value={bidPrice} onChange={e => setBidPrice(e.target.value)}
                    placeholder={`Suggest ₹${selectedListing.finalPrice}`}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="agri-label">Quantity (kg)</label>
                  <input
                    type="number" className="agri-input" required max={selectedListing.quantity}
                    value={bidQuantity} onChange={e => setBidQuantity(e.target.value)}
                    placeholder={`Max ${selectedListing.quantity}`}
                  />
                </div>
              </div>

              <div>
                <label className="agri-label">Message (Optional)</label>
                <textarea
                  className="agri-input" rows={2}
                  value={bidMessage} onChange={e => setBidMessage(e.target.value)}
                  placeholder="e.g. Need weekly supply..."
                />
              </div>

              <button type="submit" className="agri-btn agri-btn-primary agri-btn-large" disabled={isBidding}>
                {isBidding ? t('common.loading') : 'Submit Bid'}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '16px' }}>
            {filtered.length} listing{filtered.length !== 1 ? 's' : ''} available
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filtered.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                No listings found for "{search}".
              </div>
            ) : (
              filtered.map((listing: any) => (
                <div
                  key={listing.id}
                  className="agri-card"
                  style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                  onClick={() => setSelectedListing(listing)}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                >
                  <img
                    src={listing.images?.[0]?.imageUrl}
                    style={{ width: '100%', height: '160px', objectFit: 'cover', backgroundColor: '#E5E7EB' }}
                    onError={(e: any) => { e.target.style.backgroundColor = '#D1FAE5'; e.target.style.display = 'none'; }}
                  />
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>
                        {listing.cropType} {listing.variety ? `(${listing.variety})` : ''}
                      </h3>
                      {listing.analysis && (
                        <span
                          className={`grade-${listing.analysis.grade.toLowerCase()}`}
                          style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: '8px' }}
                        >
                          Grade {listing.analysis.grade}
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '4px' }}>
                      👨‍🌾 {listing.farmer?.fullName || 'Verified Farmer'}
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                      📍 {listing.location}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)' }}>
                        ₹{listing.finalPrice}<span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>/kg</span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        {listing.quantity} kg
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
