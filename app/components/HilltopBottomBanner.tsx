"use client";

import { useEffect, useRef } from "react";

export default function HilltopBottomBanner() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || container.dataset.loaded === "true") {
      return;
    }

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
    <div className="fixed inset-x-0 bottom-0 z-[2147483000] flex justify-center px-2 pb-2">
      <div className="flex min-h-[50px] w-full max-w-[728px] items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_-8px_35px_rgba(0,0,0,0.25)]">
        <div
          ref={containerRef}
          className="flex w-full items-center justify-center"
        />
      </div>
    </div>
  );
}