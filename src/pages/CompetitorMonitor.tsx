import React, { useState } from 'react';
import { Shell } from '../components/layout/Shell';
import { Button, PageHeader, Card, CardBody } from '../components/ui';
import { useToast } from '../hooks/useToast';
import { useApp } from '../contexts/AppContext';
import type { Competitor, ThreatLevel } from '../types';

const THREAT_LEVELS: { id: ThreatLevel | 'all'; label: string; color: string; bg: string }[] = [
  { id: 'all', label: 'الكل', color: 'var(--text)', bg: 'var(--bg3)' },
  { id: 'high', label: 'خطر عالي 🚨', color: '#ef4444', bg: 'rgba(239,68,68,.1)' },
  { id: 'medium', label: 'منافسة متوسطة ⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,.1)' },
  { id: 'low', label: 'خطر منخفض 🟢', color: '#10b981', bg: 'rgba(16,185,129,.1)' },
];

export default function CompetitorMonitor() {
  const { toast } = useToast();
  const { competitors, addCompetitor, updateCompetitor, deleteCompetitor } = useApp();
  
  const [search, setSearch] = useState('');
  const [filterThreat, setFilterThreat] = useState<ThreatLevel | 'all'>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Competitor>>({});

  const filteredCompetitors = competitors.filter(c => {
    if (filterThreat !== 'all' && c.threatLevel !== filterThreat) return false;
    if (search && !c.name.includes(search) && !c.notes.includes(search)) return false;
    return true;
  });

  const handleOpenModal = (c?: Competitor) => {
    if (c) {
      setEditingId(c.id);
      setForm({ ...c });
    } else {
      setEditingId(null);
      setForm({
        name: '', website: '', threatLevel: 'medium', strengths: '', weaknesses: '', notes: ''
      });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name) {
      toast('⚠️ يرجى إدخال اسم المنافس');
      return;
    }

    if (editingId) {
      updateCompetitor(editingId, form);
      toast('✅ تم تحديث بيانات المنافس');
    } else {
      const newCompetitor: Competitor = {
        ...(form as Competitor)
      };
      addCompetitor(newCompetitor);
      toast('✅ تم إضافة المنافس بنجاح');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنافس؟')) {
      deleteCompetitor(id);
      toast('🗑 تم حذف المنافس');
    }
  };

  const openWebsite = (url: string) => {
    if (!url) return;
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(finalUrl, '_blank');
  };

  return (
    <Shell
      topbarActions={
        <Button variant="accent" size="sm" onClick={() => handleOpenModal()}>منافس جديد 🎯</Button>
      }
    >
      <PageHeader
        icon="🔔"
        iconBg="rgba(239,68,68,.12)"
        title="مراقبة المنافسين"
        subtitle="غرفة العمليات الاستراتيجية: تتبع أداء منافسيك ونقاط ضعفهم في السوق"
      />

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="🔍 بحث عن منافس..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {THREAT_LEVELS.map(t => (
            <Button key={t.id} size="sm" variant={filterThreat === t.id ? 'accent' : 'ghost'} onClick={() => setFilterThreat(t.id as any)} style={filterThreat === t.id ? { background: t.bg, color: t.color, border: `1px solid ${t.color}` } : {}}>
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {filteredCompetitors.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
          {filteredCompetitors.map(c => {
            const threat = THREAT_LEVELS.find(t => t.id === c.threatLevel) || THREAT_LEVELS[2];
            return (
              <Card key={c.id} style={{ position: 'relative', overflow: 'hidden', border: `1px solid ${threat.color}44`, transition: 'transform 0.2s', background: `linear-gradient(to bottom, ${threat.bg}11, var(--bg2))` }}>
                <CardBody style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 0.3rem 0', color: 'var(--text)' }}>{c.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: threat.color, display: 'flex', alignItems: 'center', gap: '0.3rem', background: threat.bg, padding: '0.2rem 0.6rem', borderRadius: '100px', width: 'fit-content', fontWeight: 'bold' }}>
                        {threat.label}
                      </div>
                    </div>
                    {c.website && (
                      <Button variant="ghost" size="sm" onClick={() => openWebsite(c.website)} style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', background: 'var(--bg3)' }}>
                        الموقع 🔗
                      </Button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.8rem', borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--green)', marginBottom: '0.5rem' }}>💪 نقاط القوة</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>{c.strengths || 'غير محدد'}</div>
                    </div>
                    <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.8rem', borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--coral)', marginBottom: '0.5rem' }}>📉 نقاط الضعف</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>{c.weaknesses || 'غير محدد'}</div>
                    </div>
                  </div>

                  {c.notes && (
                    <div style={{ marginBottom: '1.5rem', padding: '0.8rem', background: 'var(--bg3)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--muted)', borderRight: `3px solid ${threat.color}` }}>
                      <strong>📝 ملاحظات:</strong> {c.notes}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div style={{ marginTop: 'auto' }}>
                    <Button variant="ghost" size="sm" style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }} onClick={() => handleOpenModal(c)}>تعديل التحليل ✏️</Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', background: 'var(--bg2)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <div>لا يوجد منافسين مطابقين للبحث</div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'var(--bg)', borderRadius: '20px', border: '1px solid var(--border)',
            width: '550px', maxWidth: '90%', padding: '1.8rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>
              {editingId ? 'تعديل تحليل المنافس' : 'إضافة منافس جديد'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>اسم المنافس / الشركة</label>
                  <input type="text" value={form.name || ''} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="مثال: شركة ألفا"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>مستوى الخطر</label>
                  <select value={form.threatLevel || 'medium'} onChange={(e) => setForm({...form, threatLevel: e.target.value as ThreatLevel})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                  >
                    {THREAT_LEVELS.filter(t => t.id !== 'all').map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>رابط الموقع / حساب التواصل</label>
                <input type="text" value={form.website || ''} onChange={(e) => setForm({...form, website: e.target.value})} placeholder="instagram.com/..."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontFamily: 'var(--font-en)', direction: 'ltr' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--green)', marginBottom: '0.4rem', fontWeight: 'bold' }}>💪 نقاط القوة لديهم</label>
                  <textarea value={form.strengths || ''} onChange={(e) => setForm({...form, strengths: e.target.value})} rows={3} placeholder="ما الذي يميزهم؟"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.3)', background: 'var(--bg2)', color: 'var(--text)', resize: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--coral)', marginBottom: '0.4rem', fontWeight: 'bold' }}>📉 نقاط ضعفهم</label>
                  <textarea value={form.weaknesses || ''} onChange={(e) => setForm({...form, weaknesses: e.target.value})} rows={3} placeholder="ما هي عيوبهم أو شكاوى عملائهم؟"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', background: 'var(--bg2)', color: 'var(--text)', resize: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>ملاحظات عامة / تحركات جديدة</label>
                <input type="text" value={form.notes || ''} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="مثال: أطلقوا ميزة جديدة البارحة..."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                {editingId && (
                  <Button variant="ghost" style={{ color: 'var(--coral)' }} onClick={() => { handleDelete(editingId); setModalOpen(false); }}>حذف 🗑</Button>
                )}
                <div style={{ flex: 1 }} />
                <Button variant="ghost" onClick={() => setModalOpen(false)}>إلغاء</Button>
                <Button variant="accent" onClick={handleSave}>حفظ التحليل 💾</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
