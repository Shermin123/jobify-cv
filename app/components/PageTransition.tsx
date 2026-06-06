"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 650);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key={`loader-${pathname}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden bg-white/80 backdrop-blur-2xl"
          >
            {/* buttery background glow */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1.25, opacity: 1 }}
              exit={{ scale: 1.45, opacity: 0 }}
              transition={{
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute h-[440px] w-[440px] rounded-full bg-blue-100 blur-3xl"
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.15, opacity: 0.9 }}
              exit={{ scale: 1.35, opacity: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute h-[280px] w-[280px] rounded-full bg-indigo-100 blur-3xl"
            />

            {/* logo card */}
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 1.03 }}
              transition={{
                duration: 0.42,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative text-center"
            >
              <motion.div
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="rounded-[2rem] bg-white px-9 py-5 shadow-[0_25px_80px_rgba(37,99,235,0.18)] ring-1 ring-slate-200"
              >
                <h1 className="text-5xl md:text-6xl font-black tracking-tight">
                  <span className="text-black">Job</span>
                  <span className="text-blue-600">ify</span>
                </h1>
              </motion.div>

              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 180, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mx-auto mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200"
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "230%" }}
                  transition={{
                    duration: 1.05,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-full w-1/2 rounded-full bg-blue-600"
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  delay: 0.12,
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-4 text-xs font-bold uppercase tracking-[0.32em] text-slate-400"
              >
                AI CV Studio
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 18, scale: 0.992, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{
          duration: 0.48,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}