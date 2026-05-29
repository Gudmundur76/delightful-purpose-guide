// CitationSnippet — one-click copy of APA + BibTeX citations for a dataset
// or report. Required by Verifiability Layer §14.3 to close the citation loop
// for academic / agent re-use.

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type CitationInput = {
  authors: string[]; // e.g. ["Grow"]
  year: number;
  title: string;
  publisher?: string;
  url: string;
  /** YYYY-MM-DD */
  accessed?: string;
  /** BibTeX cite key, e.g. "grow-q2-2026" */
  key: string;
};

function apa(c: CitationInput): string {
  const authors = c.authors.join(", ");
  const accessed = c.accessed ? ` Retrieved ${c.accessed}, from ${c.url}` : ` ${c.url}`;
  return `${authors} (${c.year}). ${c.title}. ${c.publisher ?? "Grow"}.${accessed}`;
}

function bibtex(c: CitationInput): string {
  return [
    `@misc{${c.key},`,
    `  author       = {${c.authors.join(" and ")}},`,
    `  title        = {${c.title}},`,
    `  year         = {${c.year}},`,
    `  howpublished = {\\url{${c.url}}},`,
    c.accessed ? `  note         = {Accessed: ${c.accessed}}` : null,
    `}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function CitationSnippet({
  citation,
  className,
}: {
  citation: CitationInput;
  className?: string;
}) {
  const [copied, setCopied] = useState<"apa" | "bibtex" | null>(null);

  const handleCopy = async (kind: "apa" | "bibtex", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard blocked — silent */
    }
  };

  const apaText = apa(citation);
  const bibText = bibtex(citation);

  return (
    <section
      aria-labelledby="citation-snippet-heading"
      className={cn(
        "rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-xs",
        className,
      )}
    >
      <h3 id="citation-snippet-heading" className="font-sans text-sm font-semibold mb-3">
        Cite this dataset
      </h3>
      <Tabs defaultValue="apa">
        <TabsList className="h-8">
          <TabsTrigger value="apa" className="text-xs">APA</TabsTrigger>
          <TabsTrigger value="bibtex" className="text-xs">BibTeX</TabsTrigger>
        </TabsList>
        <TabsContent value="apa" className="mt-3">
          <pre className="whitespace-pre-wrap break-words text-foreground/90 leading-relaxed">
            {apaText}
          </pre>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 h-7 text-xs"
            onClick={() => handleCopy("apa", apaText)}
          >
            {copied === "apa" ? (
              <><Check className="h-3 w-3 mr-1" /> Copied</>
            ) : (
              <><Copy className="h-3 w-3 mr-1" /> Copy APA</>
            )}
          </Button>
        </TabsContent>
        <TabsContent value="bibtex" className="mt-3">
          <pre className="whitespace-pre-wrap break-words text-foreground/90 leading-relaxed">
            {bibText}
          </pre>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 h-7 text-xs"
            onClick={() => handleCopy("bibtex", bibText)}
          >
            {copied === "bibtex" ? (
              <><Check className="h-3 w-3 mr-1" /> Copied</>
            ) : (
              <><Copy className="h-3 w-3 mr-1" /> Copy BibTeX</>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </section>
  );
}
