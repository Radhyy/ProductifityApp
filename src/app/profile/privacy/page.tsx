"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import styles from "../subpage.module.css";

export default function PrivacySettings() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <button className={styles.backBtn}>
            <ChevronLeft size={24} />
          </button>
        </Link>
        <h1 className={styles.title}>Privacy</h1>
      </header>

      <div className={`glass-card ${styles.contentCard}`}>
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>App Lock</span>
          <span className={styles.textMuted}>Off</span>
        </div>
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>Sync Data</span>
          <span className={styles.textMuted}>Local Only</span>
        </div>
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>Clear Data</span>
          <span className={styles.textMuted} style={{ color: '#ff3b30' }}>Delete All</span>
        </div>
      </div>
    </main>
  );
}
