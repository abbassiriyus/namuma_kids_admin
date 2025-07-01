'use client';

import Sidebar from './Sidebar';
import styles from '../styles/Layout.module.css';

export default function LayoutComponent({ children }) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main style={{padding:'10p 20px'}} className={styles.main}>
        {children}
      </main>
    </div>
  );
}
