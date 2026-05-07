import React, { useState, useRef } from 'react';
import { Shell } from '../components/layout/Shell';
import {
  Button, AiButton, ToolbarSection, ToolbarDivider,
  PageHeader, Card, CardHeader, CardBody, SectionLabel,
} from '../components/ui';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import type { Template, TemplateCategory } from '../types';

// ── Template registry ────────────────────
const TEMPLATES: Template[] = [
  { id: 'contract',    icon: '📝', nameAr: 'عقد مستقل',       category: 'legal',    plan: 'free'  },
  { id: 'nda',         icon: '🔒', nameAr: 'اتفاقية سرية NDA', category: 'legal',    plan: 'free'  },
  { id: 'employment',  icon: '👔', nameAr: 'عقد عمل',          category: 'legal',    plan: 'free'  },
  { id: 'rent',        icon: '🏢', nameAr: 'عقد إيجار',        category: 'legal',    plan: 'pro'   },
  { id: 'partnership', icon: '🤝', nameAr: 'عقد شراكة',        category: 'legal',    plan: 'pro'   },
  { id: 'proposal',    icon: '💡', nameAr: 'عرض سعر',          category: 'freelance',plan: 'free', isNew: true },
  { id: 'scope',       icon: '📋', nameAr: 'نطاق عمل',         category: 'freelance',plan: 'pro'   },
  { id: 'termination', icon: '🚫', nameAr: 'إنهاء عقد',        category: 'freelance',plan: 'pro'   },
  { id: 'sales',       icon: '🛒', nameAr: 'عقد بيع',          category: 'sales',    plan: 'pro'   },
  { id: 'maintenance', icon: '🔧', nameAr: 'عقد صيانة',        category: 'sales',    plan: 'pro'   },
];

const CAT_LABELS: Record<TemplateCategory, string> = {
  legal:     '⚖️ قانوني',
  freelance: '💼 مستقل',
  sales:     '💰 مبيعات',
};

// ── Toolbar ──────────────────────────────
type TplTab = 'library' | 'saved';
type TplCat = 'all' | 'legal' | 'freelance' | 'sales';

function TemplatesToolbar({
  tab, onTab, catFilter, onCat, onPrint, onAiFill,
}: {
  tab: TplTab; onTab: (t: TplTab) => void;
  catFilter: TplCat; onCat: (c: TplCat) => void;
  onPrint: () => void; onAiFill: () => void;
}) {
  return (
    <>
      <ToolbarSection align="left">
        <Button size="sm" variant={tab === 'library' ? 'accent' : 'ghost'} onClick={() => onTab('library')}>📚 المكتبة</Button>
        <Button size="sm" variant={tab === 'saved'   ? 'accent' : 'ghost'} onClick={() => onTab('saved')}>💾 محفوظة (2)</Button>
        <ToolbarDivider />
        {(['all','legal','freelance','sales'] as TplCat[]).map(c => (
          <Button key={c} size="sm" variant={catFilter === c ? 'accent' : 'ghost'} onClick={() => onCat(c)}>
            {c === 'all' ? 'الكل' : c === 'legal' ? '⚖️ قانوني' : c === 'freelance' ? '💼 مستقل' : '💰 مبيعات'}
          </Button>
        ))}
      </ToolbarSection>
      <ToolbarSection align="right">
        <Button size="sm" variant="ghost" onClick={onPrint}>🖨️ طباعة</Button>
        <ToolbarDivider />
        <AiButton onClick={onAiFill}>تعبئة تلقائية</AiButton>
      </ToolbarSection>
    </>
  );
}

export default function TemplatesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { savedTemplates, addSavedTemplate, deleteSavedTemplate } = useApp();
  const isPro = user?.plan === 'pro' || user?.plan === 'enterprise';
  const previewRef = useRef<HTMLDivElement>(null);
  const [tab,       setTab]       = useState<TplTab>('library');
  const [catFilter, setCatFilter] = useState<TplCat>('all');
  const [selectedId, setSelectedId] = useState<string>('contract');
  const [generated, setGenerated] = useState(false);
  const [p1name,   setP1name]   = useState('أحمد علي المطوّر');
  const [p1addr,   setP1addr]   = useState('بغداد، العراق');
  const [p2name,   setP2name]   = useState('TechCorp Arabia');
  const [p2rep,    setP2rep]    = useState('محمد الأحمد');
  const [p2addr,   setP2addr]   = useState('بغداد، العراق');
  const [service,  setService]  = useState('تصميم وتطوير موقع إلكتروني متكامل مع لوحة تحكم.');
  const [amount,   setAmount]   = useState('6,550,000 دينار عراقي');
  const [duration, setDuration] = useState('30 يوم عمل');
  const [payMethod,setPayMethod]= useState('تحويل بنكي');
  const [notes,    setNotes]    = useState('');

  const selected = TEMPLATES.find(t => t.id === selectedId)!;
  const filteredTemplates = catFilter === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.category === catFilter);
  const grouped  = (Object.keys(CAT_LABELS) as TemplateCategory[]).map(cat => ({
    cat, label: CAT_LABELS[cat],
    items: filteredTemplates.filter(t => t.category === cat),
  })).filter(g => g.items.length > 0);

  function selectTemplate(t: Template) {
    if (t.plan === 'pro' && !isPro) {
      toast('🔒 هذا النموذج متاح في خطة Pro ✦ — قم بالترقية من الـ Sidebar');
      return;
    }
    setSelectedId(t.id); setGenerated(false);
    toast('✓ تم تحميل النموذج: ' + t.nameAr);
  }

  function handlePrint() {
    const el = previewRef.current;
    if (!el) { toast('⚠️ لا يوجد نموذج للطباعة'); return; }
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) { toast('⚠️ السماح بالنوافذ المنبثقة'); return; }
    win.document.write(
      `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>${selected?.nameAr}</title>` +
      `<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;700&family=Syne:wght@700&display=swap" rel="stylesheet">` +
      `<style>body{margin:0;padding:28px 36px;font-family:Tajawal,sans-serif;}@media print{@page{margin:1cm}}</style>` +
      `</head><body>${el.innerHTML}</body></html>`
    );
    win.document.close();
    setTimeout(() => win.print(), 600);
    toast('🖨️ جارٍ الطباعة…');
  }

  function handleWord() {
    const content = `${selected?.nameAr ?? 'عقد'}
============================
الطرف الأول: ${p1name} — ${p1addr}
الطرف الثاني: ${p2name} (${p2rep}) — ${p2addr}

المادة الأولى — موضوع العقد:
${service}

المادة الثانية — القيمة والدفع:
تبلغ قيمة الخدمة ${amount}، يُسدَّد عبر ${payMethod}.

المادة الثالثة — مدة التنفيذ:
تنتهي خلال ${duration} من بدء العمل الفعلي.

المادة الرابعة — الملكية الفكرية:
تنتقل حقوق الملكية للطرف الثاني فور استلام الدفعة الكاملة.
${notes ? '\nشروط إضافية: ' + notes : ''}`;
    const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = `${selected?.nameAr ?? 'عقد'}.doc`;
    a.click(); URL.revokeObjectURL(url);
    toast('📝 تم تحميل ملف Word!');
  }

  function handleShare() {
    const text = `نموذج: ${selected?.nameAr}\nالطرف الأول: ${p1name}\nالطرف الثاني: ${p2name}\nالقيمة: ${amount}\n— تم إنشاؤه بواسطة WorkHub`;
    navigator.clipboard.writeText(text).then(() => toast('📋 تم نسخ تفاصيل العقد!')).catch(() => toast('⚠️ تعذّر النسخ'));
  }

  function generateNow() {
    toast('✦ جارٍ إنشاء الوثيقة…');
    setTimeout(() => { 
      setGenerated(true);
      addSavedTemplate({
        id: Date.now().toString(),
        name: `${selected?.nameAr ?? 'نموذج'} - ${p2name || 'العميل'}`,
        date: new Date().toISOString().split('T')[0],
        icon: selected?.icon ?? '📝',
      });
      toast('✅ تم إنشاء النموذج بنجاح!'); 
    }, 800);
  }

  function aiFill() {
    toast('✦ الذكاء الاصطناعي يملأ البيانات…');
    setTimeout(() => {
      setP1name('أحمد علي المطوّر');
      setP2name('TechCorp Arabia');
      setP2rep('محمد الأحمد');
      setService('تصميم وتطوير موقع إلكتروني متكامل مع لوحة تحكم.');
      setAmount('6,550,000 دينار عراقي');
      setDuration('30 يوم عمل');
      toast('تمت التعبئة التلقائية ✓');
    }, 900);
  }

  const inp: React.CSSProperties = {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '0.48rem 0.75rem',
    borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ar)',
    fontSize: '0.8rem', outline: 'none', width: '100%',
  };

  return (
    <Shell
      topbarActions={
        <>
          {([{label:'🔗 مشاركة',fn:handleShare,bg:'rgba(56,189,248,.12)',color:'#38bdf8',border:'rgba(56,189,248,.3)'},{label:'🖨️ PDF',fn:handlePrint,bg:'rgba(108,99,255,.12)',color:'#a78bfa',border:'rgba(108,99,255,.3)'},{label:'📝 Word',fn:handleWord,bg:'rgba(52,211,153,.1)',color:'var(--green)',border:'rgba(52,211,153,.25)'}]).map(b=>(
            <button key={b.label} onClick={b.fn} style={{background:b.bg,color:b.color,border:`1px solid ${b.border}`,padding:'0.28rem 0.9rem',borderRadius:100,fontSize:'0.75rem',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-ar)',whiteSpace:'nowrap',transition:'all .15s'}}>{b.label}</button>
          ))}
          <button style={{background:'linear-gradient(135deg,rgba(108,99,255,.8),rgba(56,189,248,.8))',color:'#fff',border:'none',padding:'0.28rem 0.9rem',borderRadius:100,fontSize:'0.75rem',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-ar)',whiteSpace:'nowrap'}}>✦ ترقية</button>
        </>
      }
      toolbar={
        <TemplatesToolbar
          tab={tab} onTab={t => { setTab(t); }}
          catFilter={catFilter} onCat={setCatFilter}
          onPrint={handlePrint} onAiFill={aiFill}
        />
      }
    >
      <PageHeader
        icon="📝" iconBg="rgba(52,211,153,.1)"
        title="النماذج الاحترافية"
        subtitle="مكتبة نماذج قانونية جاهزة — اختر، اعبئ، حمّل PDF في دقيقتين"
        stats={[
          { num: '24', label: 'نموذج متاح', color: 'var(--accent2)' },
          { num: '3',  label: 'مجاناً',     color: 'var(--green)'   },
          { num: '2',  label: 'مُستخدمة',   color: 'var(--gold)'    },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr', gap: '1rem', alignItems: 'start' }}>

        {/* ── Library ── */}
        <Card>
          <CardHeader title={<>📚 المكتبة <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 400 }}>24</span></>} />
          <CardBody style={{ padding: '0.5rem' }}>
            {grouped.map(({ cat, label, items }) => (
              <div key={cat}>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted2)', fontFamily: 'var(--font-en)', padding: '0.5rem 0.5rem 0.3rem' }}>{label}</div>
                {items.map(t => (
                  <div
                    key={t.id}
                    onClick={() => selectTemplate(t)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.48rem 0.65rem', borderRadius: 9, cursor: 'pointer',
                      marginBottom: '0.06rem', transition: 'all 0.15s',
                      background: selectedId === t.id ? 'rgba(52,211,153,.08)' : 'transparent',
                      border: `1px solid ${selectedId === t.id ? 'rgba(52,211,153,.15)' : 'transparent'}`,
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', width: 20, textAlign: 'center' }}>{t.icon}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 500, flex: 1 }}>{t.nameAr}</span>
                    <span style={{
                      fontSize: '0.6rem', padding: '0.08rem 0.4rem', borderRadius: 6, fontFamily: 'var(--font-en)', fontWeight: 600,
                      background: t.plan === 'free' ? 'rgba(52,211,153,.12)' : isPro ? 'rgba(52,211,153,.12)' : 'rgba(108,99,255,.12)',
                      color: t.plan === 'free' ? 'var(--green)' : isPro ? 'var(--green)' : 'var(--accent2)',
                    }}>{t.plan === 'free' ? 'مجاني' : isPro ? '✓ Pro' : '🔒 Pro'}</span>
                    {t.isNew && <span style={{ fontSize: '0.58rem', padding: '0.06rem 0.3rem', borderRadius: 4, background: 'rgba(245,158,11,.15)', color: 'var(--gold)', fontFamily: 'var(--font-en)' }}>جديد</span>}
                  </div>
                ))}
              </div>
            ))}
          </CardBody>
        </Card>

        {/* ── Form ── */}
        <Card>
          <CardHeader
            title={`${selected?.icon ?? '📝'} ${selected?.nameAr ?? ''} — تعبئة البيانات`}
            actions={<div style={{display:'flex',gap:'0.35rem'}}><button onClick={aiFill} style={{background:'rgba(108,99,255,.15)',color:'#a78bfa',border:'1px solid rgba(108,99,255,.3)',padding:'0.22rem 0.65rem',borderRadius:100,fontSize:'0.68rem',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-ar)',whiteSpace:'nowrap'}}>✦ AI</button><button onClick={()=>{setService('');toast('تم المسح');}} style={{background:'rgba(248,113,113,.1)',color:'#f87171',border:'1px solid rgba(248,113,113,.25)',padding:'0.22rem 0.55rem',borderRadius:100,fontSize:'0.68rem',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-ar)'}}>🗑</button></div>}
          />
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 560, overflowY: 'auto' }}>
            {/* AI fill */}
            <button onClick={aiFill} style={{
              background: 'linear-gradient(135deg,rgba(108,99,255,.1),rgba(56,189,248,.06))',
              border: '1px solid rgba(108,99,255,.22)', color: 'var(--accent2)',
              padding: '0.4rem 0.9rem', borderRadius: 8, fontSize: '0.75rem',
              cursor: 'pointer', fontFamily: 'var(--font-ar)', display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', justifyContent: 'center',
            }}>
              <span className="ai-pulse" /> تعبئة تلقائية بالذكاء الاصطناعي
            </button>

            <SectionLabel>الطرف الأول (المستقل)</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                الاسم الكامل <input style={inp} value={p1name} onChange={e => setP1name(e.target.value)} />
              </label>
              <label style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                العنوان <input style={inp} value={p1addr} onChange={e => setP1addr(e.target.value)} />
              </label>
            </div>

            <SectionLabel>الطرف الثاني (العميل)</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                الاسم / الشركة <input style={inp} value={p2name} onChange={e => setP2name(e.target.value)} />
              </label>
              <label style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                الممثل القانوني <input style={inp} value={p2rep} onChange={e => setP2rep(e.target.value)} />
              </label>
            </div>
            <label style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
              عنوان الشركة <input style={inp} value={p2addr} onChange={e => setP2addr(e.target.value)} />
            </label>

            <SectionLabel>تفاصيل العقد</SectionLabel>
            <label style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
              وصف الخدمة
              <textarea rows={2} style={{ ...inp, resize: 'vertical' }} value={service} onChange={e => setService(e.target.value)} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                القيمة الإجمالية <input style={inp} value={amount} onChange={e => setAmount(e.target.value)} />
              </label>
              <label style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                مدة التنفيذ <input style={inp} value={duration} onChange={e => setDuration(e.target.value)} />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                طريقة الدفع
                <select style={inp} value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                  {['تحويل بنكي', 'PayPal', 'نقداً', 'شيك'].map(m => <option key={m}>{m}</option>)}
                </select>
              </label>
              <label style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                شروط إضافية
                <input style={inp} value={notes} onChange={e => setNotes(e.target.value)} placeholder="اختياري…" />
              </label>
            </div>

            <button onClick={generateNow} style={{background: generated ? 'rgba(52,211,153,.15)' : 'rgba(52,211,153,.12)', color: generated ? 'var(--green)' : 'var(--green)', border: `1px solid ${generated ? 'rgba(52,211,153,.5)' : 'rgba(52,211,153,.3)'}`, padding:'0.6rem', borderRadius:100, fontSize:'0.85rem', cursor:'pointer', fontFamily:'var(--font-ar)', fontWeight:700, transition:'all .3s', width:'100%'}}>
              {generated ? '✅ تم التوليد — اطبع أو حمّل' : '📄 توليد النموذج الآن'}
            </button>
            {generated && (
              <div style={{ display: 'flex', gap: '0.45rem' }}>
                {([{label:'🖨️ طباعة / PDF',fn:handlePrint,bg:'rgba(108,99,255,.12)',color:'#a78bfa',border:'rgba(108,99,255,.3)'},{label:'📝 Word',fn:handleWord,bg:'rgba(56,189,248,.1)',color:'#38bdf8',border:'rgba(56,189,248,.25)'},{label:'🔗 نسخ',fn:handleShare,bg:'rgba(52,211,153,.1)',color:'var(--green)',border:'rgba(52,211,153,.25)'}]).map(b=>(
                  <button key={b.label} onClick={b.fn} style={{flex:1,background:b.bg,color:b.color,border:`1px solid ${b.border}`,padding:'0.5rem 0.3rem',borderRadius:100,fontSize:'0.75rem',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-ar)',whiteSpace:'nowrap',textAlign:'center',transition:'all .15s'}}>{b.label}</button>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* ── Saved view ── */}
        {tab === 'saved' && (
          <div style={{ gridColumn: '2 / -1' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1rem' }}>
              💾 النماذج المحفوظة ({savedTemplates.length})
            </div>
            {savedTemplates.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                📂 لا توجد نماذج محفوظة
              </div>
            )}
            {savedTemplates.map(s => (
              <div key={s.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.9rem 1.2rem', marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,211,153,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-en)' }}>{s.date}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  {([
                    {label:'✏ تعديل', fn:()=>{setTab('library');toast('تم الفتح ✓');},       bg:'rgba(108,99,255,.15)', color:'#a78bfa',        border:'rgba(108,99,255,.35)'},
                    {label:'📄 PDF',    fn:handlePrint,                                      bg:'rgba(56,189,248,.1)',  color:'#38bdf8',           border:'rgba(56,189,248,.25)'},
                    {label:'📝 Word',   fn:handleWord,                                       bg:'rgba(52,211,153,.1)', color:'var(--green)',       border:'rgba(52,211,153,.25)'},
                    {label:'🗑 حذف',   fn:()=>{deleteSavedTemplate(s.id); toast('🗑 تم حذف النموذج');}, bg:'rgba(248,113,113,.1)', color:'#f87171', border:'rgba(248,113,113,.25)'},
                  ] as const).map(b=>(
                    <button key={b.label} onClick={b.fn} style={{background:b.bg,color:b.color,border:`1px solid ${b.border}`,padding:'0.25rem 0.75rem',borderRadius:100,fontSize:'0.7rem',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-ar)',whiteSpace:'nowrap',transition:'all .15s'}}>{b.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Preview ── */}
        {tab === 'library' && <Card>
          <CardHeader title="👁️ معاينة مباشرة" actions={
            <div style={{display:'flex',gap:'0.35rem'}}><button onClick={handlePrint} style={{background:'rgba(108,99,255,.12)',color:'#a78bfa',border:'1px solid rgba(108,99,255,.3)',padding:'0.22rem 0.6rem',borderRadius:100,fontSize:'0.68rem',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-ar)'}}>🖨️</button><button onClick={handlePrint} style={{background:'rgba(52,211,153,.1)',color:'var(--green)',border:'1px solid rgba(52,211,153,.25)',padding:'0.22rem 0.6rem',borderRadius:100,fontSize:'0.68rem',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-ar)'}}>⬇ PDF</button></div>
          } />
          <div style={{ padding: '0.9rem', background: 'var(--bg3)', minHeight: 500 }} ref={previewRef}>
            <div style={{
              background: '#fff', borderRadius: 10, padding: '1.5rem',
              boxShadow: '0 6px 30px rgba(0,0,0,.45)', color: '#1a1a2e',
              fontFamily: 'Tajawal, sans-serif', direction: 'rtl', position: 'relative',
            }}>
              {/* Watermark */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-35deg)', fontSize: '2.5rem', fontWeight: 900, color: 'rgba(52,211,153,.06)', pointerEvents: 'none', letterSpacing: '0.1em', fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap' }}>
                CONTRACT
              </div>

              <div style={{ fontSize: '0.95rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.3rem', fontFamily: 'Syne, sans-serif' }}>
                {selected?.nameAr ? `عقد ${selected.nameAr}` : 'عقد تقديم خدمات مستقلة'}
              </div>
              <div style={{ fontSize: '0.68rem', textAlign: 'center', color: '#888', marginBottom: '0.9rem', paddingBottom: '0.8rem', borderBottom: '1.5px solid #e0e0f0' }}>
                اتفاقية قانونية ملزمة بين الطرفين
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '0.9rem', background: '#f8f7ff', borderRadius: 8, padding: '0.65rem' }}>
                {[{ label: 'الطرف الأول — المستقل', name: p1name, detail: p1addr }, { label: 'الطرف الثاني — العميل', name: p2name, detail: p2addr }].map(p => (
                  <div key={p.label}>
                    <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#aaa', marginBottom: 3, fontFamily: 'Syne, sans-serif' }}>{p.label}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a1a2e' }}>{p.name || '—'}</div>
                    <div style={{ fontSize: '0.68rem', color: '#888' }}>{p.detail}</div>
                  </div>
                ))}
              </div>

              {[
                { num: 'الأولى', title: 'موضوع العقد',   body: `يتعهد الطرف الأول بتقديم: ${service.split('،')[0] || service || '—'}` },
                { num: 'الثانية', title: 'القيمة والدفع', body: `تبلغ قيمة الخدمة ${amount || '—'}، يُسدَّد عبر ${payMethod}.` },
                { num: 'الثالثة', title: 'مدة التنفيذ',   body: `تنتهي خلال ${duration || '—'} من بدء العمل الفعلي.` },
                { num: 'الرابعة', title: 'الملكية الفكرية', body: 'تنتقل حقوق الملكية للطرف الثاني فور استلام الدفعة الكاملة.' },
              ].map(c => (
                <div key={c.num} style={{ marginBottom: '0.6rem', paddingRight: '0.65rem', borderRight: '2px solid #e0e0f0', fontSize: '0.73rem', color: '#444' }}>
                  <div style={{ fontWeight: 700, color: '#6c63ff', fontSize: '0.68rem', marginBottom: '0.12rem' }}>المادة {c.num} — {c.title}</div>
                  {c.body}
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', paddingTop: '0.9rem', borderTop: '1px solid #e8e8f0' }}>
                {[p1name || 'الطرف الأول', `${p2name || 'الطرف الثاني'}${p2rep ? ' — ' + p2rep : ''}`].map(sig => (
                  <div key={sig} style={{ textAlign: 'center' }}>
                    <div style={{ height: 30, borderBottom: '1px solid #ccc', marginBottom: '0.25rem' }} />
                    <div style={{ fontSize: '0.62rem', color: '#aaa' }}>{sig}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>}

      </div>
    </Shell>
  );
}
