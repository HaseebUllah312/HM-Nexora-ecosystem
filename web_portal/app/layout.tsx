// Build trigger: Perfection phase final push
import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { PWAProvider } from "@/context/PWAContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/layout/FloatingButtons";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import PWAInstallPrompt from "@/app/components/PWAInstallPrompt";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import StudyAlarmApp from "@/components/study/StudyAlarmApp";
import CommandPalette from "@/components/layout/CommandPalette";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#020205' },
    { media: '(prefers-color-scheme: light)', color: '#faf9ff' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL("https://hmnexora.tech"),
  title: {
    default: "HM nexora – All-in-One Academic Solution for VU Students",
    template: "%s | HM nexora"
  },
  description: "Access VU handouts, past papers, solved assignments, and LMS handling. The ultimate platform for Virtual University students by HM nexora. Free AI study help.",
  keywords: "VU, Virtual University, VU handouts, VU past papers, solved assignments, VU quiz help, GDB solutions, LMS handling, VU final term files, VU midterm files, academic help, student guider, VU community, study materials, HM nexora, VU MCQs practice, VU study planner, VU handouts download, VU solved quiz files",
  alternates: {
    canonical: "https://hmnexora.tech",
  },
  verification: {
    google: "google-site-verification-placeholder",
    yandex: "yandex-verification-placeholder",
    yahoo: "yahoo-verification-placeholder",
    other: {
      "msvalidate.01": "bing-verification-placeholder",
    },
  },
  applicationName: "HM nexora",
  appleWebApp: {
    title: "HM nexora",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  openGraph: {
    title: "HM nexora – Complete Academic Hub for VU Students",
    description: "Access VU Handouts, Past Papers, Assignment Solutions, and professional LMS handling. Join the fastest-growing VU academic community.",
    type: "website",
    url: "https://hmnexora.tech",
    siteName: "HM nexora",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "HM nexora" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HM nexora – VU Academic Platform",
    description: "Your complete guide for VU academic success. Handouts, Files, and Services.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "HM nexora",
  "url": "https://hmnexora.tech",
  "logo": "https://hmnexora.tech/logo.png",
  "sameAs": [
    "https://facebook.com/hmnexora"
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(registration) {
                console.log('SW registered');
              }, function(err) {
                console.log('SW registration failed: ', err);
              });
            });
          }
        `}} />
        {/* iOS Splash Screens - Comprehensive Support */}
        <link rel="apple-touch-startup-image" href="/icon.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icon.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icon.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icon.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icon.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icon.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icon.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/icon.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <PWAProvider>
              <AnimatedBackground variant="gradient" intensity="medium" showParticles={true} />
              <Header />
              <main className="page">
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </main>
              <Footer />
              <FloatingButtons />
              <PWAInstallPrompt />
              <MobileBottomNav />
              <CommandPalette />
              <StudyAlarmApp />
            </PWAProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
