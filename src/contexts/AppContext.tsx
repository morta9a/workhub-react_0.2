import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SavedInvoice, Task, Appointment, MeetingHistory, TimeSession, SavedTemplate, InvoiceSettings } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// ── Types ─────────────────────────────────
export type Theme = 'dark' | 'light';
export type Lang  = 'ar'   | 'en';

interface AppContextValue {
  theme: Theme;
  lang: Lang;
  toggleTheme: () => void;
  toggleLang: () => void;
  t: (ar: string, en: string) => string;
  
  savedInvoices: SavedInvoice[];
  addInvoice: (inv: SavedInvoice) => Promise<void>;
  updateInvoice: (id: string, inv: Partial<SavedInvoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;

  invoiceSettings: InvoiceSettings | null;
  updateInvoiceSettings: (settings: InvoiceSettings) => Promise<void>;

  products: import('../types').Product[];
  addProduct: (p: import('../types').Product) => Promise<void>;
  updateProduct: (id: string, p: Partial<import('../types').Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  suppliers: import('../types').Supplier[];
  addSupplier: (s: import('../types').Supplier) => Promise<void>;
  updateSupplier: (id: string, s: Partial<import('../types').Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  competitors: import('../types').Competitor[];
  addCompetitor: (c: import('../types').Competitor) => Promise<void>;
  updateCompetitor: (id: string, c: Partial<import('../types').Competitor>) => Promise<void>;
  deleteCompetitor: (id: string) => Promise<void>;

  tasks: Task[];
  addTask: (t: Task) => Promise<void>;
  updateTask: (id: string, t: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  appointments: Appointment[];
  addAppointment: (a: Appointment) => Promise<void>;
  updateAppointment: (id: string, a: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  meetingsHistory: MeetingHistory[];
  addMeetingHistory: (m: MeetingHistory) => Promise<void>;
  deleteMeetingHistory: (id: string) => Promise<void>;

  timeSessions: TimeSession[];
  addTimeSession: (ts: TimeSession) => Promise<void>;
  deleteTimeSession: (id: string) => Promise<void>;

  savedTemplates: SavedTemplate[];
  addSavedTemplate: (st: SavedTemplate) => Promise<void>;
  deleteSavedTemplate: (id: string) => Promise<void>;
}

// @ts-ignore
const AppContext = createContext<AppContextValue>({});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('wh-theme') as Theme) ?? 'dark');
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('wh-lang') as Lang) ?? 'ar');

  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings | null>(null);
  const [products, setProducts] = useState<import('../types').Product[]>([]);
  const [suppliers, setSuppliers] = useState<import('../types').Supplier[]>([]);
  const [competitors, setCompetitors] = useState<import('../types').Competitor[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [meetingsHistory, setMeetingsHistory] = useState<MeetingHistory[]>([]);
  const [timeSessions, setTimeSessions] = useState<TimeSession[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);

  // Apply theme & lang
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wh-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.body.style.direction = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.style.textAlign = lang === 'ar' ? 'right' : 'left';
    localStorage.setItem('wh-lang', lang);
  }, [lang]);

  // Load from Supabase on mount/login
  useEffect(() => {
    if (!user) {
      setSavedInvoices([]); setInvoiceSettings(null); setProducts([]); setSuppliers([]); setCompetitors([]);
      setTasks([]); setAppointments([]); setMeetingsHistory([]); setTimeSessions([]); setSavedTemplates([]);
      return;
    }

    const loadData = async () => {
      const { data: invs } = await supabase.from('invoices').select('*');
      if (invs) setSavedInvoices(invs.map(i => ({ id: i.invoice_number, client: i.client, amount: i.amount, status: i.status, date: i.date, currency: i.currency, items: [] } as any)));

      const { data: globalSet } = await supabase.from('invoice_settings').select('*').eq('is_global', true).maybeSingle();
      let finalSettings = globalSet;

      if (user.email !== 'admin@workhub.io' && user.plan !== 'free') {
        let query = supabase.from('invoice_settings').select('*');
        if (user.plan === 'enterprise' && user.companyId) {
          query = query.eq('company_id', user.companyId);
        } else {
          query = query.eq('user_id', user.id);
        }
        const { data: specificSet } = await query.maybeSingle();
        if (specificSet) finalSettings = specificSet;
      }

      if (finalSettings) {
        setInvoiceSettings({
          id: finalSettings.id,
          user_id: finalSettings.user_id,
          company_id: finalSettings.company_id,
          is_global: finalSettings.is_global,
          layout: finalSettings.layout || {},
          customText: finalSettings.custom_text || {},
          hiddenFields: finalSettings.hidden_fields || [],
          logoUrl: finalSettings.logo_url || ''
        });
      } else {
        setInvoiceSettings(null);
      }

      const { data: prods } = await supabase.from('products').select('*');
      if (prods) setProducts(prods.map(p => ({ id: p.id, name: p.name, description: p.description, price: p.price, category: p.category, currency: p.currency, icon: p.icon, inStock: p.in_stock })));

      const { data: sups } = await supabase.from('suppliers').select('*');
      if (sups) setSuppliers(sups as import('../types').Supplier[]);

      const { data: comps } = await supabase.from('competitors').select('*');
      if (comps) setCompetitors(comps.map(c => ({ id: c.id, name: c.name, website: c.website, threatLevel: c.threat_level, strengths: c.strengths, weaknesses: c.weaknesses, notes: c.notes })));

      const { data: tks } = await supabase.from('tasks').select('*');
      if (tks) setTasks(tks.map(t => ({ id: t.id, title: t.title, tag: t.tag, tagLabel: t.tag_label, priority: t.priority, aiScore: t.ai_score, date: t.date, assignee: t.assignee, assigneeBg: t.assignee_bg, assigneeColor: t.assignee_color, column: t.column_id } as any)));

      const { data: apps } = await supabase.from('appointments').select('*');
      if (apps) setAppointments(apps.map(a => ({ id: a.id, title: a.title, client: a.client, time: a.time, day: a.day, type: a.type, customType: a.custom_type } as any)));

      const { data: meets } = await supabase.from('meetings').select('*');
      if (meets) setMeetingsHistory(meets.map(m => ({ id: m.id, title: m.title, date: m.date, duration: m.duration, actionsCount: m.actions_count, status: m.status } as any)));

      const { data: ts } = await supabase.from('time_sessions').select('*');
      if (ts) setTimeSessions(ts.map(t => ({ id: t.id, title: t.title, project: t.project, date: t.date, startTime: t.start_time, endTime: t.end_time, durationSecs: t.duration_secs, hourlyRate: t.hourly_rate, billed: t.billed } as any)));

      const { data: st } = await supabase.from('saved_templates').select('*');
      if (st) setSavedTemplates(st.map(s => ({ id: s.id, name: s.name, date: s.date, icon: s.icon } as any)));
    };

    loadData();
  }, [user]);

  // ── CRUD Methods ─────────────────────────

  const addInvoice = async (inv: SavedInvoice) => {
    if (!user) return;
    await supabase.from('invoices').delete().eq('invoice_number', inv.id);
    const { data, error } = await supabase.from('invoices').insert({ user_id: user.id, invoice_number: inv.id, client: inv.client, amount: inv.amount, status: inv.status, date: inv.date, currency: inv.currency }).select().single();
    if (error) { console.error('Error:', error.message); alert('خطأ: ' + error.message); }
    if (data && !error) setSavedInvoices(prev => [{ id: data.invoice_number, client: data.client, amount: data.amount, status: data.status, date: data.date, currency: data.currency } as any, ...prev.filter(i => i.id !== inv.id)]);
  };
  const updateInvoice = async (id: string, inv: Partial<SavedInvoice>) => {
    if (!user) return;
    const { error } = await supabase.from('invoices').update({ status: inv.status, client: inv.client, amount: inv.amount }).eq('invoice_number', id);
    if (!error) setSavedInvoices(prev => prev.map(i => i.id === id ? { ...i, ...inv } : i));
  };
  const deleteInvoice = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('invoices').delete().eq('invoice_number', id);
    if (!error) setSavedInvoices(prev => prev.filter(i => i.id !== id));
  };

  const updateInvoiceSettings = async (settings: InvoiceSettings) => {
    if (!user) return;
    
    const isSuperAdmin = user.email === 'admin@workhub.io';
    const isEnterprise = user.plan === 'enterprise';
    
    const targetUserId = isSuperAdmin ? null : user.id;
    const targetCompanyId = isEnterprise ? user.companyId : null;
    const isGlobal = isSuperAdmin;

    const payload = {
      user_id: targetUserId,
      company_id: targetCompanyId,
      is_global: isGlobal,
      layout: settings.layout,
      custom_text: settings.customText,
      hidden_fields: settings.hiddenFields,
      logo_url: settings.logoUrl
    };

    let existingQuery = supabase.from('invoice_settings').select('id');
    if (isGlobal) {
      existingQuery = existingQuery.eq('is_global', true);
    } else if (isEnterprise && targetCompanyId) {
      existingQuery = existingQuery.eq('company_id', targetCompanyId);
    } else {
      existingQuery = existingQuery.eq('user_id', user.id);
    }
    
    const { data: existing } = await existingQuery.maybeSingle();
    
    if (existing) {
      const { error } = await supabase.from('invoice_settings').update(payload).eq('id', existing.id);
      if (!error) setInvoiceSettings(settings);
    } else {
      const { error } = await supabase.from('invoice_settings').insert(payload);
      if (!error) setInvoiceSettings(settings);
    }
  };

  const addProduct = async (p: import('../types').Product) => {
    if (!user) return;
    const { data, error } = await supabase.from('products').insert({ user_id: user.id, name: p.name, description: p.description, price: p.price, category: p.category, currency: p.currency, icon: p.icon, in_stock: p.inStock }).select().single();
    if (error) { console.error('Error:', error.message); alert('خطأ: ' + error.message); }
    if (data && !error) setProducts(prev => [{ id: data.id, name: data.name, description: data.description, price: data.price, category: data.category, currency: data.currency, icon: data.icon, inStock: data.in_stock }, ...prev]);
  };
  const updateProduct = async (id: string, p: Partial<import('../types').Product>) => {
    if (!user) return;
    const updatePayload: any = { ...p };
    if (p.inStock !== undefined) { updatePayload.in_stock = p.inStock; delete updatePayload.inStock; }
    delete updatePayload.id;
    const { error } = await supabase.from('products').update(updatePayload).eq('id', id);
    if (!error) setProducts(prev => prev.map(item => item.id === id ? { ...item, ...p } as any : item));
  };
  const deleteProduct = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(prev => prev.filter(item => item.id !== id));
  };

  const addSupplier = async (s: import('../types').Supplier) => {
    if (!user) return;
    const { data, error } = await supabase.from('suppliers').insert({ user_id: user.id, name: s.name, category: s.category, phone: s.phone, rating: s.rating, specialty: s.specialty, notes: s.notes }).select().single();
    if (error) { console.error('Error:', error.message); alert('خطأ: ' + error.message); }
    if (data && !error) setSuppliers(prev => [data as import('../types').Supplier, ...prev]);
  };
  const updateSupplier = async (id: string, s: Partial<import('../types').Supplier>) => {
    if (!user) return;
    const updatePayload = { ...s }; delete updatePayload.id;
    const { error } = await supabase.from('suppliers').update(updatePayload).eq('id', id);
    if (!error) setSuppliers(prev => prev.map(item => item.id === id ? { ...item, ...s } as any : item));
  };
  const deleteSupplier = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (!error) setSuppliers(prev => prev.filter(item => item.id !== id));
  };

  const addCompetitor = async (c: import('../types').Competitor) => {
    if (!user) return;
    const { data, error } = await supabase.from('competitors').insert({ user_id: user.id, name: c.name, website: c.website, threat_level: c.threatLevel, strengths: c.strengths, weaknesses: c.weaknesses, notes: c.notes }).select().single();
    if (error) { console.error('Error:', error.message); alert('خطأ: ' + error.message); }
    if (data && !error) setCompetitors(prev => [{ id: data.id, name: data.name, website: data.website, threatLevel: data.threat_level, strengths: data.strengths, weaknesses: data.weaknesses, notes: data.notes }, ...prev]);
  };
  const updateCompetitor = async (id: string, c: Partial<import('../types').Competitor>) => {
    if (!user) return;
    const updatePayload: any = { ...c };
    if (c.threatLevel !== undefined) { updatePayload.threat_level = c.threatLevel; delete updatePayload.threatLevel; }
    delete updatePayload.id;
    const { error } = await supabase.from('competitors').update(updatePayload).eq('id', id);
    if (!error) setCompetitors(prev => prev.map(item => item.id === id ? { ...item, ...c } as any : item));
  };
  const deleteCompetitor = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('competitors').delete().eq('id', id);
    if (!error) setCompetitors(prev => prev.filter(item => item.id !== id));
  };

  const addTask = async (t: Task) => {
    if (!user) return;
    const { data, error } = await supabase.from('tasks').insert({ user_id: user.id, title: t.title, tag: t.tag, tag_label: t.tagLabel, priority: t.priority, ai_score: t.aiScore, date: t.date, assignee: t.assignee, assignee_bg: t.assigneeBg, assignee_color: t.assigneeColor, column_id: t.column }).select().single();
    if (error) { console.error('Error:', error.message); alert('خطأ: ' + error.message); }
    if (data && !error) setTasks(prev => [{ id: data.id, title: data.title, tag: data.tag, tagLabel: data.tag_label, priority: data.priority, aiScore: data.ai_score, date: data.date, assignee: data.assignee, assigneeBg: data.assignee_bg, assigneeColor: data.assignee_color, column: data.column_id } as any, ...prev]);
  };
  const updateTask = async (id: string, t: Partial<Task>) => {
    if (!user) return;
    const payload: any = { ...t };
    if (t.tagLabel !== undefined) { payload.tag_label = t.tagLabel; delete payload.tagLabel; }
    if (t.aiScore !== undefined) { payload.ai_score = t.aiScore; delete payload.aiScore; }
    if (t.assigneeBg !== undefined) { payload.assignee_bg = t.assigneeBg; delete payload.assigneeBg; }
    if (t.assigneeColor !== undefined) { payload.assignee_color = t.assigneeColor; delete payload.assigneeColor; }
    if (t.column !== undefined) { payload.column_id = t.column; delete payload.column; }
    delete payload.id;
    const { error } = await supabase.from('tasks').update(payload).eq('id', id);
    if (!error) setTasks(prev => prev.map(item => String(item.id) === String(id) ? { ...item, ...t } as any : item));
  };
  const deleteTask = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) setTasks(prev => prev.filter(item => String(item.id) !== String(id)));
  };

  const addAppointment = async (a: Appointment) => {
    if (!user) return;
    const { data, error } = await supabase.from('appointments').insert({ user_id: user.id, title: a.title, client: a.client, time: a.time, day: a.day, type: a.type, custom_type: a.customType }).select().single();
    if (error) { console.error('Error:', error.message); alert('خطأ: ' + error.message); }
    if (data && !error) setAppointments(prev => [...prev, { id: data.id, title: data.title, client: data.client, time: data.time, day: data.day, type: data.type, customType: data.custom_type } as any]);
  };
  const updateAppointment = async (id: string, a: Partial<Appointment>) => {
    if (!user) return;
    const payload: any = { ...a };
    if (a.customType !== undefined) { payload.custom_type = a.customType; delete payload.customType; }
    delete payload.id;
    const { error } = await supabase.from('appointments').update(payload).eq('id', id);
    if (!error) setAppointments(prev => prev.map(item => String(item.id) === String(id) ? { ...item, ...a } as any : item));
  };
  const deleteAppointment = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) setAppointments(prev => prev.filter(item => String(item.id) !== String(id)));
  };

  const addMeetingHistory = async (m: MeetingHistory) => {
    if (!user) return;
    const { data, error } = await supabase.from('meetings').insert({ user_id: user.id, title: m.title, date: m.date, duration: m.duration, actions_count: m.actionsCount, status: m.status }).select().single();
    if (error) { console.error('Error:', error.message); alert('خطأ: ' + error.message); }
    if (data && !error) setMeetingsHistory(prev => [{ id: data.id, title: data.title, date: data.date, duration: data.duration, actionsCount: data.actions_count, status: data.status } as any, ...prev]);
  };
  const deleteMeetingHistory = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('meetings').delete().eq('id', id);
    if (!error) setMeetingsHistory(prev => prev.filter(item => String(item.id) !== String(id)));
  };

  const addTimeSession = async (ts: TimeSession) => {
    if (!user) return;
    const { data, error } = await supabase.from('time_sessions').insert({ user_id: user.id, title: ts.title, project: ts.project, date: ts.date, start_time: ts.startTime, end_time: ts.endTime, duration_secs: ts.durationSecs, hourly_rate: ts.hourlyRate, billed: ts.billed }).select().single();
    if (error) { console.error('Error:', error.message); alert('خطأ: ' + error.message); }
    if (data && !error) setTimeSessions(prev => [{ id: data.id, title: data.title, project: data.project, date: data.date, startTime: data.start_time, endTime: data.end_time, durationSecs: data.duration_secs, hourlyRate: data.hourly_rate, billed: data.billed } as any, ...prev]);
  };
  const deleteTimeSession = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('time_sessions').delete().eq('id', id);
    if (!error) setTimeSessions(prev => prev.filter(item => String(item.id) !== String(id)));
  };

  const addSavedTemplate = async (st: SavedTemplate) => {
    if (!user) return;
    const { data, error } = await supabase.from('saved_templates').insert({ user_id: user.id, name: st.name, date: st.date, icon: st.icon }).select().single();
    if (error) { console.error('Error:', error.message); alert('خطأ: ' + error.message); }
    if (data && !error) setSavedTemplates(prev => [{ id: data.id, name: data.name, date: data.date, icon: data.icon } as any, ...prev]);
  };
  const deleteSavedTemplate = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('saved_templates').delete().eq('id', id);
    if (!error) setSavedTemplates(prev => prev.filter(item => String(item.id) !== String(id)));
  };

  const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark');
  const toggleLang  = () => setLang(p =>  p === 'ar'   ? 'en'    : 'ar');
  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;

  return (
    <AppContext.Provider value={{ 
      theme, lang, toggleTheme, toggleLang, t, 
      savedInvoices, addInvoice, updateInvoice, deleteInvoice,
      invoiceSettings, updateInvoiceSettings,
      products, addProduct, updateProduct, deleteProduct,
      suppliers, addSupplier, updateSupplier, deleteSupplier,
      competitors, addCompetitor, updateCompetitor, deleteCompetitor,
      tasks, addTask, updateTask, deleteTask,
      appointments, addAppointment, updateAppointment, deleteAppointment,
      meetingsHistory, addMeetingHistory, deleteMeetingHistory,
      timeSessions, addTimeSession, deleteTimeSession,
      savedTemplates, addSavedTemplate, deleteSavedTemplate
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
