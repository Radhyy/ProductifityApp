"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Settings2 } from "lucide-react";
import styles from "./page.module.css";
import { getStats, recordFocusSession } from "@/actions/stats";

type Mode = "Pomodoro" | "Short Break" | "Long Break";

export default function FocusPage() {
  const [mode, setMode] = useState<Mode>("Pomodoro");
  const [modeTimes, setModeTimes] = useState<Record<Mode, number>>({
    "Pomodoro": 25 * 60,
    "Short Break": 5 * 60,
    "Long Break": 15 * 60,
  });
  
  const [timeLeft, setTimeLeft] = useState(modeTimes["Pomodoro"]);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);

  useEffect(() => {
    // Fetch initial stats
    getStats().then(res => {
      if (res.success && res.data) {
        setTotalFocusMinutes(res.data.focusMinutes || 0);
        setSessionsCompleted(Math.floor((res.data.focusMinutes || 0) / 25)); // rough estimate for total sessions
      }
    });
  }, []);

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === "Pomodoro") {
        const minutesAdded = Math.floor(modeTimes["Pomodoro"] / 60);
        setSessionsCompleted(s => s + 1);
        setTotalFocusMinutes(t => t + minutesAdded);
        recordFocusSession(minutesAdded);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modeTimes[mode]);
  };

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(modeTimes[newMode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const saveSettings = () => {
    const newTimes: Record<Mode, number> = {
      "Pomodoro": (tempSettings.pomodoro || 1) * 60,
      "Short Break": (tempSettings.shortBreak || 1) * 60,
      "Long Break": (tempSettings.longBreak || 1) * 60,
    };
    setModeTimes(newTimes);
    setShowSettings(false);
    setIsActive(false);
    
    // Update current time left if we're changing the current mode's duration
    setTimeLeft(newTimes[mode]);
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Focus</h1>
          <p className={styles.subtitle}>Stay productive</p>
        </div>
        <button 
          className={styles.secondaryBtn} 
          style={{ width: 40, height: 40 }}
          onClick={() => {
            setTempSettings({
              pomodoro: Math.floor(modeTimes["Pomodoro"] / 60),
              shortBreak: Math.floor(modeTimes["Short Break"] / 60),
              longBreak: Math.floor(modeTimes["Long Break"] / 60)
            });
            setShowSettings(true);
          }}
        >
          <Settings2 size={20} />
        </button>
      </header>

      {/* Mode Selector */}
      <div className={styles.modeSelector}>
        {(Object.keys(modeTimes) as Mode[]).map((m) => (
          <button
            key={m}
            className={`${styles.modeBtn} ${mode === m ? styles.active : ""}`}
            onClick={() => changeMode(m)}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Timer Circle/Card */}
      <div className={`glass-card ${styles.timerCard}`}>
        <div className={styles.timeDisplay}>
          {formatTime(timeLeft)}
        </div>
        
        <div className={styles.controls}>
          <button className={styles.secondaryBtn} onClick={resetTimer}>
            <RotateCcw size={24} />
          </button>
          <button className={styles.mainBtn} onClick={toggleTimer}>
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: 4 }} />}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={`glass-card ${styles.statCard}`}>
          <span className={styles.statLabel}>Total Sessions</span>
          <span className={styles.statValue}>{sessionsCompleted}</span>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <span className={styles.statLabel}>Total Focus Time</span>
          <span className={styles.statValue}>{totalFocusMinutes} min</span>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className={styles.modalOverlay} onClick={() => setShowSettings(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalHeader}>Timer Settings</h2>
            
            <div className={styles.inputGroup}>
              <label>Pomodoro (min)</label>
              <input 
                type="number" 
                min="1" 
                max="60"
                value={tempSettings.pomodoro}
                onChange={e => setTempSettings({...tempSettings, pomodoro: parseInt(e.target.value) || 0})}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Short Break (min)</label>
              <input 
                type="number" 
                min="1" 
                max="30"
                value={tempSettings.shortBreak}
                onChange={e => setTempSettings({...tempSettings, shortBreak: parseInt(e.target.value) || 0})}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Long Break (min)</label>
              <input 
                type="number" 
                min="1" 
                max="60"
                value={tempSettings.longBreak}
                onChange={e => setTempSettings({...tempSettings, longBreak: parseInt(e.target.value) || 0})}
              />
            </div>

            <button className={styles.saveBtn} onClick={saveSettings}>
              Save Changes
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
