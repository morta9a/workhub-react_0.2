import React from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import styles  from './Shell.module.css';
import { SmartFloatingCalc } from '../ui/SmartFloatingCalc';

interface ShellProps {
  /** Slot: buttons rendered in the Topbar's action area */
  topbarActions?: React.ReactNode;
  /** Slot: toolbar content (left + right) rendered below topbar, above main */
  toolbar?: React.ReactNode;
  /** Page content */
  children: React.ReactNode;
}

/**
 * Shell — the unified layout wrapper.
 * Every page is rendered inside Shell.
 */
export function Shell({ topbarActions, toolbar, children }: ShellProps) {
  return (
    <div className={styles.shell}>
      {/* Row 1: Topbar — spans full width */}
      <Topbar actions={topbarActions} />

      {/* Row 2, Col 1: Sidebar — spans rows 2+3 */}
      <Sidebar />

      {/* Row 2, Col 2: Toolbar */}
      {toolbar && (
        <div className={styles.toolbar}>
          {toolbar}
        </div>
      )}

      {/* Row 3, Col 2: Main content */}
      <main className={styles.main}>
        <div className={styles.mainInner}>
          {children}
        </div>
      </main>

      {/* Floating Smart Calculator */}
      <SmartFloatingCalc />
    </div>
  );
}
