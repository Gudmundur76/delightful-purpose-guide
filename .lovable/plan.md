# Add RSS feed for the Journal

Give readers (and feed readers like Feedly, Inoreader, NetNewsWire) a way to subscribe to new Journal posts.

## What gets built

1. **Feed endpoint** at `https://grow.contact/blog/rss.xml` — a valid RSS 2.0 XML feed, generated on the fly from the existing `POSTS` array in `src/lib/blog/posts.ts`. No new data source.

2. **Auto-discovery** — a `<link rel="alternate" type="application/rss+xml">` tag added to the Journal index head, so browsers and feed readers detect the feed automatically when someone pastes `grow.contact/blog` into them.

3. **Visible subscribe link** — a small "RSS" link in the Journal header next to "← Home", so non-technical visitors can find it too.

## Files

- **New** `src/routes/blog/rss[.]xml.ts` — TanStack server route. Exports a `GET` handler that maps `getAllPosts()` to `<item>` entries (title, link, guid, pubDate as RFC-822, description) wrapped in a `<channel>`. Returns `Content-Type: application/rss+xml; charset=utf-8` with a 1-hour `Cache-Control`.
- **Edit** `src/routes/blog.tsx` — add the discovery `<link>` to `head()` and a small "RSS" link in the nav bar.

## Feed contents per item

- `<title>` = post title
- `<link>` and `<guid isPermaLink="true">` = `https://grow.contact/blog/<slug>`
- `<pubDate>` = `publishedAt` converted to RFC-822 (`new Date(...).toUTCString()`)
- `<description>` = post description (CDATA-wrapped to escape any punctuation safely)
- `<category>` = each tag

Channel-level: title "Grow — Journal", link `https://grow.contact/blog`, description matching the Journal hero copy, `<atom:link rel="self">` pointing back at the feed URL (required for valid RSS).

## Out of scope

- No full-content `<content:encoded>` body. Description-only keeps the feed light and pushes readers to the site. Easy to add later if you want.
- No separate Atom feed — RSS 2.0 alone is universally supported by feed readers.
- Sitemap.xml is not part of this task (none exists today); say the word if you want one added in the same pass.
