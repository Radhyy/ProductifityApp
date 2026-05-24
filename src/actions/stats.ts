"use server";

import prisma from "@/lib/prisma";
import { checkAuth } from "./auth";

export async function getStats() {
  try {
    const auth = await checkAuth();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    const stat = await prisma.userStat.findUnique({
      where: { userId: auth.user.id }
    });

    const completedTasksCount = await prisma.task.count({
      where: { userId: auth.user.id, completed: true }
    });

    const data = stat || { focusMinutes: 0, tasksCompleted: 0 };
    return { success: true, data: { ...data, tasksCompleted: completedTasksCount } };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

export async function recordFocusSession(minutes: number) {
  try {
    const auth = await checkAuth();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    const stat = await prisma.userStat.upsert({
      where: { userId: auth.user.id },
      create: {
        userId: auth.user.id,
        focusMinutes: minutes,
        tasksCompleted: 0
      },
      update: {
        focusMinutes: {
          increment: minutes
        }
      }
    });

    return { success: true, data: stat };
  } catch (error) {
    console.error("Error recording focus session:", error);
    return { success: false, error: "Failed to record session" };
  }
}
