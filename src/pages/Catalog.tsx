import React, { useState } from 'react';
import { Shell } from '../components/layout/Shell';
import { Button, PageHeader, Card, CardBody } from '../components/ui';
import { useToast } from '../hooks/useToast';
import { useApp } from '../contexts/AppContext';
import type { Product, ProductCategory } from '../types';

export default function Catalog() {
  const { toast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct, t } = useApp();
  
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<ProductCategory | 'all'>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});

  const CATEGORIES: { id: ProductCategory | 'all'; label: string }[] = [
    { id: 'all', label: t('الكل', 'All') },
    { id: 'digital', label: t('منتجات رقمية', 'Digital Products') },
    { id: 'physical', label: t('منتجات ملموسة', 'Physical Products') },
    { id: 'service', label: t('خدمات', 'Services') },
    { id: 'subscription', label: t('اشتراكات', 'Subscriptions') },
    { id: 'other', label: t('أخرى', 'Other') },
  ];

  const filteredProducts = products.filter(p => {
    if (filterCat !== 'all' && p.category !== filterCat) return false;
    if (search && !p.name.includes(search) && !p.description.includes(search)) return false;
    return true;
  });

  const handleOpenModal = (p?: Product) => {
    if (p) {
      setEditingId(p.id);
      setForm({ ...p });
    } else {
      setEditingId(null);
      setForm({
        name: '', description: '', price: 0, category: 'digital',
        currency: 'IQD', icon: '📦', image: '', inStock: true
      });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || form.price === undefined) {
      toast(t('⚠️ يرجى إدخال اسم المنتج والسعر', '⚠️ Please enter product name and price'));
      return;
    }

    if (editingId) {
      updateProduct(editingId, form);
      toast(t('✅ تم تحديث المنتج', '✅ Product updated'));
    } else {
      const newProd: Product = {
        ...(form as Product)
        // id is omitted, Supabase generates it, but wait: our app logic needs to not crash if id is missing temporarily.
        // The context addProduct generates it on the server and prepends the returned object.
      };
      addProduct(newProd);
      toast(t('✅ تم إضافة المنتج بنجاح', '✅ Product added successfully'));
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('هل أنت متأكد من حذف هذا المنتج؟', 'Are you sure you want to delete this product?'))) {
      deleteProduct(id);
      toast(t('🗑 تم حذف المنتج', '🗑 Product deleted'));
    }
  };

  const handleShare = (p: Product) => {
    navigator.clipboard.writeText(`✨ ${p.name}\n${p.description}\n${t('السعر', 'Price')}: ${p.price.toLocaleString()} ${p.currency}`);
    toast(t('📋 تم نسخ تفاصيل المنتج لمشاركتها', '📋 Product details copied to share'));
  };

  return (
    <Shell
      topbarActions={
        <Button variant="accent" size="sm" onClick={() => handleOpenModal()}>{t('منتج جديد ➕', 'New Product ➕')}</Button>
      }
    >
      <PageHeader
        icon="🏪"
        iconBg="rgba(245,158,11,.12)"
        title={t('المستودع الرقمي', 'Digital Warehouse')}
        subtitle={t('لإدارة منتجاتك وخدماتك', 'To manage your products and services')}
      />

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder={t('🔍 بحث عن منتج أو خدمة...', '🔍 Search for a product or service...')} 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {CATEGORIES.map(c => (
            <Button key={c.id} size="sm" variant={filterCat === c.id ? 'accent' : 'ghost'} onClick={() => setFilterCat(c.id as any)}>
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {filteredProducts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.2rem' }}>
          {filteredProducts.map(p => (
            <Card key={p.id} style={{ position: 'relative', overflow: 'hidden', border: '1px solid var(--border)', transition: 'transform 0.2s', cursor: 'pointer' }}>
              {!p.inStock && (
                <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(239,68,68,0.9)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 2 }}>
                  {t('نفذت الكمية', 'Out of Stock')}
                </div>
              )}
              
              {/* Product Visual */}
              <div style={{ height: '140px', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {p.image ? (
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '4rem' }}>{p.icon}</span>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(transparent, var(--bg2))' }} />
              </div>

              {/* Product Info */}
              <CardBody style={{ padding: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, color: 'var(--text)' }}>{p.name}</h3>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--green)', fontFamily: 'var(--font-en)', whiteSpace: 'nowrap' }}>
                    {p.price.toLocaleString()} {t(p.currency === 'IQD' ? 'د.ع' : p.currency, p.currency)}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1.2rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description}
                </p>
                
                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="ghost" size="sm" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }} onClick={() => handleOpenModal(p)}>{t('تعديل ✏️', 'Edit ✏️')}</Button>
                  <Button variant="ghost" size="sm" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', color: 'var(--accent2)' }} onClick={() => handleShare(p)}>{t('مشاركة 🔗', 'Share 🔗')}</Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', background: 'var(--bg2)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <div>{t('لا توجد منتجات مطابقة للبحث', 'No products match your search')}</div>
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
              {editingId ? t('تعديل المنتج', 'Edit Product') : t('إضافة منتج جديد', 'Add New Product')}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>{t('أيقونة (إيموجي)', 'Icon (Emoji)')}</label>
                  <input type="text" value={form.icon || ''} onChange={(e) => setForm({...form, icon: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: '1.5rem', textAlign: 'center' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>{t('اسم المنتج', 'Product Name')}</label>
                  <input type="text" value={form.name || ''} onChange={(e) => setForm({...form, name: e.target.value})} placeholder={t('مثال: استشارة تسويقية', 'e.g. Marketing Consultation')}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>{t('الوصف', 'Description')}</label>
                <textarea value={form.description || ''} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} placeholder={t('اكتب تفاصيل المنتج أو الخدمة هنا...', 'Write product or service details here...')}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', resize: 'none' }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>{t('السعر', 'Price')}</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" value={form.price || 0} onChange={(e) => setForm({...form, price: Number(e.target.value)})}
                      style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontFamily: 'var(--font-en)' }}
                    />
                    <select value={form.currency || 'IQD'} onChange={(e) => setForm({...form, currency: e.target.value})}
                      style={{ width: '80px', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                    >
                      <option value="IQD">{t('د.ع', 'IQD')}</option>
                      <option value="USD">$</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>{t('الفئة', 'Category')}</label>
                  <select value={form.category || 'other'} onChange={(e) => setForm({...form, category: e.target.value as ProductCategory})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>{t('صورة المنتج (رابط خارجي - اختياري)', 'Product Image (URL - Optional)')}</label>
                <input type="text" value={form.image || ''} onChange={(e) => setForm({...form, image: e.target.value})} placeholder="https://example.com/image.jpg"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontFamily: 'var(--font-en)', direction: 'ltr' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({...form, inStock: e.target.checked})} 
                  style={{ width: '18px', height: '18px', accentColor: 'var(--green)' }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{t('متوفر (In Stock)', 'In Stock')}</span>
              </label>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                {editingId && (
                  <Button variant="ghost" style={{ color: 'var(--coral)' }} onClick={() => { handleDelete(editingId); setModalOpen(false); }}>{t('حذف 🗑', 'Delete 🗑')}</Button>
                )}
                <div style={{ flex: 1 }} />
                <Button variant="ghost" onClick={() => setModalOpen(false)}>{t('إلغاء', 'Cancel')}</Button>
                <Button variant="accent" onClick={handleSave}>{t('حفظ المنتج 💾', 'Save Product 💾')}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
