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
      { name: "Create CV", href: "/editor" },
      { name: "Documents", href: "/my-documents" },
    ]
  : [
      { name: "Home", href: "/" },
      { name: "Jobs", href: "/jobs" },
      { name: "Create CV", href: "/editor" },
      { name: "CV Score", href: "/#cv-score" },
    ];

  const isActive = (href: string) => {
    if (href === "/#cv-score") return false;
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-[72px] items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3 rounded-2xl transition hover:scale-[1.02]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-sm transition group-hover:bg-blue-700 group-hover:shadow-md">
              J
            </div>

            <div className="leading-tight">
              <p className="text-lg font-black tracking-tight text-slate-950">
                Jobify<span className="text-blue-600">.cv</span>
              </p>
              <p className="text-[11px] font-semibold text-slate-400">
                AI CV Builder
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {isLoggedIn && (
              <div className="hidden max-w-[150px] text-right xl:block">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Signed in
                </p>
                <p className="truncate text-xs font-semibold text-slate-600">
                  {session.user?.email}
                </p>
              </div>
            )}

            <Link
              href="/pricing"
              className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-100 hover:shadow-md"
            >
              Pricing
            </Link>

            <Link
              href="/jobs"
              className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-black text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md"
            >
              Jobs
            </Link>

            <Link
              href="/editor"
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
            >
              Create CV
            </Link>

            {isLoggedIn ? (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              >
                Login
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/pricing"
              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 shadow-sm transition hover:bg-amber-100"
            >
              Pricing
            </Link>

            <Link
              href="/editor"
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-blue-700"
            >
              Create CV
            </Link>

            {isLoggedIn ? (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 py-3 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black transition ${
                isActive(link.href)
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <Link
            href="/pricing"
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black transition ${
              pathname === "/pricing"
                ? "bg-amber-500 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            Pricing
          </Link>
        </nav>
      </div>
    </header>
  );
}