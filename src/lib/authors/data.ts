// Named authors for the research series. Person JSON-LD on every
// report and data drop is the highest-leverage E-E-A-T move left:
// press cites named humans, not orgs, and AI engines weight
// content with verified authorship higher.

export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  /** One-paragraph bio used in JSON-LD `description`. */
  shortBio: string;
  /** Fields the author is recognised in — Person.knowsAbout. */
  knowsAbout: string[];
  /** External profiles — Person.sameAs. */
  sameAs: string[];
  email: string;
}

export const AUTHORS: Author[] = [
  {
    slug: "grow-research",
    name: "Grow Research",
    role: "Research desk, citation.is",
    shortBio:
      "The data desk behind the Agent Readability Leaderboard. We scan top AI companies on five GEO signals and publish the dataset under CC BY 4.0.",
    bio:
      "Grow Research operates the only open, continuously-scored dataset of agent-readability across the AI industry. The desk publishes a quarterly State of the Agent-Readable Web report, monthly Data Drops, and a versioned methodology. All findings are reproducible from the public JSON dataset at /api/public/leaderboard.json.",
    knowsAbout: [
      "Generative Engine Optimization",
      "Agent-readability",
      "llms.txt",
      "Schema.org JSON-LD",
      "AI citation rates",
      "ChatGPT, Perplexity, Claude search indexing",
    ],
    sameAs: [
      "https://citation.is",
      "https://citation.is/report/q2-2026",
      "https://citation.is/leaderboard",
    ],
    email: "research@citation.is",
  },
];

export function getAuthor(slug: string): Author | undefined {
  return AUTHORS.find((a) => a.slug === slug);
}

export const DEFAULT_AUTHOR_SLUG = "grow-research";

export function personJsonLd(author: Author) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.role,
    description: author.shortBio,
    email: `mailto:${author.email}`,
    url: `https://citation.is/about/author/${author.slug}`,
    knowsAbout: author.knowsAbout,
    sameAs: author.sameAs,
    worksFor: {
      "@type": "Organization",
      name: "citation.is",
      url: "https://citation.is",
    },
  };
}
