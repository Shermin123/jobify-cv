"use client";

import { useEffect, useRef } from "react";

type ExternalScriptAdProps = {
  src: string;
};

export default function ExternalScriptAd({
  src,
}: ExternalScriptAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    container.innerHTML = "";

    const bootstrapScript = document.createElement("script");

    bootstrapScript.text = `
      (function(nal){
        var d = document,
            s = d.createElement('script'),
            l = d.scripts[d.scripts.length - 1];

        s.settings = nal || {};
        s.src = ${JSON.stringify(src)};
        s.async = true;
        s.referrerPolicy = 'no-referrer-when-downgrade';

        l.parentNode.insertBefore(s, l);
      })({});
    `;

    container.appendChild(bootstrapScript);

    return () => {
      container.innerHTML = "";
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-[250px] w-full items-center justify-center overflow-hidden"
    />
  );
}