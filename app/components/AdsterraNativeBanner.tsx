"use client";

import { useEffect, useRef } from "react";

export default function AdsterraNativeBanner() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || container.dataset.loaded === "true") {
      return;
    }

    container.dataset.loaded = "true";

    const script = document.createElement("script");

    script.src =
      "https://pl30132545.effectivecpmnetwork.com/9bdfcb21af8cd3757dcae3ef6ed0450/invoke.js";

    script.async = true;
    script.setAttribute("data-cfasync", "false");

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
      delete container.dataset.loaded;
    };
  }, []);

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={containerRef}
        id="container-9bdfcb21af8cd3757dcae3ef6ed0450"
        className="mx-auto w-full"
      />
    </div>
  );
}