export const COMPANY_BILLING = {
  plan: "Command",
  amountLabel: "$149 / month",
  status: "active" as const,
  graceDays: 3,
  seats: 8,
};

export const COMPANY_TERMS = [
  "Using Job Command means the shop agrees to the SaaS terms on this desk.",
  "Billing runs monthly. After a failed charge there is a 3-day grace window, then office and AI dispatch lock.",
  "Job data is isolated per company. Transport is TLS. Disk encryption is AES-256 when hosted on Postgres.",
  "We do not cover carrier outages, dead zones, or third-party API limits.",
  "On cancel, job ledgers and clients export as CSV or JSON.",
];
