"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Bell, Plus } from "lucide-react";
import styles from "./page.module.css";
import { getEvents, createEvent } from "@/actions/calendar";

type AppEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notified?: boolean;
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<AppEvent[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");

  useEffect(() => {
    // Load events from DB first
    getEvents().then(res => {
      if (res.success && res.data) {
        setEvents(res.data);
        localStorage.setItem("calendarEvents", JSON.stringify(res.data));
      } else {
        // Fallback to local
        const stored = localStorage.getItem("calendarEvents");
        if (stored) setEvents(JSON.parse(stored));
      }
    });
  }, []);

  const saveEvents = (newEvents: AppEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem("calendarEvents", JSON.stringify(newEvents));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleAddEvent = () => {
    if (!newEventTitle || !newEventTime) return;

    // Format selectedDate as YYYY-MM-DD locally
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    const localDateStr = `${y}-${m}-${d}`;

    // Save to DB
    createEvent({ title: newEventTitle, date: localDateStr, time: newEventTime }).then(res => {
      if (res.success && res.data) {
        const updated = [...events, res.data];
        saveEvents(updated);
      } else {
        // Fallback optimis
        const newEvent: AppEvent = {
          id: Date.now().toString(),
          title: newEventTitle,
          date: localDateStr,
          time: newEventTime,
          notified: false
        };
        saveEvents([...events, newEvent]);
      }
    });

    setShowModal(false);
    setNewEventTitle("");
    setNewEventTime("");
    
    // Request notification permission if adding an event
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={`${styles.dayCell} ${styles.empty}`}></div>);
    }
    
    // Actual days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = 
        today.getDate() === i && 
        today.getMonth() === month && 
        today.getFullYear() === year;
        
      const isSelected = 
        selectedDate.getDate() === i && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year;

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasEvent = events.some(e => e.date === dateStr);

      days.push(
        <div 
          key={`day-${i}`} 
          className={`
            ${styles.dayCell} 
            ${styles.currentMonth} 
            ${isToday ? styles.today : ''} 
            ${isSelected ? styles.selected : ''}
          `}
          onClick={() => setSelectedDate(new Date(year, month, i))}
        >
          {i}
          {hasEvent && <div className={styles.eventDot}></div>}
        </div>
      );
    }
    
    return days;
  };

  // Get selected date string for filtering events
  const y = selectedDate.getFullYear();
  const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const d = String(selectedDate.getDate()).padStart(2, '0');
  const selectedDateStr = `${y}-${m}-${d}`;
  
  const selectedEvents = events.filter(e => e.date === selectedDateStr).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Schedule</h1>
          <p className={styles.subtitle}>Plan your days</p>
        </div>
        <button className={styles.actionBtn}>
          <Bell size={20} />
        </button>
      </header>

      {/* Calendar View */}
      <div className={`glass-card ${styles.calendarCard}`}>
        <div className={styles.monthNav}>
          <button className={styles.navBtn} onClick={prevMonth}>
            <ChevronLeft size={24} />
          </button>
          <span className={styles.monthTitle}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button className={styles.navBtn} onClick={nextMonth}>
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className={styles.weekdays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        
        <div className={styles.daysGrid}>
          {renderCalendar()}
        </div>
      </div>

      {/* Events for selected day */}
      <div className={styles.eventsSection}>
        <div className={styles.eventsHeader}>
          <h3>
            {selectedDate.getDate() === new Date().getDate() && selectedDate.getMonth() === new Date().getMonth() 
              ? 'Today' 
              : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>
          <button className={styles.addEventBtn} onClick={() => setShowModal(true)}>
            + Add Event
          </button>
        </div>
        
        {selectedEvents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>No schedule for this day. Enjoy your free time!</p>
        ) : (
          selectedEvents.map(ev => (
            <div key={ev.id} className={`glass-card ${styles.eventItem}`}>
              <div className={styles.eventTime}>{ev.time}</div>
              <div className={styles.eventTitle}>{ev.title}</div>
            </div>
          ))
        )}
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>Add Schedule</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: -16, marginBottom: 8 }}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            
            <div className={styles.inputGroup}>
              <label>Event Title</label>
              <input 
                type="text" 
                placeholder="e.g. Pancasila Day Ceremony" 
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Time</label>
              <input 
                type="time" 
                value={newEventTime}
                onChange={e => setNewEventTime(e.target.value)}
              />
            </div>

            <button className={styles.saveBtn} onClick={handleAddEvent}>
              Save & Set Reminder
            </button>
            <button 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', marginTop: -8, padding: 8, cursor: 'pointer' }}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
