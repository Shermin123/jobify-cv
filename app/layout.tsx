import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "./providers/AuthProvider";
import Navbar from "./components/Navbar";
import PageTransition from "./components/PageTransition";
import HilltopBottomBanner from "./components/HilltopBottomBanner";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "jobifycv.co",
  description:
    "jobifycv.co helps you improve your CV, match job keywords, create cover letters, and apply with more confidence.",

  icons: {
    icon: "/jobify-logo-new.png",
    shortcut: "/jobify-logo-new.png",
    apple: "/jobify-logo-new.png",
  },

  openGraph: {
    title: "jobifycv.co",
    description:
      "AI CV Builder that helps you improve your CV, create cover letters, and apply with confidence.",
    url: "https://jobifycv.co",
    siteName: "jobifycv.co",
    images: [
      {
        url: "https://jobifycv.co/jobify-logo-new.png",
        width: 512,
        height: 512,
        alt: "jobifycv.co logo",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "jobifycv.co",
    description:
      "AI CV Builder that helps you improve your CV, create cover letters, and apply with confidence.",
    images: ["https://jobifycv.co/jobify-logo-new.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Google AdSense */}
        <Script
          id="google-adsense"
          strategy="beforeInteractive"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7648291083196313"
          crossOrigin="anonymous"
        />

        {/* Google Analytics loader */}
        <Script
          id="google-analytics-loader"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-ZZLSC9QDXR"
        />

        {/* Google Analytics configuration */}
        <Script
          id="google-analytics-config"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];

            function gtag() {
              window.dataLayer.push(arguments);
            }

            gtag("js", new Date());
            gtag("config", "G-ZZLSC9QDXR");
          `}
        </Script>
      </head>

      <body className="flex min-h-full flex-col bg-black pb-[100px] text-white">
        {/* BidVertiser verification */}
        <div
          dangerouslySetInnerHTML={{
            __html: "<!-- Bidvertiser2105376 -->",
          }}
        />

        <AuthProvider>
          <Navbar />

          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
        </AuthProvider>

        <Analytics />

        {/* Infolinks account configuration */}
        <Script id="infolinks-config" strategy="afterInteractive">
          {`
            var infolinks_pid = 3446288;
            var infolinks_wsid = 0;
          `}
        </Script>

        {/* Infolinks main script */}
        <Script
          id="infolinks-main"
          strategy="afterInteractive"
          src="https://resources.infolinks.com/js/infolinks_main.js"
        />

        

        {/* New fixed bottom HilltopAds banner */}
        <HilltopBottomBanner />
      </body>
    </html>
  );
}