"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function login(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.password !== password) {
      return { success: false, error: "Invalid credentials" };
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/"
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An error occurred during login" };
  }
}

export async function register(name: string, email: string, password: string) {
  try {
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return { success: false, error: "Email already registered" };
    }

    const user = await prisma.user.create({
      data: { name, email, password }
    });

    // Auto login
    const cookieStore = await cookies();
    cookieStore.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, error: "An error occurred during registration" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  revalidatePath("/");
  return { success: true };
}

export async function checkAuth() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  console.log("checkAuth: sessionId =", sessionId);
  if (!sessionId) return { success: false };

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { id: true, name: true, email: true, avatar: true, notificationsEnabled: true }
    });
    
    console.log("checkAuth: user found =", !!user);
    if (!user) return { success: false };
    return { success: true, user };
  } catch (error) {
    console.error("checkAuth: error =", error);
    return { success: false };
  }
}
