import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { UpgradeModal } from '../../pages/Upgrade';

/* ══════════════════════════════
   AI PANEL
══════════════════════════════ */
interface AiChip {
  label: string;
  onClick: () => void;
}
interface AiPanelProps {
  message: string;
  chips?: AiChip[];
}

export function AiPanel({ message, chips = [] }: AiPanelProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg,rgba(108,99,255,.07),rgba(56,189,248,.04))',
      border: '1px solid rgba(108,99,255,.18)',
      borderRadius: 'var(--radius-lg)',
      padding: '0.85rem 1rem',
    }}>
      <div style={{
        fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent2)',
        display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem',
      }}>
        <span className="ai-pulse" />
        ذكاء WorkHub
      </div>
      <p style={{
        fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.65,
        marginBottom: chips.length ? '0.7rem' : 0,
        paddingRight: '0.7rem', borderRight: '1.5px solid rgba(108,99,255,.25)',
      }}>
        {message}
      </p>
      {chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {chips.map((chip, i) => (
            <button
              key={i}
              onClick={chip.onClick}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--muted)', padding: '0.22rem 0.6rem',
                borderRadius: '7px', fontSize: '0.7rem', cursor: 'pointer',
                fontFamily: 'var(--font-ar)', transition: 'var(--transition)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,.3)';
                (e.currentTarget as HTMLElement).style.color = 'var(--accent2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.color = 'var(--muted)';
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════
   PLAN CARD
══════════════════════════════ */
interface PlanCardProps {
  tier: 'free' | 'pro' | 'enterprise';
  nameAr: string;
  used: number;
  limit: number;
  unit: string;
  accentColor?: string;
}

export function PlanCard({
  nameAr,
  used,
  limit,
  unit,
  accentColor = 'var(--accent2)',
}: PlanCardProps) {
  const pct = Math.round((used / limit) * 100);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <>
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '0.75rem 0.9rem',
    }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>
        خطتك الحالية
      </div>
      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: accentColor, marginBottom: '0.4rem' }}>
        {nameAr}
      </div>
      <div style={{ height: 3, background: 'var(--bg)', borderRadius: 2, marginBottom: '0.3rem', overflow: 'hidden' }}>
        <div style={{
          height: 3, borderRadius: 2, width: `${pct}%`,
          background: `linear-gradient(90deg, ${accentColor}, var(--accent3))`,
        }} />
      </div>
      <div style={{
        fontSize: '0.65rem', color: 'var(--muted)',
        display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem',
      }}>
        <span>{used} / {limit} {unit}</span>
        <span>{pct}%</span>
      </div>
      <button 
        onClick={() => setUpgradeOpen(true)}
        style={{
          width: '100%', background: 'var(--accent)', border: 'none',
          color: '#fff', padding: '0.42rem', borderRadius: 8,
          fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-ar)',
          transition: 'background 0.18s',
        }}>
        ⬆ ترقية للاحترافي
      </button>
    </div>
    
    {upgradeOpen && createPortal(
      <UpgradeModal onClose={() => setUpgradeOpen(false)} />,
      document.body
    )}
    </>
  );
}
