export const PRIMARY_SCREEN_IDS = [
  "fleet",
  "phone",
  "pipeline",
  "expenses",
  "chat",
  "company",
] as const;

export type PrimaryScreenId = (typeof PRIMARY_SCREEN_IDS)[number];

export const PAD_TONES = ["lime", "gold", "orange", "pending", "yellow", "ember"] as const;
export type PadTone = (typeof PAD_TONES)[number];

export type PrimaryScreen = {
  id: PrimaryScreenId;
  href: string;
  label: string;
  short: string;
  hint: string;
  ready: boolean;
  tone: PadTone;
  opens: string[];
};

export const PAD_TONE_CLASS = {
  lime: {
    ready: "bg-boss text-ink ring-lime/50",
    wait: "bg-card text-muted-foreground ring-boss/20",
    mark: "text-boss",
    bar: "bg-boss",
  },
  gold: {
    ready: "bg-lime text-ink ring-lime/70",
    wait: "bg-card text-muted-foreground ring-logo/25",
    mark: "text-lime",
    bar: "bg-lime",
  },
  orange: {
    ready: "bg-employee text-ink ring-employee/70",
    wait: "bg-card text-muted-foreground ring-employee/25",
    mark: "text-employee",
    bar: "bg-employee",
  },
  pending: {
    ready: "bg-pending text-ink ring-pending/70",
    wait: "bg-card text-muted-foreground ring-pending/25",
    mark: "text-pending",
    bar: "bg-pending",
  },
  yellow: {
    ready: "bg-yellow text-ink ring-yellow/70",
    wait: "bg-card text-muted-foreground ring-yellow/25",
    mark: "text-yellow",
    bar: "bg-yellow",
  },
  ember: {
    ready: "bg-employee-deep text-white ring-employee/50",
    wait: "bg-card text-muted-foreground ring-employee-deep/30",
    mark: "text-employee",
    bar: "bg-employee-deep",
  },
} as const;

export const PRIMARY_SCREENS: PrimaryScreen[] = [
  {
    id: "fleet",
    href: "/command/crew",
    label: "Fleet",
    short: "GPS",
    hint: "Live crew on the Hot Springs map",
    ready: true,
    tone: "lime",
    opens: [
      "Where each tech is, and how far",
      "Shift bar, IN / OUT, overtime",
      "One-tap directions to the job",
    ],
  },
  {
    id: "phone",
    href: "/command/phone",
    label: "Phone",
    short: "AI",
    hint: "AI receptionist and call log",
    ready: true,
    tone: "gold",
    opens: [
      "Missed and answered calls",
      "Transcripts and a short lead summary",
      "Send the lead to Pipeline",
    ],
  },
  {
    id: "pipeline",
    href: "/command/board",
    label: "Pipeline",
    short: "Jobs",
    hint: "Lead to invoice on one board",
    ready: true,
    tone: "orange",
    opens: [
      "Lead, estimate, schedule, on job, invoice",
      "Move a job by tapping the next stage",
    ],
  },
  {
    id: "expenses",
    href: "/command/expenses",
    label: "Expenses",
    short: "Scan",
    hint: "Scan a receipt onto a job",
    ready: true,
    tone: "pending",
    opens: [
      "Camera scan of a material receipt",
      "Tied to the job, not a shoebox",
    ],
  },
  {
    id: "chat",
    href: "/command/chat",
    label: "Chat",
    short: "Talk",
    hint: "Office, field, and job threads",
    ready: true,
    tone: "yellow",
    opens: [
      "Direct messages",
      "Company broadcast",
      "Comments on a job",
    ],
  },
  {
    id: "company",
    href: "/command/company",
    label: "Company",
    short: "Hub",
    hint: "Profile, people, and billing",
    ready: true,
    tone: "ember",
    opens: [
      "Business name and logo",
      "Invite a tech",
      "What this shop is subscribed to",
    ],
  },
];

export function screenForPath(pathname: string) {
  return PRIMARY_SCREENS.find((item) => item.href === pathname) ?? null;
}

export function screenNumber(id: PrimaryScreenId) {
  return String(PRIMARY_SCREENS.findIndex((item) => item.id === id) + 1).padStart(2, "0");
}
