import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareButton({ query }: { query: string }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  void navigate;

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: query, url });
        return;
      }
    } catch {
      /* fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={onShare} className="font-mono text-[11px]">
      {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Share2 className="h-3.5 w-3.5 mr-1.5" />}
      {copied ? "Copied" : "Share"}
    </Button>
  );
}
