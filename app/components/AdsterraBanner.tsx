"use client";

import { useEffect, useRef } from "react";

type AdsterraBannerProps = {
  adKey: string;
  width: number;
  height: number;
};

export default function AdsterraBanner({
  adKey,
  width,
  height,
}: AdsterraBannerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = adContainerRef.current;

    if (!container || container.dataset.loaded === "true") return;

    container.dataset.loaded = "true";

    const configScript = document.createElement("script");
    configScript.type = "text/javascript";
    configScript.text = `
      atOptions = {
        'key': '${adKey}',
        'format': 'iframe',
        'height': ${height},
        'width': ${width},
        'params': {}
      };
    `;

    const adScript = document.createElement("script");
    adScript.type = "text/javascript";
    adScript.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
    adScript.async = true;

    container.appendChild(configScript);
    container.appendChild(adScript);

    return () => {
      container.innerHTML = "";
      container.dataset.loaded = "false";
    };
  }, [adKey, width, height]);

  return (
    <div className="flex w-full justify-center">
      <div
        ref={adContainerRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
        className="overflow-hidden"
        aria-label="Advertisement"
      />
    </div>
  );
}