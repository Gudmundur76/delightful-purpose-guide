import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "grow-cookie-consent-v1";

type Consent = "accepted" | "rejected";

export function getCookieConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "accepted" || v === "rejected" ? v : null;
}

export function openCookieSettings() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("grow:cookie-consent-reset"));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVisible(getCookieConsent() === null);
    const onReset = () => setVisible(true);
    window.addEventListener("grow:cookie-consent-reset", onReset);
    return () => window.removeEventListener("grow:cookie-consent-reset", onReset);
  }, []);

  function decide(value: Consent) {
    window.localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-md z-50 border border-border bg-card text-foreground shadow-2xl"
    >
      <div className="p-4 sm:p-5 space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
          // Cookies
        </p>
        <p className="text-sm leading-relaxed">
          We use strictly necessary cookies to run this site. With your consent we also enable
          privacy-friendly analytics. Read the{" "}
          <Link to="/cookies" className="underline hover:text-accent">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={() => decide("rejected")}
            className="flex-1 border border-border px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest hover:bg-muted/40 transition-colors"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="flex-1 bg-accent text-accent-foreground px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest font-bold hover:bg-foreground hover:text-background transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
