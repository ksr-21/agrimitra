import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'FARMER' | 'BUYER' | 'DELIVERY'>('FARMER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    try {
      setIsLoading(true);
      const res = await apiClient.post('/auth/signup', { phone, password, role, fullName });
      login(res.data.token, res.data.user);
      
      // Redirect based on role
      switch (res.data.user.role) {
        case 'FARMER': navigate('/farmer'); break;
        case 'BUYER': navigate('/buyer'); break;
        case 'DELIVERY': navigate('/delivery'); break;
        default: navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'var(--color-background)',
    }}>
      <div className="agri-card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🌱</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)' }}>
            {t('auth.signupTitle')}
          </h1>
          <p style={{ color: 'var(--color-text-light)' }}>{t('auth.signupSubtitle')}</p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#FEE2E2', 
            color: '#B91C1C', 
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              {t('auth.selectRole')}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { val: 'FARMER', icon: '👨‍🌾', label: t('auth.farmer') },
                { val: 'BUYER', icon: '🛒', label: t('auth.buyer') }
              ].map(r => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setRole(r.val as any)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: `2px solid ${role === r.val ? 'var(--color-primary)' : '#E5E7EB'}`,
                    backgroundColor: role === r.val ? '#ECFDF5' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{r.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: role === r.val ? 600 : 400 }}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Full Name / Business Name
            </label>
            <input
              type="text"
              className="agri-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              {t('auth.phone')}
            </label>
            <input
              type="tel"
              className="agri-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit number"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              {t('auth.password')}
            </label>
            <input
              type="password"
              className="agri-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="agri-btn agri-btn-primary agri-btn-large"
            disabled={isLoading}
            style={{ marginTop: '8px' }}
          >
            {isLoading ? t('common.loading') : t('auth.signup')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: 'var(--color-text-light)' }}>{t('auth.hasAccount')} </span>
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            {t('auth.login')}
          </Link>
        </div>
      </div>
    </div>
  );
}
