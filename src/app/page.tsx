"use client";

import { Gift, Bell, ChevronRight, CheckCircle2, User } from "lucide-react";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { checkAuth } from "@/actions/auth";
import { getTasks, toggleTaskCompletion } from "@/actions/tasks";
import { getStats } from "@/actions/stats";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [locationGranted, setLocationGranted] = useState(false);
  const [coords, setCoords] = useState<{lat: number, lon: number} | null>(null);
  const [weather, setWeather] = useState<{temp: number, desc: string} | null>(null);
  const [city, setCity] = useState<string>("Locating...");
  const [tasks, setTasks] = useState<any[]>([]);
  const [focusMinutes, setFocusMinutes] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);

  useEffect(() => {
    // Fetch User
    checkAuth().then(res => {
      if (res.success && res.user) {
        setUser(res.user);
        
        // Load Tasks
        getTasks().then(tRes => {
          if (tRes.success) setTasks(tRes.data?.slice(0, 3) || []); // max 3 on dashboard
        });

        // Load Focus Stats
        getStats().then(sRes => {
          if (sRes.success) setFocusMinutes(sRes.data?.focusMinutes || 0);
        });

        // Load notifications (Upcoming Calendar Events)
        const stored = localStorage.getItem("calendarEvents");
        if (stored) {
          const events = JSON.parse(stored);
          const upcoming = events.filter((e: any) => !e.notified);
          setNotifs(upcoming);
        }
      }
      setLoadingUser(false);
    });

    // Request location permission on mount if not already granted
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationGranted(true);
          setCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
          fetchWeather(position.coords.latitude, position.coords.longitude);
          fetchCity(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setLocationGranted(false);
          // Fallback location (e.g. Jakarta) for demo if denied
          fetchWeather(-6.200000, 106.816666);
          fetchCity(-6.200000, 106.816666);
        }
      );
    }
  }, []);

  const fetchCity = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`);
      const data = await res.json();
      if (data && data.city) {
        setCity(data.city.toUpperCase());
      } else if (data && data.locality) {
        setCity(data.locality.toUpperCase());
      } else {
        setCity("UNKNOWN CITY");
      }
    } catch (e) {
      setCity("OFFLINE");
    }
  };

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await res.json();
      if (data && data.current_weather) {
        setWeather({
          temp: Math.round(data.current_weather.temperature),
          desc: getWeatherDescription(data.current_weather.weathercode)
        });
      }
    } catch (e) {
      console.error("Failed to fetch weather", e);
    }
  };

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear sky";
    if (code <= 3) return "Partly cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    if (code <= 99) return "Thunderstorm";
    return "Cloudy";
  };

  return (
    <main className={styles.container}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.greeting}>
          <h1>
            {loadingUser ? "Loading..." : user ? user.name.split(" ")[0] : "Tilda"} <ChevronRight size={20} />
          </h1>
          <span className={styles.subtitle}>{city}</span>
        </div>
        <div className={styles.headerActions} style={{ position: 'relative' }}>
          <button className={styles.iconBtn}>
            <Gift size={24} />
          </button>
          <button className={styles.iconBtn} onClick={() => setShowNotifs(!showNotifs)}>
            <Bell size={24} />
            {notifs.length > 0 && <span style={{ position: 'absolute', top: 6, right: 8, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }}></span>}
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifs && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 280, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: 16, zIndex: 100, border: '1px solid rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#333' }}>Notifications</h3>
              {notifs.length === 0 ? (
                <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: '12px 0' }}>Belum ada notifikasi.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {notifs.map((n, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 12, borderBottom: i < notifs.length - 1 ? '1px solid #eee' : 'none' }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{n.title}</span>
                      <span style={{ fontSize: 11, color: '#888' }}>{n.date} at {n.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Map Card */}
      <div className={`glass-panel ${styles.heroCard}`} style={{ padding: 0, minHeight: '220px', background: '#e0eac6', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.85)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, zIndex: 10, backdropFilter: 'blur(4px)' }}>
          <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center' }}>●</span> Online · Now
        </div>
        
        {/* Real Map using iframe */}
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, overflow: 'hidden' }}>
          {coords ? (
            <iframe 
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.01}%2C${coords.lat - 0.01}%2C${coords.lon + 0.01}%2C${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`}
              style={{ width: '100%', height: 'calc(100% + 100px)', marginTop: '-50px', border: 'none', pointerEvents: 'none', filter: 'hue-rotate(320deg) saturate(0.6) brightness(1.1)' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d1e6d4' }}>
              <div style={{ background: 'rgba(255,255,255,0.9)', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                Loading map...
              </div>
            </div>
          )}
        </div>

        {/* Floating Avatar over Map */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fff', border: '3px solid white', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loadingUser ? (
                <User size={30} color="#888" />
              ) : (
                <img src={user?.avatar || (user ? `https://api.dicebear.com/7.x/micah/svg?seed=${user.name}` : "/icon-192x192.png")} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.95)', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)' }}>
              {loadingUser ? "Loading..." : user ? user.name : "Mobbin House"} <span style={{ color: '#888', fontWeight: 400 }}>for 12 min ›</span>
            </div>
        </div>
      </div>

      {/* Today's Section */}
      <div>
        <div className={styles.sectionHeader}>
          <h2>Today</h2>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>

        <div className={styles.grid}>
          {/* Weather Card */}
          <div className={`glass-card ${styles.gridCard}`} style={{ position: 'relative', overflow: 'hidden', minHeight: 160, display: 'flex', flexDirection: 'column' }}>
            <div className={styles.cardHeader} style={{ zIndex: 2 }}>
              <span>Weather</span>
              <ChevronRight size={16} className="text-muted" color="#8e8e93" />
            </div>
            {/* Adjust text position by using flex-grow and margin */}
            <div className={styles.cardBody} style={{ zIndex: 2, position: 'relative', marginTop: 'auto', paddingBottom: '30px' }}>
              {weather ? (
                <>
                  <p className={styles.muted} style={{ fontSize: 13, fontWeight: 500, color: '#666' }}>{weather.desc}</p>
                  <p className={styles.highlight} style={{ fontSize: 24, marginTop: 4, color: '#333' }}>{weather.temp}°C</p>
                </>
              ) : (
                <p className={styles.muted}>Loading...</p>
              )}
            </div>
            {/* SVG Background for Weather */}
            <svg style={{ position: 'absolute', bottom: -5, left: 0, width: '100%', height: '70px', zIndex: 1 }} viewBox="0 0 100 50" preserveAspectRatio="none">
              <path d="M 0 50 Q 20 10 50 30 T 100 20 L 100 50 Z" fill="#d8d8f6" />
              <path d="M 0 50 Q 30 20 60 40 T 100 30 L 100 50 Z" fill="#e2e2fa" opacity="0.6" />
              <circle cx="85" cy="15" r="6" fill="#a0a0ff" />
            </svg>
          </div>

          {/* Activity Card - Cache bust */}
          <div className={`glass-card ${styles.gridCard}`} style={{ position: 'relative', overflow: 'hidden', minHeight: 160, display: 'flex', flexDirection: 'column' }}>
            <div className={styles.cardHeader} style={{ zIndex: 2 }}>
              <span>Activity</span>
              <ChevronRight size={16} className="text-muted" color="#8e8e93" />
            </div>
            <div className={styles.cardBody} style={{ zIndex: 2, position: 'relative', marginTop: 'auto', paddingBottom: '30px' }}>
              <p className={styles.muted} style={{ fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>Active time</p>
              <p className={styles.highlight} style={{ marginTop: 2, color: 'var(--accent-green)' }}>
                {loadingUser ? "..." : `${focusMinutes} min`}
              </p>
            </div>
            {/* SVG Background for Activity */}
            <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', alignItems: 'flex-end', gap: 6, height: 45, zIndex: 1 }}>
              <div style={{ width: 14, height: '15%', background: '#a7f3d0', borderRadius: 3 }}></div>
              <div style={{ width: 14, height: '35%', background: '#6ee7b7', borderRadius: 3 }}></div>
              <div style={{ width: 14, height: '60%', background: '#34d399', borderRadius: 3 }}></div>
              <div style={{ width: 14, height: '90%', background: '#10b981', borderRadius: 3 }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* To-Do List Section */}
      <div className={styles.sectionHeader} style={{ marginTop: "16px" }}>
        <h2>To-Do List</h2>
        <Link href="/tasks" style={{ color: '#888', fontSize: 14, textDecoration: 'none' }}>View all &gt;</Link>
      </div>
      <div className={`glass-card ${styles.fullCard}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loadingUser ? (
            <span style={{ fontSize: 14, color: '#888' }}>Loading tasks...</span>
          ) : tasks.length === 0 ? (
            <span style={{ fontSize: 14, color: '#888' }}>No tasks for today. Yay!</span>
          ) : (
            tasks.map(task => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={async () => {
                const updated = !task.completed;
                setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: updated } : t));
                await toggleTaskCompletion(task.id, updated);
              }}>
                <CheckCircle2 color={task.completed ? "#34c759" : "#e5e5ea"} size={22} />
                <span style={{ fontSize: 15, fontWeight: 500, color: task.completed ? '#888' : '#333', textDecoration: task.completed ? 'line-through' : 'none' }}>
                  {task.title}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
