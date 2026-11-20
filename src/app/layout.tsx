import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ChatProvider } from "@/context/ChatContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthModal } from "@/components/AuthModal";
import { PhonePromptModal } from "@/components/PhonePromptModal";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kitto.uz'),
  title: {
    default: 'Kitto — Toshkentda kitob almashish platformasi',
    template: '%s | Kitto.uz',
  },
  description:
    "Toshkentda kitobxonlar bilan kitob almashing. Xaritadan eng yaqin kitobni toping.",
  keywords: ['kitto', 'kitto.uz', 'kitob almashish', 'kitob ulashish', 'Toshkent kitoblar', 'mutolaa'],
  icons: {
    icon: '/kittologo.jpg',
    shortcut: '/kittologo.jpg',
    apple: '/kittologo.jpg',
  },
  openGraph: {
    title: 'Kitto — Toshkentda kitob almashish platformasi',
    description: "Toshkentda kitobxonlar bilan kitob almashing. Xaritadan eng yaqin kitobni toping.",
    url: 'https://kitto.uz',
    siteName: 'Kitto.uz',
    locale: 'uz_UZ',
    type: 'website',
    images: [
      {
        url: '/kittologo.jpg',
        width: 640,
        height: 640,
        alt: 'Kitto Logo',
      },
    ],
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
    <html lang="uz" className={`dark ${sansFont.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('kitto_theme');
                  if (t === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#F8F7F4] dark:bg-zinc-950 text-[#141413] dark:text-[#F8F7F4] font-sans selection:bg-amber-600 selection:text-white dark:selection:bg-amber-500 dark:selection:text-zinc-900 overflow-x-clip transition-colors duration-200">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <ChatProvider>
                {children}
                <AuthModal />
                <PhonePromptModal />
              </ChatProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
