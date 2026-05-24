"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import styles from "../subpage.module.css";

export default function NotificationsSettings() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <button className={styles.backBtn}>
            <ChevronLeft size={24} />
          </button>
        </Link>
        <h1 className={styles.title}>Notifications</h1>
      </header>

      <div className={`glass-card ${styles.contentCard}`}>
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>Push Notifications</span>
          <span className={styles.textMuted}>Enabled</span>
        </div>
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>Task Reminders</span>
          <span className={styles.textMuted}>Enabled</span>
        </div>
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>Focus Mode Sounds</span>
          <span className={styles.textMuted}>Disabled</span>
        </div>
      </div>
    </main>
  );
}
