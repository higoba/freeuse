"use client";

import { useEffect, useRef } from "react";

const PUBLISHER_ID = "ca-pub-2521433324822656";

export default function GoogleAd({ slot }) {
  const adRef = useRef(null);

  useEffect(() => {
    const ad = adRef.current;
    if (!ad || ad.dataset.adRequested === "true") return;
    ad.dataset.adRequested = "true";
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return <ins
    ref={adRef}
    className="adsbygoogle google-ad"
    style={{ display: "block" }}
    data-ad-client={PUBLISHER_ID}
    data-ad-slot={slot}
    data-ad-format="auto"
    data-full-width-responsive="true"
  />;
}
