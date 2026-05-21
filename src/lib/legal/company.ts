// Single source of truth for legal/business details surfaced in policies.
// EDIT these values to match your real registered entity.
export const COMPANY = {
  tradingName: "Grow Studio",
  legalEntity: "Grow Studio",
  // TODO: replace with registered office address
  address: "[Registered office address — please update]",
  // TODO: replace with company / VAT registration number if applicable
  registration: "[Company registration number — please update]",
  contactEmail: "hello@grow.contact",
  privacyEmail: "privacy@grow.contact",
  dpoEmail: "privacy@grow.contact",
  website: "https://grow.contact",
  lastUpdated: "May 21, 2026",
  jurisdictionNote:
    "These policies are written to cover the EU/UK (GDPR) and California (CCPA/CPRA), and to set out reasonable defaults for visitors elsewhere.",
} as const;
