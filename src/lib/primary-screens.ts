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
    ready: "bg-boss text-ink ring-lime/60",
    wait: "bg-card text-muted-foreground ring-boss/20",
    mark: "text-ink/70",
    bar: "bg-lime",
  },
  gold: {
    ready: "bg-lime text-ink ring-boss/50",
    wait: "bg-card text-muted-foreground ring-boss/20",
    mark: "text-ink/70",
    bar: "bg-boss",
  },
  orange: {
    ready: "bg-[#14161c] text-boss ring-boss/45",
    wait: "bg-card text-muted-foreground ring-white/10",
    mark: "text-boss",
    bar: "bg-boss",
  },
  pending: {
    ready: "bg-[#14161c] text-boss ring-boss/45",
    wait: "bg-card text-muted-foreground ring-white/10",
    mark: "text-boss",
    bar: "bg-lime",
  },
  yellow: {
    ready: "bg-[#14161c] text-lime ring-lime/40",
    wait: "bg-card text-muted-foreground ring-white/10",
    mark: "text-lime",
    bar: "bg-lime",
  },
  ember: {
    ready: "bg-[#14161c] text-boss ring-boss/45",
    wait: "bg-card text-muted-foreground ring-white/10",
    mark: "text-boss",
    bar: "bg-boss",
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
      "Send the lead to Jobs",
    ],
  },
  {
    id: "pipeline",
    href: "/command/board",
    label: "Jobs",
    short: "Jobs",
    hint: "Who you are painting, and what is next",
    ready: true,
    tone: "orange",
    opens: [
      "New call, estimate, booked, painting, paid",
      "Green button is the next step",
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
