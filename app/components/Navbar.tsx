"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
type NavItem = {
  name: string;
  href: string;
};
export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const navItemRefs = useRef<
    Array<HTMLAnchorElement | null>
  >([]);
  const animationFrameRef = useRef<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLoggedIn = Boolean(session);
  const links: NavItem[] = isLoggedIn
    ? [
        {
          name: "Dashboard",
          href: "/dashboard",
        },
        {
          name: "Jobs",
          href: "/jobs",
        },
        {
          name: "AI CV",
          href: "/upload",
        },
        {
          name: "Documents",
          href: "/my-documents",
        },
      ]
    : [
        {
          name: "Home",
          href: "/",
        },
        {
          name: "Jobs",
          href: "/jobs",
        },
        {
          name: "AI CV",
          href: "/upload",
        },
        {
          name: "CV Score",
          href: "/#cv-score",
        },
      ];
  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow =
      document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  const handleNavMove = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    const mouseX = event.clientX;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      navItemRefs.current.forEach((item) => {
        if (!item) return;
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(mouseX - itemCenter);
        const maximumDistance = 190;
        const influence = Math.max(
          0,
          1 - distance / maximumDistance
        );
        const easedInfluence =
          influence * influence * (3 - 2 * influence);
        const scale = 1 + easedInfluence * 0.14;
        const lift = easedInfluence * -4;
        item.style.setProperty(
          "--nav-scale",
          scale.toString()
        );
        item.style.setProperty(
          "--nav-lift",
          `${lift}px`
        );
      });
      animationFrameRef.current = null;
    });
  };
  const resetNavItems = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    navItemRefs.current.forEach((item) => {
      if (!item) return;
      item.style.setProperty("--nav-scale", "1");
      item.style.setProperty("--nav-lift", "0px");
    });
  };
  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[99999] transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl"
            : "border-b border-transparent bg-white/70 backdrop-blur-lg"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="Jobifycv.co home"
            className="group flex shrink-0 items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-100 shadow-[0_8px_20px_rgba(79,70,229,0.12)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_26px_rgba(79,70,229,0.18)]">
              <img
                src="/jobify-logo-new.png"
                alt="Jobifycv.co logo"
                className="h-9 w-9 object-contain"
              />
            </span>
            <span className="hidden min-[390px]:block">
              <span className="block text-[22px] font-black leading-none tracking-[-0.045em] text-slate-950">
                Jobify
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  cv.co
                </span>
              </span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                AI Career Workspace
              </span>
            </span>
          </Link>
          <nav className="hidden items-center lg:flex">
            <div
              onMouseMove={handleNavMove}
              onMouseLeave={resetNavItems}
              className="flex items-end gap-1 rounded-xl border border-slate-200/80 bg-white/70 px-1.5 py-1 shadow-[0_8px_24px_rgba(15,23,42,0.05)] backdrop-blur-xl"
            >
              {links.map((link, index) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    ref={(element) => {
                      navItemRefs.current[index] =
                        element;
                    }}
                    className="magnify-nav-item group relative flex min-w-[78px] origin-bottom items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold"
                  >
                    <span
                      className={`absolute inset-0 rounded-lg transition-all duration-200 ${
                        active
                          ? "scale-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 opacity-100"
                          : "scale-95 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                      }`}
                    />
                    <span
                      className={`relative z-10 transition-colors duration-200 ${
                        active
                          ? "text-indigo-700"
                          : "text-slate-600 group-hover:text-slate-950"
                      }`}
                    >
                      {link.name}
                    </span>
                    {active && (
                      <span className="absolute inset-x-4 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
                    )}
                  </Link>
                );
              })}
              <Link
                href="/pricing"
                ref={(element) => {
                  navItemRefs.current[links.length] =
                    element;
                }}
                className="magnify-nav-item group relative flex min-w-[78px] origin-bottom items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold"
              >
                <span
                  className={`absolute inset-0 rounded-lg transition-all duration-200 ${
                    isActive("/pricing")
                      ? "scale-100 bg-violet-50 opacity-100"
                      : "scale-95 bg-violet-50 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                  }`}
                />
                <span
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive("/pricing")
                      ? "text-violet-700"
                      : "text-slate-600 group-hover:text-slate-950"
                  }`}
                >
                  Pricing
                </span>
                {isActive("/pricing") && (
                  <span className="absolute inset-x-4 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
                )}
              </Link>
            </div>
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() =>
                  signOut({
                    callbackUrl: "/login",
                  })
                }
                className="rounded-lg px-4 py-2.5 text-sm font-bold text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-4 py-2.5 text-sm font-bold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-950"
              >
                Login
              </Link>
            )}
            <Link
              href="/editor"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(79,70,229,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(79,70,229,0.3)]"
            >
              <span className="transition duration-300 group-hover:rotate-180">
                ✦
              </span>
              Create CV
              <span className="transition duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/editor"
              className="rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_18px_rgba(79,70,229,0.22)]"
            >
              Create CV
            </Link>
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              onClick={() =>
                setMobileOpen((current) => !current)
              }
              className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 ${
                mobileOpen
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-950"
              }`}
            >
              <span className="relative h-5 w-5">
                <span
                  className={`absolute left-0 top-1 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                    mobileOpen
                      ? "translate-y-1.5 rotate-45"
                      : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[9px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                    mobileOpen
                      ? "scale-x-0 opacity-0"
                      : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[15px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                    mobileOpen
                      ? "-translate-y-1.5 -rotate-45"
                      : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-[99990] bg-slate-950/25 backdrop-blur-sm transition-all duration-300 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-x-3 top-[82px] z-[99998] overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.18)] transition-all duration-300 lg:hidden ${
          mobileOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <div className="mb-3 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600">
            Jobify Navigation
          </p>
          <p className="mt-1 text-sm font-black text-slate-950">
            Choose your destination
          </p>
        </div>
        <nav className="grid gap-1">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{link.name}</span>
                <span
                  className={`text-base ${
                    active
                      ? "text-indigo-600"
                      : "text-slate-300"
                  }`}
                >
                  →
                </span>
              </Link>
            );
          })}
          <Link
            href="/pricing"
            className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
              isActive("/pricing")
                ? "bg-violet-50 text-violet-700"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>Pricing</span>
            <span className="text-slate-300">→</span>
          </Link>
        </nav>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() =>
                signOut({
                  callbackUrl: "/login",
                })
              }
              className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-black text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Login
            </Link>
          )}
          <Link
            href="/editor"
            className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-3 text-center text-sm font-black text-white shadow-[0_8px_20px_rgba(79,70,229,0.22)]"
          >
            Create CV
          </Link>
        </div>
      </aside>
      <div className="h-[72px]" />
      <style jsx global>{`
        .magnify-nav-item {
          --nav-scale: 1;
          --nav-lift: 0px;
          transform:
            translate3d(0, var(--nav-lift), 0)
            scale(var(--nav-scale));
          transition:
            transform 240ms
              cubic-bezier(0.22, 1, 0.36, 1),
            color 220ms ease,
            background-color 220ms ease;
          transform-origin: center bottom;
          will-change: transform;
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .magnify-nav-item:hover {
          z-index: 10;
        }
        @media (prefers-reduced-motion: reduce) {
          .magnify-nav-item {
            transform: none !important;
            transition: color 150ms ease;
          }
        }
      `}</style>
    </>
  );
}