"use client";

import { useEffect } from "react";

const SCRIPT_ID = "google-adsense";
const SCRIPT_URL = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2521433324822656";

export default function AdSenseScript() {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = SCRIPT_URL;
    document.head.appendChild(script);
  }, []);

  return null;
}
