import React from 'react';

/* ══════════════════════════════
   BUTTON
══════════════════════════════ */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'green' | 'accent' | 'gold' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const padMap = { sm: '0.35rem 0.85rem', md: '0.48rem 1.2rem', lg: '0.6rem 1.6rem' };
  const fszMap = { sm: '0.75rem', md: '0.83rem', lg: '0.9rem' };

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    borderRadius: '100px',
    cursor: 'pointer',
    fontFamily: 'var(--font-ar)',
    fontWeight: 600,
    transition: 'var(--transition)',
    whiteSpace: 'nowrap',
    border: '1px solid transparent',
    fontSize: fszMap[size],
    padding: padMap[size],
    letterSpacing: '0.01em',
  };

  const variants: Record<string, React.CSSProperties> = {
    default:  { background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--muted)' },
    primary:  {
      background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
      borderColor: 'transparent',
      color: '#fff',
      boxShadow: '0 2px 12px var(--glow-accent)',
    },
    green:    { background: 'rgba(62,201,139,.1)', borderColor: 'rgba(62,201,139,.3)', color: 'var(--green)' },
    accent:   {
      background: 'rgba(210, 95, 30, 0.1)',
      borderColor: 'rgba(210, 95, 30, 0.3)',
      color: 'var(--accent2)',
    },
    gold:     {
      background: 'rgba(255, 185, 80, 0.1)',
      borderColor: 'rgba(255, 185, 80, 0.3)',
      color: 'var(--gold)',
    },
    ghost:    { background: 'transparent', borderColor: 'transparent', color: 'var(--muted)' },
    danger:   { background: 'rgba(240,90,90,.1)', borderColor: 'rgba(240,90,90,.3)', color: 'var(--coral)' },
  };

  return (
    <button className={className} style={{ ...base, ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  );
}

/* ══════════════════════════════
   AI BUTTON
══════════════════════════════ */
interface AiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AiButton({ children, ...props }: AiButtonProps) {
  return (
    <button
      style={{
        background: 'linear-gradient(135deg, rgba(210,95,30,0.14), rgba(255,185,80,0.08))',
        border: '1px solid rgba(210,95,30,0.28)',
        color: 'var(--accent2)',
        padding: '0.3rem 0.9rem',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontFamily: 'var(--font-ar)',
        transition: 'var(--transition)',
        fontWeight: 600,
      }}
      {...props}
    >
      <span className="ai-pulse" />
      {children}
    </button>
  );
}

/* ══════════════════════════════
   TOOLBAR DIVIDER
══════════════════════════════ */
export function ToolbarDivider() {
  return (
    <div
      style={{
        width: '1px',
        height: '18px',
        background: 'var(--border2)',
        margin: '0 0.1rem',
        flexShrink: 0,
      }}
    />
  );
}

/* ══════════════════════════════
   TOOLBAR SECTION (left/right)
══════════════════════════════ */
interface ToolbarSectionProps {
  align?: 'left' | 'right';
  children: React.ReactNode;
}
export function ToolbarSection({ align = 'left', children }: ToolbarSectionProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        flex: align === 'left' ? 1 : undefined,
        flexShrink: align === 'right' ? 0 : undefined,
      }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════
   PAGE HEADER — Bloom style
══════════════════════════════ */
interface StatItem {
  num: string;
  label: string;
  color?: string;
}
interface PageHeaderProps {
  icon: string;
  iconBg?: string;
  iconColor?: string;
  title: string;
  subtitle: string;
  stats?: StatItem[];
}

export function PageHeader({
  icon,
  iconBg = 'rgba(210, 95, 30, 0.12)',
  iconColor,
  title,
  subtitle,
  stats,
}: PageHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{
          width: 48, height: 48,
          borderRadius: 14,
          background: iconBg,
          border: `1px solid ${iconColor ? `${iconColor}30` : 'rgba(210,95,30,0.2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem',
          flexShrink: 0,
          boxShadow: `0 4px 16px ${iconColor ? `${iconColor}20` : 'var(--glow-accent)'}`,
        }}>
          {icon}
        </div>
        <div>
          <h1 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '0.2rem',
            lineHeight: 1.2,
          }}>
            {title}
          </h1>
          <p style={{ fontSize: '0.79rem', color: 'var(--muted)', fontWeight: 400, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        </div>
      </div>

      {stats && stats.length > 0 && (
        <div style={{
          display: 'flex', gap: '0', alignItems: 'stretch', flexShrink: 0,
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden',
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '0.6rem 1rem',
              borderInlineEnd: i < stats.length - 1 ? '1px solid var(--border)' : undefined,
            }}>
              <div style={{
                fontFamily: 'var(--font-en)',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: s.color ?? 'var(--accent)',
                lineHeight: 1,
              }}>
                {s.num}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: '0.2rem', whiteSpace: 'nowrap' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════
   CARD — Premium style
══════════════════════════════ */
interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
  hover?: boolean;
}
export function Card({ children, style, accent, hover = false }: CardProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: 'var(--bg2)',
        border: `1px solid ${accent ?? (hovered ? 'var(--border2)' : 'var(--border)')}`,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        transition: 'var(--transition)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: React.ReactNode;
  actions?: React.ReactNode;
  subtitle?: string;
}
export function CardHeader({ title, actions, subtitle }: CardHeaderProps) {
  return (
    <div style={{
      padding: '0.9rem 1.2rem',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <div style={{
          fontSize: '0.87rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          letterSpacing: '-0.01em',
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
            {subtitle}
          </div>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>{actions}</div>}
    </div>
  );
}

export function CardBody({
  children,
  style,
}: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ padding: '1.1rem 1.2rem', ...style }}>{children}</div>;
}

/* ══════════════════════════════
   SECTION LABEL
══════════════════════════════ */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase',
      color: 'var(--muted2)', fontFamily: 'var(--font-en)', fontWeight: 700,
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      margin: '0.8rem 0 0.5rem',
    }}>
      {children}
      <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

/* ══════════════════════════════
   STAT CARD — for dashboard
══════════════════════════════ */
interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
  trend?: string;
  trendUp?: boolean;
  index?: number;
}

export function StatCard({ label, value, icon, color, bg, trend, trendUp, index = 0 }: StatCardProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg2)',
        border: `1px solid ${hovered ? color + '40' : 'var(--border)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: '1.2rem 1.3rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        cursor: 'default',
        transition: 'var(--transition)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? `0 8px 24px ${color}20` : 'var(--shadow-sm)',
        animation: `fadeUp 0.4s ${index * 0.07}s ease both`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(90deg, ${color}, ${color}00)`,
        opacity: hovered ? 1 : 0.5,
        transition: 'var(--transition)',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: 12,
          background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.35rem',
          flexShrink: 0,
          transition: 'var(--transition)',
          filter: hovered ? `drop-shadow(0 0 8px ${color}80)` : 'none',
        }}>
          {icon}
        </div>

        {trend && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            fontSize: '0.72rem', fontWeight: 700,
            color: trendUp ? 'var(--green)' : 'var(--coral)',
            background: trendUp ? 'rgba(62,201,139,0.1)' : 'rgba(240,90,90,0.1)',
            padding: '0.2rem 0.55rem',
            borderRadius: 100,
            fontFamily: 'var(--font-en)',
          }}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>

      <div>
        <div style={{
          fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.3rem',
          fontWeight: 500,
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '1.45rem', fontWeight: 800,
          fontFamily: 'var(--font-en)',
          color: 'var(--text)',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}
