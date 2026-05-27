import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listBriefsFn, createBriefFn, createDraftFn } from "@/lib/content/content.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";

export const Route = createFileRoute("/content/briefs")({
  component: BriefsTab,
});

function BriefsTab() {
  const list = useServerFn(listBriefsFn);
  const { data, isLoading } = useQuery({
    queryKey: ["content-briefs"],
    queryFn: () => list(),
  });
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const router = useRouter();
  const createBrief = useServerFn(createBriefFn);
  const createDraft = useServerFn(createDraftFn);

  const generate = useMutation({
    mutationFn: async (briefId: string) => {
      const briefs = data ?? [];
      const b = briefs.find((x: any) => x.id === briefId);
      if (!b) throw new Error("brief not found");
      return await createDraft({ data: { brief_id: briefId, title: b.title } });
    },
    onSuccess: (draft: any) => {
      toast.success("Draft created");
      router.navigate({ to: "/content/drafts/$id", params: { id: draft.id } });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Briefs feed the content agent. Each new brief queues an <code className="font-mono text-xs">agent_runs</code> job.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> New brief</Button>
          </DialogTrigger>
          <NewBriefDialog
            onCreated={() => {
              setOpen(false);
              qc.invalidateQueries({ queryKey: ["content-briefs"] });
            }}
            createBrief={createBrief}
          />
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground font-mono">Loading…</div>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="border border-dashed border-border p-12 text-center">
          <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No briefs yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Words</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((b: any) => (
                <tr key={b.id} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs">{b.site}</td>
                  <td className="px-4 py-3 font-medium">{b.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.content_type ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{b.target_word_count ?? "—"}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{b.status}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={generate.isPending}
                      onClick={() => generate.mutate(b.id)}
                    >
                      New draft
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function NewBriefDialog({
  onCreated,
  createBrief,
}: {
  onCreated: () => void;
  createBrief: ReturnType<typeof useServerFn<typeof createBriefFn>>;
}) {
  const [form, setForm] = useState({
    site: "",
    title: "",
    topic: "",
    intent: "informational",
    audience: "",
    keywords: "",
    content_type: "blog post",
    target_word_count: "1200",
  });
  const create = useMutation({
    mutationFn: () =>
      createBrief({
        data: {
          site: form.site,
          title: form.title,
          topic: form.topic,
          intent: form.intent,
          audience: form.audience,
          keywords: form.keywords.split(",").map((s) => s.trim()).filter(Boolean),
          content_type: form.content_type,
          target_word_count: Number(form.target_word_count) || 1200,
        },
      }),
    onSuccess: () => {
      toast.success("Brief created");
      onCreated();
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>New content brief</DialogTitle>
      </DialogHeader>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Site</Label>
            <Input value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} placeholder="acme.com" required />
          </div>
          <div className="space-y-2">
            <Label>Content type</Label>
            <Input value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Topic</Label>
          <Textarea value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Intent</Label>
            <Input value={form.intent} onChange={(e) => setForm({ ...form, intent: e.target.value })} placeholder="informational" />
          </div>
          <div className="space-y-2">
            <Label>Target word count</Label>
            <Input type="number" value={form.target_word_count} onChange={(e) => setForm({ ...form, target_word_count: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Audience</Label>
          <Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Keywords (comma separated)</Label>
          <Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="seo, generative engine optimization" />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create brief"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
