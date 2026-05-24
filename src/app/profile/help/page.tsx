"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import styles from "../subpage.module.css";

export default function HelpSupport() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <button className={styles.backBtn}>
            <ChevronLeft size={24} />
          </button>
        </Link>
        <h1 className={styles.title}>Help</h1>
      </header>

      <div className={`glass-card ${styles.contentCard}`}>
        <p className={styles.textMuted}>
          Welcome to the Productivity App. Here are some quick tips:
        </p>
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>FAQ</span>
          <span className={styles.textMuted}>&gt;</span>
        </div>
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>Contact Support</span>
          <span className={styles.textMuted}>&gt;</span>
        </div>
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>App Version</span>
          <span className={styles.textMuted}>v1.0.0</span>
        </div>
      </div>
    </main>
  );
}
