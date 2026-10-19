import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ChatProvider } from "@/context/ChatContext";
import { AuthModal } from "@/components/AuthModal";

const serifFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kitto.uz'),
  title: {
    default: 'Kitto — Kitob almashish va ulashish platformasi | kitto.uz',
    template: '%s | Kitto.uz',
  },
  description:
    "Toshkent bo'ylab kitobxonlar bilan kitoblarni vaqtincha o'qishga almashing, doimiy almashtiring yoki bepul ulashing. Xaritadan eng yaqin kitobni toping.",
  keywords: ['kitto', 'kitto.uz', 'kitob almashish', 'kitob ulashish', 'Toshkent kitoblar', 'mutolaa'],
  openGraph: {
    title: 'Kitto — Yaqiningizdagi kitobxonlar bilan kitob almashing',
    description: "Javoningizdagi kitoblarni ulashing va o'zingizga yaqin joydan yangi kitoblar toping.",
    url: 'https://kitto.uz',
    siteName: 'Kitto.uz',
    locale: 'uz_UZ',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F7F4" },
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`light ${serifFont.variable} ${sansFont.variable}`} suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#F8F7F4] dark:bg-zinc-950 text-[#141413] dark:text-[#F8F7F4] font-sans selection:bg-stone-800 selection:text-white dark:selection:bg-stone-200 dark:selection:text-stone-900 transition-colors duration-200">
        <ToastProvider>
          <AuthProvider>
            <ChatProvider>
              {children}
              <AuthModal />
            </ChatProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
