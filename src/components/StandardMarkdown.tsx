// Minimal styled renderer for the Standard specification. Uses `marked` to
// parse — same parser used in countless production docs sites; Worker-safe,
// pure JS, no DOM dependency. The output is wrapped in `prose` styling that
// mirrors the rest of the marketing surface.

import { marked } from "marked";
import { useMemo } from "react";

interface Props {
  markdown: string;
}

marked.setOptions({ gfm: true, breaks: false });

export function StandardMarkdown({ markdown }: Props) {
  const html = useMemo(() => marked.parse(markdown) as string, [markdown]);
  return (
    <div
      className="standard-prose"
      // The spec is authored in-repo by us; not user input. Safe to inject.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
