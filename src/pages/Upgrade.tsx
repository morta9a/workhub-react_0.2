import React, { useState } from 'react';
import { useAuth, Plan } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';

interface PlanInfo {
  id: Plan;
  name: string;
  price: string;
  period: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
  badge?: string;
  features: { text: string; included: boolean }[];
}

const PLANS: PlanInfo[] = [
  {
    id: 'free', name: 'مجاني', price: '$0', period: '/شهر', icon: '🌱',
    color: 'var(--green)', bg: 'rgba(52,211,153,.06)', border: 'rgba(52,211,153,.2)',
    features: [
      { text: '3 فواتير / شهر',           included: true  },
      { text: 'نموذجان احترافيان',          included: true  },
      { text: 'تلخيص اجتماع واحد / شهر',   included: true  },
      { text: 'تحسين سيرة واحدة / شهر',    included: true  },
      { text: 'فواتير غير محدودة',          included: false },
      { text: 'تصدير PDF & Word',           included: false },
      { text: 'AI تعبئة تلقائية',           included: false },
      { text: 'دعم أولوي',                  included: false },
    ],
  },
  {
    id: 'pro', name: 'احترافي', price: '$19', period: '/شهر', icon: '⚡', badge: 'الأكثر طلباً',
    color: 'var(--accent2)', bg: 'rgba(108,99,255,.08)', border: 'rgba(108,99,255,.3)',
    features: [
      { text: 'فواتير غير محدودة',          included: true },
      { text: 'جميع النماذج الاحترافية',     included: true },
      { text: 'تلخيص اجتماعات غير محدود',   included: true },
      { text: 'تحسين سير ذاتية غير محدود',  included: true },
      { text: 'تصدير PDF & Word',            included: true },
      { text: 'AI تعبئة تلقائية',            included: true },
      { text: 'مشاركة وتتبع',               included: true },
      { text: 'دعم أولوي',                   included: false },
    ],
  },
  {
    id: 'enterprise', name: 'مؤسسي', price: '$49', period: '/شهر', icon: '🏢',
    color: 'var(--gold)', bg: 'rgba(245,158,11,.06)', border: 'rgba(245,158,11,.25)',
    features: [
      { text: 'كل مميزات Pro',               included: true },
      { text: 'مستخدمون متعددون',            included: true },
      { text: 'لوحة تحكم فريق',             included: true },
      { text: 'API Access',                  included: true },
      { text: 'تقارير متقدمة',               included: true },
      { text: 'نطاق خاص',                   included: true },
      { text: 'دعم أولوي 24/7',              included: true },
      { text: 'تكاملات مخصصة',              included: true },
    ],
  },
];

interface UpgradeModalProps {
  onClose: () => void;
}

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const { user, checkoutStripe, redeemCoupon } = useAuth();
  const { toast } = useToast();
  const [buying, setBuying] = useState<Plan | null>(null);
  const [billingCycle, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [coupon, setCoupon] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  async function handleUpgrade(plan: Plan) {
    if (plan === 'free') { toast('أنت بالفعل في الخطة المجانية'); return; }
    if (plan === user?.plan) { toast(`أنت بالفعل في خطة ${PLANS.find(p=>p.id===plan)?.name}`); return; }
    setBuying(plan);
    // Redirects to Stripe, so we don't clear setBuying (page will navigate away)
    checkoutStripe(plan);
  }

  async function handleRedeem() {
    if (!coupon.trim()) return;
    setRedeeming(true);
    const result = await redeemCoupon(coupon.trim());
    setRedeeming(false);
    
    if (result.success) {
      toast(`🎉 ${result.message}`);
      setCoupon('');
      setTimeout(() => onClose(), 1500);
    } else {
      toast(`❌ ${result.message}`);
    }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(10px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 24, padding: '2rem', width: '100%', maxWidth: 860, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose}
          style={{ position: 'absolute', top: '1.2rem', left: '1.2rem', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>

        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>✦ ارقَ إلى مستوى أعلى</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>اختر الخطة المناسبة لأعمالك</div>
          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', background: 'var(--bg3)', borderRadius: 10, padding: 4, marginTop: '1rem', gap: 4 }}>
            {(['monthly','yearly'] as const).map(c => (
              <button key={c} onClick={() => setBilling(c)}
                style={{ border: 'none', padding: '0.4rem 1rem', borderRadius: 7, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', fontSize: '0.82rem', fontWeight: 600, transition: 'all .2s',
                  background: billingCycle === c ? 'var(--accent)' : 'transparent', color: billingCycle === c ? '#fff' : 'var(--muted)' }}>
                {c === 'monthly' ? 'شهري' : 'سنوي (-20%)'}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
          {PLANS.map(plan => {
            const isCurrentPlan = user?.plan === plan.id;
            const yearlyPrice = plan.price === '$0' ? '$0' : `$${Math.round(parseInt(plan.price.replace('$','')) * 0.8 * 12)}`;
            const displayPrice = billingCycle === 'yearly' && plan.price !== '$0' ? yearlyPrice : plan.price;
            const displayPeriod = billingCycle === 'yearly' && plan.price !== '$0' ? '/سنة' : plan.period;
            return (
              <div key={plan.id} style={{
                background: plan.bg, border: `1px solid ${isCurrentPlan ? plan.color : plan.border}`,
                borderRadius: 16, padding: '1.4rem', position: 'relative', display: 'flex', flexDirection: 'column',
                boxShadow: isCurrentPlan ? `0 0 0 2px ${plan.color}` : 'none',
              }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: '-10px', right: '50%', transform: 'translateX(50%)', background: 'var(--accent2)', color: '#fff', padding: '0.2rem 0.8rem', borderRadius: 100, fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}
                {isCurrentPlan && (
                  <div style={{ position: 'absolute', top: '0.8rem', left: '0.8rem', background: plan.color, color: '#0a0a0f', padding: '0.15rem 0.55rem', borderRadius: 100, fontSize: '0.6rem', fontWeight: 700 }}>
                    ✓ حالي
                  </div>
                )}
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{plan.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem', color: plan.color }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '1rem' }}>
                  <span style={{ fontFamily: 'var(--font-en)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--text)' }}>{displayPrice}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{displayPeriod}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.2rem' }}>
                  {plan.features.map(f => (
                    <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: f.included ? 'var(--text)' : 'var(--muted2)', opacity: f.included ? 1 : 0.5 }}>
                      <span style={{ color: f.included ? plan.color : 'var(--border2)', flexShrink: 0 }}>{f.included ? '✓' : '×'}</span>
                      {f.text}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || buying !== null}
                  style={{
                    width: '100%', border: 'none', padding: '0.65rem', borderRadius: 10,
                    fontFamily: 'Tajawal, sans-serif', fontSize: '0.88rem', fontWeight: 700,
                    cursor: isCurrentPlan || buying !== null ? 'not-allowed' : 'pointer', transition: 'all .2s',
                    background: isCurrentPlan ? 'var(--bg3)' : buying === plan.id ? 'var(--bg3)' : plan.color === 'var(--green)' ? 'rgba(52,211,153,.15)' : plan.id === 'pro' ? 'var(--accent)' : 'rgba(245,158,11,.15)',
                    color: isCurrentPlan ? 'var(--muted)' : plan.id === 'pro' ? '#fff' : plan.color,
                  }}>
                  {buying === plan.id ? '⏳ جارٍ…' : isCurrentPlan ? '✓ خطتك الحالية' : plan.id === 'free' ? 'الخطة المجانية' : `ترقية إلى ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', padding: '1.5rem', background: 'var(--bg3)', borderRadius: 16 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>هل لديك كود ترقية؟ 🎟️</div>
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: 400 }}>
            <input 
              type="text" 
              placeholder="أدخل كود الترقية هنا" 
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
              style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontFamily: 'Tajawal, sans-serif' }}
            />
            <button 
              onClick={handleRedeem}
              disabled={redeeming || !coupon.trim()}
              style={{ padding: '0.6rem 1.2rem', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: redeeming || !coupon.trim() ? 'not-allowed' : 'pointer', opacity: redeeming || !coupon.trim() ? 0.6 : 1, fontFamily: 'Tajawal, sans-serif' }}
            >
              {redeeming ? 'جاري التحقق...' : 'تفعيل'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted)' }}>
          🔒 دفع آمن · إلغاء في أي وقت · ضمان استرداد 14 يوم
        </div>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(true);
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
