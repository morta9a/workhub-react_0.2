// ══════════════════════════════════════════════════════════
//  CvOptimizer.tsx  — fully interactive
// ══════════════════════════════════════════════════════════
import React, { useState, useRef } from 'react';
import { Shell } from '../components/layout/Shell';
import {
  Button, AiButton, ToolbarSection, ToolbarDivider,
  PageHeader, Card, CardHeader, CardBody, SectionLabel,
} from '../components/ui';
import { AiPanel } from '../components/shared';
import { useToast } from '../hooks/useToast';

type CvState = 'upload' | 'processing' | 'result';
type CvView  = 'editor' | 'saved';
type KeywordStatus = 'matched' | 'added' | 'missing';
interface Keyword { text: string; status: KeywordStatus }

// ── Static data ────────────────────────────────────────────
const KEYWORDS: Keyword[] = [
  { text: 'React',       status: 'matched' },
  { text: 'TypeScript',  status: 'matched' },
  { text: 'Node.js',     status: 'matched' },
  { text: 'REST APIs',   status: 'matched' },
  { text: 'Git',         status: 'matched' },
  { text: 'UI/UX',       status: 'matched' },
  { text: 'Jest',        status: 'added'   },
  { text: 'Agile',       status: 'added'   },
  { text: 'CI/CD',       status: 'added'   },
  { text: 'Docker',      status: 'missing' },
  { text: 'Kubernetes',  status: 'missing' },
];

const KW_STYLE: Record<KeywordStatus, React.CSSProperties> = {
  matched: { background: 'rgba(52,211,153,.12)',  color: 'var(--green)',   border: '1px solid rgba(52,211,153,.2)'   },
  added:   { background: 'rgba(108,99,255,.12)',  color: 'var(--accent2)', border: '1px solid rgba(108,99,255,.2)'   },
  missing: { background: 'rgba(248,113,113,.08)', color: 'var(--coral)',   border: '1px solid rgba(248,113,113,.15)' },
};

const SAVED_CVS = [
  { id: 1, name: 'مطور Frontend – TechCorp',   date: '2025-04-10', score: 87, job: 'Frontend Developer' },
  { id: 2, name: 'مهندس Full-Stack – Startup X', date: '2025-03-28', score: 74, job: 'Full-Stack Engineer' },
];

const CV_BEFORE = `محمد العنزي — مطور ويب

الخبرة:
• مطور ويب — شركة ABC (2022 – الآن)
  - عمل على مشاريع مواقع إلكترونية
  - استخدام React وJavaScript
  - التعاون مع الفريق

المهارات: HTML, CSS, JavaScript, React, بعض Node.js, Git`;

const CV_AFTER = `محمد العنزي — مطور Frontend متخصص في React & TypeScript

الخبرة:
• مطور Frontend — شركة ABC التقنية (2022 – الآن)
  + طوّر 8 تطبيقات React/TypeScript رفعت معدل التحويل 40%
  + نفّذ REST APIs بـ Node.js خادمت 50K+ مستخدم
  + يعمل ضمن بيئة Agile مع دورات Sprint أسبوعية
  + استخدم Jest للاختبارات وCI/CD للنشر التلقائي

المهارات: React · TypeScript · Node.js · REST APIs · Jest · Git · CI/CD · Agile · Docker (أساسي)`;

// ── Toolbar ────────────────────────────────────────────────
function CvToolbar({
  view, onView, onAts, onPdf, onOptimize,
}: {
  view: CvView;
  onView: (v: CvView) => void;
  onAts: () => void;
  onPdf: () => void;
  onOptimize: () => void;
}) {
  return (
    <>
      <ToolbarSection align="left">
        <Button size="sm" variant={view === 'editor' ? 'accent' : 'ghost'}
          onClick={() => onView('editor')}>📄 سيرة جديدة</Button>
        <Button size="sm" variant={view === 'saved' ? 'accent' : 'ghost'}
          onClick={() => onView('saved')}>📂 سيراتي ({SAVED_CVS.length})</Button>
        <ToolbarDivider />
        <Button size="sm" variant="ghost" onClick={onAts}>📊 تحليل ATS</Button>
      </ToolbarSection>
      <ToolbarSection align="right">
        <Button size="sm" variant="ghost" onClick={onPdf}>📄 PDF</Button>
        <ToolbarDivider />
        <AiButton onClick={onOptimize}>تحسين بالذكاء الاصطناعي</AiButton>
      </ToolbarSection>
    </>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function CvOptimizerPage() {
  const { toast } = useToast();
  const afterRef = useRef<HTMLDivElement>(null);

  const [state,    setState]    = useState<CvState>('upload');
  const [cvView,   setCvView]   = useState<CvView>('editor');
  const [jdText,   setJdText]   = useState(
    'نبحث عن مطور Frontend خبرة 3+ سنوات.\n\nالمتطلبات: React, TypeScript, Node.js, REST APIs, Git. خبرة في تصميم UI/UX واختبارات Jest. مهارات التواصل والعمل ضمن فريق Agile. معرفة بـ CI/CD و Docker ميزة إضافية.'
  );
  const [matchPct, setMatchPct] = useState(0);
  const [atsOpen,  setAtsOpen]  = useState(false);

  // ── Handlers ──────────────────────────────────────────
  function startOptimize() {
    setState('processing');
    const steps = ['تحليل إعلان الوظيفة…', 'مطابقة الكلمات المفتاحية…', 'إعادة صياغة الخبرات…', 'اكتمل ✓'];
    steps.forEach((s, i) => setTimeout(() => {
      toast('✦ ' + s);
      if (i === steps.length - 1) setTimeout(() => { setState('result'); setMatchPct(87); }, 400);
    }, i * 700));
  }

  function handleShare() {
    const text = `سيرة ذاتية محسّنة\nالتطابق مع الوظيفة: ${matchPct}%\nالكلمات المفتاحية: ${KEYWORDS.filter(k => k.status !== 'missing').map(k => k.text).join(', ')}\n— تم التحسين بواسطة WorkHub AI`;
    navigator.clipboard.writeText(text)
      .then(() => toast('📋 تم نسخ ملخص السيرة!'))
      .catch(() => toast('⚠️ تعذّر النسخ'));
  }

  function handlePdf(content = CV_AFTER) {
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) { toast('⚠️ السماح بالنوافذ المنبثقة'); return; }
    win.document.write(
      `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>سيرة ذاتية</title>` +
      `<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;700&display=swap" rel="stylesheet">` +
      `<style>body{margin:0;padding:28px 36px;font-family:Tajawal,sans-serif;font-size:14px;line-height:1.8;color:#1a1a2e;}h1{font-size:20px;margin-bottom:4px;}p{white-space:pre-wrap;}@media print{@page{margin:1cm}}</style>` +
      `</head><body><pre style="font-family:Tajawal,sans-serif;white-space:pre-wrap">${content}</pre></body></html>`
    );
    win.document.close();
    setTimeout(() => win.print(), 600);
    toast('🖨️ جارٍ فتح نافذة الطباعة…');
  }

  function handleWord(content = CV_AFTER) {
    const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'سيرة-ذاتية-محسّنة.doc';
    a.click(); URL.revokeObjectURL(url);
    toast('📝 تم تحميل ملف Word!');
  }

  function handleCopyBefore() {
    navigator.clipboard.writeText(CV_BEFORE).then(() => toast('📋 تم نسخ السيرة الأصلية')).catch(() => toast('⚠️ تعذّر النسخ'));
  }

  function handleCopyAfter() {
    navigator.clipboard.writeText(CV_AFTER).then(() => toast('📋 تم نسخ السيرة المحسّنة')).catch(() => toast('⚠️ تعذّر النسخ'));
  }

  const inp: React.CSSProperties = {
    background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
    padding: '0.6rem 0.85rem', borderRadius: 10, fontFamily: 'var(--font-ar)',
    fontSize: '0.82rem', outline: 'none', width: '100%', resize: 'vertical',
  };

  return (
    <Shell
      topbarActions={
        <>
          <Button size="sm" onClick={state === 'result' ? handleShare : () => toast('⚠️ حسّن السيرة أولاً')}>🔗 مشاركة</Button>
          <Button size="sm" onClick={state === 'result' ? () => handlePdf() : () => toast('⚠️ حسّن السيرة أولاً')}>📥 PDF</Button>
          <Button size="sm" onClick={state === 'result' ? () => handleWord() : () => toast('⚠️ حسّن السيرة أولاً')}>📝 Word</Button>

        </>
      }
      toolbar={
        <CvToolbar
          view={cvView}
          onView={v => { setCvView(v); if (v === 'editor') setState('upload'); }}
          onAts={() => setAtsOpen(true)}
          onPdf={() => state === 'result' ? handlePdf() : toast('⚠️ حسّن السيرة أولاً')}
          onOptimize={startOptimize}
        />
      }
    >
      <PageHeader
        icon="📄" iconBg="rgba(108,99,255,.12)"
        title="محسّن السيرة الذاتية بالذكاء الاصطناعي"
        subtitle="ارفع سيرتك + إعلان الوظيفة — الذكاء الاصطناعي يكيّفها تلقائياً لترفع قبولك 3x"
        stats={[
          { num: state === 'result' ? `${matchPct}%` : '—', label: 'تطابق ATS',    color: 'var(--green)'   },
          { num: '12',  label: 'كلمة مفتاحية', color: 'var(--accent2)' },
          { num: '3x',  label: 'معدل القبول',  color: 'var(--gold)'    },
        ]}
      />

      {/* ── SAVED VIEW ── */}
      {cvView === 'saved' && (
        <div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1rem' }}>📂 سيراتي المحفوظة</div>
          {SAVED_CVS.map(cv => (
            <div key={cv.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.9rem 1.2rem', marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(108,99,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>📄</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cv.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-en)' }}>{cv.date} — {cv.job}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-en)', fontWeight: 700, color: 'var(--green)', fontSize: '0.9rem' }}>{cv.score}%</div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <Button size="sm" onClick={() => { setCvView('editor'); setState('result'); setMatchPct(cv.score); toast('تم فتح السيرة ✓'); }}>👁️ فتح</Button>
                <Button size="sm" onClick={() => handlePdf()}>📄 PDF</Button>
                <Button size="sm" onClick={() => handleWord()}>📝 Word</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EDITOR VIEW ── */}
      {cvView === 'editor' && (
        <>
          {/* Upload / processing state */}
          {state !== 'result' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              {/* Upload zone */}
              <div
                onClick={startOptimize}
                style={{ border: '1.5px dashed rgba(108,99,255,.35)', borderRadius: 18, background: 'rgba(108,99,255,.04)', padding: '2.2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(108,99,255,.04)')}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.8rem' }}>📄</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  {state === 'processing' ? '⏳ جارٍ التحليل…' : 'ارفع سيرتك الذاتية'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1rem' }}>PDF · DOCX · TXT</div>
                {state === 'upload' && (
                  <Button variant="primary" onClick={e => { e.stopPropagation(); startOptimize(); }}>📄 جرّب بسيرة تجريبية</Button>
                )}
                {state === 'processing' && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent2)', marginTop: '0.5rem' }}>الرجاء الانتظار…</div>
                )}
              </div>

              {/* Job description */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.1rem 1.2rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.6rem' }}>💼 إعلان الوظيفة المستهدفة</div>
                <textarea rows={5} style={inp} value={jdText} onChange={e => setJdText(e.target.value)} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.8rem' }}>
                  <button
                    onClick={startOptimize}
                    style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#fff', border: 'none', padding: '0.65rem 1.8rem', borderRadius: 12, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--font-ar)', fontWeight: 600 }}
                  >
                    ✦ تحسين السيرة الآن
                  </button>
                  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.5rem 0.9rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)' }} />
                    63% تطابق حالي
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result state */}
          {state === 'result' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

              {/* Match bar */}
              <Card>
                <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>نتيجة التطابق مع الوظيفة</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-en)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--green)' }}>{matchPct}%</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--green)' }}>↑ من 63%</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button size="sm" onClick={() => handlePdf()}>📄 PDF</Button>
                      <Button size="sm" onClick={() => handleWord()}>📝 Word</Button>
                      <Button size="sm" onClick={handleShare}>🔗 مشاركة</Button>
                      <Button size="sm" onClick={() => { setState('upload'); setMatchPct(0); }}>↺ جديد</Button>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: 6, borderRadius: 3, width: `${matchPct}%`, background: 'linear-gradient(90deg,var(--accent2),var(--green))', transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {KEYWORDS.map(kw => (
                      <span key={kw.text} style={{ fontSize: '0.68rem', padding: '0.18rem 0.55rem', borderRadius: 6, fontFamily: 'var(--font-en)', ...KW_STYLE[kw.status] }}>
                        {kw.text}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.65rem' }}>
                    <span style={{ color: 'var(--green)' }}>● موجودة</span>
                    <span style={{ color: 'var(--accent2)' }}>● مُضافة بواسطة AI</span>
                    <span style={{ color: 'var(--coral)' }}>● غير موجودة</span>
                  </div>
                </CardBody>
              </Card>

              {/* Split view: Before | After */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', alignItems: 'start' }}>
                {/* Before */}
                <Card>
                  <CardHeader
                    title={<><span style={{ color: 'var(--coral)' }}>●</span> قبل التحسين — 63%</>}
                    actions={<Button size="sm" onClick={handleCopyBefore}>📋 نسخ</Button>}
                  />
                  <CardBody style={{ maxHeight: 380, overflowY: 'auto', fontSize: '0.82rem' }}>
                    <pre style={{ fontFamily: 'var(--font-ar)', whiteSpace: 'pre-wrap', color: 'var(--muted)', margin: 0, fontSize: '0.8rem', lineHeight: 1.8 }}>{CV_BEFORE}</pre>
                  </CardBody>
                </Card>

                {/* After */}
                <Card style={{ borderColor: 'rgba(52,211,153,.2)' }}>
                  <CardHeader
                    title={<><span style={{ color: 'var(--green)' }}>●</span> بعد التحسين — 87% ✦</>}
                    actions={
                      <>
                        <Button size="sm" onClick={handleCopyAfter}>📋 نسخ</Button>
                        <Button size="sm" onClick={() => handlePdf()}>⬇ PDF</Button>
                        <Button size="sm" onClick={() => handleWord()}>📝 Word</Button>
                      </>
                    }
                  />
                  <CardBody style={{ maxHeight: 380, overflowY: 'auto', fontSize: '0.82rem' }}>
                    <pre style={{ fontFamily: 'var(--font-ar)', whiteSpace: 'pre-wrap', margin: 0, fontSize: '0.8rem', lineHeight: 1.8, color: 'var(--text)' }}>{CV_AFTER}</pre>
                  </CardBody>
                </Card>
              </div>

              {/* AI suggestions */}
              <AiPanel
                message="أضف مشروعاً يستخدم Docker لأنه مذكور في الوظيفة — حتى مشروع شخصي صغير يرفع التطابق إلى 94%"
                chips={[
                  { label: '📄 تحميل PDF',  onClick: () => handlePdf()  },
                  { label: '📝 تحميل Word', onClick: () => handleWord() },
                  { label: '↺ تحسين آخر',   onClick: () => { setState('upload'); setMatchPct(0); } },
                ]}
              />
            </div>
          )}
        </>
      )}

      {/* ATS Analysis Modal */}
      {atsOpen && (() => {
        const matched = KEYWORDS.filter(k => k.status === 'matched').length;
        const added   = KEYWORDS.filter(k => k.status === 'added').length;
        const missing = KEYWORDS.filter(k => k.status === 'missing').length;
        return (
          <div onClick={e => { if (e.target === e.currentTarget) setAtsOpen(false); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 20, padding: '1.8rem', width: 440, position: 'relative' }}>
              <button onClick={() => setAtsOpen(false)}
                style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted)', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.4rem' }}>📊 تحليل ATS التفصيلي</div>
              {[
                { label: '✅ كلمات موجودة أصلاً', val: matched, color: 'var(--green)',   bg: 'rgba(52,211,153,.1)' },
                { label: '✦ كلمات أضافها الذكاء الاصطناعي', val: added,   color: 'var(--accent2)', bg: 'rgba(108,99,255,.08)' },
                { label: '❌ كلمات مفقودة', val: missing,  color: 'var(--coral)',   bg: 'rgba(248,113,113,.08)' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.9rem', background: row.bg, borderRadius: 10, marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-en)', fontWeight: 700, color: row.color, fontSize: '1.1rem' }}>{row.val}</span>
                </div>
              ))}
              <div style={{ marginTop: '0.6rem', padding: '0.7rem 0.9rem', background: 'rgba(108,99,255,.08)', borderRadius: 10, border: '1px solid rgba(108,99,255,.2)', fontSize: '0.78rem', color: 'var(--accent2)' }}>
                ✨ نسبة التطابق الحالية: <strong>{state === 'result' ? `${matchPct}%` : '63%'}</strong>
                {missing > 0 && ` — أضف ${missing} كلمات مفتاحية للوصول إلى 94%`}
              </div>
              <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {KEYWORDS.map(kw => (
                  <span key={kw.text} style={{ fontSize: '0.68rem', padding: '0.18rem 0.55rem', borderRadius: 6, fontFamily: 'var(--font-en)', ...KW_STYLE[kw.status] }}>{kw.text}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </Shell>
  );
}
