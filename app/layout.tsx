import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Import the environment checker component
import { EnvironmentChecker } from "@/components/debug/EnvironmentChecker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aipply - Your Job Search Companion",
  description: "Aipply helps you apply privately to thousands of tech companies and start-ups with one profile.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${manrope.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Google Analytics - lazyOnload keeps it off the critical path */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EM9MYZGQN9"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EM9MYZGQN9');
          `}
        </Script>

        {/* Environment checks - development builds only */}
        {process.env.NODE_ENV === "development" && (
          <>
            <Script id="environment-check" strategy="afterInteractive">
              {`
                console.log('🚀 Application starting...');

                const hasLocalStorage = typeof(Storage) !== "undefined";
                const hasIndexedDB = 'indexedDB' in window;

                console.log('🌐 Browser Environment:', {
                  hasLocalStorage,
                  hasIndexedDB,
                  userAgent: navigator.userAgent.substring(0, 50) + '...',
                  url: window.location.href
                });
              `}
            </Script>
            <EnvironmentChecker />
          </>
        )}

        {children}
      </body>
    </html>
  );
}
