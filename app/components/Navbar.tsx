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
        { name: "AI CV Studio", href: "/upload" },
        { name: "Pricing", href: "/pricing" },
      ]
    : [
        { name: "Home", href: "/" },
        { name: "Pricing", href: "/pricing" },
      ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-sm">
              J
            </div>

            <div className="leading-tight">
              <p className="font-black text-gray-900 tracking-tight">
                Jobify.cv
              </p>
              <p className="text-[11px] text-gray-500">
                AI CV Builder
              </p>
            </div>
          </Link>

          {/* CENTER NAV */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1 rounded-full border border-gray-200">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm rounded-full transition font-medium ${
                  isActive(link.href)
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-blue-700"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">

            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-blue-700 transition"
                >
                  Login
                </Link>

                <Link
                  href="/upload"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  Start Free
                </Link>
              </>
            ) : (
              <>
                <div className="hidden lg:flex flex-col items-end leading-tight">
                  <span className="text-xs text-gray-500">
                    Signed in as
                  </span>
                  <span className="text-xs font-medium text-gray-700 max-w-[180px] truncate">
                    {session.user?.email}
                  </span>
                </div>

                <Link
                  href="/upload"
                  className="hidden sm:inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  Create CV
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="rounded-full border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-blue-600 hover:text-blue-700 transition"
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