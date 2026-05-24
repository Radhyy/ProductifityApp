"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import BottomNav from "./BottomNav";

interface Props {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

export default function AuthWall({ children, isAuthenticated }: Props) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage || isAuthenticated) {
    return (
      <div className="app-container">
        {children}
        {!isAuthPage && <BottomNav />}
      </div>
    );
  }

  return (
    <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Blurred Content */}
      <div style={{ 
        filter: 'blur(12px) brightness(0.7)', 
        pointerEvents: 'none', 
        userSelect: 'none', 
        height: '100%', 
        minHeight: '100vh',
        transform: 'scale(1.05)' // prevent blur bleeding edges
      }}>
        {children}
      </div>
      
      {/* Centered message */}
      <div style={{ 
        position: 'absolute', 
        top: 0, left: 0, right: 0, bottom: 90, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 50, 
        padding: 24, 
        textAlign: 'center' 
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 32,
          padding: '40px 24px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: 'white' }}>
            Ingin menggunakan fitur ini?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 24, fontSize: 15 }}>
            Yuk login untuk mulai melacak produktivitasmu.
          </p>
          <Link href="/auth/login" style={{ 
            background: 'white', 
            color: 'black', 
            padding: '16px 32px', 
            borderRadius: 30, 
            fontWeight: 700, 
            textDecoration: 'none', 
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            width: '100%'
          }}>
            Login / Daftar
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
