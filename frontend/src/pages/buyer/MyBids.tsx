import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function MyBids() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div style={{ paddingBottom: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>{t('buyer.myBids')}</h1>
      <div className="agri-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
        <p>Bids management will be fully implemented in a future phase.</p>
        <button className="agri-btn agri-btn-primary" onClick={() => navigate('/buyer/market')} style={{ marginTop: '16px' }}>
          Back to Market
        </button>
      </div>
    </div>
  );
}
