// ── useToast ──────────────────────────────────
import { useCallback, useRef } from 'react';

export function useToast() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((msg: string, duration = 2500) => {
    let el = document.getElementById('wh-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'wh-toast';
      Object.assign(el.style, {
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--bg3)',
        border: '1px solid var(--border2)',
        color: 'var(--text)',
        padding: '.55rem 1.3rem',
        borderRadius: '10px',
        fontSize: '.82rem',
        zIndex: '9999',
        fontFamily: 'var(--font-ar)',
        boxShadow: '0 4px 20px rgba(0,0,0,.4)',
        transition: 'opacity .3s',
        opacity: '0',
        pointerEvents: 'none',
      });
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (el) el.style.opacity = '0';
    }, duration);
  }, []);

  return { toast };
}
