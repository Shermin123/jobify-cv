"use client";

import { useEffect, useRef } from "react";

export default function HilltopBottomBanner() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || container.dataset.loaded === "true") return;

    container.dataset.loaded = "true";

    const script = document.createElement("script") as HTMLScriptElement & {
      settings?: Record<string, unknown>;
    };

    script.settings = {};
    script.src =
      "https://prizefamily.com/bGXpVos/d.GtlB0zYpWccA/ZeHmD9juvZeU/l_kBPwTNc/xOOJDkMz3yNjjJUitXN/zOEU4KM/zncw2/O-Qi";
    script.async = true;
    script.referrerPolicy = "no-referrer-when-downgrade";

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
      delete container.dataset.loaded;
    };
  }, []);

  return (
    <div className="mt-auto flex w-full justify-center bg-white px-2 py-3">
      <div
        ref={containerRef}
        className="flex min-h-[50px] w-full max-w-[728px] items-center justify-center overflow-hidden"
      />
    </div>
  );
}