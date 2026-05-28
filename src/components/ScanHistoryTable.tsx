import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { HistoryScanRow } from "@/lib/check/history.functions";

interface Props {
  host: string;
  scans: HistoryScanRow[];
}

export function ScanHistoryTable({ host, scans }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  function compare() {
    if (selected.length !== 2) return;
    navigate({
      to: "/history/$host/diff",
      params: { host },
      search: { a: selected[0], b: selected[1] },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-mono text-xs text-muted-foreground">
          {scans.length} scan{scans.length === 1 ? "" : "s"} · select 2 to compare
        </div>
        <button
          onClick={compare}
          disabled={selected.length !== 2}
          className="bg-foreground text-background font-bold px-4 py-2 text-xs uppercase tracking-tighter disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Compare selected ({selected.length}/2)
        </button>
      </div>
      <div className="border border-border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-card">
            <tr className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="text-left p-3 w-8"></th>
              <th className="text-left p-3">Date</th>
              <th className="text-right p-3">Overall</th>
              <th className="text-right p-3 hidden sm:table-cell">Sem</th>
              <th className="text-right p-3 hidden sm:table-cell">JSON-LD</th>
              <th className="text-right p-3 hidden sm:table-cell">llms</th>
              <th className="text-right p-3 hidden sm:table-cell">Cite</th>
              <th className="text-right p-3 hidden sm:table-cell">Speed</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((s) => {
              const checked = selected.includes(s.id);
              const color =
                s.overall >= 85 ? "text-accent" : s.overall >= 70 ? "text-yellow-500" : "text-red-500";
              return (
                <tr
                  key={s.id}
                  className={`border-t border-border hover:bg-card/50 cursor-pointer ${
                    checked ? "bg-accent/5" : ""
                  }`}
                  onClick={() => toggle(s.id)}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(s.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="accent-accent"
                    />
                  </td>
                  <td className="p-3 font-mono text-xs">
                    {new Date(s.scanned_at).toLocaleString()}
                  </td>
                  <td className={`p-3 text-right font-mono font-bold ${color}`}>{s.overall}</td>
                  <td className="p-3 text-right font-mono text-xs hidden sm:table-cell">{s.semantic}</td>
                  <td className="p-3 text-right font-mono text-xs hidden sm:table-cell">{s.jsonld}</td>
                  <td className="p-3 text-right font-mono text-xs hidden sm:table-cell">{s.llms}</td>
                  <td className="p-3 text-right font-mono text-xs hidden sm:table-cell">{s.citability}</td>
                  <td className="p-3 text-right font-mono text-xs hidden sm:table-cell">{s.speed}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
