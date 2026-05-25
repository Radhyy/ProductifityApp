import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import NotificationEngine from "@/components/NotificationEngine";
import AuthWall from "@/components/AuthWall";
import SplashScreen from "@/components/SplashScreen";
import FloatingChat from "@/components/FloatingChat";
import { checkAuth } from "@/actions/auth";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#e0c3fc",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Productivity Dashboard",
  description: "All-in-one productivity dashboard with Pomodoro, To-do list, and Schedule.",
  manifest: "/manifest.json",
  icons: {
    icon: "/iconApplicationNew.png",
    apple: "/iconApplicationNew.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Productivity Dashboard",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authRes = await checkAuth();
  const isAuthenticated = authRes.success;

  return (
    <html lang="en">
      <body className={inter.className}>
        <SplashScreen />
        <FloatingChat />
        <ServiceWorkerRegister />
        {isAuthenticated && <NotificationEngine />}
        
        <AuthWall isAuthenticated={isAuthenticated}>
          {children}
        </AuthWall>
      </body>
    </html>
  );
}
