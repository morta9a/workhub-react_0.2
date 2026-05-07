// ══════════════════════════════
//  NAVIGATION
// ══════════════════════════════

export type NavCategory = 'productivity' | 'ai' | 'business';

export interface NavItem {
  id: string;
  icon: string;
  labelAr: string;
  path: string;
  category: NavCategory;
  badge?: number;
  badgeColor?: 'purple' | 'gold' | 'green' | 'coral';
}

// ══════════════════════════════
//  SHELL / LAYOUT
// ══════════════════════════════

export interface ToolbarConfig {
  left: ToolbarAction[];
  right: ToolbarAction[];
}

export interface ToolbarAction {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'default' | 'active' | 'ai';
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

// ══════════════════════════════
//  TASKS
// ══════════════════════════════

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskColumn  = 'todo' | 'doing' | 'review' | 'done';

export interface Task {
  id: number;
  title: string;
  tag: string;
  tagLabel: string;
  priority: TaskPriority;
  aiScore: number;
  date: string;
  assignee: string;
  assigneeBg: string;
  assigneeColor: string;
  column: TaskColumn;
}

// ══════════════════════════════
//  INVOICES
// ══════════════════════════════

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'time';

export interface SavedInvoice {
  id: string;
  client: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
  currency: string;
  storeId?: string;
  dealerNo?: string;
  items?: any[];
}

export interface InvoiceItem {
  id: number;
  description: string;
  qty: number;
  price: number;
  store?: string;
  expiry?: string;
  company?: string;
  bonus?: number;
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  clientName: string;
  clientDetail: string;
  myName: string;
  myEmail: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate: number;
  discountRate: number;
  notes: string;
  currency: string;
  storeId?: string;
  dealerNo?: string;
}

export interface InvoiceSettings {
  id?: string;
  user_id?: string;
  company_id?: string;
  is_global?: boolean;
  layout: Record<string, { x: number; y: number }>;
  customText: Record<string, string>;
  hiddenFields: string[];
  logoUrl: string;
}

// ══════════════════════════════
//  MEETINGS
// ══════════════════════════════

export interface Speaker {
  initials: string;
  name: string;
  role: string;
  duration: number;
  color: string;
  bg: string;
}

export interface ActionItem {
  id: number;
  text: string;
  owner: string;
  due: string;
  done: boolean;
}

export interface MeetingResult {
  title: string;
  duration: string;
  language: string;
  wordCount: number;
  summary: string;
  decisions: { text: string; type: 'confirmed' | 'pending' }[];
  actions: ActionItem[];
  speakers: Speaker[];
  tags: { label: string; color: string }[];
}

// ══════════════════════════════
//  TEMPLATES
// ══════════════════════════════

export type TemplatePlan = 'free' | 'pro';
export type TemplateCategory = 'legal' | 'freelance' | 'sales';

export interface Template {
  id: string;
  icon: string;
  nameAr: string;
  category: TemplateCategory;
  plan: TemplatePlan;
  isNew?: boolean;
}

// ══════════════════════════════
//  CV OPTIMIZER
// ══════════════════════════════

export interface CvKeyword {
  text: string;
  status: 'matched' | 'added' | 'missing';
}

export interface CvResult {
  scoreBefore: number;
  scoreAfter: number;
  keywords: CvKeyword[];
  suggestions: string[];
}

// ══════════════════════════════
//  PLAN
// ══════════════════════════════

export type PlanTier = 'free' | 'pro' | 'enterprise';

export interface Plan {
  tier: PlanTier;
  nameAr: string;
  used: number;
  limit: number;
  unit: string;
}

// ══════════════════════════════
//  CATALOG (PRODUCTS)
// ══════════════════════════════

export type ProductCategory = 'digital' | 'physical' | 'service' | 'subscription' | 'other';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  currency: string;
  icon: string;    // Emoji or icon name
  image?: string;  // Optional image URL
  inStock: boolean;
}

// ══════════════════════════════
//  SUPPLIERS
// ══════════════════════════════

export type SupplierCategory = 'hosting' | 'printing' | 'hardware' | 'external_services' | 'other';

export interface Supplier {
  id: string;
  name: string;
  category: SupplierCategory;
  phone: string;
  rating: number; // 1 to 5
  specialty: string;
  notes: string;
}

// ══════════════════════════════
//  COMPETITORS
// ══════════════════════════════

export type ThreatLevel = 'high' | 'medium' | 'low';

export interface Competitor {
  id: string;
  name: string;
  website: string;
  threatLevel: ThreatLevel;
  strengths: string;
  weaknesses: string;
  notes: string;
}

// ══════════════════════════════
//  TIME TRACKING
// ══════════════════════════════

export interface TimeSession {
  id: string;
  title: string;
  project: string;
  date: string;
  startTime: string;
  endTime: string;
  durationSecs: number;
  hourlyRate: number;
  billed: boolean;
}

export interface AttendanceRecord {
  id: string;
  employee: string;
  checkIn: string;
  checkOut: string | null;
  duration: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  avatar: string;
}

export interface BiometricDevice {
  id: string;
  name: string;
  type: 'ZKTeco' | 'Hikvision' | 'Suprema';
  ip: string;
  status: 'online' | 'offline';
  lastSync: string;
  usersCount: number;
}

// ══════════════════════════════
//  APPOINTMENTS (CALENDAR)
// ══════════════════════════════

export interface Appointment {
  id: string;
  title: string;
  client: string;
  time: string;
  day: number;
  type: 'meeting' | 'call' | 'review' | 'other';
  customType?: string;
}

// ══════════════════════════════
//  MEETINGS HISTORY
// ══════════════════════════════

export interface MeetingHistory {
  id: string;
  title: string;
  date: string;
  duration: string;
  actionsCount: number;
  status: string;
}

// ══════════════════════════════
//  SAVED TEMPLATES
// ══════════════════════════════

export interface SavedTemplate {
  id: string;
  name: string;
  date: string;
  icon: string;
}
