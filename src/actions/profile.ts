"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfile(name?: string, avatarBase64?: string) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) return { success: false, error: "Unauthorized" };

  try {
    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (avatarBase64) dataToUpdate.avatar = avatarBase64;

    const user = await prisma.user.update({
      where: { id: sessionId },
      data: dataToUpdate
    });
    
    revalidatePath("/profile");
    return { success: true, user };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function toggleNotifications(enabled: boolean) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.update({
      where: { id: sessionId },
      data: { notificationsEnabled: enabled }
    });
    
    revalidatePath("/profile");
    return { success: true, user };
  } catch (error) {
    console.error("Notification toggle error:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

export async function updatePassword(oldPass: string, newPass: string) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { id: sessionId } });
    if (!user || user.password !== oldPass) {
      return { success: false, error: "Incorrect current password" };
    }

    await prisma.user.update({
      where: { id: sessionId },
      data: { password: newPass }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Password update error:", error);
    return { success: false, error: "Failed to update password" };
  }
}
