import React, { useState } from 'react';
import { Shell } from '../components/layout/Shell';
import { Button, PageHeader, Card, CardHeader, CardBody } from '../components/ui';
import { useToast } from '../hooks/useToast';

type StorageModel = 'cloud' | 'onpremise' | 'hybrid';
type Plan = 'starter' | 'business' | 'enterprise';

const MODELS: { id: StorageModel; icon: string; nameAr: string; tagAr: string; descAr: string; badgeAr?: string; color: string; bg: string }[] = [
  { id: 'cloud',      icon: '☁️', nameAr: 'سحابي',  tagAr: 'Cloud',      descAr: 'بياناتك محفوظة على سيرفرات WorkHub الآمنة — لا تحتاج لأي بنية تحتية',        badgeAr: 'الأشهر',            color: 'var(--sky)',    bg: 'rgba(56,189,239,0.1)'  },
  { id: 'onpremise',  icon: '🖥️', nameAr: 'محلي',   tagAr: 'On-Premise', descAr: 'قاعدة البيانات داخل سيرفر شركتك — كامل السيطرة وأقصى الخصوصية',             badgeAr: 'للمؤسسات',          color: 'var(--accent)', bg: 'rgba(210,95,30,0.1)'   },
  { id: 'hybrid',     icon: '🔀', nameAr: 'هجين',   tagAr: 'Hybrid',     descAr: 'محلي كأساس + نسخ احتياطي سحابي تلقائي — أفضل مزيج من الأمان والمرونة',       badgeAr: 'الأكثر أماناً',     color: 'var(--gold)',   bg: 'rgba(255,185,80,0.1)'  },
];

const BACKUPS = [
  { date: '2026-04-28  02:00', size: '24.3 MB', status: 'success' },
  { date: '2026-04-27  02:00', size: '23.8 MB', status: 'success' },
  { date: '2026-04-26  02:00', size: '23.1 MB', status: 'success' },
  { date: '2026-04-25  02:00', size: '22.9 MB', status: 'failed'  },
  { date: '2026-04-24  02:00', size: '22.6 MB', status: 'success' },
];

const PLANS: { id: Plan; icon: string; nameAr: string; priceAr: string; featuresAr: string[]; color: string; bg: string; highlight?: boolean }[] = [
  {
    id: 'starter', icon: '🌱', nameAr: 'Starter', priceAr: '29,000 د.ع / شهر', color: 'var(--green)', bg: 'rgba(62,201,139,0.08)',
    featuresAr: ['حتى 5 مستخدمين', 'تخزين سحابي', 'فواتير وتقارير', 'نسخ احتياطي يومي', 'دعم عبر البريد'],
  },
  {
    id: 'business', icon: '💼', nameAr: 'Business', priceAr: 'رسوم تركيب + 79,000 د.ع / شهر', color: 'var(--accent)', bg: 'rgba(210,95,30,0.08)', highlight: true,
    featuresAr: ['مستخدمون غير محدودين', 'سيرفر داخل الشركة', 'ربط أجهزة البصمة', 'تقارير متقدمة', 'دعم أولوية'],
  },
  {
    id: 'enterprise', icon: '🏢', nameAr: 'Enterprise', priceAr: 'عقد سنوي مخصص', color: 'var(--gold)', bg: 'rgba(255,185,80,0.08)',
    featuresAr: ['كل مميزات Business', 'هجين سحابي + محلي', 'SLA مضمون 99.9%', 'دعم على مدار الساعة', 'تدريب الفريق'],
  },
];

export default function StorageSettings() {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<StorageModel>('cloud');
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackupNow = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      toast('✅ تم إنشاء نسخة احتياطية بنجاح');
    }, 2500);
  };

  const current = MODELS.find(m => m.id === selectedModel)!;
  const usedGB = 0.58;
  const totalGB = 5;
  const usedPct = Math.round((usedGB / totalGB) * 100);

  return (
    <Shell topbarActions={
      <Button variant="primary" size="sm" onClick={() => toast('✅ تم حفظ الإعدادات')}>حفظ الإعدادات 💾</Button>
    }>
      <PageHeader
        icon="🗄️"
        iconBg="rgba(210,95,30,0.12)"
        title="نظام التخزين المرن"
        subtitle="اختر نموذج التخزين المناسب لشركتك — سحابي أو محلي أو هجين"
        stats={[
          { num: `${usedGB} GB`, label: 'مستخدم', color: 'var(--accent)' },
          { num: `${totalGB} GB`, label: 'الإجمالي', color: 'var(--muted)' },
        ]}
      />

      {/* ── Model Selector ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
        {MODELS.map(m => {
          const active = selectedModel === m.id;
          return (
            <div
              key={m.id}
              onClick={() => { setSelectedModel(m.id); toast(`تم اختيار النموذج ${m.nameAr}`); }}
              style={{
                border: `2px solid ${active ? m.color : 'var(--border)'}`,
                borderRadius: 18,
                padding: '1.4rem',
                cursor: 'pointer',
                background: active ? m.bg : 'var(--bg2)',
                transition: 'all 0.2s',
                position: 'relative',
                boxShadow: active ? `0 6px 24px ${m.color}25` : 'var(--shadow-sm)',
              }}
            >
              {m.badgeAr && (
                <div style={{ position: 'absolute', top: 12, insetInlineStart: 12, background: m.color, color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 100 }}>
                  {m.badgeAr}
                </div>
              )}
              {active && (
                <div style={{ position: 'absolute', top: 12, insetInlineEnd: 12, width: 22, height: 22, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff', fontWeight: 800 }}>✓</div>
              )}
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem', marginTop: '0.5rem' }}>{m.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem', color: active ? m.color : 'var(--text)' }}>{m.nameAr}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-en)', marginBottom: '0.6rem' }}>{m.tagAr}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.6 }}>{m.descAr}</div>
            </div>
          );
        })}
      </div>

      {/* ── Status + Backup Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* Connection Status */}
        <Card>
          <CardHeader title="حالة الاتصال الحالية" />
          <CardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: current.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: `1px solid ${current.color}30` }}>{current.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{current.nameAr} — {current.tagAr}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 600 }}>متصل — يعمل بشكل طبيعي</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)' }}>
              <span>مساحة التخزين</span>
              <span style={{ color: usedPct > 80 ? 'var(--coral)' : 'var(--accent)', fontWeight: 700 }}>{usedPct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 8, background: 'var(--bg4)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${usedPct}%`, borderRadius: 8, background: `linear-gradient(90deg, var(--accent), var(--gold))`, transition: 'width 0.5s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted2)', marginTop: '0.4rem' }}>
              <span>{usedGB} GB مستخدم</span>
              <span>{totalGB} GB الإجمالي</span>
            </div>

            <div style={{ marginTop: '1.2rem', padding: '0.75rem', background: 'var(--bg3)', borderRadius: 10, fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>آخر نسخة احتياطية</span>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>اليوم 02:00 ص ✅</span>
            </div>
          </CardBody>
        </Card>

        {/* Backup History */}
        <Card>
          <CardHeader
            title="سجل النسخ الاحتياطية"
            actions={
              <Button variant="accent" size="sm" onClick={handleBackupNow} disabled={isBackingUp}>
                {isBackingUp ? '⏳ جارٍ...' : 'نسخ الآن ⚡'}
              </Button>
            }
          />
          <CardBody style={{ padding: '0.5rem 1.2rem 1rem' }}>
            {BACKUPS.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: i < BACKUPS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.9rem' }}>{b.status === 'success' ? '✅' : '❌'}</span>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-en)', color: 'var(--text)' }}>{b.date}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{b.size}</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: b.status === 'success' ? 'var(--green)' : 'var(--coral)', background: b.status === 'success' ? 'rgba(62,201,139,0.1)' : 'rgba(240,90,90,0.1)', padding: '0.15rem 0.55rem', borderRadius: 100 }}>
                  {b.status === 'success' ? 'نجح' : 'فشل'}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* ── Pricing Plans ── */}
      <Card>
        <CardHeader title="باقات التخزين" subtitle="اختر الباقة المناسبة لحجم شركتك" />
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
            {PLANS.map(p => (
              <div key={p.id} style={{ border: `2px solid ${p.highlight ? p.color : 'var(--border)'}`, borderRadius: 16, padding: '1.4rem', background: p.highlight ? p.bg : 'var(--bg3)', position: 'relative', transition: 'all 0.2s' }}>
                {p.highlight && (
                  <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: p.color, color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '0.2rem 0.9rem', borderRadius: 100, whiteSpace: 'nowrap' }}>
                    ⭐ الأكثر طلباً
                  </div>
                )}
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{p.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: p.color, marginBottom: '0.3rem' }}>{p.nameAr}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1rem', lineHeight: 1.5 }}>{p.priceAr}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.2rem' }}>
                  {p.featuresAr.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text)' }}>
                      <span style={{ color: p.color, fontWeight: 700 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <Button variant={p.highlight ? 'primary' : 'default'} size="sm" style={{ width: '100%', justifyContent: 'center', ...(p.highlight ? {} : { borderColor: p.color, color: p.color }) }} onClick={() => toast(`سيتم التواصل معك لترتيب باقة ${p.nameAr}`)}>
                  اختر هذه الباقة
                </Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </Shell>
  );
}
