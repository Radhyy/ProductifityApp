"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import styles from "../subpage.module.css";
import { checkAuth } from "@/actions/auth";
import { updateProfile, updatePassword, toggleNotifications } from "@/actions/profile";

export default function AccountSettings() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit states
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  
  const [editingPassword, setEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await checkAuth();
      if (res.success && res.user) {
        setUser(res.user);
        setName(res.user.name);
        setNotifications(res.user.notificationsEnabled ?? true);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSaveName = async () => {
    if (!name.trim()) return;
    const res = await updateProfile(name);
    if (res.success) {
      setUser({ ...user, name });
      setEditingName(false);
    }
  };

  const handleSavePassword = async () => {
    if (!oldPassword || !newPassword) return;
    const res = await updatePassword(oldPassword, newPassword);
    if (res.success) {
      setEditingPassword(false);
      setOldPassword("");
      setNewPassword("");
      alert("Password updated successfully");
    } else {
      alert(res.error);
    }
  };

  const handleToggleNotification = async () => {
    const newValue = !notifications;
    setNotifications(newValue);
    await toggleNotifications(newValue);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-muted)' }}>Loading...</div>;
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <button className={styles.backBtn}>
            <ChevronLeft size={24} />
          </button>
        </Link>
        <h1 className={styles.title}>Account</h1>
      </header>

      <div className={`glass-card ${styles.contentCard}`}>
        <div className={styles.settingRow} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: 16 }}>
          <span className={styles.settingLabel} style={{ minWidth: 100 }}>Username</span>
          {editingName ? (
            <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 0 }}>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                style={{ flex: 1, minWidth: 0, padding: 8, borderRadius: 8, border: '1px solid #ddd' }}
              />
              <button onClick={handleSaveName} style={{ flexShrink: 0, background: '#000', color: '#fff', padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Save</button>
            </div>
          ) : (
            <span className={styles.textMuted} onClick={() => setEditingName(true)} style={{ cursor: 'pointer', flex: 1, textAlign: 'right' }}>
              {user?.name}
            </span>
          )}
        </div>
        
        <div className={styles.settingRow} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: 16, paddingTop: 16 }}>
          <span className={styles.settingLabel}>Email</span>
          <span className={styles.textMuted} style={{ opacity: 0.6 }}>{user?.email}</span>
        </div>

        <div className={styles.settingRow} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: 16, paddingTop: 16 }}>
          <span className={styles.settingLabel} style={{ minWidth: 100 }}>Password</span>
          {editingPassword ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <input type="password" placeholder="Current Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd' }} />
              <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditingPassword(false)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSavePassword} style={{ flex: 1, background: '#000', color: '#fff', padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer' }}>Update</button>
              </div>
            </div>
          ) : (
            <span className={styles.textMuted} onClick={() => setEditingPassword(true)} style={{ cursor: 'pointer', flex: 1, textAlign: 'right' }}>
              ••••••••
            </span>
          )}
        </div>

        <div className={styles.settingRow} style={{ paddingTop: 16 }}>
          <span className={styles.settingLabel}>Notifications</span>
          <div 
            onClick={handleToggleNotification}
            style={{
              width: 50, height: 28, background: notifications ? '#34c759' : '#e5e5ea', 
              borderRadius: 30, position: 'relative', cursor: 'pointer', transition: '0.3s'
            }}
          >
            <div style={{
              width: 24, height: 24, background: '#fff', borderRadius: '50%', 
              position: 'absolute', top: 2, left: notifications ? 24 : 2, 
              transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </div>
        </div>
      </div>
    </main>
  );
}
