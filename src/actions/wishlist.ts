"use server";

import prisma from "@/lib/prisma";
import { checkAuth } from "./auth";
import { revalidatePath } from "next/cache";

export async function getWishlists() {
  try {
    const auth = await checkAuth();
    if (!auth.success || !auth.user) {
      return { success: false, message: "Unauthorized" };
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: wishlists };
  } catch (error: any) {
    console.error("getWishlists error:", error);
    return { success: false, message: error.message };
  }
}

export async function createWishlist(data: {
  title: string;
  image: string | null;
  targetAmount: number;
  targetMonths: number | null;
  customDaily: number | null;
}) {
  try {
    const auth = await checkAuth();
    if (!auth.success || !auth.user) {
      return { success: false, message: "Unauthorized" };
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        title: data.title,
        image: data.image,
        targetAmount: data.targetAmount,
        targetMonths: data.targetMonths,
        customDaily: data.customDaily,
        userId: auth.user.id,
      },
    });

    revalidatePath("/");
    revalidatePath("/wishlist");
    return { success: true, data: wishlist };
  } catch (error: any) {
    console.error("createWishlist error:", error);
    return { success: false, message: error.message };
  }
}

export async function addSaving(wishlistId: string, amount: number) {
  try {
    const auth = await checkAuth();
    if (!auth.success || !auth.user) {
      return { success: false, message: "Unauthorized" };
    }

    // Verify ownership
    const wishlist = await prisma.wishlist.findUnique({
      where: { id: wishlistId },
    });

    if (!wishlist || wishlist.userId !== auth.user.id) {
      return { success: false, message: "Wishlist not found" };
    }

    // Run transaction to add history and update currentAmount
    await prisma.$transaction([
      prisma.savingHistory.create({
        data: {
          amount,
          wishlistId,
        },
      }),
      prisma.wishlist.update({
        where: { id: wishlistId },
        data: {
          currentAmount: wishlist.currentAmount + amount,
        },
      }),
    ]);

    revalidatePath("/");
    revalidatePath("/wishlist");
    return { success: true };
  } catch (error: any) {
    console.error("addSaving error:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteWishlist(id: string) {
  try {
    const auth = await checkAuth();
    if (!auth.success || !auth.user) {
      return { success: false, message: "Unauthorized" };
    }

    await prisma.wishlist.deleteMany({
      where: { id, userId: auth.user.id },
    });

    revalidatePath("/");
    revalidatePath("/wishlist");
    return { success: true };
  } catch (error: any) {
    console.error("deleteWishlist error:", error);
    return { success: false, message: error.message };
  }
}
