import React, { useState, useRef } from 'react';
import { Shell } from '../components/layout/Shell';
import { Button, AiButton, ToolbarSection, ToolbarDivider, PageHeader, Card, CardHeader, CardBody, SectionLabel } from '../components/ui';
import { AiPanel } from '../components/shared';
import { useToast } from '../hooks/useToast';
import { useApp } from '../contexts/AppContext';

// ── Types ────────────────────────────────
type PageState = 'upload' | 'processing' | 'result';

interface ActionItem {
  id: number;
  text: string;
  owner: string;
  due: string;
  done: boolean;
}

interface Tag {
  label: string;
  color: string;
  bg: string;
}

// ── Initial data ─────────────────────────
const INITIAL_TAGS: Tag[] = [
  { label: '🎯 أهداف Q3',    color: 'var(--accent2)', bg: 'rgba(108,99,255,.15)' },
  { label: '💻 تطوير المنتج', color: 'var(--accent3)', bg: 'rgba(56,189,248,.12)' },
  { label: '✅ قرارات',       color: 'var(--green)',   bg: 'rgba(52,211,153,.12)' },
  { label: '⚠️ عقبات',        color: 'var(--gold)',    bg: 'rgba(245,158,11,.12)' },
  { label: '📅 مواعيد نهائية',color: 'var(--coral)',   bg: 'rgba(248,113,113,.12)' },
];

const INITIAL_ACTIONS: ActionItem[] = [
  { id: 1, text: 'مراجعة ميزانية التسويق وإرسال المقترح للفريق', owner: 'سارة', due: 'الأربعاء', done: false },
  { id: 2, text: 'إعداد مواصفات وظيفة المطور وطرح الإعلان',    owner: 'أحمد', due: 'الثلاثاء', done: false },
  { id: 3, text: 'إرسال محضر الاجتماع للفريق',                  owner: 'نورة', due: 'اليوم',    done: true  },
  { id: 4, text: 'جدولة اجتماع المتابعة الخميس 10 صباحاً',      owner: 'الكل', due: 'الخميس',  done: false },
];

// ── Toolbar ───────────────────────────────
type MeetView = 'upload' | 'history';

function MeetingsToolbar({
  view, onView, onExport, onAi,
}: {
  view: MeetView;
  onView: (v: MeetView) => void;
  onExport: () => void;
  onAi: () => void;
}) {
  const { toast } = useToast();
  return (
    <>
      <ToolbarSection align="left">
        <Button variant={view === 'upload' ? 'accent' : 'ghost'} size="sm"
          onClick={() => onView('upload')}>⬆ رفع ملف</Button>
        <Button variant={view === 'history' ? 'accent' : 'ghost'} size="sm"
          onClick={() => onView('history')}>📂 السابقة</Button>
        <Button variant="ghost" size="sm" onClick={() => toast('🌐 سيتوفر قريباً…')}>🌐 رابط Zoom</Button>
        <Button variant="ghost" size="sm" onClick={() => toast('🎤 سيتوفر قريباً…')}>🎤 تسجيل مباشر</Button>
        <ToolbarDivider />
        <Button variant="ghost" size="sm" onClick={() => toast('🌐 النص متاح بالعربية والإنجليزية')}>
          🌐 عربي ↔ EN
        </Button>
      </ToolbarSection>
      <ToolbarSection align="right">
        <Button variant="ghost" size="sm" onClick={onExport}>📄 تصدير</Button>
        <ToolbarDivider />
        <AiButton onClick={onAi}>مساعدة الذكاء الاصطناعي</AiButton>
      </ToolbarSection>
    </>
  );
}


// ── Main Page ─────────────────────────────
export default function MeetingsPage() {
  const { toast } = useToast();
  const { meetingsHistory, addMeetingHistory, deleteMeetingHistory } = useApp();
  const [state, setState]         = useState<PageState>('upload');
  const [progress, setProg]       = useState(0);
  const [actions, setActions]     = useState<ActionItem[]>(INITIAL_ACTIONS);
  const [tags, setTags]           = useState<Tag[]>(INITIAL_TAGS);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [meetView, setMeetView]   = useState<MeetView>('upload');
  const progRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleShare() {
    const summary = `اجتماع فريق Q3\nالتاريخ: اليوم\nنقاط العمل: ${actions.filter(a=>!a.done).length} مهام معلقة\nتم إنشاؤه بواسطة WorkHub`;
    navigator.clipboard.writeText(summary).then(() => toast('📋 تم نسخ ملخص الاجتماع!')).catch(() => toast('⚠️ تعذّر النسخ'));
  }

  function handleExport() {
    const lines = [
      'ملخص اجتماع فريق Q3',
      '===========================',
      '',
      'نقاط العمل:',
      ...actions.map(a => `${a.done ? '✓' : '□'} ${a.text} (${a.owner} - ${a.due})`),
      '',
      'التاغس:',
      ...tags.map(t => t.label),
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'اجتماع-Q3.txt';
    a.click(); URL.revokeObjectURL(url);
    toast('📄 تم تحميل ملف الاجتماع');
  }

  function startDemo() {
    setState('processing');
    setProg(0);
    const steps = [25, 55, 80, 100];
    let i = 0;
    progRef.current = setInterval(() => {
      if (i < steps.length) {
        setProg(steps[i]);
        i++;
      } else {
        clearInterval(progRef.current!);
        setTimeout(() => {
          setState('result');
          addMeetingHistory({
            id: Date.now().toString(),
            title: 'اجتماع_فريق_Q3.mp3',
            date: new Date().toISOString().split('T')[0],
            duration: '47 دق',
            actionsCount: actions.length,
            status: 'done',
          });
        }, 500);
      }
    }, 800);
  }

  function toggleAction(id: number) {
    setActions(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a));
  }

  function removeTag(label: string) {
    setTags(prev => prev.filter(t => t.label !== label));
  }

  return (
    <Shell
      topbarActions={
        <>
          <Button size="sm" onClick={state === 'result' ? handleShare : () => toast('⚠️ املأ الاجتماع أولاً')}>⬆ مشاركة</Button>
          <Button size="sm" onClick={state === 'result' ? () => { window.print(); toast('🖨️ جارٍ الطباعة…'); } : () => toast('⚠️ املأ الاجتماع أولاً')}>📥 PDF</Button>
          <Button variant="accent" size="sm" onClick={() => toast('◼ Notion: سيتوفر قريباً — اربط حسابك من الإعدادات')}>◼ Notion</Button>

        </>
      }
      toolbar={<MeetingsToolbar view={meetView} onView={v => { setMeetView(v); if (v === 'upload') setState('upload'); }} onExport={handleExport} onAi={() => toast('✦ مساعد WorkHub جاهز…')} />}
    >
      {/* Page Header */}
      <PageHeader
        icon="🎙️"
        iconBg="rgba(108,99,255,.12)"
        title="تلخيص الاجتماعات"
        subtitle="ارفع تسجيلك — الذكاء الاصطناعي يستخرج الملخص ونقاط العمل تلقائياً"
        stats={[
          { num: '2',  label: 'هذا الشهر',   color: 'var(--accent2)' },
          { num: '1',  label: 'متبقي مجاناً', color: 'var(--green)'   },
          { num: '8',  label: 'مهام مُستخرجة',color: 'var(--gold)'    },
        ]}
      />

      {/* History View */}
      {meetView === 'history' ? (
        <div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1rem' }}>📂 سجل الاجتماعات السابقة</div>
          {meetingsHistory.map(h => (
            <div key={h.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.9rem 1.2rem', marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,99,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🎤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.15rem' }}>{h.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-en)' }}>{h.date} — {h.duration} — {h.actionsCount} مهام</div>
              </div>
              <Button size="sm" onClick={() => { setMeetView('upload'); setState('result'); toast('تم فتح الاجتماع ✓'); }}>👁️ عرض</Button>
              <Button size="sm" onClick={() => { deleteMeetingHistory(h.id); toast('🗑 تم الحذف'); }}>❌</Button>
            </div>
          ))}
        </div>
      ) : (
        <div>
      {/* ── UPLOAD ── */}
      {state === 'upload' && (
        <UploadZone onStart={startDemo} />
      )}

      {/* ── PROCESSING ── */}
      {state === 'processing' && (
        <ProcessingCard progress={progress} />
      )}

      {/* ── RESULT ── */}
      {state === 'result' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Split: summary + right panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.2rem', alignItems: 'start' }}>

            {/* Summary card */}
            <Card>
              <CardHeader
                title={<><span>📝</span> ملخص الاجتماع</>}
                actions={
                  <>
                    <Button size="sm" onClick={() => toast('تم النسخ ✓')}>📋 نسخ</Button>
                    <Button size="sm" onClick={() => toast('PDF…')}>⬇ PDF</Button>
                  </>
                }
              />
              <CardBody>
                {/* Tags */}
                <SectionLabel>Tags المستخرجة تلقائياً</SectionLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                  {tags.map(tag => (
                    <span key={tag.label} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.22rem 0.65rem', borderRadius: '100px',
                      fontSize: '0.72rem', fontFamily: 'var(--font-en)', fontWeight: 600,
                      background: tag.bg, color: tag.color,
                      border: `1px solid ${tag.color}40`,
                    }}>
                      {tag.label}
                      <span style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => removeTag(tag.label)}>✕</span>
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      const n = prompt('اسم الـ Tag:');
                      if (n) setTags(prev => [...prev, { label: n, color: 'var(--accent2)', bg: 'rgba(108,99,255,.12)' }]);
                    }}
                    style={{
                      background: 'transparent', border: '1px dashed var(--border2)',
                      color: 'var(--muted)', padding: '0.22rem 0.6rem',
                      borderRadius: '100px', fontSize: '0.72rem', cursor: 'pointer',
                    }}
                  >
                    + إضافة Tag
                  </button>
                </div>

                {/* Summary text */}
                <SectionLabel>الملخص التنفيذي</SectionLabel>
                <p style={{
                  fontSize: '0.88rem', lineHeight: 1.85, fontWeight: 300,
                  marginBottom: '1rem', borderRight: '2px solid rgba(108,99,255,.3)',
                  paddingRight: '0.9rem',
                }}>
                  ناقش الفريق خطة Q3 وتم الاتفاق على إطلاق المنتج الجديد بحلول نهاية سبتمبر.
                  أشار أحمد إلى تأخر في تطوير واجهة المستخدم بسبب نقص في الموارد.
                  قررت سارة مراجعة ميزانية التسويق وتخصيص 15% إضافية لحملة الإطلاق.
                </p>

                {/* Action items */}
                <SectionLabel>نقاط العمل المستخرجة</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {actions.map(a => (
                    <div
                      key={a.id}
                      onClick={() => toggleAction(a.id)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                        padding: '0.6rem 0.9rem', background: 'var(--bg3)',
                        borderRadius: 10, border: '1px solid var(--border)',
                        cursor: 'pointer', transition: 'var(--transition)',
                      }}
                    >
                      <div style={{
                        width: 16, height: 16, borderRadius: 5, flexShrink: 0, marginTop: 2,
                        background: a.done ? 'var(--green)' : 'transparent',
                        border: `1.5px solid ${a.done ? 'var(--green)' : 'var(--border2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.5rem', color: '#fff', fontWeight: 700,
                      }}>
                        {a.done && '✓'}
                      </div>
                      <div style={{
                        fontSize: '0.82rem', flex: 1,
                        textDecoration: a.done ? 'line-through' : 'none',
                        color: a.done ? 'var(--muted)' : 'var(--text)',
                      }}>
                        {a.text}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--muted)', flexShrink: 0 }}>{a.owner}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--muted2)', flexShrink: 0 }}>{a.due}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Right panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <MeetingMeta />
              <SpeakersPanel />
              <AiPanel
                message="لاحظت أن أحمد ذكر تأخراً في التطوير — هل تريد إنشاء مهمة متابعة في تتبع المهام؟"
                chips={[
                  { label: '📋 أضف للمهام',   onClick: () => toast('تمت الإضافة ✓') },
                  { label: '📅 جدول متابعة',  onClick: () => toast('تمت الجدولة ✓') },
                  { label: '📧 أرسل ملخصاً', onClick: () => toast('تم الإرسال ✓')  },
                ]}
              />
            </div>
          </div>

          {/* Transcript */}
          <Card>
            <div
              style={{
                padding: '0.85rem 1.2rem', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', cursor: 'pointer',
              }}
              onClick={() => setTranscriptOpen(o => !o)}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>📄 النص الكامل (Transcript)</span>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{transcriptOpen ? '▲' : '▼'}</span>
            </div>
            {transcriptOpen && (
              <CardBody>
                {[
                  { sp: 'أح', color: 'var(--accent2)', bg: 'rgba(108,99,255,.15)', time: '00:32', text: 'أهلاً بالجميع، نبدأ باجتماع Q3. عندنا ثلاث نقاط رئيسية اليوم.' },
                  { sp: 'سا', color: 'var(--green)',   bg: 'rgba(52,211,153,.12)', time: '01:15', text: 'بالنسبة لخطة التسويق، أقترح زيادة الميزانية 15% للحملة.' },
                  { sp: 'أح', color: 'var(--accent3)', bg: 'rgba(56,189,248,.12)', time: '04:40', text: 'فريق التطوير محتاج مطور إضافي. واجهة المستخدم متأخرة أسبوعين.' },
                ].map((line, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.85rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: line.bg, color: line.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, flexShrink: 0 }}>{line.sp}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted2)', fontFamily: 'var(--font-en)', flexShrink: 0, paddingTop: 3, width: 35 }}>{line.time}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6, flex: 1 }}>{line.text}</div>
                  </div>
                ))}
              </CardBody>
            )}
          </Card>

          <div style={{ textAlign: 'center' }}>
            <Button onClick={() => { setState('upload'); setProg(0); }}>🎙️ تلخيص اجتماع جديد</Button>
          </div>
        </div>
      )}
      </div>
      )}

    </Shell>
  );
}


// ── Sub-components ────────────────────────

function UploadZone({ onStart }: { onStart: () => void }) {
  return (
    <div
      onClick={onStart}
      style={{
        border: '1.5px dashed rgba(108,99,255,.35)', borderRadius: 18,
        background: 'rgba(108,99,255,.04)', padding: '2.5rem 2rem',
        textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,.08)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(108,99,255,.04)')}
    >
      <div style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>🎙️</div>
      <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>اسحب وأفلت ملفك هنا</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1rem' }}>MP3 · MP4 · WAV · M4A · WEBM</div>
      <Button variant="primary" onClick={e => { e.stopPropagation(); onStart(); }}>
        🎙️ جرّب مع ملف تجريبي
      </Button>
    </div>
  );
}

function ProcessingCard({ progress }: { progress: number }) {
  return (
    <Card>
      <CardBody>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '1.1rem' }}>🎙️</div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.15rem' }}>اجتماع_فريق_Q3.mp3</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>24.3 MB · 47 دقيقة</div>
          </div>
          <span style={{ marginRight: 'auto', fontSize: '0.72rem', background: 'rgba(108,99,255,.15)', color: 'var(--accent2)', padding: '0.15rem 0.6rem', borderRadius: 100 }}>
            جارٍ المعالجة…
          </span>
        </div>
        {['رفع الملف', 'تفريغ الصوت إلى نص', 'تحليل المحتوى', 'تصنيف Tags'].map((step, i) => {
          const done  = progress > (i + 1) * 25;
          const active = !done && progress > i * 25;
          return (
            <div key={step} style={{
              display: 'flex', alignItems: 'center', gap: '0.8rem',
              padding: '0.6rem 0.9rem', background: 'var(--bg3)',
              borderRadius: 10, border: '1px solid var(--border)', marginBottom: '0.5rem',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem',
                background: done ? 'rgba(52,211,153,.15)' : active ? 'rgba(108,99,255,.15)' : 'var(--bg4)',
                color: done ? 'var(--green)' : active ? 'var(--accent2)' : 'var(--muted2)',
              }}>
                {done ? '✓' : active ? '◌' : '○'}
              </div>
              <span style={{ fontSize: '0.82rem' }}>{step}</span>
            </div>
          );
        })}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ height: 4, background: 'var(--bg)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: 4, borderRadius: 2, width: `${progress}%`, background: 'linear-gradient(90deg,var(--accent2),var(--accent3))', transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
            <span>جارٍ المعالجة…</span>
            <span>{progress}%</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function MeetingMeta() {
  const rows = [
    ['الملف', 'اجتماع_Q3.mp3'], ['المدة', '47:23'], ['المتحدثون', '3'],
    ['اللغة', 'عربي'], ['الكلمات', '6,842'], ['نقاط العمل', '4'], ['القرارات', '3'],
  ];
  return (
    <Card>
      <CardHeader title="📋 معلومات الاجتماع" />
      <CardBody>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.38rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>{k}</span>
            <span style={{ fontWeight: 500, fontFamily: 'var(--font-en)' }}>{v}</span>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

function SpeakersPanel() {
  const speakers = [
    { init: 'أح', name: 'أحمد — مطور',  pct: 55, color: 'var(--accent2)', bg: 'rgba(108,99,255,.15)', dur: '26 دق' },
    { init: 'سا', name: 'سارة — تسويق', pct: 30, color: 'var(--green)',   bg: 'rgba(52,211,153,.12)', dur: '14 دق' },
    { init: 'نو', name: 'نورة — مشاريع',pct: 15, color: 'var(--gold)',    bg: 'rgba(245,158,11,.12)', dur: '7 دق'  },
  ];
  return (
    <Card>
      <CardHeader title="👥 المتحدثون" actions={<span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>تعرف تلقائي</span>} />
      <CardBody>
        {speakers.map(s => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.45rem 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>{s.init}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{s.name}</div>
              <div style={{ height: 3, background: 'var(--bg3)', borderRadius: 2, marginTop: 3 }}>
                <div style={{ height: 3, borderRadius: 2, width: `${s.pct}%`, background: s.color }} />
              </div>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--muted)', flexShrink: 0 }}>{s.dur}</div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
