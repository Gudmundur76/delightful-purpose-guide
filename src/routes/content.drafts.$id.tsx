import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getDraftFn, updateDraftFn, setDraftStatusFn } from "@/lib/content/content.functions";
import { scoreContent, type ContentScore, type Check } from "@/lib/scoring/content-score";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ArrowLeft, Check as CheckIcon, X, ChevronDown, Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2 } from "lucide-react";

export const Route = createFileRoute("/content/drafts/$id")({
  component: DraftEditor,
});

function useDebouncedValue<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function scoreColor(n: number) {
  if (n >= 85) return "text-emerald-400";
  if (n >= 70) return "text-amber-400";
  return "text-red-400";
}

function DraftEditor() {
  const { id } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const getDraft = useServerFn(getDraftFn);
  const updateDraft = useServerFn(updateDraftFn);
  const setStatus = useServerFn(setDraftStatusFn);

  const { data, isLoading } = useQuery({
    queryKey: ["content-draft", id],
    queryFn: () => getDraft({ data: { id } }),
  });

  const [html, setHtml] = useState<string>("");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");
  const initializedRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { class: "text-accent underline" } }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[500px] focus:outline-none px-6 py-4",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  // Initialize editor content once data arrives
  useEffect(() => {
    if (!editor || !data?.draft || initializedRef.current) return;
    editor.commands.setContent(data.draft.body_html || "<h1></h1><p></p>");
    setHtml(data.draft.body_html || "");
    initializedRef.current = true;
  }, [editor, data]);

  const brief = data?.brief
    ? {
        keywords: (data.brief.keywords as string[]) ?? [],
        target_word_count: (data.brief.target_word_count as number | null) ?? undefined,
      }
    : undefined;

  // Debounced scoring (1s)
  const debouncedHtml = useDebouncedValue(html, 1000);
  const score: ContentScore = useMemo(() => scoreContent(debouncedHtml, brief), [debouncedHtml, brief]);

  // Autosave debounced 3s
  const debouncedSaveHtml = useDebouncedValue(html, 3000);
  useEffect(() => {
    if (!initializedRef.current || !data?.draft) return;
    if (debouncedSaveHtml === data.draft.body_html) return;
    setSavingState("saving");
    updateDraft({
      data: {
        id,
        body_html: debouncedSaveHtml,
        seo_score: score.seo,
        geo_score: score.geo,
        aeo_score: score.aeo,
        overall_score: score.overall,
        checks: score.checks,
      },
    })
      .then(() => {
        setLastSavedAt(Date.now());
        setSavingState("saved");
      })
      .catch((e) => {
        setSavingState("idle");
        toast.error(e.message ?? "Save failed");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSaveHtml]);

  const statusMutation = useMutation({
    mutationFn: (vars: { status: "approved" | "draft" | "rejected"; bumpVersion?: boolean }) =>
      setStatus({ data: { id, ...vars } }),
    onSuccess: (_d, vars) => {
      toast.success(`Marked ${vars.status === "draft" ? "for revision" : vars.status}`);
      qc.invalidateQueries({ queryKey: ["content-draft", id] });
      qc.invalidateQueries({ queryKey: ["content-drafts"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  if (isLoading || !editor) {
    return <div className="px-6 py-10 font-mono text-sm text-muted-foreground">Loading draft…</div>;
  }
  if (!data?.draft) {
    return <div className="px-6 py-10 font-mono text-sm text-muted-foreground">Draft not found.</div>;
  }

  const draft = data.draft;
  const topFixes = score.checks.filter((c) => !c.pass).slice(0, 3);

  return (
    <main className="min-h-screen px-4 lg:px-6 py-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.navigate({ to: "/content/drafts" })}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Drafts
          </Button>
          <div>
            <h1 className="font-bold text-lg">{draft.title}</h1>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              v{draft.version} · {draft.status} · {savingState === "saving" ? "saving…" : lastSavedAt ? `saved ${Math.floor((Date.now() - lastSavedAt) / 1000)}s ago` : "no changes"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        {/* Editor */}
        <div className="border border-border bg-card">
          <Toolbar editor={editor} />
          <EditorContent editor={editor} />
        </div>

        {/* Score panel */}
        <div className="space-y-4">
          <div className="border border-border bg-card p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Overall</div>
            <div className={`text-5xl font-bold ${scoreColor(score.overall)}`}>{score.overall}</div>
            <div className="text-xs text-muted-foreground font-mono mt-1">{score.wordCount} words</div>
            <div className="space-y-3 mt-5">
              <ScoreRow label="SEO" value={score.seo} weight="25%" />
              <ScoreRow label="GEO" value={score.geo} weight="35%" />
              <ScoreRow label="AEO" value={score.aeo} weight="40%" />
            </div>
          </div>

          {topFixes.length > 0 && (
            <div className="border border-border bg-card p-5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Top 3 fixes</div>
              <ol className="space-y-2 text-sm">
                {topFixes.map((c, i) => (
                  <li key={c.id} className="flex gap-2">
                    <span className="font-mono text-xs text-accent shrink-0">{i + 1}.</span>
                    <span>{c.label}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <CheckGroup title="SEO" category="seo" checks={score.checks} />
          <CheckGroup title="GEO" category="geo" checks={score.checks} />
          <CheckGroup title="AEO" category="aeo" checks={score.checks} />
        </div>
      </div>

      {/* Action bar */}
      <div className="sticky bottom-0 mt-6 -mx-4 lg:-mx-6 bg-background/95 backdrop-blur border-t border-border px-4 lg:px-6 py-3 flex gap-2 justify-end">
        <Button
          variant="outline"
          disabled={statusMutation.isPending}
          onClick={() => statusMutation.mutate({ status: "rejected" })}
        >
          Reject
        </Button>
        <Button
          variant="outline"
          disabled={statusMutation.isPending}
          onClick={() => statusMutation.mutate({ status: "draft", bumpVersion: true })}
        >
          Request revision
        </Button>
        <Button
          disabled={statusMutation.isPending}
          onClick={() => statusMutation.mutate({ status: "approved" })}
        >
          Approve
        </Button>
      </div>
    </main>
  );
}

function ScoreRow({ label, value, weight }: { label: string; value: number; weight: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span>{label} <span className="text-muted-foreground">· {weight}</span></span>
        <span className={scoreColor(value)}>{value}</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function CheckGroup({ title, category, checks }: { title: string; category: "seo" | "geo" | "aeo"; checks: Check[] }) {
  const items = checks.filter((c) => c.category === category);
  const passed = items.filter((c) => c.pass).length;
  return (
    <Collapsible>
      <div className="border border-border bg-card">
        <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/20">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest">{title}</span>
            <span className="text-xs text-muted-foreground">{passed}/{items.length} passing</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="border-t border-border divide-y divide-border">
            {items.map((c) => (
              <li key={c.id} className="px-4 py-2 flex items-start gap-2 text-sm">
                {c.pass ? (
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span className={c.pass ? "text-muted-foreground" : ""}>{c.label}</span>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const btn = (active: boolean, onClick: () => void, children: React.ReactNode, title: string) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 hover:bg-muted/40 ${active ? "bg-muted text-accent" : "text-muted-foreground"}`}
    >
      {children}
    </button>
  );
  return (
    <div className="flex border-b border-border bg-background/50">
      {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold className="w-4 h-4" />, "Bold")}
      {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic className="w-4 h-4" />, "Italic")}
      <div className="w-px bg-border" />
      {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 className="w-4 h-4" />, "H2")}
      {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 className="w-4 h-4" />, "H3")}
      <div className="w-px bg-border" />
      {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <List className="w-4 h-4" />, "Bulleted list")}
      {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className="w-4 h-4" />, "Numbered list")}
      <div className="w-px bg-border" />
      {btn(editor.isActive("link"), () => {
        const prev = editor.getAttributes("link").href;
        const url = window.prompt("URL", prev ?? "https://");
        if (url === null) return;
        if (url === "") editor.chain().focus().unsetLink().run();
        else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }, <Link2 className="w-4 h-4" />, "Link")}
    </div>
  );
}
