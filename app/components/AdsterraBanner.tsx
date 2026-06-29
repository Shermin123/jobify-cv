"use client";

import { useEffect, useRef } from "react";

export default function AdsterraBanner() {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = adContainerRef.current;

    if (!container || container.dataset.loaded === "true") {
      return;
    }

    container.dataset.loaded = "true";

    const configScript = document.createElement("script");
    configScript.type = "text/javascript";
    configScript.text = `
      atOptions = {
        'key': '022bf6f0ac84fc8271661fdf0220eab4',
        'format': 'iframe',
        'height': 250,
        'width': 300,
        'params': {}
      };
    `;

    const adScript = document.createElement("script");
    adScript.type = "text/javascript";
    adScript.src =
      "https://www.highperformanceformat.com/022bf6f0ac84fc8271661fdf0220eab4/invoke.js";
    adScript.async = true;

    container.appendChild(configScript);
    container.appendChild(adScript);

    return () => {
      container.innerHTML = "";
      container.dataset.loaded = "false";
    };
  }, []);

  return (
    <div className="my-8 flex w-full justify-center">
      <div
        ref={adContainerRef}
        className="h-[250px] w-[300px] overflow-hidden"
        aria-label="Advertisement"
      />
    </div>
  );
}