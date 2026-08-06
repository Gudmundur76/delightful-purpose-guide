/**
 * IndexNow — instant URL submission to Bing, Yandex, Seznam, Naver
 * (and, via the shared protocol, any participating engine).
 *
 * The key file must be reachable at https://grow.contact/<key>.txt
 * and contain exactly the key.
 */

export const INDEXNOW_KEY = "850307b6fd9b7ece026f0a493448256d";
export const INDEXNOW_HOST = "grow.contact";
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";

export type IndexNowResult = {
  submitted: string[];
  status: number;
  ok: boolean;
  message: string;
};

function normalize(url: string): string | null {
  try {
    const u = new URL(url, `https://${INDEXNOW_HOST}`);
    if (u.hostname !== INDEXNOW_HOST) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Submit up to 10,000 URLs on this host to the IndexNow network. */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const urlList = Array.from(new Set(urls.map(normalize).filter((u): u is string => !!u))).slice(0, 10000);
  if (urlList.length === 0) {
    return { submitted: [], status: 400, ok: false, message: `No valid URLs on ${INDEXNOW_HOST}.` };
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList,
    }),
  });

  const message =
    res.status === 200
      ? "Accepted — URLs queued for crawl."
      : res.status === 202
        ? "Accepted, key validation pending."
        : res.status === 422
          ? "URLs do not belong to the host, or the key does not match."
          : res.status === 403
            ? "Key not found at the key location."
            : res.status === 429
              ? "Too many requests — slow down."
              : `IndexNow returned ${res.status}.`;

  return { submitted: urlList, status: res.status, ok: res.status === 200 || res.status === 202, message };
}

/**
 * Fire-and-forget ping used by publish/update flows.
 * Accepts paths ("/blog/x") or absolute URLs, never throws.
 */
export async function pingIndexNow(pathsOrUrls: string[]): Promise<IndexNowResult | null> {
  try {
    const urls = pathsOrUrls.map((p) => (p.startsWith("http") ? p : `https://${INDEXNOW_HOST}${p.startsWith("/") ? p : `/${p}`}`));
    const result = await submitToIndexNow(urls);
    if (!result.ok) console.error("IndexNow ping failed", result.status, result.message);
    return result;
  } catch (e) {
    console.error("IndexNow ping error", e);
    return null;
  }
}

/** Read our own sitemap.xml and return every <loc> on this host. */
export async function sitemapUrls(origin = `https://${INDEXNOW_HOST}`): Promise<string[]> {
  const res = await fetch(`${origin}/sitemap.xml`, { headers: { accept: "application/xml" } });
  if (!res.ok) return [];
  const xml = await res.text();
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g))
    .map((m) => (m[1] ?? "").trim())
    .filter(Boolean);
}
