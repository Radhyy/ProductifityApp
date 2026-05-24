"use server";

import prisma from "@/lib/prisma";
import { checkAuth } from "./auth";
import { revalidatePath } from "next/cache";

export async function getEvents() {
  try {
    const auth = await checkAuth();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    const events = await prisma.event.findMany({
      where: { userId: auth.user.id },
      orderBy: [{ date: 'asc' }, { time: 'asc' }]
    });

    return { success: true, data: events };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error: "Failed to fetch events" };
  }
}

export async function createEvent(data: {
  title: string;
  date: string;
  time: string;
}) {
  try {
    const auth = await checkAuth();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    const event = await prisma.event.create({
      data: {
        title: data.title,
        date: data.date,
        time: data.time,
        userId: auth.user.id,
        notified: false
      }
    });
    revalidatePath('/calendar');
    return { success: true, data: event };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: "Failed to create event" };
  }
}

export async function markEventNotified(id: string) {
  try {
    const auth = await checkAuth();
    if (!auth.success || !auth.user) return { success: false, error: "Unauthorized" };

    const event = await prisma.event.update({
      where: { id, userId: auth.user.id },
      data: { notified: true }
    });
    return { success: true, data: event };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: "Failed to update event" };
  }
}
