"use client";

import { useEffect } from "react";

function markLoaded(img: HTMLImageElement) {
  img.dataset.loaded = "";
}

function watch(img: HTMLImageElement) {
  if (img.complete) markLoaded(img);
  else {
    img.addEventListener("load", () => markLoaded(img), { once: true });
    img.addEventListener("error", () => markLoaded(img), { once: true });
  }
}

/**
 * Every <img> inside <main> shimmers (see globals.css) until it has loaded.
 * Marks images loaded — including ones already cached before hydration and
 * ones added later by client navigation — so the shimmer stops behind them.
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
        if (r.type === "attributes" && r.target instanceof HTMLImageElement) {
          delete r.target.dataset.loaded;
          watch(r.target);
        }
      }
    });
    observer.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });
    return () => observer.disconnect();
  }, []);

  return null;
}
