"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAuth } from "./auth";

export async function getTasks() {
  try {
    const auth = await checkAuth();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    const tasks = await prisma.task.findMany({
      where: { userId: auth.user.id },
      orderBy: { submittedAt: 'desc' }
    });
    return { success: true, data: tasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: "Failed to fetch tasks" };
  }
}

export async function createTask(data: {
  title: string;
  category: string;
  submittedAt: string;
}) {
  try {
    const auth = await checkAuth();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    const task = await prisma.task.create({
      data: {
        title: data.title,
        category: data.category,
        submittedAt: data.submittedAt,
        completed: false,
        userId: auth.user.id
      }
    });
    revalidatePath('/tasks');
    return { success: true, data: task };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

export async function toggleTaskCompletion(id: string, completed: boolean) {
  try {
    const auth = await checkAuth();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    const task = await prisma.task.update({
      where: { id, userId: auth.user.id },
      data: { completed }
    });
    revalidatePath('/tasks');
    return { success: true, data: task };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, error: "Failed to update task" };
  }
}

export async function deleteTask(id: string) {
  try {
    const auth = await checkAuth();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    await prisma.task.delete({
      where: { id, userId: auth.user.id }
    });
    revalidatePath('/tasks');
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: "Failed to delete task" };
  }
}
