"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import styles from "./page.module.css";
import TaskItem, { Task } from "@/components/TaskItem";
import TaskInputForm from "@/components/TaskInputForm";
import { getTasks, createTask, toggleTaskCompletion } from "@/actions/tasks";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const loadTasks = async () => {
    const res = await getTasks();
    if (res.success && res.data) {
      setTasks(res.data as any);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);
  const [filter, setFilter] = useState<"All" | "Pending" | "Completed">("All");

  const toggleTask = async (id: string) => {
    // Optimistic update
    const currentTasks = [...tasks];
    const taskIndex = currentTasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;
    
    const newStatus = !currentTasks[taskIndex].completed;
    currentTasks[taskIndex].completed = newStatus;
    setTasks(currentTasks);

    const res = await toggleTaskCompletion(id, newStatus);
    if (!res.success) {
      // Revert on failure
      loadTasks();
    }
  };

  const addTask = async (title: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Optimistic update
    const tempId = Date.now().toString();
    const newTask: Task = {
      id: tempId,
      title,
      completed: false,
      dueDate: "Today",
      category: "Personal",
      submittedAt: timeStr
    };
    setTasks([newTask, ...tasks]);

    const res = await createTask({
      title,
      category: "Personal",
      submittedAt: timeStr
    });

    if (res.success && res.data) {
      setTasks(current => current.map(t => t.id === tempId ? res.data : t) as any);
    } else {
      // Revert on failure
      loadTasks();
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === "Pending") return !t.completed;
    if (filter === "Completed") return t.completed;
    return true;
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tasks</h1>
          <p className={styles.subtitle}>{tasks.filter(t => !t.completed).length} tasks pending</p>
        </div>
        <button className={styles.actionBtn}>
          <Search size={20} />
        </button>
      </header>

      {/* Extracted Input Form Component */}
      <TaskInputForm onAdd={addTask} />

      {/* Tabs */}
      <div className={styles.tabContainer}>
        {["All", "Pending", "Completed"].map((tab) => (
          <button 
            key={tab} 
            className={`${styles.tab} ${filter === tab ? styles.active : ""}`}
            onClick={() => setFilter(tab as any)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className={styles.taskList}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
            <p>Loading tasks from database...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
            <p>No tasks found.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={toggleTask} />
          ))
        )}
      </div>
    </main>
  );
}
