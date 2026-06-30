import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "./providers/AuthProvider";
import Navbar from "./components/Navbar";
import PageTransition from "./components/PageTransition";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Jobifycv.co",
  description:
    "Jobifycv.co helps you improve your CV, match job keywords, create cover letters, and apply with more confidence.",
  icons: {
    icon: "/jobify-logo-new.png",
    shortcut: "/jobify-logo-new.png",
    apple: "/jobify-logo-new.png",
  },
  openGraph: {
    title: "Jobifycv.co",
    description:
      "AI CV Builder that helps you improve your CV, create cover letters, and apply with confidence.",
    url: "https://jobifycv.co",
    siteName: "Jobifycv.co",
    images: [
      {
        url: "https://jobifycv.co/jobify-logo-new.png",
        width: 512,
        height: 512,
        alt: "Jobifycv.co logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jobifycv.co",
    description:
      "AI CV Builder that helps you improve your CV, create cover letters, and apply with confidence.",
    images: ["https://jobifycv.co/jobify-logo-new.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7648291083196313"
          crossOrigin="anonymous"
        />

        {/* Google Analytics GA4 */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-ZZLSC9QDXR"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-ZZLSC9QDXR');
            `,
          }}
        />

        {/* Monetag */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(s){
                s.dataset.zone='11218400';
                s.src='https://nap5k.com/tag.min.js';
              })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
            `,
          }}
        />
      </head>

      <body className="flex min-h-full flex-col bg-black text-white">
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

        {/* HilltopAds MultiTag Banner */}
        <Script id="hilltopads-multitag-banner" strategy="afterInteractive">
          {`
            (function(vlie){
              var d = document,
                  s = d.createElement('script'),
                  l = d.scripts[d.scripts.length - 1];

              s.settings = vlie || {};
              s.src = "//prizefamily.com/b.XLVcsQdTGhlq0SY/WFch/Vedm/9zuzZXU/lIkdPYTYcRx/OpDuEsy-NBzncYtoNvzPE/4zMwT/IQ4_M/QM";
              s.async = true;
              s.referrerPolicy = 'no-referrer-when-downgrade';

              l.parentNode.insertBefore(s, l);
            })({})
          `}
        </Script>
      </body>
    </html>
  );
}