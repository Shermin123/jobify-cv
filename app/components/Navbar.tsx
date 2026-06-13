"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isLoggedIn = !!session;

  const links = isLoggedIn
    ? [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Auto Apply", href: "/jobs" },
        { name: "AI CV", href: "/upload" },
        { name: "Documents", href: "/my-documents" },
      ]
    : [
        { name: "Home", href: "/" },
        { name: "Jobs", href: "/jobs" },
        { name: "AI CV", href: "/upload" },
        { name: "CV Score", href: "/#cv-score" },
      ];

  const isActive = (href: string) => {
    if (href === "/#cv-score") return false;
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex h-[64px] items-center justify-between gap-3">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 transition active:scale-[0.98]"
          >
            <img
              src="/j-logo.png"
              alt="Jobifycv logo"
              className="h-12 w-12 shrink-0 object-contain"
            />

            <div className="leading-tight">
              <p className="text-lg font-black tracking-tight text-slate-950">
                Jobify<span className="text-blue-600">cv.co</span>
              </p>
              <p className="text-[11px] font-semibold text-slate-400">
                AI CV Builder
              </p>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center lg:flex">
            <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${
                    isActive(link.href)
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </nav>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <Link
              href="/pricing"
              className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-700 shadow-sm transition hover:bg-amber-100"
            >
              Pricing
            </Link>

            <Link
              href="/editor"
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
            >
              Create New CV
            </Link>

            {isLoggedIn ? (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Login
              </Link>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <Link
              href="/upload"
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-sm active:scale-[0.98]"
            >
              AI CV
            </Link>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm active:scale-[0.98]"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm active:scale-[0.98]"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}