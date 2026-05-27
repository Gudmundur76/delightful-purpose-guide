import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listDraftsFn } from "@/lib/content/content.functions";
import { Badge } from "@/components/ui/badge";
import { FileEdit } from "lucide-react";

export const Route = createFileRoute("/content/drafts")({
  component: DraftsTab,
});

function scoreColor(n: number | null | undefined) {
  if (n == null) return "bg-muted text-muted-foreground";
  if (n >= 85) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (n >= 70) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-red-500/15 text-red-400 border-red-500/30";
}

function statusColor(s: string) {
  switch (s) {
    case "published": return "bg-emerald-500/15 text-emerald-400";
    case "scheduled": return "bg-blue-500/15 text-blue-400";
    case "approved": return "bg-violet-500/15 text-violet-400";
    case "in_review": return "bg-amber-500/15 text-amber-400";
    case "rejected": return "bg-red-500/15 text-red-400";
    default: return "bg-muted text-muted-foreground";
  }
}

function DraftsTab() {
  const list = useServerFn(listDraftsFn);
  const { data, isLoading } = useQuery({ queryKey: ["content-drafts"], queryFn: () => list() });

  if (isLoading) return <div className="text-sm font-mono text-muted-foreground">Loading…</div>;
  if (!data || data.length === 0) {
    return (
      <div className="border border-dashed border-border p-12 text-center">
        <FileEdit className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">No drafts yet. Generate one from a brief.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((d: any) => (
        <Link
          key={d.id}
          to="/content/drafts/$id"
          params={{ id: d.id }}
          className="border border-border p-4 hover:border-accent transition-colors block"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold leading-tight">{d.title}</h3>
            <span className="font-mono text-[10px] text-muted-foreground shrink-0 ml-2">v{d.version}</span>
          </div>
          <div className="flex gap-1 mb-3 flex-wrap">
            <Badge variant="outline" className={scoreColor(d.seo_score)}>SEO {d.seo_score ?? "—"}</Badge>
            <Badge variant="outline" className={scoreColor(d.geo_score)}>GEO {d.geo_score ?? "—"}</Badge>
            <Badge variant="outline" className={scoreColor(d.aeo_score)}>AEO {d.aeo_score ?? "—"}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 font-mono text-[10px] uppercase ${statusColor(d.status)}`}>{d.status}</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {d.overall_score != null ? `${d.overall_score}/100` : "unscored"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
