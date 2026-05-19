## Goal

Showcase Grow.contact (AI talent acquisition SaaS) on the RapidEngine landing page as a turnkey business available for acquisition, plus add it as a third portfolio entry.

## Changes

### 1. Capture Grow.contact hero as portfolio image
- Save the fetched screenshot of grow.contact to `src/assets/portfolio-grow.jpg` (cropped to a 4:3 hero shot, matching the existing portfolio image style).

### 2. New "Acquire" section (between Portfolio and Pricing)
A dedicated full-width section positioned as "Businesses For Acquisition":

```text
// FOR ACQUISITION — TURNKEY BUSINESSES

GROW.CONTACT
The most powerful AI ever deployed in talent acquisition.

[ large product screenshot ]      [ right column ]
                                   - Category: AI SaaS / HR Tech
                                   - Stage: Beta, live product
                                   - Stack: Built on Lovable
                                   - Key metrics (placeholders): 3× faster
                                     time-to-hire · 94% screening accuracy
                                   - Status badge: "Accepting offers"
                                   - CTA: "Request acquisition memo"
                                   - Secondary: "Visit grow.contact" →
```

Styling stays in the Operator Technical system (mono labels, sharp borders, orange accent for the "Accepting offers" status, no rounded corners).

### 3. Add Grow.contact to the existing Portfolio grid
- Change the portfolio grid from 2 columns to a 3-column responsive grid (`md:grid-cols-3`).
- Third card: Grow.contact image + label `GROW.CONTACT` + meta `AI SAAS // FOR SALE` (orange accent text to flag it).

### 4. Header nav
- Add an `Acquire` link to the nav pointing at the new `#acquire` section.

### 5. Metadata
- Update the page description to mention "ready-to-launch businesses for acquisition" alongside the 48h site service.

## Technical notes

- Single file changed: `src/routes/index.tsx` (plus the new image asset).
- All copy uses placeholder figures pulled from grow.contact's own marketing (3×, 60%, 94%, 12mo) — clearly framed as product metrics, not financials. No asking price is shown; the CTA routes interested buyers to request a memo instead, which is the standard play for business-for-sale listings.
- No backend, no form wiring yet — the CTA buttons are anchor links / `mailto:` placeholders you can swap later.

## Out of scope

- Real acquisition deal-flow form (would need Lovable Cloud + email).
- Financials, traffic stats, MRR — left out until you provide them.
- Multi-listing marketplace UI — only Grow.contact is featured for now; structure makes it easy to add more later.