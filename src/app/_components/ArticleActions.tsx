"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

export default function ArticleActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  async function handleCopy() {
    // Whole article text lives in the server-rendered prose block above this
    // component (same card) — read it from the DOM instead of threading the
    // full HTML through props.
    const body = document.querySelector(".prose-ml")?.textContent?.trim() ?? "";
    await navigator.clipboard.writeText(`${title}\n\n${body}\n\n${window.location.href}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch {
        // user cancelled — no-op
      }
    } else {
      // No native share (desktop) — copy the article link instead.
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  return (
    <div className="mt-6 flex items-center gap-5">
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors ${
          copied
            ? "text-green-600 dark:text-green-400"
            : "text-muted hover:text-primary"
        }`}
      >
        {copied ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={2} />}
        {copied ? "Copied" : "Copy text"}
      </button>
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors ${
          shared
            ? "text-green-600 dark:text-green-400"
            : "text-muted hover:text-primary"
        }`}
      >
        {shared ? <Check size={15} strokeWidth={2} /> : <Share2 size={15} strokeWidth={2} />}
        {shared ? "Link copied" : "Share"}
      </button>
    </div>
  );
}
