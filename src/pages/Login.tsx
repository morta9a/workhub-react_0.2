import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import workhubIcon from '../svg/workhub-icon.svg';
import logoDark from '../svg/workhub-logo-dark.svg';
import logoLight from '../svg/workhub-logo-light.svg';

type Mode = 'login' | 'signup';

export default function LoginPage({ onSuccess }: { onSuccess?: () => void }) {
  const { login, signup } = useAuth();
  const { theme } = useApp();
  const navigate = useNavigate();
  const [mode,     setMode]    = useState<Mode>('login');
  const [name,     setName]    = useState('');
  const [email,    setEmail]   = useState('');
  const [password, setPass]    = useState('');
  const [error,    setError]   = useState('');
  const [loading,  setLoading] = useState(false);

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
    color: '#fff', padding: '0.75rem 1rem', borderRadius: 12,
    fontFamily: 'Tajawal, sans-serif', fontSize: '0.9rem', outline: 'none',
    boxSizing: 'border-box', transition: 'border .2s',
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    let ok = false;
    if (mode === 'login') {
      ok = await login(email, password);
      if (!ok) setError('البريد أو كلمة المرور غير صحيحة');
    } else {
      if (!name.trim()) { setError('الاسم مطلوب'); setLoading(false); return; }
      ok = await signup(name, email, password);
      if (!ok) setError('بريد غير صالح أو كلمة المرور أقل من 6 أحرف');
    }
    setLoading(false);
    if (ok) {
      if (onSuccess) onSuccess();
      else navigate('/meetings', { replace: true });
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Tajawal, sans-serif', direction: 'rtl',
    }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,99,255,.18),transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(56,189,248,.12),transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        width: 420, background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 24, padding: '2.5rem', position: 'relative', zIndex: 1,
        boxShadow: '0 24px 80px rgba(0,0,0,.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src={workhubIcon}
            alt="WorkHub Icon"
            style={{ width: 72, height: 72, marginBottom: '0.6rem', filter: 'drop-shadow(0 4px 16px rgba(215,100,28,.3))' }}
          />
          <div>
            <img
              src={theme === 'dark' ? logoDark : logoLight}
              alt="WorkHub"
              style={{ height: 44, width: 'auto' }}
            />
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.4rem' }}>منصة العمل الذكية</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 12, padding: 4, marginBottom: '1.6rem', gap: 4 }}>
          {(['login','signup'] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, border: 'none', padding: '0.55rem', borderRadius: 9, cursor: 'pointer',
                fontFamily: 'Tajawal, sans-serif', fontSize: '0.85rem', fontWeight: 600, transition: 'all .2s',
                background: mode === m ? 'linear-gradient(135deg,var(--accent),var(--accent2))' : 'transparent',
                color: mode === m ? '#fff' : 'var(--muted)',
              }}>
              {m === 'login' ? '🔑 تسجيل الدخول' : '✨ حساب جديد'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {mode === 'signup' && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.35rem' }}>الاسم الكامل</div>
              <input style={inp} placeholder="محمد أحمد" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.35rem' }}>البريد الإلكتروني</div>
            <input style={inp} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} dir="ltr" />
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.35rem' }}>كلمة المرور</div>
            <input style={inp} type="password" placeholder="••••••••" value={password} onChange={e => setPass(e.target.value)} dir="ltr" />
          </div>

          {error && (
            <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.2)', color: '#f87171', padding: '0.6rem 0.9rem', borderRadius: 10, fontSize: '0.82rem' }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: loading ? 'var(--bg3)' : 'linear-gradient(135deg,var(--accent),var(--accent2))',
            color: loading ? 'var(--muted)' : '#fff', border: 'none',
            padding: '0.8rem', borderRadius: 12, fontSize: '0.95rem', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal, sans-serif',
            transition: 'all .2s', marginTop: '0.4rem',
          }}>
            {loading ? '⏳ جارٍ التحقق…' : mode === 'login' ? '🔑 دخول' : '🚀 إنشاء الحساب'}
          </button>
        </form>

        {/* Removed Demo hint since we are using real Supabase Auth now */}
      </div>
    </div>
  );
}
