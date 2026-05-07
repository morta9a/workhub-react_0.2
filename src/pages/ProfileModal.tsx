import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui';
import { useToast } from '../hooks/useToast';
import { UpgradeModal } from './Upgrade';

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { user, updateProfile, resetPasswordEmail, logout } = useAuth();
  const { lang } = useApp();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const planLabel = user?.plan === 'pro' ? '⚡ Pro' : user?.plan === 'enterprise' ? '🏢 Enterprise' : (lang === 'ar' ? 'مجاني' : 'Free');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !avatar.trim()) {
      toast(lang === 'ar' ? '⚠️ الرجاء ملء الاسم والرمز' : '⚠️ Please fill name and avatar');
      return;
    }
    setLoadingProfile(true);
    const success = await updateProfile(name, avatar);
    setLoadingProfile(false);
    
    if (success) {
      toast(lang === 'ar' ? '✅ تم حفظ معلوماتك الشخصية' : '✅ Personal info saved');
      onClose();
    } else {
      toast(lang === 'ar' ? '❌ خطأ في التحديث' : '❌ Error updating');
    }
  };

  const handleResetEmail = async () => {
    if (!user?.email) return;
    setLoadingSecurity(true);
    const success = await resetPasswordEmail(user.email);
    setLoadingSecurity(false);
    if (success) {
      toast(lang === 'ar' ? '✉️ تم إرسال رابط استعادة الرمز السري إلى بريدك' : '✉️ Password reset link sent to your email');
    } else {
      toast(lang === 'ar' ? '❌ حدث خطأ أثناء إرسال البريد' : '❌ Error sending reset email');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  if (upgradeOpen) {
    return <UpgradeModal onClose={() => setUpgradeOpen(false)} />;
  }

  // Common input styles to match the Catalog modal perfectly
  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
    border: '1px solid var(--border)', background: 'var(--bg2)',
    color: 'var(--text)', fontSize: '0.95rem', outline: 'none',
    transition: 'border-color 0.2s'
  };

  const labelStyle = { 
    display: 'block', fontSize: '0.85rem', color: 'var(--muted)', 
    marginBottom: '0.5rem', fontWeight: 600
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg)', borderRadius: '20px', border: '1px solid var(--border)',
        width: '100%', maxWidth: '450px', padding: '1.8rem', 
        boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
        maxHeight: '85vh', overflowY: 'auto', margin: 'auto',
        animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>
            {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
          </h2>
          <button onClick={onClose} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)',
            width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>
        
        {/* Avatar Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '2.5rem', color: '#fff',
            boxShadow: '0 8px 24px var(--glow-accent)', marginBottom: '0.8rem',
            border: '3px solid var(--bg2)'
          }}>
            {avatar || '?'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              background: 'rgba(52,211,153,0.1)', color: 'var(--green)', 
              padding: '0.3rem 0.8rem', borderRadius: '20px', 
              fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(52,211,153,0.2)'
            }}>
              {planLabel}
            </div>
            {user?.plan === 'free' && (
              <button onClick={() => setUpgradeOpen(true)} style={{
                background: 'linear-gradient(135deg, var(--accent), var(--gold))', color: '#fff',
                padding: '0.3rem 0.8rem', borderRadius: '20px', border: 'none',
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 2px 8px var(--glow-accent)'
              }}>
                {lang === 'ar' ? 'ترقية 🚀' : 'Upgrade 🚀'}
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>{lang === 'ar' ? 'أيقونة' : 'Avatar'}</label>
              <input type="text" value={avatar} maxLength={2} onChange={(e) => setAvatar(e.target.value)}
                style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', padding: '0.6rem' }}
              />
            </div>
            <div>
              <label style={labelStyle}>{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
            <input type="email" value={user?.email || ''} readOnly
              style={{ ...inputStyle, background: 'var(--bg)', color: 'var(--muted)', opacity: 0.8 }}
            />
          </div>

          {/* Security Action */}
          <div style={{ background: 'var(--bg2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>
                {lang === 'ar' ? 'الرمز السري' : 'Password'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                {lang === 'ar' ? 'تغيير عبر الرابط فقط' : 'Change via link only'}
              </div>
            </div>
            <Button type="button" variant="default" size="sm" onClick={handleResetEmail} disabled={loadingSecurity}>
              {loadingSecurity ? '...' : (lang === 'ar' ? 'إرسال رابط 🔗' : 'Reset Link 🔗')}
            </Button>
          </div>

          {/* Bottom Actions */}
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button type="button" variant="ghost" style={{ color: 'var(--coral)', padding: '0.5rem' }} onClick={handleLogout}>
              {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </Button>
            <div style={{ flex: 1 }} />
            <Button type="submit" variant="accent" disabled={loadingProfile}>
              {loadingProfile ? '...' : (lang === 'ar' ? 'حفظ التغييرات 💾' : 'Save Changes 💾')}
            </Button>
          </div>

        </form>
      </div>
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        input:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 2px var(--glow-accent);
        }
      `}</style>
    </div>
  );
}
