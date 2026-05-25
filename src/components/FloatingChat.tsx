"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import styles from "./FloatingChat.module.css";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Position & Drag state
  const [position, setPosition] = useState({ x: -1, y: -1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  // Size state
  const [size, setSize] = useState({ width: 320, height: 400 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; initW: number; initH: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial position bottom right
    if (typeof window !== "undefined" && position.x === -1) {
      setPosition({
        x: window.innerWidth - 80,
        y: window.innerHeight - 80
      });
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // --- Drag Logic ---
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag from the bubble itself
    if (isOpen) return; // if open, we don't drag the bubble, or maybe we do, but let's keep it simple
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y
    };
    setIsDragging(false); // will be true if moved
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setIsDragging(true);
    }

    if (isDragging) {
      // Bound to screen
      let newX = dragRef.current.initX + dx;
      let newY = dragRef.current.initY + dy;
      
      newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 60));

      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
    
    // If it wasn't dragged, consider it a click
    if (!isDragging) {
      setIsOpen(prev => !prev);
    }
    
    setTimeout(() => setIsDragging(false), 0);
  };

  // --- Resize Logic ---
  const handleResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initW: size.width,
      initH: size.height
    };
    setIsResizing(true);
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!isResizing || !resizeRef.current) return;
    const dx = e.clientX - resizeRef.current.startX;
    const dy = e.clientY - resizeRef.current.startY;
    
    // We are resizing from bottom-right corner. 
    // Wait, the chat is positioned with bottom: 68px and right: 0 relative to the bubble.
    // If we drag bottom-right, since it's anchored right, dx should actually be negative to expand? 
    // No, if it's anchored right, changing width will expand to the left.
    // If we drag the right edge, dx increases width. Wait, the resizer is bottom-right.
    
    const newW = Math.max(280, Math.min(window.innerWidth - 20, resizeRef.current.initW + dx));
    const newH = Math.max(300, Math.min(window.innerHeight - 100, resizeRef.current.initH + dy));
    
    setSize({ width: newW, height: newH });
  };

  const handleResizeEnd = (e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    resizeRef.current = null;
    setIsResizing(false);
  };

  // --- Chat Logic ---
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: `Error: ${data.error}` }]);
      }
    } catch (err: any) {
      setMessages([...newMessages, { role: "assistant", content: `Error connecting to AI server.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent rendering if not mounted
  if (position.x === -1) return null;

  return (
    <div 
      className={styles.wrapper} 
      style={{ left: position.x, top: position.y }}
    >
      {/* Chat Window */}
      {isOpen && (
        <div 
          className={styles.chatWindow}
          style={{ width: size.width, height: size.height }}
        >
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <Sparkles size={18} color="#000" />
              Tilda AI
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.messages}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#888', marginTop: 20, fontSize: 13 }}>
                Tanya saya apa saja tentang produktivitas!
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.messageRow} ${styles[msg.role]}`}>
                <div className={styles.bubbleMsg}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.messageRow} ${styles.assistant}`}>
                <div className={styles.bubbleMsg}>
                  <div className={styles.loadingDot} />
                  <div className={styles.loadingDot} />
                  <div className={styles.loadingDot} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Ketik pesan..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim() || isLoading}>
              <Send size={18} />
            </button>
          </div>

          {/* Resizer Handle */}
          <div 
            className={styles.resizer}
            onPointerDown={handleResizeStart}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            onPointerCancel={handleResizeEnd}
          />
        </div>
      )}

      {/* Draggable Bubble */}
      <button 
        className={styles.bubble}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        title="Tanya AI"
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
}
