import React, { useState } from 'react';
import { Shell } from '../components/layout/Shell';
import { Button, AiButton, ToolbarSection, ToolbarDivider, PageHeader, Card, CardHeader, CardBody } from '../components/ui';
import { AiPanel } from '../components/shared';
import { useToast } from '../hooks/useToast';
import { useApp } from '../contexts/AppContext';
import type { Appointment } from '../types';

// Fake Data for Calendar
const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTH_DAYS = 30;
const START_DAY = 3; // Starts on Wednesday for April 2026
const TODAY = 21; // Assuming today is 21st April 2026

export default function Calendar() {
  const { toast } = useToast();
  const { appointments: apps, addAppointment, updateAppointment, deleteAppointment } = useApp();
  const [selectedDay, setSelectedDay] = useState<number | null>(15);
  const [view, setView] = useState<'month' | 'list'>('month');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<any>(null);
  const [aiPanelVisible, setAiPanelVisible] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [newDay, setNewDay] = useState<number>(selectedDay && selectedDay >= TODAY ? selectedDay : TODAY);
  const [newType, setNewType] = useState<'meeting' | 'call' | 'review' | 'other'>('meeting');
  const [newCustomType, setNewCustomType] = useState('');

  const selectedApps = apps.filter(a => a.day === selectedDay);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return { bg: 'rgba(108,99,255,.15)', color: 'var(--accent2)', label: 'اجتماع' };
      case 'call': return { bg: 'rgba(52,211,153,.12)', color: 'var(--green)', label: 'مكالمة' };
      case 'review': return { bg: 'rgba(245,158,11,.12)', color: 'var(--gold)', label: 'مراجعة' };
      case 'other': return { bg: 'var(--bg3)', color: 'var(--text)', label: 'أخرى' };
      default: return { bg: 'var(--bg3)', color: 'var(--text)', label: type };
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://workhub.app/book/me').then(() => {
      toast('🔗 تم نسخ رابط الحجز الشخصي إلى الحافظة');
    });
  };

  const handleAddApp = () => {
    if (!newTitle || !newClient || (newType === 'other' && !newCustomType)) {
      toast('⚠️ يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (newDay < TODAY) {
      toast('⚠️ لا يمكن تحديد موعد قبل تاريخ اليوم');
      return;
    }
    const newAppointment: Appointment = {
      id: editId !== null ? editId : Date.now().toString() as any,
      title: newTitle,
      client: newClient,
      time: newTime,
      day: newDay,
      type: newType,
      customType: newType === 'other' ? newCustomType : undefined,
    };
    if (editId !== null) {
      updateAppointment(editId.toString(), newAppointment);
      toast('✅ تم تعديل الموعد بنجاح');
    } else {
      addAppointment(newAppointment);
      toast('✅ تم إضافة الموعد بنجاح');
    }
    
    setShowModal(false);
    setEditId(null);
    setNewTitle('');
    setNewClient('');
    setNewCustomType('');
  };

  const openEditModal = (a: Appointment) => {
    setEditId(a.id);
    setNewTitle(a.title);
    setNewClient(a.client);
    setNewTime(a.time);
    setNewDay(a.day);
    setNewType(a.type);
    if (a.type === 'other' && a.customType) setNewCustomType(a.customType);
    setShowModal(true);
  };

  const handleDelete = (id: any) => {
    deleteAppointment(id.toString());
    toast('🗑 تم إلغاء الموعد');
  };

  const handleJoin = () => {
    window.open('https://zoom.us/test', '_blank');
    toast('🔗 تم فتح رابط الاجتماع');
  };

  const handleAiSuggest = () => {
    toast('✨ الذكاء الاصطناعي يقوم بتحليل جدولك...');
    setTimeout(() => {
      const aiApp: Appointment = {
        id: Date.now().toString() as any,
        title: 'استشارة مقترحة',
        client: 'عميل محتمل',
        time: '01:00 م',
        day: selectedDay || 15,
        type: 'call',
      };
      addAppointment(aiApp);
      toast('📅 تم إضافة موعد مقترح تلقائياً');
    }, 1500);
  };

  const renderCalendar = () => {
    if (view === 'list') {
      const sortedApps = [...apps].sort((a, b) => a.day - b.day);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {sortedApps.map(a => {
            const colors = getTypeColor(a.type);
            return (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg2)',
                borderRight: `4px solid ${colors.color}`
              }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>{a.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', gap: '1rem' }}>
                    <span>👤 {a.client}</span>
                    <span>📅 {a.day} أبريل</span>
                    <span>🕒 {a.time}</span>
                    <span style={{ color: colors.color, background: colors.bg, padding: '0 0.4rem', borderRadius: '4px' }}>{a.type === 'other' ? a.customType : colors.label}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="green" size="sm" onClick={handleJoin}>انضمام 📧</Button>
                  <Button variant="accent" size="sm" onClick={() => openEditModal(a)}>تعديل ✏️</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}>إلغاء 🗑</Button>
                </div>
              </div>
            );
          })}
          {sortedApps.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>لا توجد مواعيد هذا الشهر</div>}
        </div>
      );
    }

    const blanks = Array.from({ length: START_DAY }, (_, i) => <div key={`b-${i}`} style={{ minHeight: '100px', borderRadius: '8px' }} />);
    const days = Array.from({ length: MONTH_DAYS }, (_, i) => {
      const d = i + 1;
      const dayApps = apps.filter(a => a.day === d);
      const isSelected = selectedDay === d;
      return (
        <div 
          key={d} 
          onClick={() => setSelectedDay(d)}
          style={{
            minHeight: '100px',
            border: `1px solid ${isSelected ? 'var(--accent2)' : 'var(--border)'}`,
            padding: '0.5rem',
            background: isSelected ? 'rgba(108,99,255,.05)' : 'var(--bg2)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ 
            fontWeight: isSelected ? 'bold' : 'normal', 
            color: isSelected ? 'var(--accent2)' : 'var(--text)', 
            marginBottom: '0.5rem',
            background: isSelected ? 'rgba(108,99,255,.15)' : 'transparent',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            fontSize: '0.85rem'
          }}>
            {d}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            {dayApps.map(a => {
              const colors = getTypeColor(a.type);
              return (
                <div key={a.id} style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: colors.bg,
                  color: colors.color,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {a.time} - {a.title}
                </div>
              );
            })}
          </div>
        </div>
      );
    });

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {DAYS.map(day => (
          <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--muted)', paddingBottom: '0.5rem' }}>
            {day}
          </div>
        ))}
        {blanks}
        {days}
      </div>
    );
  };

  return (
    <>
      <Shell
        topbarActions={
          <>
            <Button size="sm" onClick={handleCopyLink}>رابط الحجز 🔗</Button>
            <Button variant="gold" size="sm" onClick={() => { setEditId(null); setShowModal(true); }}>موعد جديد ➕</Button>
          </>
        }
        toolbar={
          <>
            <ToolbarSection align="left">
              <Button variant={view === 'month' ? 'accent' : 'ghost'} size="sm" onClick={() => setView('month')}>📅 تقويم</Button>
              <Button variant={view === 'list' ? 'accent' : 'ghost'} size="sm" onClick={() => setView('list')}>📜 قائمة</Button>
              <ToolbarDivider />
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>أبريل 2026</span>
            </ToolbarSection>
            <ToolbarSection align="right">
              <AiButton onClick={handleAiSuggest}>اقتراح مواعيد</AiButton>
            </ToolbarSection>
          </>
        }
      >
        <PageHeader
          icon="📅"
          iconBg="rgba(56,189,248,.12)"
          title="إدارة المواعيد"
          subtitle="جدولك الزمني ومواعيد عملائك في مكان واحد مدعوم بالذكاء الاصطناعي"
          stats={[
            { num: apps.length.toString(), label: 'إجمالي هذا الشهر', color: 'var(--accent2)' },
            { num: selectedApps.length.toString(), label: 'مواعيد اليوم', color: 'var(--green)' },
          ]}
        />

        <div style={{ display: 'grid', gridTemplateColumns: view === 'month' ? '1fr 300px' : '1fr', gap: '1.2rem', alignItems: 'start' }}>
          {/* Main View */}
          <Card>
            <CardBody>
              {renderCalendar()}
            </CardBody>
          </Card>

          {/* Side Panel (Only in Month View) */}
          {view === 'month' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Card>
                <CardHeader title={`مواعيد يوم ${selectedDay} أبريل`} />
                <CardBody>
                  {selectedApps.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {selectedApps.map(a => {
                        const colors = getTypeColor(a.type);
                        return (
                          <div key={a.id} style={{
                            padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg3)',
                            borderRight: `3px solid ${colors.color}`
                          }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>{a.title}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.8rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>👤 {a.client}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🕒 {a.time}</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <Button variant="green" size="sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={handleJoin}>انضمام 📧</Button>
                              <Button variant="accent" size="sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => openEditModal(a)}>تعديل ✏️</Button>
                              <Button variant="ghost" size="sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => handleDelete(a.id)}>إلغاء 🗑</Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', padding: '2rem 1rem' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍃</div>
                      لا توجد مواعيد مجدولة في هذا اليوم
                    </div>
                  )}
                </CardBody>
              </Card>


              {aiPanelVisible && (
                <AiPanel
                  message="يبدو أن لديك فجوة زمنية بين الساعة 11:00 والساعة 02:00، هل تريد فتح هذا الوقت للحجوزات التلقائية؟"
                  chips={[
                    { label: '✅ فتح المواعيد', onClick: () => { toast('تم تحديث التوفر وفتح المواعيد التلقائية'); setAiPanelVisible(false); } },
                    { label: '🕒 تعديل التوفر', onClick: () => { toast('جاري فتح إعدادات التوفر...'); setAiPanelVisible(false); } }
                  ]}
                />
              )}
            </div>
          )}
        </div>
      </Shell>

      {/* New Appointment Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border)',
            width: '400px', maxWidth: '90%', padding: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>{editId !== null ? 'تعديل الموعد' : 'إضافة موعد جديد'}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>عنوان الموعد</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: استشارة مالية"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>اسم العميل</label>
                <input 
                  type="text" 
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  placeholder="اسم العميل أو الشركة"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>اليوم (أبريل)</label>
                  <input 
                    type="number" 
                    min={TODAY} max="30"
                    value={newDay}
                    onChange={(e) => setNewDay(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>الوقت</label>
                  <input 
                    type="time" 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>نوع الموعد</label>
                <select 
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                >
                  <option value="meeting">اجتماع</option>
                  <option value="call">مكالمة</option>
                  <option value="review">مراجعة</option>
                  <option value="other">أخرى...</option>
                </select>
              </div>

              {newType === 'other' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>اكتب نوع الموعد</label>
                  <input 
                    type="text" 
                    value={newCustomType}
                    onChange={(e) => setNewCustomType(e.target.value)}
                    placeholder="مثال: جلسة تصوير"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => { setShowModal(false); setEditId(null); }}>إلغاء</Button>
                <Button variant="gold" onClick={handleAddApp}>حفظ 💾</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
