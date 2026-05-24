"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import styles from "@/app/tasks/page.module.css";

interface TaskInputFormProps {
  onAdd: (title: string) => void;
}

export default function TaskInputForm({ onAdd }: TaskInputFormProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    onAdd(newTaskTitle);
    setNewTaskTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className={`glass-card ${styles.inputCard}`}>
      <input 
        type="text" 
        placeholder="Add a new task..." 
        className={styles.taskInput}
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
      />
      <button type="submit" className={styles.addBtn} disabled={!newTaskTitle.trim()}>
        <Plus size={20} />
      </button>
    </form>
  );
}
