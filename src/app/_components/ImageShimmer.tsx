"use client";

import { useEffect } from "react";

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Stop the shimmer (and fade the picture in) through the Web Animations API
// only. Writing attributes/classes/styles here would race React hydration of
// streamed Suspense sections and trigger hydration-mismatch errors.
function finish(img: HTMLImageElement, fade: boolean) {
  for (const a of img.getAnimations()) {
    if (a instanceof CSSAnimation && a.animationName === "shimmer") a.cancel();
  }
  if (fade && !reduceMotion()) {
    img.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 350, easing: "ease-out" });
  }
}

const seen = new WeakSet<HTMLImageElement>();

function watch(img: HTMLImageElement) {
  if (seen.has(img)) return;
  seen.add(img);
  if (img.complete) finish(img, false);
  else {
    img.addEventListener("load", () => finish(img, true), { once: true });
    img.addEventListener("error", () => finish(img, false), { once: true });
  }
}

/**
 * Every <img> inside <main> shimmers (see globals.css) until it has loaded —
 * including images already cached before hydration and ones added later by
 * streaming or client navigation.
 */
export default function ImageShimmer() {
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    main.querySelectorAll("img").forEach(watch);
    const observer = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n instanceof HTMLImageElement) watch(n);
          else if (n instanceof HTMLElement) n.querySelectorAll("img").forEach(watch);
        });
      }
    });
    observer.observe(main, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
