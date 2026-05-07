import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { NAV_ITEMS, CATEGORY_LABELS } from '../../data/navigation';
import styles from './Sidebar.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

const CATEGORIES = ['productivity', 'ai', 'business'] as const;
const badgeClass: Record<string, string> = {
  purple: styles.badgePurple, gold: styles.badgeGold,
  green:  styles.badgeGreen,  coral: styles.badgeCoral,
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { 
    lang, tasks, savedInvoices, appointments, timeSessions, 
    meetingsHistory, savedTemplates, products, competitors, suppliers 
  } = useApp();

  return (
    <>
      <aside className={styles.sidebar}>
        <nav className={styles.nav}>
          {CATEGORIES.map((cat) => {
            const items = NAV_ITEMS.filter((n) => n.category === cat);
            return (
              <div key={cat}>
                <div className={styles.sectionLabel}>{CATEGORY_LABELS[cat][lang]}</div>
                {items.map((item) => {
                  let badgeValue = item.badge;
                  if (item.id === 'tasks') badgeValue = tasks.length;
                  if (item.id === 'invoices') badgeValue = savedInvoices.length;
                  if (item.id === 'calendar') badgeValue = appointments.length;
                  if (item.id === 'timetrack') badgeValue = timeSessions.length;
                  if (item.id === 'meetings') badgeValue = meetingsHistory.length;
                  if (item.id === 'templates') badgeValue = savedTemplates.length;
                  if (item.id === 'catalog') badgeValue = products.length;
                  if (item.id === 'monitor') badgeValue = competitors.length;
                  if (item.id === 'suppliers') badgeValue = suppliers.length;

                  return (
                    <NavLink key={item.id} to={item.path}
                      className={({ isActive }) => [styles.navItem, isActive ? styles.active : ''].join(' ')}>
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navLabel}>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                      {badgeValue ? (
                        <span className={[styles.badge, item.badgeColor ? badgeClass[item.badgeColor] : ''].join(' ')}>
                          {badgeValue}
                        </span>
                      ) : null}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

