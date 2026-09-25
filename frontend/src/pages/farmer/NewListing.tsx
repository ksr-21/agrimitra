import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

export default function NewListing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1); // 1: Photo, 2: AI Result & Form
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [cropType, setCropType] = useState('tomato');

  // Form State
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [finalPrice, setFinalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [variety, setVariety] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const analyzePhoto = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError('');
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('cropType', cropType);

    try {
      const res = await apiClient.post('/listings/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAiData(res.data);
      setFinalPrice(res.data.pricing.recommendedPrice.toString());
      setVariety(res.data.variety || '');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze photo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const publishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiData || !quantity || !finalPrice) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      await apiClient.post('/listings', {
        cropType: aiData.cropType,
        variety: variety || aiData.variety,
        quantity,
        unit,
        description,
        location,
        finalPrice,
        imageUrl: aiData.imageUrl,
        aiData: aiData,
      });
      
      alert(t('farmer.listingPublished'));
      navigate('/farmer');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to publish listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ paddingBottom: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>{t('farmer.newListing')}</h1>
      
      {error && (
        <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="agri-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>📸</div>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{t('farmer.uploadHint')}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Take a clear photo of your produce for AI analysis</p>
          </div>

          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
          />

          {preview ? (
            <div style={{ width: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
              <img src={preview} alt="Produce preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  position: 'absolute', top: '8px', right: '8px', 
                  background: 'rgba(0,0,0,0.6)', color: 'white', 
                  border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '12px' 
                }}
              >
                Retake
              </button>
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="agri-btn agri-btn-primary" 
              style={{ width: '100%', padding: '24px 0' }}
            >
              Take Photo
            </button>
          )}

          {preview && (
            <div style={{ width: '100%' }}>
              <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                <label className="agri-label">Product Name</label>
                <input 
                  type="text" 
                  className="agri-input" 
                  placeholder="e.g. Tomato"
                  value={cropType}
                  onChange={e => setCropType(e.target.value)}
                />
              </div>
              <button 
                onClick={analyzePhoto}
                disabled={isAnalyzing || !cropType}
                className="agri-btn agri-btn-accent agri-btn-large"
                style={{ width: '100%' }}
              >
                {isAnalyzing ? t('farmer.analyzing') : 'Analyze & Get Price'}
              </button>
            </div>
          )}

          {!preview && (
            <button 
              onClick={() => {
                setCropType('Tomato');
                setAiData({
                  imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80',
                  cropType: 'tomato',
                  variety: 'Hybrid',
                  analysis: {
                    grade: 'B',
                    qualityScore: 3.2,
                    confidence: 0.78,
                    notes: 'Good quality. Minor imperfections detected but overall acceptable for wholesale. Some variation in size noted.'
                  },
                  pricing: {
                    minPrice: 23.8,
                    maxPrice: 32.2,
                    recommendedPrice: 28,
                    currency: 'INR'
                  },
                  advice: {
                    recommendation: 'sell',
                    reason: 'Current prices for tomato are stable. Selling now avoids storage costs and spoilage risk.',
                    confidenceScore: 0.68
                  },
                  transport: {
                    estimatedCost: 600,
                    suggestedVehicleType: 'mini_truck',
                    estimatedDistance: 50,
                    currency: 'INR'
                  },
                  profit: {
                    grossRevenue: 9000,
                    transportCost: 600,
                    platformFee: 0,
                    netProfit: 8400,
                    currency: 'INR'
                  }
                });
                setQuantity('300');
                setFinalPrice('30');
                setDescription('Farm-fresh tomatoes, sorted and graded. Ready for immediate pickup.');
                setStep(2);
              }}
              className="agri-btn"
              style={{ 
                width: '100%', 
                marginTop: '16px', 
                backgroundColor: '#F3F4F6', 
                color: '#4B5563',
                border: '1px solid #D1D5DB'
              }}
            >
              🚀 Load Realistic Demo
            </button>
          )}
        </div>
      )}

      {step === 2 && aiData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* AI Analysis Card */}
          <div className="agri-card" style={{ border: '2px solid var(--color-primary-light)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-primary)' }}>
              {t('farmer.aiResults')}
            </h2>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <img src={aiData.imageUrl} style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '20px', fontWeight: 700, textTransform: 'capitalize' }}>
                  {aiData.cropType} {aiData.variety ? `(${aiData.variety})` : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <span className={`grade-${aiData.analysis.grade.toLowerCase()}`} style={{ padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                    Grade {aiData.analysis.grade}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                    Score: {aiData.analysis.qualityScore}/5
                  </span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#F3F4F6', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
              {aiData.analysis.notes}
            </div>

            {/* Sell/Wait Advice */}
            <div style={{ 
              marginTop: '16px', padding: '16px', borderRadius: '12px',
              backgroundColor: aiData.advice.recommendation === 'sell' ? '#ECFDF5' : '#FFFBEB',
              border: `1px solid ${aiData.advice.recommendation === 'sell' ? '#A7F3D0' : '#FDE68A'}`
            }}>
              <div style={{ fontWeight: 700, color: aiData.advice.recommendation === 'sell' ? '#065F46' : '#92400E', fontSize: '16px' }}>
                {aiData.advice.recommendation === 'sell' ? `📈 ${t('farmer.sellNow')}` : `⏳ ${t('farmer.waitToSell')}`}
              </div>
              <p style={{ margin: 0, fontSize: '14px', marginTop: '4px', color: '#4B5563' }}>
                {aiData.advice.reason}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={publishListing} className="agri-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label className="agri-label">{t('farmer.quantity')}</label>
                <input 
                  type="number" 
                  className="agri-input" 
                  required 
                  min="1"
                  placeholder="e.g. 500"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                />
              </div>
              <div style={{ width: '100px' }}>
                <label className="agri-label">Unit</label>
                <select 
                  className="agri-input" 
                  value={unit} 
                  onChange={e => setUnit(e.target.value)}
                >
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                  <option value="quintal">quintal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="agri-label">Variety (Optional)</label>
              <input 
                type="text" 
                className="agri-input" 
                placeholder="e.g. Roma"
                value={variety}
                onChange={e => setVariety(e.target.value)}
              />
            </div>

            <div>
              <label className="agri-label">Location</label>
              <input 
                type="text" 
                className="agri-input" 
                required
                placeholder="e.g. Pune, Maharashtra"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>

            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <label className="agri-label">Recommended Price (per kg)</label>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)' }}>
                ₹{aiData.pricing.recommendedPrice}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Market range: ₹{aiData.pricing.minPrice} - ₹{aiData.pricing.maxPrice}
              </div>
            </div>

            <div>
              <label className="agri-label">{t('farmer.setYourPrice')} (₹ per kg)</label>
              <input 
                type="number" 
                className="agri-input" 
                required 
                step="0.1"
                value={finalPrice}
                onChange={e => setFinalPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="agri-label">{t('farmer.description')} (Optional)</label>
              <textarea 
                className="agri-input" 
                rows={3} 
                style={{ padding: '12px' }}
                placeholder="Any special notes for buyers..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {quantity && finalPrice && (
              <div style={{ padding: '16px', backgroundColor: '#ECFDF5', borderRadius: '8px', marginTop: '8px' }}>
                <div style={{ fontSize: '14px', color: '#065F46' }}>Estimated Net Profit</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  ₹{Math.round((parseFloat(quantity) * parseFloat(finalPrice)) - aiData.profit.transportCost)}
                </div>
                <div style={{ fontSize: '12px', color: '#065F46', opacity: 0.8 }}>
                  After ₹{aiData.profit.transportCost} estimated transport
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="agri-btn agri-btn-primary agri-btn-large" 
              disabled={isSubmitting}
              style={{ marginTop: '16px' }}
            >
              {isSubmitting ? t('common.loading') : t('farmer.publishListing')}
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
