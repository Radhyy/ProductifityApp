"use client";

import { useState, useEffect, useRef } from "react";
import { User, Settings, Bell, Shield, CircleHelp, LogOut, ChevronRight, CheckCircle2, Clock, Camera } from "lucide-react";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { checkAuth, logout } from "@/actions/auth";
import { updateProfile } from "@/actions/profile";
import { getStats } from "@/actions/stats";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUser = async () => {
    const res = await checkAuth();
    if (res.success && res.user) {
      const statsRes = await getStats();
      const realStats = statsRes.success && statsRes.data ? statsRes.data : { tasksCompleted: 0, focusMinutes: 0 };
      
      setUser({
        ...res.user,
        avatar: res.user.avatar || `https://api.dicebear.com/7.x/micah/svg?seed=${res.user.name}`,
        stats: { 
          tasksCompleted: realStats.tasksCompleted, 
          focusTime: realStats.focusMinutes < 60 ? `${realStats.focusMinutes}m` : `${Math.floor(realStats.focusMinutes / 60)}h ${realStats.focusMinutes % 60}m`
        }
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      // Optimistic update
      setUser({ ...user, avatar: base64 });
      await updateProfile(undefined, base64);
    };
    reader.readAsDataURL(file);
  };

  const menuItems = [
    { id: "account", label: "Account Settings", icon: User, href: "/profile/account" },
    { id: "notifications", label: "Notifications", icon: Bell, href: "/profile/notifications" },
    { id: "privacy", label: "Privacy & Security", icon: Shield, href: "/profile/privacy" },
    { id: "help", label: "Help & Support", icon: CircleHelp, href: "/profile/help" },
  ];

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <button className="icon-btn" style={{ background: 'transparent', border: 'none' }}>
          <Settings size={24} color="var(--text-main)" />
        </button>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-muted)' }}>Loading...</div>
      ) : user ? (
        <>
          {/* Profile Card */}
          <div className={`glass-card ${styles.profileCard}`}>
            <div className={styles.avatarWrapper} onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', position: 'relative' }}>
              <Image 
                src={user.avatar} 
                alt={user.name} 
                fill 
                className={styles.avatarImg}
              />
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: 4 }}>
                <Camera size={14} color="white" />
              </div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleAvatarChange}
              />
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>{user.name}</h2>
              <p className={styles.profileEmail}>{user.email}</p>
            </div>
            <button className={styles.editBtn} onClick={() => router.push("/profile/account")}>Edit Profile</button>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <div className={`glass-card ${styles.statCard}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} />
                <span className={styles.statLabel}>Tasks Done</span>
              </div>
              <span className={styles.statValue}>{user.stats.tasksCompleted}</span>
            </div>
            <div className={`glass-card ${styles.statCard}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                <Clock size={16} />
                <span className={styles.statLabel}>Focus Time</span>
              </div>
              <span className={styles.statValue}>{user.stats.focusTime}</span>
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-muted)' }}>Please log in.</div>
      )}

      {/* Settings Menu */}
      <div>
        <h3 className={styles.sectionTitle}>Preferences</h3>
        <div className={styles.menuList}>
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.id} style={{ textDecoration: 'none' }}>
                <div className={`glass-card ${styles.menuItem}`}>
                  <div className={styles.menuContent}>
                    <div className={styles.menuIcon}>
                      <Icon size={18} />
                    </div>
                    <span className={styles.menuText}>{item.label}</span>
                  </div>
                  <ChevronRight size={20} color="var(--text-muted)" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div 
        className={`glass-card ${styles.menuItem}`} 
        style={{ marginTop: 8, color: '#ff3b30', cursor: 'pointer' }}
        onClick={async () => {
          await logout();
          window.location.reload();
        }}
      >
        <div className={styles.menuContent}>
          <div className={styles.menuIcon} style={{ background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30' }}>
            <LogOut size={18} />
          </div>
          <span className={styles.menuText} style={{ color: '#ff3b30' }}>Log Out</span>
        </div>
      </div>
    </main>
  );
}
