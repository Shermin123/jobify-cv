"use client";

import { useEffect } from "react";

type MonetagAdProps = {
  zone: string;
  src: string;
};

export default function MonetagAd({
  zone,
  src,
}: MonetagAdProps) {
  useEffect(() => {
    const scriptId = `monetag-${zone}`;

    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");

    script.id = scriptId;
    script.dataset.zone = zone;
    script.src = src;
    script.async = true;

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [zone, src]);

  return null;
}