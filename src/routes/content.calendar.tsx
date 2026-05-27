import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listCalendarFn } from "@/lib/content/content.functions";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/content/calendar")({
  component: CalendarTab,
});

function CalendarTab() {
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getUTCFullYear(), m: today.getUTCMonth() + 1 });
  const list = useServerFn(listCalendarFn);
  const { data } = useQuery({
    queryKey: ["content-calendar", cursor.y, cursor.m],
    queryFn: () => list({ data: { year: cursor.y, month: cursor.m } }),
  });

  const first = new Date(Date.UTC(cursor.y, cursor.m - 1, 1));
  const startWeekday = first.getUTCDay();
  const daysInMonth = new Date(Date.UTC(cursor.y, cursor.m, 0)).getUTCDate();
  const cells: Array<{ day: number | null; iso?: string }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, iso: `${cursor.y}-${String(cursor.m).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null });

  const byDay = new Map<string, Array<any>>();
  for (const item of data ?? []) {
    const dateStr = (item.published_at ?? item.scheduled_for ?? "").slice(0, 10);
    if (!dateStr) continue;
    const arr = byDay.get(dateStr) ?? [];
    arr.push(item);
    byDay.set(dateStr, arr);
  }

  const monthName = new Date(Date.UTC(cursor.y, cursor.m - 1, 1)).toLocaleString("en", { month: "long", year: "numeric", timeZone: "UTC" });

  const move = (delta: number) => {
    let m = cursor.m + delta;
    let y = cursor.y;
    if (m < 1) { m = 12; y--; } else if (m > 12) { m = 1; y++; }
    setCursor({ y, m });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-xl">{monthName}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => move(-1)}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setCursor({ y: today.getUTCFullYear(), m: today.getUTCMonth() + 1 })}>Today</Button>
          <Button variant="outline" size="sm" onClick={() => move(1)}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-border border border-border">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">{d}</div>
        ))}
        {cells.map((c, i) => {
          const items = c.iso ? byDay.get(c.iso) ?? [] : [];
          return (
            <div key={i} className="bg-background min-h-[100px] p-1.5 text-xs">
              {c.day && <div className="font-mono text-[10px] text-muted-foreground mb-1">{c.day}</div>}
              <div className="space-y-1">
                {items.map((it: any) => {
                  const color = it.status === "published" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : it.status === "scheduled" ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                    : "bg-muted text-muted-foreground border-border";
                  return (
                    <Link key={it.id} to="/content/drafts/$id" params={{ id: it.id }} className={`block px-1.5 py-0.5 text-[10px] truncate border ${color}`}>
                      {it.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 text-xs font-mono text-muted-foreground">
        <span><span className="inline-block w-3 h-3 bg-emerald-500/40 mr-1 align-middle" /> published</span>
        <span><span className="inline-block w-3 h-3 bg-blue-500/40 mr-1 align-middle" /> scheduled</span>
      </div>
    </div>
  );
}
