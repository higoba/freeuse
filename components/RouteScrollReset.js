"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const FADE_MS = 180;
const NAVIGATION_FAILSAFE_MS = 5000;

export default function RouteScrollReset() {
  const pathname = usePathname();
  const router = useRouter();
  const previousPath = useRef(pathname);
  const navigationTimer = useRef(null);
  const failsafeTimer = useRef(null);

  useLayoutEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    const root = document.documentElement;
    window.clearTimeout(navigationTimer.current);
    window.clearTimeout(failsafeTimer.current);
    navigationTimer.current = null;
    failsafeTimer.current = null;
    root.classList.remove("route-leaving");
    root.classList.add("route-entering");
    const scrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      root.style.scrollBehavior = scrollBehavior;
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.remove("route-entering"));
    });
  }, [pathname]);

  useEffect(() => {
    function onClick(event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!(event.target instanceof Element)) return;

      const link = event.target.closest("a[href]");
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;
      event.preventDefault();

      if (navigationTimer.current) return;
      const root = document.documentElement;
      root.classList.remove("route-entering");
      root.classList.add("route-leaving");
      navigationTimer.current = window.setTimeout(() => {
        navigationTimer.current = null;
        router.push(`${destination.pathname}${destination.search}${destination.hash}`);
        failsafeTimer.current = window.setTimeout(() => {
          root.classList.remove("route-leaving", "route-entering");
          failsafeTimer.current = null;
        }, NAVIGATION_FAILSAFE_MS);
      }, FADE_MS);
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(navigationTimer.current);
      window.clearTimeout(failsafeTimer.current);
    };
  }, [router]);

  return null;
}
