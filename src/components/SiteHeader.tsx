import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { to: "/", label: "Home", exact: true },
  { to: "/services", label: "Services", exact: false },
  { to: "/process", label: "Process", exact: false },
  { to: "/work", label: "Work", exact: false },
  { to: "/pricing", label: "Pricing", exact: false },
  { to: "/playground", label: "Playground", exact: false },
  { to: "/extension", label: "Extension", exact: false },

  { to: "/leaderboard", label: "Leaderboard", exact: false },
  { to: "/research", label: "Research", exact: false },
  { to: "/blog", label: "Journal", exact: false },
] as const;


export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-background/70 backdrop-blur-xl border-border/80 shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
          : "bg-background border-transparent"
      }`}
    >
      <nav aria-label="Primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="font-extrabold tracking-tighter text-xl uppercase">GROW_</span>
          <span className="hidden sm:inline-flex font-mono text-[10px] font-medium px-2 py-1 border border-accent/40 bg-accent/10 text-accent tracking-tight rounded-sm items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Score: 100
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-8">
          <div className="hidden md:flex gap-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                activeProps={{ className: "text-foreground" }}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/contact"
              className="inline-flex bg-foreground text-background text-xs font-bold px-4 py-2 uppercase tracking-tighter hover:bg-accent hover:text-accent-foreground transition-all"
            >
              Start Brief
            </Link>
          </div>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 border border-border hover:border-accent hover:text-accent transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-background border-t border-border animate-in fade-in duration-150">
          <div className="px-6 py-8 flex flex-col gap-6">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                activeProps={{ className: "text-accent" }}
                onClick={() => setOpen(false)}
                className="font-extrabold uppercase tracking-tighter text-3xl text-foreground/90 hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm"
            >
              Start Brief →
            </Link>
          </div>
        </div>
      )}
      </nav>
    </header>
  );
}
