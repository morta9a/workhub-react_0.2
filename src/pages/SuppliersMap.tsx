import React, { useState } from 'react';
import { Shell } from '../components/layout/Shell';
import { Button, PageHeader, Card, CardBody } from '../components/ui';
import { useToast } from '../hooks/useToast';
import { useApp } from '../contexts/AppContext';
import type { Supplier, SupplierCategory } from '../types';

const CATEGORIES: { id: SupplierCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'الكل', icon: '🗺️' },
  { id: 'hosting', label: 'استضافة وسيرفرات', icon: '☁️' },
  { id: 'printing', label: 'مطابع وإنتاج', icon: '🖨️' },
  { id: 'hardware', label: 'أجهزة ومعدات', icon: '💻' },
  { id: 'external_services', label: 'خدمات خارجية', icon: '🤝' },
  { id: 'other', label: 'أخرى', icon: '📌' },
];

export default function SuppliersMap() {
  const { toast } = useToast();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useApp();
  
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<SupplierCategory | 'all'>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Supplier>>({});

  const filteredSuppliers = suppliers.filter(s => {
    if (filterCat !== 'all' && s.category !== filterCat) return false;
    if (search && !s.name.includes(search) && !s.specialty.includes(search)) return false;
    return true;
  });

  const handleOpenModal = (s?: Supplier) => {
    if (s) {
      setEditingId(s.id);
      setForm({ ...s });
    } else {
      setEditingId(null);
      setForm({
        name: '', category: 'other', phone: '', rating: 5, specialty: '', notes: ''
      });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.phone) {
      toast('⚠️ يرجى إدخال اسم المورد ورقم الهاتف');
      return;
    }

    if (editingId) {
      updateSupplier(editingId, form);
      toast('✅ تم تحديث بيانات المورد');
    } else {
      const newSupplier: Supplier = {
        ...(form as Supplier)
      };
      addSupplier(newSupplier);
      toast('✅ تم إضافة المورد بنجاح');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المورد؟')) {
      deleteSupplier(id);
      toast('🗑 تم حذف المورد');
    }
  };

  const openWhatsApp = (phone: string) => {
    // Clean phone number (remove spaces, +, etc) for wa.me link
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <Shell
      topbarActions={
        <Button variant="gold" size="sm" onClick={() => handleOpenModal()}>مورد جديد ➕</Button>
      }
    >
      <PageHeader
        icon="🗺️"
        iconBg="rgba(16,185,129,.12)"
        title="خريطة الموردين"
        subtitle="قاعدة بيانات ذكية لإدارة العلاقات مع الموردين وتقييمهم"
      />

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="🔍 بحث عن مورد أو تخصص..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {CATEGORIES.map(c => (
            <Button key={c.id} size="sm" variant={filterCat === c.id ? 'accent' : 'ghost'} onClick={() => setFilterCat(c.id as any)}>
              {c.icon} {c.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {filteredSuppliers.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {filteredSuppliers.map(s => {
            const cat = CATEGORIES.find(c => c.id === s.category);
            return (
              <Card key={s.id} style={{ position: 'relative', overflow: 'hidden', border: '1px solid var(--border)', transition: 'transform 0.2s' }}>
                <CardBody style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 0.3rem 0', color: 'var(--text)' }}>{s.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>{cat?.icon}</span> {cat?.label}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--gold)', letterSpacing: '2px' }}>
                      {renderStars(s.rating)}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text)', marginBottom: '0.3rem' }}>التخصص:</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{s.specialty || 'غير محدد'}</div>
                  </div>

                  {s.notes && (
                    <div style={{ marginBottom: '1.5rem', padding: '0.8rem', background: 'var(--bg3)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--muted)', borderLeft: '3px solid var(--accent)' }}>
                      {s.notes}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: 'auto' }}>
                    <Button variant="ghost" size="sm" style={{ padding: '0.6rem', fontSize: '0.85rem' }} onClick={() => handleOpenModal(s)}>تعديل ✏️</Button>
                    <Button variant="ghost" size="sm" style={{ padding: '0.6rem', fontSize: '0.85rem', color: 'var(--green)', background: 'rgba(16,185,129,0.1)' }} onClick={() => openWhatsApp(s.phone)}>واتساب 💬</Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', background: 'var(--bg2)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
          <div>لا يوجد موردين مطابقين للبحث</div>
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
            width: '500px', maxWidth: '90%', padding: '1.8rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>
              {editingId ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>اسم المورد / الشركة</label>
                <input type="text" value={form.name || ''} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="مثال: مطبعة الألوان"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>رقم الهاتف (للواتساب)</label>
                  <input type="text" value={form.phone || ''} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="+964..."
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontFamily: 'var(--font-en)', direction: 'ltr' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>التصنيف</label>
                  <select value={form.category || 'other'} onChange={(e) => setForm({...form, category: e.target.value as SupplierCategory})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>التخصص الدقيق</label>
                  <input type="text" value={form.specialty || ''} onChange={(e) => setForm({...form, specialty: e.target.value})} placeholder="مثال: طباعة بنرات"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>التقييم (من 5)</label>
                  <input type="number" min="1" max="5" value={form.rating || 5} onChange={(e) => setForm({...form, rating: Number(e.target.value)})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontFamily: 'var(--font-en)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>ملاحظات (جودة، سرعة، أسعار)</label>
                <textarea value={form.notes || ''} onChange={(e) => setForm({...form, notes: e.target.value})} rows={3} placeholder="اكتب ملاحظاتك عن التعامل مع هذا المورد..."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                {editingId && (
                  <Button variant="ghost" style={{ color: 'var(--coral)' }} onClick={() => { handleDelete(editingId); setModalOpen(false); }}>حذف 🗑</Button>
                )}
                <div style={{ flex: 1 }} />
                <Button variant="ghost" onClick={() => setModalOpen(false)}>إلغاء</Button>
                <Button variant="accent" onClick={handleSave}>حفظ البيانات 💾</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
