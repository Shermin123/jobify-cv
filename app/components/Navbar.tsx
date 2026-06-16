"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { MouseEvent, useEffect, useRef, useState } from "react";
type NavItem = {
  name: string;
  href: string;
  icon: string;
  description: string;
};
export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const dockItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const isLoggedIn = Boolean(session);
  const links: NavItem[] = isLoggedIn
    ? [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: "⌂",
          description: "Career overview",
        },
        {
          name: "Jobs",
          href: "/jobs",
          icon: "◎",
          description: "Find opportunities",
        },
        {
          name: "AI CV",
          href: "/upload",
          icon: "✦",
          description: "Improve your CV",
        },
        {
          name: "Documents",
          href: "/my-documents",
          icon: "▤",
          description: "Saved files",
        },
      ]
    : [
        {
          name: "Home",
          href: "/",
          icon: "⌂",
          description: "Explore Jobify",
        },
        {
          name: "Jobs",
          href: "/jobs",
          icon: "◎",
          description: "Find opportunities",
        },
        {
          name: "AI CV",
          href: "/upload",
          icon: "✦",
          description: "Improve your CV",
        },
        {
          name: "CV Score",
          href: "/#cv-score",
          icon: "↗",
          description: "Check your score",
        },
      ];
  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };
  useEffect(() => {
    let previousScroll = window.scrollY;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrolled(currentScroll > 18);
      if (mobileOpen) {
        setHidden(false);
        previousScroll = currentScroll;
        return;
      }
      if (currentScroll > previousScroll && currentScroll > 180) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      previousScroll = currentScroll;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mobileOpen]);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);
  const handleDockMove = (event: MouseEvent<HTMLDivElement>) => {
    const mouseX = event.clientX;
    dockItemRefs.current.forEach((item) => {
      if (!item) return;
      const rect = item.getBoundingClientRect();
      const centre = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX - centre);
      const maximumDistance = 175;
      const influence = Math.max(
        0,
        1 - distance / maximumDistance
      );
      item.style.setProperty(
        "--dock-scale",
        `${1 + influence * 0.22}`
      );
      item.style.setProperty(
        "--dock-lift",
        `${influence * -5}px`
      );
    });
  };
  const resetDock = () => {
    dockItemRefs.current.forEach((item) => {
      if (!item) return;
      item.style.setProperty("--dock-scale", "1");
      item.style.setProperty("--dock-lift", "0px");
    });
  };
  return (
    <>
      <header
        className={`liquid-header fixed inset-x-0 top-0 z-[99999] transition-all duration-500 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div
          className={`liquid-shell relative transition-all duration-500 ${
            scrolled
              ? "border-b border-white/60 bg-white/78 shadow-[0_14px_45px_rgba(15,23,42,0.09)] backdrop-blur-3xl"
              : "border-b border-slate-200/70 bg-white/88 backdrop-blur-2xl"
          }`}
        >
          {/* LIQUID BACKGROUND */}
          <div className="liquid-orb liquid-orb-blue" />
          <div className="liquid-orb liquid-orb-purple" />
          <div className="liquid-orb liquid-orb-cyan" />
          <div className="liquid-gloss" />
          <div className="liquid-refraction" />
          <div className="liquid-shimmer" />
          <div
            className={`relative z-10 mx-auto grid max-w-[1500px] items-center gap-4 px-4 transition-all duration-500 sm:px-6 lg:grid-cols-[245px_minmax(420px,1fr)_360px] lg:px-8 ${
              scrolled ? "h-[68px]" : "h-[78px]"
            }`}
          >
            {/* BRAND */}
            <Link
              href="/"
              aria-label="Jobify.cv home"
              className="group flex min-w-0 items-center gap-3"
            >
              <span className="liquid-logo relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden">
                <span className="liquid-logo-flow" />
                <img
                  src="/jobify-logo-new.png"
                  alt="Jobify.cv logo"
                  className="relative z-10 h-9 w-9 object-contain transition duration-500 group-hover:scale-110"
                />
              </span>
              <span className="hidden min-w-0 leading-tight min-[390px]:block">
                <span className="block truncate text-[18px] font-black tracking-[-0.045em] text-slate-950">
                  Jobify
                  <span className="liquid-brand-text">
                    cv.co
                  </span>
                </span>
                <span className="block truncate text-[9px] font-black uppercase tracking-[0.19em] text-slate-400">
                  AI Career Workspace
                </span>
              </span>
            </Link>
            {/* DESKTOP DOCK */}
            <nav className="hidden min-w-0 items-center justify-center lg:flex">
              <div
                onMouseMove={handleDockMove}
                onMouseLeave={resetDock}
                className="liquid-dock flex w-full max-w-[700px] items-end justify-between px-2 py-1.5"
              >
                {links.map((link, index) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      ref={(element) => {
                        dockItemRefs.current[index] = element;
                      }}
                      className="liquid-dock-item group relative flex h-[48px] flex-1 origin-bottom flex-col items-center justify-center px-3"
                    >
                      <span
                        className={`liquid-dock-surface absolute inset-0 transition-all duration-300 ${
                          active
                            ? "scale-100 opacity-100"
                            : "scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                        }`}
                      />
                      {active && (
                        <>
                          <span className="liquid-active-border absolute inset-0" />
                          <span className="liquid-active-light absolute inset-x-3 bottom-1 h-[2px]" />
                        </>
                      )}
                      <span
                        className={`relative z-10 text-[17px] transition-colors duration-300 ${
                          active
                            ? "text-blue-600"
                            : "text-slate-500 group-hover:text-blue-600"
                        }`}
                      >
                        {link.icon}
                      </span>
                      <span
                        className={`relative z-10 mt-0.5 text-[9px] font-black ${
                          active
                            ? "text-slate-950"
                            : "text-slate-500 group-hover:text-slate-950"
                        }`}
                      >
                        {link.name}
                      </span>
                      <span className="liquid-tooltip pointer-events-none absolute -top-11 left-1/2 z-30 -translate-x-1/2 translate-y-1 whitespace-nowrap bg-slate-950 px-3 py-2 text-[10px] font-bold text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                        {link.description}
                        <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-950" />
                      </span>
                    </Link>
                  );
                })}
                <span className="mx-1 h-8 w-px shrink-0 bg-slate-200/80" />
                <Link
                  href="/pricing"
                  className="liquid-dock-item group relative flex h-[48px] min-w-[88px] origin-bottom flex-col items-center justify-center px-3"
                >
                  <span className="liquid-dock-surface absolute inset-0 scale-95 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                  <span className="relative z-10 text-[17px] text-amber-500">
                    ♛
                  </span>
                  <span className="relative z-10 mt-0.5 text-[9px] font-black text-slate-500 group-hover:text-slate-950">
                    Pricing
                  </span>
                </Link>
              </div>
            </nav>
            {/* DESKTOP ACTIONS */}
            <div className="hidden items-center justify-end gap-2 lg:flex">
              <div className="liquid-status hidden items-center gap-2 px-3 py-2 xl:flex">
                <span className="liquid-status-dot" />
                <span className="text-[9px] font-black uppercase tracking-[0.13em] text-emerald-700">
                  AI Ready
                </span>
              </div>
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() =>
                    signOut({
                      callbackUrl: "/login",
                    })
                  }
                  className="liquid-secondary px-4 py-2.5 text-sm font-black text-slate-600 transition duration-300 hover:-translate-y-0.5 hover:text-red-600"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="liquid-secondary px-4 py-2.5 text-sm font-black text-slate-600 transition duration-300 hover:-translate-y-0.5 hover:text-blue-700"
                >
                  Login
                </Link>
              )}
              <Link
                href="/editor"
                className="liquid-create group relative overflow-hidden px-5 py-2.5 text-sm font-black text-white transition duration-300 hover:-translate-y-0.5"
              >
                <span className="liquid-create-wave liquid-create-wave-one" />
                <span className="liquid-create-wave liquid-create-wave-two" />
                <span className="liquid-create-shine" />
                <span className="relative z-10 flex items-center gap-2">
                  <span className="transition duration-500 group-hover:rotate-180">
                    ✦
                  </span>
                  Create CV
                  <span className="transition duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </div>
            {/* MOBILE ACTIONS */}
            <div className="flex items-center justify-end gap-2 lg:hidden">
              <Link
                href="/editor"
                className="liquid-create relative overflow-hidden px-4 py-2.5 text-xs font-black text-white active:scale-95"
              >
                <span className="relative z-10">
                  Create CV
                </span>
              </Link>
              <button
                type="button"
                aria-label="Toggle navigation"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((current) => !current)}
                className={`liquid-menu-button relative flex h-11 w-11 items-center justify-center transition-all duration-300 ${
                  mobileOpen
                    ? "bg-slate-950 text-white"
                    : "text-slate-950"
                }`}
              >
                <span className="relative h-5 w-5">
                  <span
                    className={`absolute left-0 top-1 h-0.5 w-5 bg-current transition-all duration-300 ${
                      mobileOpen
                        ? "translate-y-1.5 rotate-45"
                        : ""
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-[9px] h-0.5 w-5 bg-current transition-all duration-300 ${
                      mobileOpen
                        ? "scale-x-0 opacity-0"
                        : ""
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-[15px] h-0.5 w-5 bg-current transition-all duration-300 ${
                      mobileOpen
                        ? "-translate-y-1.5 -rotate-45"
                        : ""
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
          
        </div>
      </header>
      {/* MOBILE BACKDROP */}
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
      {/* MOBILE MENU */}
      <aside
        className={`liquid-mobile-menu fixed inset-x-3 top-[84px] z-[99998] overflow-hidden p-3 transition-all duration-400 lg:hidden ${
          mobileOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <div className="liquid-mobile-orb liquid-mobile-orb-one" />
        <div className="liquid-mobile-orb liquid-mobile-orb-two" />
        <div className="liquid-mobile-gloss" />
        <div className="relative z-10 mb-3 flex items-center justify-between border border-white/70 bg-white/50 px-4 py-3 backdrop-blur-2xl">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
              Jobify Dock
            </p>
            <p className="mt-1 text-sm font-black text-slate-950">
              Choose your destination
            </p>
          </div>
          <div className="liquid-status flex items-center gap-2 px-3 py-2">
            <span className="liquid-status-dot" />
            <span className="text-[9px] font-black uppercase tracking-[0.13em] text-emerald-700">
              Ready
            </span>
          </div>
        </div>
        <nav className="relative z-10 grid grid-cols-2 gap-2">
          {links.map((link, index) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  transitionDelay: mobileOpen
                    ? `${index * 45}ms`
                    : "0ms",
                }}
                className={`liquid-mobile-item group relative flex min-h-[105px] flex-col items-center justify-center overflow-hidden px-3 py-4 transition-all duration-300 ${
                  mobileOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                <span
                  className={`absolute inset-0 ${
                    active
                      ? "liquid-mobile-active"
                      : "bg-white/42 group-hover:bg-white/68"
                  }`}
                />
                <span
                  className={`relative z-10 flex h-11 w-11 items-center justify-center text-xl transition duration-300 group-hover:-translate-y-1 group-hover:scale-110 ${
                    active
                      ? "bg-blue-600 text-white"
                      : "border border-white/80 bg-white/65 text-blue-600"
                  }`}
                >
                  {link.icon}
                </span>
                <span className="relative z-10 mt-2 text-sm font-black text-slate-950">
                  {link.name}
                </span>
                <span className="relative z-10 mt-1 text-center text-[9px] font-bold text-slate-400">
                  {link.description}
                </span>
                {active && (
                  <span className="absolute bottom-2 h-1.5 w-1.5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="relative z-10 mt-3 grid grid-cols-2 gap-2">
          <Link
            href="/pricing"
            className="liquid-mobile-small py-3.5 text-center text-sm font-black text-amber-700"
          >
            ♛ Pricing
          </Link>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() =>
                signOut({
                  callbackUrl: "/login",
                })
              }
              className="liquid-mobile-small py-3.5 text-sm font-black text-red-600"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="liquid-mobile-small py-3.5 text-center text-sm font-black text-slate-700"
            >
              Login
            </Link>
          )}
        </div>
        <Link
          href="/editor"
          className="liquid-create relative z-10 mt-2 flex w-full items-center justify-center overflow-hidden py-4 text-sm font-black text-white"
        >
          <span className="liquid-create-wave liquid-create-wave-one" />
          <span className="liquid-create-wave liquid-create-wave-two" />
          <span className="relative z-10">
            ✦ Create New CV →
          </span>
        </Link>
      </aside>
      <div className="h-[78px]" />
      <style jsx global>{`
        .liquid-shell {
          isolation: isolate;
          overflow: hidden;
        }
        .liquid-orb {
          position: absolute;
          pointer-events: none;
          border-radius: 45% 55% 60% 40% / 55% 40% 60% 45%;
          filter: blur(44px);
          opacity: 0.52;
          will-change: transform, border-radius;
        }
        .liquid-orb-blue {
          left: -120px;
          top: -150px;
          width: 300px;
          height: 300px;
          background: rgba(59, 130, 246, 0.18);
          animation: liquidBlue 10s ease-in-out infinite;
        }
        .liquid-orb-purple {
          right: -120px;
          bottom: -170px;
          width: 320px;
          height: 320px;
          background: rgba(139, 92, 246, 0.16);
          animation: liquidPurple 11s ease-in-out infinite;
        }
        .liquid-orb-cyan {
          left: 42%;
          top: -180px;
          width: 280px;
          height: 280px;
          background: rgba(34, 211, 238, 0.12);
          animation: liquidCyan 12s ease-in-out infinite;
        }
        @keyframes liquidBlue {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
            border-radius: 45% 55% 60% 40% / 55% 40% 60% 45%;
          }
          50% {
            transform: translate3d(210px, 45px, 0) rotate(110deg)
              scale(1.2);
            border-radius: 65% 35% 45% 55% / 40% 60% 35% 65%;
          }
        }
        @keyframes liquidPurple {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
          50% {
            transform: translate3d(-230px, -40px, 0) rotate(-120deg)
              scale(1.18);
          }
        }
        @keyframes liquidCyan {
          0%,
          100% {
            transform: translate3d(-40px, 0, 0) rotate(0deg) scale(0.9);
            opacity: 0.28;
          }
          50% {
            transform: translate3d(90px, 55px, 0) rotate(140deg)
              scale(1.25);
            opacity: 0.55;
          }
        }
        .liquid-gloss {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(
              110deg,
              rgba(255, 255, 255, 0.8) 0%,
              rgba(255, 255, 255, 0.25) 24%,
              transparent 44%
            ),
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.58),
              transparent 48%
            );
          mix-blend-mode: screen;
          opacity: 0.72;
        }
        .liquid-refraction {
          position: absolute;
          inset: -120%;
          pointer-events: none;
          opacity: 0.16;
          background: conic-gradient(
            from 40deg,
            transparent,
            rgba(59, 130, 246, 0.35),
            transparent,
            rgba(139, 92, 246, 0.3),
            transparent,
            rgba(34, 211, 238, 0.3),
            transparent
          );
          animation: liquidRefraction 22s linear infinite;
        }
        @keyframes liquidRefraction {
          to {
            transform: rotate(360deg);
          }
        }
        .liquid-shimmer {
          position: absolute;
          top: -70%;
          bottom: -70%;
          left: -180px;
          width: 110px;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.88),
            rgba(147, 197, 253, 0.16),
            transparent
          );
          transform: skewX(-16deg);
          animation: liquidShimmer 9s ease-in-out infinite;
        }
        @keyframes liquidShimmer {
          0%,
          15% {
            transform: translateX(0) skewX(-16deg);
            opacity: 0;
          }
          30% {
            opacity: 0.9;
          }
          75%,
          100% {
            transform: translateX(calc(100vw + 400px)) skewX(-16deg);
            opacity: 0;
          }
        }
        .liquid-logo {
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.88);
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.84),
              rgba(239, 246, 255, 0.62)
            );
          box-shadow:
            0 10px 28px rgba(37, 99, 235, 0.13),
            inset 0 1px 0 rgba(255, 255, 255, 1);
          backdrop-filter: blur(22px);
        }
        .liquid-logo-flow {
          position: absolute;
          inset: -18px;
          background: conic-gradient(
            from 0deg,
            rgba(59, 130, 246, 0.42),
            rgba(34, 211, 238, 0.28),
            transparent,
            rgba(139, 92, 246, 0.36),
            rgba(59, 130, 246, 0.42)
          );
          animation: liquidLogoFlow 8s linear infinite;
        }
        @keyframes liquidLogoFlow {
          to {
            transform: rotate(360deg);
          }
        }
        .liquid-brand-text {
          background: linear-gradient(
            90deg,
            #2563eb,
            #06b6d4,
            #7c3aed,
            #2563eb
          );
          background-size: 230% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: liquidBrandFlow 5s linear infinite;
        }
        @keyframes liquidBrandFlow {
          to {
            background-position: 230% 50%;
          }
        }
        .liquid-dock {
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 14px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.56),
              rgba(255, 255, 255, 0.28)
            );
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.96),
            inset 0 -1px 0 rgba(255, 255, 255, 0.32),
            0 10px 28px rgba(15, 23, 42, 0.07);
          backdrop-filter: blur(28px) saturate(170%);
          -webkit-backdrop-filter: blur(28px) saturate(170%);
        }
        .liquid-dock-item {
          --dock-scale: 1;
          --dock-lift: 0px;
          transform:
            translateY(var(--dock-lift))
            scale(var(--dock-scale));
          transition:
            transform 120ms ease-out,
            color 250ms ease;
          will-change: transform;
        }
        .liquid-dock-surface {
          border-radius: 10px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.94),
              rgba(239, 246, 255, 0.68)
            );
          box-shadow:
            0 9px 22px rgba(15, 23, 42, 0.09),
            inset 0 1px 0 rgba(255, 255, 255, 1),
            inset 0 -8px 18px rgba(96, 165, 250, 0.06);
        }
        .liquid-active-border {
          border-radius: 10px;
          border: 1px solid rgba(147, 197, 253, 0.54);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.68),
            0 0 20px rgba(59, 130, 246, 0.16);
        }
        .liquid-active-light {
          border-radius: 9999px;
          background: linear-gradient(
            90deg,
            #2563eb,
            #06b6d4,
            #7c3aed
          );
          box-shadow: 0 0 10px rgba(37, 99, 235, 0.55);
        }
        .liquid-tooltip {
          border-radius: 8px;
        }
        .liquid-status,
        .liquid-secondary,
        .liquid-menu-button,
        .liquid-mobile-small {
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 10px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.7),
              rgba(255, 255, 255, 0.36)
            );
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.95),
            0 8px 22px rgba(15, 23, 42, 0.06);
          backdrop-filter: blur(22px);
        }
        .liquid-status-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background: #22c55e;
          box-shadow:
            0 0 10px rgba(34, 197, 94, 0.8),
            0 0 18px rgba(34, 197, 94, 0.38);
          animation: liquidStatusPulse 1.8s ease-in-out infinite;
        }
        @keyframes liquidStatusPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.35);
            opacity: 1;
          }
        }
        .liquid-create {
          isolation: isolate;
          border-radius: 10px;
          background:
            radial-gradient(
              circle at 25% 0%,
              rgba(255, 255, 255, 0.3),
              transparent 40%
            ),
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5,
              #7c3aed
            );
          box-shadow:
            0 13px 30px rgba(37, 99, 235, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.28);
        }
        .liquid-create-wave {
          position: absolute;
          pointer-events: none;
          border-radius: 45% 55% 60% 40%;
          filter: blur(12px);
          opacity: 0.65;
        }
        .liquid-create-wave-one {
          left: -40px;
          top: -55px;
          width: 110px;
          height: 110px;
          background: #22d3ee;
          animation: liquidCreateOne 4.5s ease-in-out infinite;
        }
        .liquid-create-wave-two {
          right: -50px;
          bottom: -60px;
          width: 125px;
          height: 125px;
          background: #a855f7;
          animation: liquidCreateTwo 5s ease-in-out infinite;
        }
        @keyframes liquidCreateOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(90px, 26px, 0) rotate(120deg);
          }
        }
        @keyframes liquidCreateTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(-95px, -22px, 0) rotate(-130deg);
          }
        }
        .liquid-create-shine {
          position: absolute;
          top: -80%;
          bottom: -80%;
          left: -90px;
          width: 60px;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.84),
            transparent
          );
          transform: rotate(14deg);
          opacity: 0;
        }
        .liquid-create:hover .liquid-create-shine {
          animation: liquidCreateShine 800ms ease-out;
        }
        @keyframes liquidCreateShine {
          0% {
            opacity: 0;
            transform: translateX(0) rotate(14deg);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(420px) rotate(14deg);
          }
        }
        .liquid-mobile-menu {
          isolation: isolate;
          border: 1px solid rgba(255, 255, 255, 0.76);
          border-radius: 12px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.88),
              rgba(248, 250, 252, 0.68)
            );
          box-shadow:
            0 28px 80px rgba(15, 23, 42, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(34px) saturate(170%);
          -webkit-backdrop-filter: blur(34px) saturate(170%);
        }
        .liquid-mobile-orb {
          position: absolute;
          pointer-events: none;
          border-radius: 45% 55% 60% 40%;
          filter: blur(40px);
        }
        .liquid-mobile-orb-one {
          left: -110px;
          top: -110px;
          width: 250px;
          height: 250px;
          background: rgba(59, 130, 246, 0.18);
          animation: liquidBlue 8s ease-in-out infinite;
        }
        .liquid-mobile-orb-two {
          right: -120px;
          bottom: -120px;
          width: 270px;
          height: 270px;
          background: rgba(139, 92, 246, 0.16);
          animation: liquidPurple 9s ease-in-out infinite;
        }
        .liquid-mobile-gloss {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.72),
            transparent 42%
          );
        }
        .liquid-mobile-item {
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 10px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            0 10px 24px rgba(15, 23, 42, 0.06);
          backdrop-filter: blur(22px);
        }
        .liquid-mobile-active {
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.94),
              rgba(219, 234, 254, 0.76)
            );
          box-shadow:
            0 12px 28px rgba(37, 99, 235, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .liquid-orb,
          .liquid-refraction,
          .liquid-shimmer,
          .liquid-logo-flow,
          .liquid-brand-text,
          .liquid-status-dot,
          .liquid-create-wave,
          .liquid-create-shine,
          .liquid-mobile-orb {
            animation: none !important;
          }
          .liquid-dock-item {
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}