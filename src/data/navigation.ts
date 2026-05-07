import type { NavItem } from '../types';

export const NAV_ITEMS: (NavItem & { labelEn: string })[] = [
  // ── Productivity ──
  { id: 'tasks',     icon: '📋', labelAr: 'المهام الذكية',      labelEn: 'Smart Tasks',      path: '/tasks',     category: 'productivity', badge: 8, badgeColor: 'purple' },
  { id: 'invoices',  icon: '🧾', labelAr: 'الفواتير',            labelEn: 'Invoices',         path: '/invoices',  category: 'productivity', badge: 3, badgeColor: 'gold'   },
  { id: 'calendar',  icon: '📅', labelAr: 'المواعيد',            labelEn: 'Calendar',         path: '/calendar',  category: 'productivity', badge: 2, badgeColor: 'green'  },
  { id: 'timetrack', icon: '⏱️', labelAr: 'الوقت والحضور',        labelEn: 'Time & Attendance', path: '/timetrack', category: 'productivity' },
  { id: 'kpi',       icon: '📊', labelAr: 'لوحة KPI',            labelEn: 'KPI Dashboard',    path: '/kpi',       category: 'productivity' },

  // ── AI ──
  { id: 'meetings',  icon: '🎙️', labelAr: 'تلخيص الاجتماعات',  labelEn: 'Meeting Summary',  path: '/meetings',  category: 'ai' },
  { id: 'cv',        icon: '📄', labelAr: 'محسّن السيرة',        labelEn: 'CV Optimizer',     path: '/cv',        category: 'ai' },
  { id: 'chatbot',   icon: '💬', labelAr: 'الشات بوت',           labelEn: 'AI Chatbot',       path: '/chatbot',   category: 'ai' },

  // ── Business ──
  { id: 'catalog',   icon: '🏪', labelAr: 'الكاتالوج الرقمي',   labelEn: 'Digital Catalog',  path: '/catalog',   category: 'business' },
  { id: 'monitor',   icon: '🔔', labelAr: 'مراقبة المنافسين',    labelEn: 'Competitor Watch', path: '/monitor',   category: 'business' },
  { id: 'templates', icon: '📝', labelAr: 'النماذج القانونية',   labelEn: 'Legal Templates',  path: '/templates', category: 'business' },
  { id: 'suppliers', icon: '🗺️', labelAr: 'خريطة الموردين',     labelEn: 'Supplier Map',     path: '/suppliers', category: 'business' },
  { id: 'storage',   icon: '🗄️', labelAr: 'نظام التخزين',       labelEn: 'Flexible Storage', path: '/storage',   category: 'business' },
];

export const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  productivity: { ar: 'إنتاجية',         en: 'Productivity' },
  ai:           { ar: 'ذكاء اصطناعي',   en: 'AI Tools'     },
  business:     { ar: 'أعمال',           en: 'Business'     },
};

// Helpers (keep backward compat — default to Arabic)
export function getPageTitle(path: string, lang: 'ar' | 'en' = 'ar'): string {
  const item = NAV_ITEMS.find((n) => n.path === path);
  if (!item) return 'WorkHub';
  return `${item.icon} ${lang === 'ar' ? item.labelAr : item.labelEn}`;
}

export function getCategoryLabel(path: string, lang: 'ar' | 'en' = 'ar'): string {
  const item = NAV_ITEMS.find((n) => n.path === path);
  if (!item) return '';
  return CATEGORY_LABELS[item.category]?.[lang] ?? '';
}
