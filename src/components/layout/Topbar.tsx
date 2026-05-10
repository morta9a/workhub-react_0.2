import React from 'react';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getPageTitle, getCategoryLabel } from '../../data/navigation';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Topbar.module.css';
import { ProfileModal } from '../../pages/ProfileModal';
import { UpgradeModal } from '../../pages/Upgrade';
import logoDark from '../../svg/workhub-logo-dark.svg';
import logoLight from '../../svg/workhub-logo-light.svg';

interface TopbarProps {
  actions?: React.ReactNode;
  onToggleSidebar?: () => void;
}

// Single toggle button
function ToggleBtn({
  onClick, children, title,
}: { onClick: () => void; children: React.ReactNode; title?: string }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'rgba(210,95,30,0.12)' : 'var(--bg3)',
        border: `1px solid ${hover ? 'rgba(210,95,30,0.35)' : 'var(--border2)'}`,
        color: hover ? 'var(--accent2)' : 'var(--muted)',
        borderRadius: 100,
        padding: '0.28rem 0.8rem',
        fontSize: '0.76rem',
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'var(--font-ar)',
        whiteSpace: 'nowrap',
        transition: 'all .18s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

export function Topbar({ actions, onToggleSidebar }: TopbarProps) {
  const { pathname } = useLocation();
  const { theme, lang, toggleTheme, toggleLang, notifications, markNotificationsRead } = useApp();
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const pageTitle = getPageTitle(pathname, lang);
  const categoryLabel = getCategoryLabel(pathname, lang);
  const showUpgradeBtn = user?.plan !== 'enterprise' && user?.email !== 'admin@workhub.io';

  return (
    <>
    <header className={styles.topbar}>
      <button 
        className={styles.hamburger} 
        onClick={onToggleSidebar}
        aria-label="Toggle Menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Logo — uses SVG files, switches based on theme */}
      <div className={styles.logo}>
        <img
          src={theme === 'dark' ? logoDark : logoLight}
          alt="WorkHub"
          className={styles.logoImg}
        />
      </div>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="breadcrumb">
        <span>WorkHub</span>
        {categoryLabel && (
          <>
            <span className={styles.sep}>/</span>
            <span>{categoryLabel}</span>
          </>
        )}
        {pageTitle && (
          <>
            <span className={styles.sep}>/</span>
            <span className={styles.current}>{pageTitle}</span>
          </>
        )}
      </nav>

      {/* Actions slot */}
      <div className={styles.actions}>
        {actions}

        {/* Upgrade button — shown for free/pro users */}
        {showUpgradeBtn && (
          <ToggleBtn onClick={() => setUpgradeOpen(true)} title="ترقية خطتك">
            ✦ ترقية
          </ToggleBtn>
        )}

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <ToggleBtn 
            onClick={() => {
              if (notifOpen) {
                setNotifOpen(false);
              } else {
                setNotifOpen(true);
                markNotificationsRead();
              }
            }} 
            title="الإشعارات"
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', animation: unreadCount > 0 ? 'pulse-notif 1.5s infinite' : 'none' }}>🔔</span>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--coral)', color: '#fff', fontSize: '0.55rem', minWidth: 14, height: 14, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, border: '2px solid var(--bg3)', boxShadow: '0 0 10px rgba(248,113,113,0.5)' }}>
                  {unreadCount}
                </span>
              )}
            </div>
          </ToggleBtn>

          {notifOpen && (
            <div style={{ position: 'absolute', top: '120%', right: lang === 'ar' ? 'auto' : 0, left: lang === 'ar' ? 0 : 'auto', width: 280, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 14, boxShadow: '0 15px 40px rgba(0,0,0,0.4)', zIndex: 300, overflow: 'hidden' }}>
              <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>الإشعارات</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{notifications.length} إجمالي</span>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id} style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', background: n.read ? 'transparent' : 'rgba(108,99,255,0.05)', transition: 'background 0.2s' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: n.read ? 400 : 600, color: 'var(--text)', marginBottom: '0.2rem' }}>{n.title}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted2)' }}>{new Date(n.at).toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                )) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem' }}>لا توجد إشعارات جديدة</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <ToggleBtn onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </ToggleBtn>

        {/* Lang toggle */}
        <ToggleBtn onClick={toggleLang} title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}>
          {lang === 'ar' ? 'EN' : 'ع'}
        </ToggleBtn>

        <div 
          onClick={() => setProfileOpen(true)}
          className={styles.avatar} 
          title={lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {user?.avatar || '؟'}
        </div>
      </div>
    </header>

    {/* Render modals via Portal to escape header's stacking context (backdrop-filter) */}
    {profileOpen && createPortal(
      <ProfileModal onClose={() => setProfileOpen(false)} />,
      document.body
    )}
    {upgradeOpen && createPortal(
      <UpgradeModal onClose={() => setUpgradeOpen(false)} />,
      document.body
    )}
    </>
  );
}
