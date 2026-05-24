"use client";

import { useEffect } from "react";
import { checkAuth } from "@/actions/auth";
import { markEventNotified } from "@/actions/calendar";

export default function NotificationEngine() {
  useEffect(() => {
    // Request permission early
    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }

    const checkEvents = () => {
      const stored = localStorage.getItem("calendarEvents");
      if (!stored) return;

      try {
        const events = JSON.parse(stored);
        const now = new Date();
        
        // Format YYYY-MM-DD reliably in local time
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const localDateStr = `${y}-${m}-${d}`;
        
        // Format HH:MM in local time
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const timeStr = `${hh}:${mm}`;

        let modified = false;

        events.forEach(async (ev: any) => {
          if (ev.date === localDateStr && ev.time === timeStr && !ev.notified) {
            
            // Check user preferences before notifying
            const auth = await checkAuth();
            if (auth.success && auth.user?.notificationsEnabled === false) {
              // Mark as notified without triggering
              ev.notified = true;
              modified = true;
              localStorage.setItem("calendarEvents", JSON.stringify(events));
              if (ev.id) markEventNotified(ev.id);
              return;
            }

            // Trigger Notification
            if (Notification.permission === "granted") {
              // Try Service Worker registration first for better PWA support
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                  registration.showNotification("Reminder", {
                    body: ev.title,
                    icon: '/icon-192x192.png'
                  });
                }).catch(() => {
                  new Notification("Reminder", { body: ev.title, icon: '/icon-192x192.png' });
                });
              } else {
                new Notification("Reminder", { body: ev.title, icon: '/icon-192x192.png' });
              }
            }
            // Mark as notified so it doesn't trigger again
            ev.notified = true;
            modified = true;
            localStorage.setItem("calendarEvents", JSON.stringify(events));
            if (ev.id) markEventNotified(ev.id);
          }
        });
      } catch (e) {
        console.error("Error checking notifications:", e);
      }
    };

    // Check immediately, then every 30 seconds to not miss the minute mark
    checkEvents();
    const intervalId = setInterval(checkEvents, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
