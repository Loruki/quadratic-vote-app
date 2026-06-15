"use client";

import { useState } from "react";
import { growth } from "../analytics";

function withRef(url: string, refCode?: string): string {
  if (!refCode) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.has("ref")) u.searchParams.set("ref", refCode);
    return u.toString();
  } catch {
    return url;
  }
}

export function ShareButton({
  url,
  title,
  text,
  refCode,
  className,
  children,
  copiedLabel = "Copied!",
}: {
  /** Defaults to the current page URL. */
  url?: string;
  title?: string;
  text?: string;
  /** Appended as ?ref= so you can attribute shares that convert. */
  refCode?: string;
  className?: string;
  children?: React.ReactNode;
  /** Transient label shown after a successful copy. */
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const base =
      url ?? (typeof window !== "undefined" ? window.location.href : "");
    const shareUrl = withRef(base, refCode);

    // Native share sheet only on touch devices, where it's the expected UX.
    // On desktop it's a clunky OS dialog, so we prefer copy-to-clipboard.
    const isTouch =
      typeof navigator !== "undefined" &&
      (navigator.maxTouchPoints > 0 ||
        window.matchMedia?.("(pointer: coarse)").matches);

    if (isTouch && navigator.share) {
      try {
        await navigator.share({ url: shareUrl, title, text });
        growth.shared({ method: "native", url: shareUrl });
        return;
      } catch {
        // User dismissed — fall through to copy.
      }
    }

    // Fallback: copy to clipboard.
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      growth.shared({ method: "copy", url: shareUrl });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — last resort, no-op beyond the event.
      growth.shared({ method: "failed", url: shareUrl });
    }
  }

  return (
    <button type="button" onClick={handleShare} className={className}>
      {copied ? copiedLabel : (children ?? "Share")}
    </button>
  );
}
