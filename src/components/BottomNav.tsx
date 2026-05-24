"use client";

import { LayoutDashboard, ListTodo, Timer, CalendarDays, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./BottomNav.module.css";
import Image from "next/image";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { id: "today", label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { id: "tasks", label: "Tasks", icon: ListTodo, href: "/tasks" },
    { id: "timer", label: "Focus", icon: Timer, href: "/focus" },
    { id: "calendar", label: "Calendar", icon: CalendarDays, href: "/calendar" },
  ];

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            style={{ textDecoration: 'none' }}
          >
            <div style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isActive && (
                <div style={{ position: 'absolute', width: '100%', height: '100%', background: '#eef2ff', borderRadius: '50%', zIndex: -1 }} />
              )}
              <Icon className={`${styles.icon} ${isActive ? styles.activeIcon : ""}`} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span style={{ marginTop: -2, fontSize: 11 }}>{item.label}</span>
          </Link>
        );
      })}
      
      {/* Profile Avatar as last item */}
      <Link
        href="/profile"
        className={`${styles.navItem} ${pathname === "/profile" ? styles.active : ""}`}
        style={{ textDecoration: 'none' }}
      >
        <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: pathname === '/profile' ? '2px solid var(--accent-blue)' : '2px solid transparent' }}>
          {/* We use a placeholder user icon if no image */}
          <User size={28} color="#444" />
        </div>
      </Link>
    </nav>
  );
}
