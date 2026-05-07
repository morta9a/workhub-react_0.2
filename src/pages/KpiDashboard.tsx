import React, { useMemo, useState } from 'react';
import { Shell } from '../components/layout/Shell';
import { Button, PageHeader, Card, CardHeader, CardBody, StatCard } from '../components/ui';
import { useToast } from '../hooks/useToast';
import { useApp } from '../contexts/AppContext';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

/* ──────────────────────────────
   Custom Tooltip
────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg3)',
      border: '1px solid var(--border2)',
      borderRadius: 12,
      padding: '0.7rem 1rem',
      boxShadow: 'var(--shadow-md)',
      direction: 'rtl',
      minWidth: 140,
    }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{
          fontSize: '0.9rem', fontWeight: 800,
          fontFamily: 'var(--font-en)',
          color: p.color ?? 'var(--accent)',
        }}>
          {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────
   Activity Item
────────────────────────────── */
function ActivityItem({
  icon, title, sub, time, color, index,
}: { icon: string; title: string; sub: string; time: string; color: string; index: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.85rem',
      padding: '0.65rem 0',
      borderBottom: '1px solid var(--border)',
      animation: `fadeUp 0.35s ${0.05 * index}s ease both`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem', flexShrink: 0,
        border: `1px solid ${color}25`,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.15rem' }}>
          {title}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sub}
        </div>
      </div>
      <div style={{
        fontSize: '0.68rem', color: 'var(--muted2)',
        fontFamily: 'var(--font-en)', flexShrink: 0,
      }}>
        {time}
      </div>
    </div>
  );
}

/* ──────────────────────────────
   Quick Action Button
────────────────────────────── */
function QuickAction({
  icon, label, color, bg, onClick,
}: { icon: string; label: string; color: string; bg: string; onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1,
        background: hov ? bg : 'var(--bg3)',
        border: `1px solid ${hov ? color + '40' : 'var(--border)'}`,
        borderRadius: 14,
        padding: '0.9rem 0.6rem',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '0.5rem',
        transition: 'all 0.2s ease',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 6px 20px ${color}20` : 'none',
        fontFamily: 'var(--font-ar)',
      }}
    >
      <div style={{ fontSize: '1.4rem' }}>{icon}</div>
      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: hov ? color : 'var(--muted)' }}>
        {label}
      </div>
    </button>
  );
}

/* ══════════════════════════════
   KPI DASHBOARD — Main Component
══════════════════════════════ */
export default function KpiDashboard() {
  const { toast } = useToast();
  const { savedInvoices, t } = useApp();

  /* ── Calculated Stats ── */
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;
    const clients = new Set<string>();

    savedInvoices.forEach(inv => {
      clients.add(inv.client);
      if (inv.status === 'paid') totalRevenue += inv.amount;
      else if (['sent', 'draft', 'time'].includes(inv.status)) pendingAmount += inv.amount;
      else if (inv.status === 'overdue') overdueAmount += inv.amount;
    });

    return { totalRevenue, pendingAmount, overdueAmount, activeClients: clients.size };
  }, [savedInvoices]);

  /* ── Donut Data ── */
  const pieData = useMemo(() => [
    { name: t('مدفوعة', 'Paid'),    value: stats.totalRevenue,  color: '#3EC98B' },
    { name: t('معلقة', 'Pending'),  value: stats.pendingAmount,  color: '#FFB950' },
    { name: t('متأخرة', 'Overdue'), value: stats.overdueAmount,  color: '#F05A5A' },
  ].filter(d => d.value > 0), [stats, t]);

  /* ── Area Chart Data ── */
  const areaData = useMemo(() => [
    { name: 'Nov', revenue: 1200000, expenses: 820000 },
    { name: 'Dec', revenue: 2500000, expenses: 1100000 },
    { name: 'Jan', revenue: 1800000, expenses: 950000 },
    { name: 'Feb', revenue: 3200000, expenses: 1400000 },
    { name: 'Mar', revenue: 2900000, expenses: 1250000 },
    { name: 'Apr', revenue: stats.totalRevenue > 0 ? stats.totalRevenue : 4628000, expenses: 1800000 },
  ], [stats.totalRevenue]);

  /* ── Bar Chart (weekly tasks) ── */
  const weekData = [
    { day: t('أحد', 'Sun'), tasks: 4 },
    { day: t('اثن', 'Mon'), tasks: 8 },
    { day: t('ثلا', 'Tue'), tasks: 6 },
    { day: t('أرب', 'Wed'), tasks: 11 },
    { day: t('خمس', 'Thu'), tasks: 7 },
    { day: t('جمع', 'Fri'), tasks: 3 },
    { day: t('سبت', 'Sat'), tasks: 5 },
  ];

  /* ── Recent Activity ── */
  const activity = [
    { icon: '🧾', title: t('فاتورة جديدة #INV-041', 'New Invoice #INV-041'), sub: t('أبو رغد للمقاولات — 850,000 د.ع', 'Abu Raghad Construction — IQD 850K'), time: '2m', color: 'var(--accent)' },
    { icon: '✅', title: t('مهمة مكتملة', 'Task Completed'),           sub: t('مراجعة العقود الشهرية', 'Monthly contract review'),              time: '18m', color: 'var(--green)' },
    { icon: '📅', title: t('اجتماع مجدوّل', 'Meeting Scheduled'),      sub: t('فريق التسويق — الثلاثاء 10 ص', 'Marketing team — Tue 10AM'),       time: '1h',  color: 'var(--sky)' },
    { icon: '⚠️', title: t('فاتورة متأخرة', 'Overdue Invoice'),        sub: t('شركة الفجر — 420,000 د.ع', 'Al-Fajr Co — IQD 420K'),              time: '3h',  color: 'var(--coral)' },
    { icon: '👤', title: t('عميل جديد', 'New Client'),                  sub: t('مجموعة النور التجارية', 'Al-Nour Trading Group'),                  time: '5h',  color: 'var(--gold)' },
  ];

  const fmtCurrency = (v: number) =>
    v >= 1_000_000
      ? `${(v / 1_000_000).toFixed(1)}M`
      : v >= 1_000
        ? `${(v / 1_000).toFixed(0)}K`
        : v.toLocaleString();

  return (
    <Shell
      topbarActions={
        <>
          <Button variant="ghost" size="sm" onClick={() => toast(t('تصدير البيانات...', 'Exporting data...'))}>
            {t('تصدير ↓', 'Export ↓')}
          </Button>
          <Button variant="primary" size="sm" onClick={() => toast(t('تم تحديث البيانات 🔄', 'Data updated 🔄'))}>
            {t('تحديث', 'Refresh')} 🔄
          </Button>
        </>
      }
    >
      {/* ── Page Header ── */}
      <PageHeader
        icon="📊"
        iconBg="rgba(210, 95, 30, 0.12)"
        title={t('لوحة المتابعة', 'Dashboard')}
        subtitle={t(
          'نظرة شاملة على أداء أعمالك — الإيرادات والمهام والنشاط',
          'A complete overview of your business performance — revenue, tasks & activity',
        )}
        stats={[
          { num: String(savedInvoices.length), label: t('فاتورة', 'Invoices'), color: 'var(--accent)' },
          { num: String(stats.activeClients),  label: t('عميل',   'Clients'),  color: 'var(--gold)'   },
        ]}
      />

      {/* ── KPI Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        <StatCard
          index={0}
          label={t('إجمالي الإيرادات', 'Total Revenue')}
          value={`${fmtCurrency(stats.totalRevenue)} ${t('د.ع', 'IQD')}`}
          icon="💰"
          color="var(--accent)"
          bg="rgba(210, 95, 30, 0.12)"
          trend="12%"
          trendUp
        />
        <StatCard
          index={1}
          label={t('أموال معلقة', 'Pending Funds')}
          value={`${fmtCurrency(stats.pendingAmount)} ${t('د.ع', 'IQD')}`}
          icon="⏳"
          color="#FFB950"
          bg="rgba(255, 185, 80, 0.12)"
          trend="3%"
          trendUp
        />
        <StatCard
          index={2}
          label={t('أموال متأخرة', 'Overdue Funds')}
          value={`${fmtCurrency(stats.overdueAmount)} ${t('د.ع', 'IQD')}`}
          icon="⚠️"
          color="var(--coral)"
          bg="rgba(240, 90, 90, 0.12)"
          trend="5%"
          trendUp={false}
        />
        <StatCard
          index={3}
          label={t('عملاء نشطين', 'Active Clients')}
          value={stats.activeClients.toString()}
          icon="👥"
          color="var(--sky)"
          bg="rgba(56, 189, 239, 0.12)"
          trend="8%"
          trendUp
        />
      </div>

      {/* ── Quick Actions ── */}
      <Card>
        <CardBody style={{ padding: '1rem 1.2rem' }}>
          <div style={{
            fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted2)',
            textTransform: 'uppercase', letterSpacing: '0.12em',
            fontFamily: 'var(--font-en)', marginBottom: '0.75rem',
          }}>
            {t('إجراءات سريعة', 'Quick Actions')}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <QuickAction
              icon="🧾" label={t('فاتورة جديدة', 'New Invoice')}
              color="var(--accent)" bg="rgba(210,95,30,0.08)"
              onClick={() => toast(t('افتح صفحة الفواتير', 'Go to Invoices'))}
            />
            <QuickAction
              icon="✅" label={t('مهمة جديدة', 'New Task')}
              color="var(--green)" bg="rgba(62,201,139,0.08)"
              onClick={() => toast(t('افتح صفحة المهام', 'Go to Tasks'))}
            />
            <QuickAction
              icon="📅" label={t('جدولة اجتماع', 'Schedule Meeting')}
              color="var(--sky)" bg="rgba(56,189,239,0.08)"
              onClick={() => toast(t('افتح التقويم', 'Open Calendar'))}
            />
            <QuickAction
              icon="📄" label={t('قالب جديد', 'New Template')}
              color="var(--gold)" bg="rgba(255,185,80,0.08)"
              onClick={() => toast(t('افتح القوالب', 'Go to Templates'))}
            />
          </div>
        </CardBody>
      </Card>

      {/* ── Main Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1rem' }}>

        {/* Revenue Area Chart */}
        <Card>
          <CardHeader
            title={
              <>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'inline-block',
                  boxShadow: '0 0 6px var(--glow-accent)',
                  animation: 'pulse 2s infinite',
                }} />
                {t('تدفق الإيرادات', 'Revenue Flow')}
              </>
            }
            subtitle={t('آخر 6 أشهر', 'Last 6 months')}
            actions={
              <div style={{
                fontSize: '0.7rem', color: 'var(--muted)',
                fontFamily: 'var(--font-en)',
              }}>
                <span style={{ color: 'var(--accent)', marginInlineEnd: '0.8rem' }}>
                  ■ {t('إيرادات', 'Revenue')}
                </span>
                <span style={{ color: 'var(--muted2)' }}>
                  ■ {t('مصروفات', 'Expenses')}
                </span>
              </div>
            }
          />
          <CardBody style={{ height: 260, padding: '1rem 0.5rem 0.5rem', direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#D25F1E" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#D25F1E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#FFB950" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#FFB950" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--muted2)" fontSize={11} tickLine={false} axisLine={false} fontFamily="Inter" />
                <YAxis stroke="var(--muted2)" fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + 'M' : (v / 1_000).toFixed(0) + 'K'}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="expenses" stroke="#FFB950" strokeWidth={1.5}
                  fillOpacity={1} fill="url(#gradExpenses)" strokeDasharray="4 2" />
                <Area type="monotone" dataKey="revenue" stroke="#D25F1E" strokeWidth={2.5}
                  fillOpacity={1} fill="url(#gradRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Donut + Bar column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Funds Donut */}
          <Card style={{ flex: 1 }}>
            <CardHeader title={t('توزيع الأموال', 'Funds Split')} />
            <CardBody style={{ padding: '0.5rem 1rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexDirection: 'column' }}>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={42} outerRadius={62}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                    {pieData.map((d, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        fontSize: '0.75rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block' }} />
                          <span style={{ color: 'var(--muted)' }}>{d.name}</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-en)', fontWeight: 700, color: d.color }}>
                          {fmtCurrency(d.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                  🍃 {t('لا توجد بيانات بعد', 'No data yet')}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ── Bottom Row: Activity + Weekly Tasks ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* Recent Activity */}
        <Card>
          <CardHeader
            title={t('آخر النشاطات', 'Recent Activity')}
            actions={
              <Button variant="ghost" size="sm">{t('عرض الكل', 'View all')}</Button>
            }
          />
          <CardBody style={{ padding: '0.2rem 1.2rem 0.8rem' }}>
            {activity.map((a, i) => (
              <ActivityItem key={i} {...a} index={i} />
            ))}
          </CardBody>
        </Card>

        {/* Weekly Tasks Bar */}
        <Card>
          <CardHeader
            title={t('المهام الأسبوعية', 'Weekly Tasks')}
            subtitle={t('إجمالي هذا الأسبوع', 'Total this week')}
            actions={
              <div style={{
                fontSize: '1.1rem', fontWeight: 800,
                fontFamily: 'var(--font-en)',
                color: 'var(--accent)',
              }}>
                {weekData.reduce((s, d) => s + d.tasks, 0)}
              </div>
            }
          />
          <CardBody style={{ height: 220, padding: '1rem 0.5rem 0.5rem', direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} barSize={20} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="var(--muted2)" fontSize={11} tickLine={false} axisLine={false} fontFamily="Inter" />
                <YAxis stroke="var(--muted2)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(210,95,30,0.06)', radius: 6 }} />
                <Bar dataKey="tasks" fill="var(--accent)" radius={[6, 6, 0, 0]}
                  background={{ fill: 'var(--bg3)', radius: 6 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

    </Shell>
  );
}
