import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, TOOLS, type ToolCategory } from "@/lib/playground/catalog";

export function ToolCatalog() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ToolCategory | "All">("All");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return TOOLS.filter((t) => {
      if (cat !== "All" && t.category !== cat) return false;
      if (!needle) return true;
      return (
        t.name.toLowerCase().includes(needle) ||
        t.description.toLowerCase().includes(needle)
      );
    });
  }, [q, cat]);

  return (
    <div className="border border-border bg-card/40">
      <div className="p-5 border-b border-border space-y-3">
        <div className="flex items-baseline justify-between">
          <h3 className="font-extrabold uppercase tracking-tighter text-xl">
            Tool catalog
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {TOOLS.length} tools
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools…"
            className="w-full bg-background border border-border pl-9 pr-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`font-mono text-[9px] uppercase tracking-widest px-2 py-1 border transition-colors ${
                cat === c
                  ? "border-accent text-accent bg-accent/10"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <ul className="divide-y divide-border max-h-[640px] overflow-y-auto">
        {filtered.map((t) => (
          <li key={t.name} className="p-4 hover:bg-accent/5 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <code className="font-mono text-sm font-bold text-foreground">{t.name}</code>
                <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {t.publicSafe && (
                  <span className="font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 border border-accent/40 text-accent bg-accent/5">
                    public
                  </span>
                )}
                {t.mutates && (
                  <span className="font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 border border-border text-muted-foreground">
                    auth
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="p-8 text-center font-mono text-xs text-muted-foreground">
            No tools match.
          </li>
        )}
      </ul>
    </div>
  );
}
