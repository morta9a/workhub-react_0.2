import React, { useState, useEffect, useRef } from 'react';
import { Shell } from '../components/layout/Shell';
import {
  Button, AiButton, ToolbarSection, ToolbarDivider,
  PageHeader, Card, CardHeader, CardBody, SectionLabel,
} from '../components/ui';
import { useToast } from '../hooks/useToast';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { InvoiceDesign } from '../components/invoice/InvoiceDesign';
import type { InvoiceItem, InvoiceStatus, SavedInvoice } from '../types';

// ── Currency config ──────────────────────
const RATES: Record<string, number> = {
  IQD: 1, USD: 1310, SAR: 349, AED: 357, EGP: 27, EUR: 1425,
};
const CURRENCIES = [
  { code: 'IQD', sym: 'د.ع', primary: true },
  { code: 'USD', sym: '$', primary: true },
  { code: 'SAR', sym: '﷼', primary: false },
  { code: 'AED', sym: 'AED', primary: false },
  { code: 'EGP', sym: 'EGP', primary: false },
  { code: 'EUR', sym: '€', primary: false },
];

const STATUS_MAP: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'مسودة', color: '#6c63ff', bg: 'rgba(108,99,255,.15)' },
  time: { label: 'فاتورة ساعات', color: '#a855f7', bg: 'rgba(168,85,247,.15)' },
  sent: { label: 'مُرسلة ✉', color: '#38bdf8', bg: 'rgba(56,189,248,.12)' },
  paid: { label: 'مدفوعة ✓', color: '#059669', bg: 'rgba(52,211,153,.15)' },
  overdue: { label: 'متأخرة !', color: '#ef4444', bg: 'rgba(248,113,113,.12)' },
};

type InvView = 'form' | 'all' | 'pending' | 'overdue';

function InvoicesToolbar({
  view, onView, onNew, onReport, onClear, onAi, counts
}: {
  view: InvView; onView: (v: InvView) => void; onNew: () => void; onReport: () => void; onClear: () => void; onAi: () => void; counts: { pending: number; overdue: number };
}) {
  return (
    <>
      <ToolbarSection align="left">
        <Button size="sm" variant={view === 'form' ? 'accent' : 'ghost'} onClick={onNew}>➕ جديدة</Button>
        {([
          { id: 'all' as InvView, label: '📂 الكل' },
          { id: 'pending' as InvView, label: `⏳ معلّقة (${counts.pending})` },
          { id: 'overdue' as InvView, label: `🔴 متأخرة (${counts.overdue})` },
        ]).map(({ id, label }) => (
          <Button key={id} size="sm" variant={view === id ? 'accent' : 'ghost'} onClick={() => onView(id)}>{label}</Button>
        ))}
        <ToolbarDivider />
        <Button size="sm" variant="ghost" onClick={onReport}>📊 تقرير</Button>
      </ToolbarSection>
      <ToolbarSection align="right">
        <Button size="sm" variant="ghost" onClick={onClear}>🗑 مسح</Button>
        <ToolbarDivider />
        <AiButton onClick={onAi}>اقتراح ذكي</AiButton>
      </ToolbarSection>
    </>
  );
}

export default function InvoicesPage() {
  const { toast } = useToast();
  const { savedInvoices, addInvoice, deleteInvoice, invoiceSettings, updateInvoiceSettings } = useApp();
  const { user } = useAuth();
  const previewRef = useRef<HTMLDivElement>(null);

  const [invView, setInvView] = useState<InvView>('form');
  const [reportOpen, setReportOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState('');
  const [sending, setSending] = useState(false);

  const [invNum, setInvNum] = useState('INV-2025-007');
  const [invDate, setInvDate] = useState('');
  const [invDue, setInvDue] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('paid');
  const [myName, setMyName] = useState('WorkHub Platform');
  const [myEmail, setMyEmail] = useState('contact@workhub.io');
  const [clientName, setClientName] = useState('شركة التقنية العربية');
  const [clientDet, setClientDet] = useState('الرياض، المملكة العربية السعودية');
  const [taxRate, setTaxRate] = useState(15);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [storeId, setStoreId] = useState('S1');
  const [dealerNo, setDealerNo] = useState('242');
  const [currency, setCurrency] = useState({ code: 'IQD', sym: 'د.ع', rate: 1 });
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, description: 'خدمات برمجية - تطوير واجهات', qty: 1, price: 850000, store: 'S1', expiry: '2027/12', company: 'TechCorp', bonus: 0 },
    { id: 2, description: 'دعم فني وصيانة شهرية', qty: 1, price: 200000, store: 'S1', expiry: '-', company: 'TechCorp', bonus: 0 },
  ]);
  const [nextItemId, setNextItemId] = useState(10);

  useEffect(() => {
    const today = new Date();
    const due = new Date(); due.setDate(due.getDate() + 14);
    setInvDate(today.toISOString().split('T')[0]);
    setInvDue(due.toISOString().split('T')[0]);
  }, []);

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const tax = subtotal * (taxRate / 100);
  const disc = subtotal * (discount / 100);
  const grand = subtotal + tax - disc;

  function fmt(n: number) {
    const converted = n * currency.rate;
    const isIQD = currency.code === 'IQD';
    return currency.sym + ' ' + converted.toLocaleString('en', { minimumFractionDigits: isIQD ? 0 : 2, maximumFractionDigits: isIQD ? 0 : 2 });
  }

  function handleNew() { setInvNum('INV-' + String(Math.floor(Math.random() * 900000) + 100000)); setClientName(''); setClientDet(''); setStoreId('S1'); setDealerNo('242'); setItems([{ id: 1, description: '', qty: 1, price: 0, store: 'S1', expiry: '', company: '', bonus: 0 }]); setInvView('form'); toast('✨ نموذج جديد'); }
  function saveInvoice() { addInvoice({ id: invNum, client: clientName || 'عميل غير محدد', amount: grand, status, date: invDate, currency: currency.code, storeId, dealerNo, items }); toast('✅ تم حفظ الفاتورة ' + invNum); }
  function handleSend() { if (!sendEmail.trim()) { toast('⚠️ أدخل البريد الإلكتروني'); return; } setSending(true); setTimeout(() => { setSending(false); setSendOpen(false); setStatus('sent'); toast('✅ تم إرسال الفاتورة'); }, 1500); }

  function handlePdf() {
    const el = previewRef.current; if (!el) return;
    const printWin = window.open('', '_blank', 'width=850,height=1100'); if (!printWin) { toast('⚠️ السماح بالنوافذ المنبثقة'); return; }
    printWin.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>${invNum}</title><link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;700&display=swap" rel="stylesheet"><style>@page { size: A4; margin: 0; } body { margin: 0; padding: 0; width: 210mm; height: 297mm; overflow: hidden; background: #fff; } .print-container { width: 210mm; height: 297mm; display: block; position: relative; } svg { width: 100%; height: 100%; display: block; } </style></head><body><div class="print-container">${el.innerHTML}</div></body></html>`);
    printWin.document.close(); setTimeout(() => { printWin.focus(); printWin.print(); }, 1000);
  }

  function addItem() { setItems(prev => [...prev, { id: nextItemId, description: '', qty: 1, price: 0, store: 'S1', expiry: '', company: '', bonus: 0 }]); setNextItemId(n => n + 1); }
  function updateItem(id: number, field: keyof InvoiceItem, val: string | number) { setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i)); }
  function removeItem(id: number) { setItems(prev => prev.filter(i => i.id !== id)); }

  const inp: React.CSSProperties = { background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ar)', fontSize: '0.75rem', outline: 'none', width: '100%' };

  const [layout, setLayout] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      const saved = localStorage.getItem('invoice_layout');
      return saved ? JSON.parse(saved) : {
        client: { x: 0, y: 0 },
        invoice: { x: 0, y: 0 },
        table: { x: 0, y: 0 },
        totals: { x: 0, y: 0 },
        footer: { x: 0, y: 0 },
      };
    } catch {
      return { client: { x: 0, y: 0 }, invoice: { x: 0, y: 0 }, table: { x: 0, y: 0 }, totals: { x: 0, y: 0 }, footer: { x: 0, y: 0 } };
    }
  });

  const [logoUrl, setLogoUrl] = useState<string>(() => localStorage.getItem('invoice_logo') || '');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoUrl(base64);
        localStorage.setItem('invoice_logo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const [customText, setCustomText] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('invoice_text');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  
  const [hiddenFields, setHiddenFields] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('invoice_hidden');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // History for Undo/Redo
  const [history, setHistory] = useState<{ layout: any, text: any, hidden: string[] }[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const [designMode, setDesignMode] = useState(false);
  const [dragging, setDragging] = useState<{ section: string; startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  useEffect(() => {
    if (invoiceSettings && Object.keys(invoiceSettings.layout || {}).length > 0) {
      setLayout(invoiceSettings.layout as Record<string, { x: number; y: number }>);
      setCustomText(invoiceSettings.customText);
      setHiddenFields(invoiceSettings.hiddenFields);
      setLogoUrl(invoiceSettings.logoUrl);
    }
  }, [invoiceSettings]);

  function saveToHistory(newLayout: any, newText: any, newHidden: string[]) {
    const entry = {
      layout: JSON.parse(JSON.stringify(newLayout)),
      text: JSON.parse(JSON.stringify(newText)),
      hidden: [...newHidden]
    };
    const newHistory = history.slice(0, historyIdx + 1);
    newHistory.push(entry);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  }

  function undo() {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setLayout(prev.layout);
      setCustomText(prev.text);
      setHiddenFields(prev.hidden);
      setHistoryIdx(historyIdx - 1);
    }
  }

  function redo() {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setLayout(next.layout);
      setCustomText(next.text);
      setHiddenFields(next.hidden);
      setHistoryIdx(historyIdx + 1);
    }
  }

  // Initial history entry
  useEffect(() => {
    if (history.length === 0) {
      saveToHistory(layout, customText, hiddenFields);
    }
  }, []);


  function handleMoveStart(section: string, e: React.MouseEvent) {
    if (!designMode) return;
    const current = (layout as any)[section] || { x: 0, y: 0 };
    setDragging({
      section,
      startX: e.clientX,
      startY: e.clientY,
      initialX: current.x,
      initialY: current.y,
    });
  }

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragging.startX;
      const dy = e.clientY - dragging.startY;

      setLayout(prev => {
        const newLayout = { ...prev };
        (newLayout as any)[dragging.section] = {
          x: dragging.initialX + dx,
          y: dragging.initialY + dy
        };
        return newLayout;
      });
    };

    const handleUp = () => {
      if (dragging) {
        saveToHistory(layout, customText, hiddenFields);
      }
      setDragging(null);
    };


    if (dragging) {
      window.addEventListener('mousemove', handleMove, { passive: true });
      window.addEventListener('mouseup', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, layout, customText]);

  function handleTextEdit(key: string, oldVal: string) {
    if (!designMode) return;
    const newVal = prompt(`تعديل النص: (${oldVal})`, oldVal);
    if (newVal !== null) {
      const nextText = { ...customText, [key]: newVal };
      setCustomText(nextText);
      saveToHistory(layout, nextText, hiddenFields);
    }
  }

  function updateLayout(section: string, axis: 'x' | 'y', val: number) {
    const nextLayout = { ...layout, [section]: { ...((layout as any)[section] || { x: 0, y: 0 }), [axis]: val } };
    setLayout(nextLayout);
    saveToHistory(nextLayout, customText, hiddenFields);
  }

  function toggleField(key: string) {
    setHiddenFields(prev => {
      const next = prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key];
      saveToHistory(layout, customText, next);
      return next;
    });
  }
  const pendingInvoices = savedInvoices.filter(i => i.status !== 'paid');
  const overdueInvoices = savedInvoices.filter(i => i.status === 'overdue');
  const filteredInvoices = invView === 'pending' ? pendingInvoices : invView === 'overdue' ? overdueInvoices : savedInvoices;

  const isAdmin = user?.email === 'admin@workhub.io';
  const isPro = user?.plan === 'pro';
  const isEnterpriseAdmin = user?.plan === 'enterprise' && user?.role === 'admin';
  const canEditDesign = isAdmin || isPro || isEnterpriseAdmin;

  return (
    <Shell
      topbarActions={<>
        {canEditDesign && (
          designMode ? (
            <>
              <button onClick={undo} disabled={historyIdx <= 0} style={{ background: 'rgba(255,255,255,0.05)', color: historyIdx <= 0 ? '#555' : '#fff', border: '1px solid var(--border)', padding: '0.28rem 0.6rem', borderRadius: 6, marginRight: 8, cursor: 'pointer', fontSize: '0.75rem' }}>↩️ تراجع</button>
              <button onClick={redo} disabled={historyIdx >= history.length - 1} style={{ background: 'rgba(255,255,255,0.05)', color: historyIdx >= history.length - 1 ? '#555' : '#fff', border: '1px solid var(--border)', padding: '0.28rem 0.6rem', borderRadius: 6, marginRight: 8, cursor: 'pointer', fontSize: '0.75rem' }}>↪️ إعادة</button>
              <button onClick={() => { setDesignMode(false); updateInvoiceSettings({ layout, customText, hiddenFields, logoUrl }); toast('✅ تم حفظ التصميم في حسابك بنجاح'); }} style={{ background: 'rgba(52,211,153,.15)', color: 'var(--green)', border: '1px solid rgba(52,211,153,.3)', padding: '0.28rem 0.9rem', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ar)' }}>✅ حفظ التعديلات</button>
            </>
          ) : (
            <button onClick={() => setDesignMode(true)} style={{ background: 'rgba(108,99,255,.12)', color: '#a78bfa', border: '1px solid rgba(108,99,255,.3)', padding: '0.28rem 0.9rem', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ar)' }}>🎨 وضع التصميم</button>
          )
        )}
        {[{ label: '📄 PDF', fn: handlePdf, bg: 'rgba(108,99,255,.12)', color: '#a78bfa', border: 'rgba(108,99,255,.3)' }].map(b => (<button key={b.label} onClick={b.fn} style={{ background: b.bg, color: b.color, border: `1px solid ${b.border}`, padding: '0.28rem 0.9rem', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ar)', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>{b.label}</button>))}
      </>}

      toolbar={<InvoicesToolbar view={invView} onView={setInvView} onNew={handleNew} onReport={() => setReportOpen(true)} onClear={() => setItems([])} onAi={() => { }} counts={{ pending: pendingInvoices.length, overdue: overdueInvoices.length }} />}
    >
      <style>{`
        .inv-main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; align-items: stretch; }
        .inv-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; flex-shrink: 0; }
        .inv-form-grid-small { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem; }
        @media (max-width: 768px) {
          .inv-main-grid, .inv-form-grid, .inv-form-grid-small { grid-template-columns: 1fr; }
        }
      `}</style>
      <PageHeader title="نظام الفواتير المطور" subtitle="إدارة المبيعات والمخازن بدقة واحترافية" icon="📄" />

      {invView === 'form' && (
        <div className="inv-main-grid">
          <Card style={{ height: '90vh' }}>
            <CardHeader title="تعديل الفاتورة" />
            <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', height: 'calc(90vh - 60px)', overflow: 'hidden', paddingBottom: 0 }}>
              <div className="inv-form-grid">
                <label style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>التاريخ / Date <input type="date" style={inp} value={invDate} onChange={e => setInvDate(e.target.value)} /></label>
                <label style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>الاسم / Name <input style={inp} value={clientName} onChange={e => setClientName(e.target.value)} /></label>
              </div>

              <div className="inv-form-grid">
                <label style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>رقم المخزن / Store ID <input style={inp} value={storeId} onChange={e => setStoreId(e.target.value)} /></label>
                <label style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>العنوان / Address <input style={inp} value={clientDet} onChange={e => setClientDet(e.target.value)} /></label>
              </div>

              <div className="inv-form-grid">
                <label style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>العملة / Currency 
                  <select 
                    style={inp} 
                    value={currency.code} 
                    onChange={e => {
                      const c = CURRENCIES.find(curr => curr.code === e.target.value);
                      if (c) setCurrency({ code: c.code, sym: c.sym, rate: RATES[c.code] });
                    }}
                  >
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.sym})</option>)}
                  </select>
                </label>
                <label style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>رمز العميل / Dealer No. <input style={inp} value={dealerNo} onChange={e => setDealerNo(e.target.value)} /></label>
              </div>

              <SectionLabel>الأصناف</SectionLabel>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: '0.15rem', background: 'var(--bg2)', flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', minWidth: 600, fontSize: '0.65rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)', position: 'sticky', top: 0, zIndex: 10 }}>
                      <th style={{ textAlign: 'right', padding: '0.5rem 0.3rem' }}>الوصف</th>
                      <th style={{ width: 50 }}>مخزن</th>
                      <th style={{ width: 70 }}>انتهاء</th>
                      <th style={{ width: 40 }}>كمية</th>
                      <th style={{ width: 70 }}>سعر</th>
                      <th style={{ width: 25 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border2)' }}>
                        <td style={{ padding: '0.15rem' }}><input style={{ ...inp, padding: '0.2rem 0.4rem', background: 'transparent' }} value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} /></td>
                        <td style={{ padding: '0.15rem' }}><input style={{ ...inp, padding: '0.2rem 0.4rem', background: 'transparent', textAlign: 'center' }} value={item.store} onChange={e => updateItem(item.id, 'store', e.target.value)} /></td>
                        <td style={{ padding: '0.15rem' }}><input style={{ ...inp, padding: '0.2rem 0.4rem', background: 'transparent', textAlign: 'center' }} value={item.expiry} onChange={e => updateItem(item.id, 'expiry', e.target.value)} /></td>
                        <td style={{ padding: '0.15rem' }}><input type="number" style={{ ...inp, padding: '0.2rem 0.4rem', background: 'transparent', textAlign: 'center' }} value={item.qty} onChange={e => updateItem(item.id, 'qty', +e.target.value)} /></td>
                        <td style={{ padding: '0.15rem' }}><input type="number" style={{ ...inp, padding: '0.2rem 0.4rem', background: 'transparent', textAlign: 'center' }} value={item.price} onChange={e => updateItem(item.id, 'price', +e.target.value)} /></td>
                        <td style={{ padding: '0.15rem', textAlign: 'center' }}><button onClick={() => removeItem(item.id)} style={{ color: 'var(--coral)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button size="sm" variant="ghost" onClick={addItem} style={{ width: '100%', border: '1px dashed var(--border)', flexShrink: 0 }}>＋ إضافة بند جديد</Button>

              <div style={{ background: 'var(--bg3)', padding: '0.8rem', borderRadius: 12, flexShrink: 0, marginTop: '0.5rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}><span style={{ color: 'var(--muted)' }}>المجموع</span><span>{fmt(subtotal)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--accent)' }}><span>الضريبة ({taxRate}%)</span><span>{fmt(tax)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--coral)' }}><span>الخصم ({discount}%)</span><span>-{fmt(disc)}</span></div>
                  </div>
                  <div style={{ borderRight: '1px solid var(--border)', paddingRight: '0.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>الإجمالي النهائي</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--green)' }}>{fmt(grand)}</div>
                  </div>
                </div>

                <div className="inv-form-grid-small">
                  <label style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>الضريبة % <input type="number" style={{ ...inp, padding: '0.2rem' }} value={taxRate} onChange={e => setTaxRate(+e.target.value)} /></label>
                  <label style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>الخصم % <input type="number" style={{ ...inp, padding: '0.2rem' }} value={discount} onChange={e => setDiscount(+e.target.value)} /></label>
                </div>

                <textarea style={{ ...inp, height: 70, resize: 'none', fontSize: '0.7rem', marginTop: '0.4rem' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="ملاحظات الفاتورة..." />

                <Button variant="accent" onClick={saveInvoice} style={{ width: '100%', marginTop: '0.6rem' }}>💾 حفظ الفاتورة النهائية</Button>
              </div>
            </CardBody>



          </Card>

          <Card style={{ height: '90vh' }}>
            <CardHeader title="معاينة حية (A4)" actions={designMode ? <span style={{ fontSize: '0.65rem', color: 'var(--accent)' }}>✨ جرب تحريك الحقول بالأسفل</span> : null} />
            <CardBody style={{ padding: '1rem', background: '#ccc', height: 'calc(90vh - 60px)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', overflowX: 'auto' }}>
              {designMode && (
                <div style={{ width: '100%', background: 'var(--bg2)', padding: '1rem', borderRadius: 12, marginBottom: '1rem', border: '1px solid var(--accent)', boxShadow: '0 4px 20px rgba(108,99,255,.15)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🎨 لوحة التحكم في التصميم <span style={{ fontWeight: 400, fontSize: '0.65rem', color: 'var(--muted)' }}>(استخدم الأسهم للضبط الدقيق)</span></div>
                    <label style={{ cursor: 'pointer', padding: '0.3rem 0.6rem', borderRadius: 6, background: 'rgba(108,99,255,.1)', border: '1px solid var(--accent)', fontSize: '0.65rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      🖼️ {logoUrl ? 'تغيير الشعار' : 'رفع الشعار'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                    </label>
                  </div>
                  <div className="inv-form-grid" style={{ gap: '0.8rem' }}>
                    {(Object.keys(layout) as (keyof typeof layout)[]).map(section => (
                      <div key={section} style={{ background: 'var(--bg3)', padding: '0.6rem', borderRadius: 8 }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '0.4rem', textTransform: 'capitalize' }}>
                          {section === 'client' ? 'بيانات العميل' : section === 'invoice' ? 'بيانات الفاتورة' : section === 'table' ? 'الجدول' : section === 'totals' ? 'الإجماليات' : 'التذييل'}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.6rem' }}>X:</span>
                          <input type="range" min="-100" max="100" value={layout[section].x} onChange={e => updateLayout(section, 'x', +e.target.value)} style={{ flex: 1 }} />
                          <input type="number" value={layout[section].x} onChange={e => updateLayout(section, 'x', +e.target.value)} style={{ width: 40, fontSize: '0.65rem', background: 'transparent', border: 'none', color: 'var(--accent)' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.3rem' }}>
                          <span style={{ fontSize: '0.6rem' }}>Y:</span>
                          <input type="range" min="-100" max="100" value={layout[section].y} onChange={e => updateLayout(section, 'y', +e.target.value)} style={{ flex: 1 }} />
                          <input type="number" value={layout[section].y} onChange={e => updateLayout(section, 'y', +e.target.value)} style={{ width: 40, fontSize: '0.65rem', background: 'transparent', border: 'none', color: 'var(--accent)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setLayout({ client: { x: 0, y: 0 }, invoice: { x: 0, y: 0 }, table: { x: 0, y: 0 }, totals: { x: 0, y: 0 }, footer: { x: 0, y: 0 } }); setCustomText({}); setHiddenFields([]); setLogoUrl(''); updateInvoiceSettings({ layout: { client: { x: 0, y: 0 }, invoice: { x: 0, y: 0 }, table: { x: 0, y: 0 }, totals: { x: 0, y: 0 }, footer: { x: 0, y: 0 } }, customText: {}, hiddenFields: [], logoUrl: '' }); toast('🔄 تمت إعادة الضبط بالكامل'); }} style={{ marginTop: '0.8rem', width: '100%', padding: '0.4rem', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: '0.7rem', cursor: 'pointer' }}>🔄 إعادة ضبط المصنع</button>
                </div>
              )}
              <div ref={previewRef} style={{ width: '210mm', minWidth: '210mm', height: '297mm', background: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.2)', flexShrink: 0 }}>
                <InvoiceDesign
                  invNum={invNum}
                  invDate={invDate}
                  myName={myName}
                  myEmail={myEmail}
                  clientName={clientName}
                  clientDet={clientDet}
                  status={status}
                  items={items}
                  subtotal={subtotal}
                  tax={tax}
                  taxRate={taxRate}
                  discount={disc}
                  discountRate={discount}
                  logoUrl={logoUrl}
                  grand={grand}
                  currencySym={currency.sym}
                  notes={notes}
                  storeId={storeId}
                  dealerNo={dealerNo}
                  offsets={layout}
                  designMode={designMode}
                  onTextEdit={handleTextEdit}
                  onMoveStart={handleMoveStart}
                  onToggleField={toggleField}
                  customText={customText}
                  hiddenFields={hiddenFields}
                />

              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {invView !== 'form' && (
        <Card style={{ minHeight: '80vh' }}>
          <CardHeader title={invView === 'all' ? 'جميع الفواتير' : invView === 'pending' ? 'الفواتير المعلّقة' : 'الفواتير المتأخرة'} />
          <CardBody>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'right' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                    <th style={{ padding: '1rem' }}>رقم الفاتورة</th>
                    <th style={{ padding: '1rem' }}>العميل</th>
                    <th style={{ padding: '1rem' }}>التاريخ</th>
                    <th style={{ padding: '1rem' }}>المبلغ</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>الحالة</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border2)' }}>
                      <td style={{ padding: '1rem' }}>{inv.id}</td>
                      <td style={{ padding: '1rem' }}>{inv.client}</td>
                      <td style={{ padding: '1rem' }}>{inv.date}</td>
                      <td style={{ padding: '1rem', color: 'var(--gold)' }}>{inv.amount.toLocaleString()} {inv.currency}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ background: STATUS_MAP[inv.status]?.bg, color: STATUS_MAP[inv.status]?.color, padding: '0.3rem 0.6rem', borderRadius: 100, fontSize: '0.7rem' }}>
                          {STATUS_MAP[inv.status]?.label}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <Button size="sm" variant="ghost" onClick={() => deleteInvoice(inv.id)} style={{ color: 'var(--coral)' }}>حذف</Button>
                      </td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>لا توجد فواتير مطابقة</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {reportOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg2)', padding: '2rem', borderRadius: 12, width: 400, maxWidth: '90%', border: '1px solid var(--border)' }}>
            <h3 style={{ marginTop: 0, color: 'var(--accent)', marginBottom: '1.5rem', fontFamily: 'var(--font-ar)' }}>📊 تقرير الفواتير</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted)' }}>إجمالي عدد الفواتير:</span>
              <span style={{ fontWeight: 'bold' }}>{savedInvoices.length}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted)' }}>إجمالي المبالغ المدفوعة:</span>
              <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>
                {savedInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0).toLocaleString()}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', marginBottom: '1.5rem' }}>
              <span style={{ color: 'var(--muted)' }}>إجمالي المبالغ المعلّقة:</span>
              <span style={{ color: 'var(--coral)', fontWeight: 'bold' }}>
                {savedInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0).toLocaleString()}
              </span>
            </div>

            <Button variant="accent" onClick={() => setReportOpen(false)} style={{ width: '100%' }}>إغلاق</Button>
          </div>
        </div>
      )}
    </Shell>
  );
}
