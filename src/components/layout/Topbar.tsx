import React from 'react';
import { useLocation } from 'react-router-dom';
import { getPageTitle, getCategoryLabel } from '../../data/navigation';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Topbar.module.css';
import { ProfileModal } from '../../pages/ProfileModal';
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
  const { theme, lang, toggleTheme, toggleLang } = useApp();
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = React.useState(false);

  const pageTitle = getPageTitle(pathname, lang);
  const categoryLabel = getCategoryLabel(pathname, lang);

  return (
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

        {/* Theme toggle — single button, shows current & next state */}
        <ToggleBtn onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </ToggleBtn>

        {/* Lang toggle — single button, shows opposite lang on click */}
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
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </header>
  );
}
