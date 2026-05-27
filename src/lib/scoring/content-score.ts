// Pure, dependency-free content scoring engine.
// Runs in browser (live preview) and in Workers (autosave). No DOM, no I/O.
//
// scoreContent(html, brief?) -> { seo, geo, aeo, overall, checks[] }
// overall = round(seo * 0.25 + geo * 0.35 + aeo * 0.40)

export type ContentBrief = {
  keywords?: string[];
  target_word_count?: number | null;
};

export type CheckCategory = "seo" | "geo" | "aeo";

export type Check = {
  id: string;
  label: string;
  pass: boolean;
  category: CheckCategory;
  weight: number;
  hint?: string;
};

export type ContentScore = {
  seo: number;
  geo: number;
  aeo: number;
  overall: number;
  wordCount: number;
  checks: Check[];
};

// ---------- helpers ----------

const TAG = (name: string) => new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "gi");

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function wordsOf(text: string): string[] {
  if (!text) return [];
  return text.split(/\s+/).filter(Boolean);
}

function findAll(html: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  while ((m = r.exec(html)) !== null) out.push(m[1] ?? m[0]);
  return out;
}

export function extractText(html: string): string {
  return stripTags(html);
}

export function paragraphs(html: string): string[] {
  return findAll(html, TAG("p")).map(stripTags).filter((p) => p.length > 0);
}

function headings(html: string): Array<{ level: number; text: string }> {
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  const out: Array<{ level: number; text: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    out.push({ level: Number(m[1]), text: stripTags(m[2]) });
  }
  return out;
}

function hasSequentialHeadings(hs: Array<{ level: number }>): boolean {
  if (hs.length === 0) return false;
  let prev = 0;
  for (const h of hs) {
    if (prev !== 0 && h.level > prev + 1) return false;
    prev = h.level;
  }
  return true;
}

export function findFaqPairs(html: string): Array<{ q: string; a: string }> {
  const pairs: Array<{ q: string; a: string }> = [];
  // Pair = a heading (h2-h4) that ends with '?' followed by sibling content
  // up to the next heading of equal/greater level.
  const re = /<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[1-4]\b|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const qText = stripTags(m[2]);
    if (!qText.endsWith("?")) continue;
    const aText = stripTags(m[3]);
    if (aText.length > 0) pairs.push({ q: qText, a: aText });
  }
  return pairs;
}

export function hasDirectAnswer(html: string): boolean {
  // An h2/h3 question followed immediately (within first paragraph) by a
  // declarative answer paragraph >= 8 words.
  const re = /<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>\s*<p\b[^>]*>([\s\S]*?)<\/p>/i;
  const m = re.exec(html);
  if (!m) return false;
  const q = stripTags(m[1]);
  if (!q.endsWith("?")) return false;
  const a = stripTags(m[2]);
  return wordsOf(a).length >= 8;
}

function firstNWords(text: string, n: number): string {
  return wordsOf(text).slice(0, n).join(" ");
}

function hasDeclarativeSentence(text: string): boolean {
  // A sentence ending in a period (not a question), 8-40 words, no list markers.
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.some((s) => {
    const w = wordsOf(s);
    return s.endsWith(".") && !s.endsWith("?") && w.length >= 8 && w.length <= 40;
  });
}

function hasStatistic(text: string): boolean {
  // %, $, "X out of Y", or a bare number >= 3 digits, or "N times", "N%".
  return /\b\d+(?:[.,]\d+)?\s*%/.test(text)
    || /\$\s?\d/.test(text)
    || /\b\d+\s+(?:out of|of)\s+\d+\b/i.test(text)
    || /\b\d{3,}\b/.test(text)
    || /\b\d+x\b/i.test(text);
}

function hasLink(html: string): boolean {
  return /<a\b[^>]*\bhref=/i.test(html);
}

function namedEntities(text: string): string[] {
  // Naive: sequences of 1-3 Capitalised words not at sentence start.
  const sentences = text.split(/(?<=[.!?])\s+/);
  const entities = new Set<string>();
  for (const s of sentences) {
    const words = s.split(/\s+/);
    for (let i = 1; i < words.length; i++) {
      const w = words[i];
      if (/^[A-Z][a-zA-Z]{2,}/.test(w)) {
        let phrase = w;
        let j = i + 1;
        while (j < words.length && /^[A-Z][a-zA-Z]+/.test(words[j]) && j - i < 3) {
          phrase += " " + words[j];
          j++;
        }
        entities.add(phrase.replace(/[.,;:!?]+$/, ""));
        i = j - 1;
      }
    }
  }
  return [...entities];
}

function hasConclusionHeading(hs: Array<{ text: string }>): boolean {
  return hs.some((h) => /\b(conclusion|summary|takeaway|key takeaways|wrap[- ]?up|in summary|tl;?dr)\b/i.test(h.text));
}

function hasFaqHeading(hs: Array<{ text: string }>): boolean {
  return hs.some((h) => /\bf\.?a\.?q\.?s?\b|frequently asked questions/i.test(h.text));
}

function hasHowTo(html: string, hs: Array<{ text: string }>): boolean {
  if (hs.some((h) => /\bhow[- ]?to\b|step[- ]?by[- ]?step|tutorial|how it works/i.test(h.text))) return true;
  // Ordered list with >= 3 items.
  const ols = findAll(html, TAG("ol"));
  return ols.some((ol) => (ol.match(/<li\b/gi) ?? []).length >= 3);
}

function hasList(html: string): boolean {
  return /<(ul|ol)\b/i.test(html);
}

// ---------- score ----------

export function scoreContent(html: string, brief?: ContentBrief): ContentScore {
  const text = extractText(html);
  const words = wordsOf(text);
  const wordCount = words.length;
  const hs = headings(html);
  const h1s = hs.filter((h) => h.level === 1);
  const h2s = hs.filter((h) => h.level === 2);
  const paras = paragraphs(html);
  const longestPara = paras.reduce((acc, p) => Math.max(acc, wordsOf(p).length), 0);
  const avgPara = paras.length ? paras.reduce((acc, p) => acc + wordsOf(p).length, 0) / paras.length : 0;
  const first100 = firstNWords(text, 100);
  const entities = namedEntities(text);
  const faqPairs = findFaqPairs(html);
  const target = brief?.target_word_count ?? 600;
  const keywords = (brief?.keywords ?? []).map((k) => k.trim().toLowerCase()).filter(Boolean);
  const h1Text = (h1s[0]?.text ?? "").toLowerCase();
  const keywordInH1 = keywords.length === 0
    ? h1s.length > 0
    : keywords.some((k) => h1Text.includes(k));

  const checks: Check[] = [
    // ----- SEO (6) -----
    { id: "seo.h1", category: "seo", weight: 1, label: "Has a single H1 heading", pass: h1s.length === 1 },
    {
      id: "seo.h1-keyword",
      category: "seo",
      weight: 1,
      label: keywords.length ? "H1 contains a brief keyword" : "H1 is set",
      pass: keywordInH1,
    },
    { id: "seo.h2", category: "seo", weight: 1, label: "Has at least one H2", pass: h2s.length >= 1 },
    { id: "seo.hierarchy", category: "seo", weight: 1, label: "Heading levels are sequential", pass: hasSequentialHeadings(hs) },
    {
      id: "seo.length",
      category: "seo",
      weight: 1,
      label: `Word count ≥ ${target}`,
      pass: wordCount >= Math.max(target, 600),
    },
    { id: "seo.para-length", category: "seo", weight: 1, label: "No paragraph longer than 150 words", pass: longestPara > 0 && longestPara <= 150 },

    // ----- GEO (6) -----
    {
      id: "geo.declarative",
      category: "geo",
      weight: 1,
      label: "First 100 words contain a declarative sentence",
      pass: hasDeclarativeSentence(first100),
    },
    { id: "geo.statistic", category: "geo", weight: 1, label: "Contains a specific number or statistic", pass: hasStatistic(text) },
    { id: "geo.link", category: "geo", weight: 1, label: "Contains at least one hyperlink", pass: hasLink(html) },
    { id: "geo.entities", category: "geo", weight: 1, label: "Named entities present (proper nouns)", pass: entities.length >= 3 },
    { id: "geo.avg-para", category: "geo", weight: 1, label: "Average paragraph under 80 words", pass: paras.length > 0 && avgPara < 80 },
    { id: "geo.conclusion", category: "geo", weight: 1, label: "Has a conclusion or summary heading", pass: hasConclusionHeading(hs) },

    // ----- AEO (6) -----
    { id: "aeo.faq-heading", category: "aeo", weight: 1, label: "Contains an FAQ section heading", pass: hasFaqHeading(hs) },
    { id: "aeo.faq-pairs", category: "aeo", weight: 1, label: "FAQ has 3 or more question/answer pairs", pass: faqPairs.length >= 3 },
    {
      id: "aeo.faq-answer-len",
      category: "aeo",
      weight: 1,
      label: "Each FAQ answer is under 80 words",
      pass: faqPairs.length > 0 && faqPairs.every((p) => wordsOf(p.a).length < 80),
    },
    { id: "aeo.list", category: "aeo", weight: 1, label: "Contains a numbered or bulleted list", pass: hasList(html) },
    {
      id: "aeo.howto-or-faq5",
      category: "aeo",
      weight: 1,
      label: "Has a HowTo section or 5+ FAQ pairs",
      pass: hasHowTo(html, hs) || faqPairs.length >= 5,
    },
    { id: "aeo.direct-answer", category: "aeo", weight: 1, label: "Has an H2 question with direct answer below", pass: hasDirectAnswer(html) },
  ];

  const categoryScore = (cat: CheckCategory): number => {
    const items = checks.filter((c) => c.category === cat);
    const total = items.reduce((a, c) => a + c.weight, 0);
    const got = items.reduce((a, c) => a + (c.pass ? c.weight : 0), 0);
    if (total === 0) return 0;
    return Math.round((got / total) * 100);
  };

  const seo = categoryScore("seo");
  const geo = categoryScore("geo");
  const aeo = categoryScore("aeo");
  const overall = Math.round(seo * 0.25 + geo * 0.35 + aeo * 0.4);

  return { seo, geo, aeo, overall, wordCount, checks };
}
