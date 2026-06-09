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
        { name: "Jobs", href: "/jobs" },
        { name: "AI CV Studio", href: "/upload" },
        { name: "File Editor", href: "/editor" },
        { name: "Documents", href: "/my-documents" },
        { name: "Pricing", href: "/pricing" },
      ]
    : [
        { name: "Home", href: "/" },
        { name: "Jobs", href: "/jobs" },
        { name: "CV Score", href: "/#cv-score" },
        { name: "File Editor", href: "/editor" },
        { name: "Pricing", href: "/pricing" },
      ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-16 flex-col gap-3 py-3 md:h-16 md:flex-row md:items-center md:justify-between md:py-0">
          {/* LOGO */}
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 text-white shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-950 opacity-90 transition group-hover:scale-110" />
                <span className="relative text-base font-black">J</span>
              </div>

              <div className="leading-tight">
                <p className="text-lg font-black tracking-tight">
                  <span className="text-slate-950">Job</span>
                  <span className="text-blue-600">ify</span>
                  <span className="text-slate-400">.cv</span>
                </p>

                <p className="text-[11px] font-medium text-slate-400">
                  AI CV Builder
                </p>
              </div>
            </Link>

            {/* MOBILE ACTION */}
            <div className="md:hidden">
              {!isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm"
                  >
                    Login
                  </Link>

                  <Link
                    href="/jobs"
                    className="rounded-full bg-blue-600 px-3 py-2 text-xs font-black text-white shadow-sm"
                  >
                    Jobs
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/jobs"
                    className="rounded-full bg-blue-600 px-3 py-2 text-xs font-black text-white shadow-sm"
                  >
                    Jobs
                  </Link>

                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* NAV LINKS */}
          <nav className="mx-auto flex w-fit max-w-full items-center justify-center gap-1 overflow-x-auto rounded-full border border-slate-200 bg-slate-100/80 p-1 md:mx-0 md:overflow-visible">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${
                  isActive(link.href)
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-950"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* DESKTOP RIGHT */}
          <div className="hidden items-center gap-3 md:flex">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Login
                </Link>

                <Link
                  href="/jobs"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Find Jobs →
                </Link>
              </>
            ) : (
              <>
                <div className="hidden max-w-[190px] text-right leading-tight lg:block">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Signed in
                  </p>
                  <p className="truncate text-xs font-semibold text-slate-600">
                    {session.user?.email}
                  </p>
                </div>

                <Link
                  href="/jobs"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Find Jobs
                </Link>

                <Link
                  href="/upload"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Create CV
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-900 hover:text-slate-950"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}