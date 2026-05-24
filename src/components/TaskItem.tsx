"use client";

import { Circle, CheckCircle2, Clock, Calendar } from "lucide-react";
import styles from "@/app/tasks/page.module.css";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
  submittedAt?: string;
};

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

export default function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <div 
      className={`glass-card ${styles.taskItem}`}
      onClick={() => onToggle(task.id)}
    >
      <div style={{ flexShrink: 0 }}>
        {task.completed ? (
          <CheckCircle2 color="var(--accent-green)" size={24} />
        ) : (
          <Circle color="var(--text-muted)" size={24} />
        )}
      </div>
      
      <div className={styles.taskContent}>
        <span className={`${styles.taskTitle} ${task.completed ? styles.completed : ""}`}>
          {task.title}
        </span>
        
        <div className={styles.taskMeta}>
          {task.dueDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} /> {task.dueDate}
            </span>
          )}
          {task.category && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {task.category}
            </span>
          )}
          {task.submittedAt && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> Added at {task.submittedAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
