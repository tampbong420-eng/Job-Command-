export const PRIMARY_SCREEN_IDS = [
  "crew",
  "two",
  "three",
  "four",
  "five",
  "six",
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
};

export const PAD_TONE_CLASS = {
  lime: {
    ready: "bg-boss text-ink ring-lime/50",
    wait: "bg-card text-muted-foreground ring-boss/20",
    mark: "text-boss",
    bar: "bg-boss",
  },
  gold: {
    ready: "bg-logo text-ink ring-logo/70",
    wait: "bg-card text-muted-foreground ring-logo/25",
    mark: "text-logo",
    bar: "bg-logo",
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
    id: "crew",
    href: "/command/crew",
    label: "Active Jobs",
    short: "Jobs",
    hint: "On-site work, maps, and live crew",
    ready: true,
    tone: "lime",
  },
  {
    id: "two",
    href: "/command",
    label: "Coming next",
    short: "02",
    hint: "Next function",
    ready: false,
    tone: "gold",
  },
  {
    id: "three",
    href: "/command",
    label: "Coming next",
    short: "03",
    hint: "Next function",
    ready: false,
    tone: "orange",
  },
  {
    id: "four",
    href: "/command",
    label: "Coming next",
    short: "04",
    hint: "Next function",
    ready: false,
    tone: "pending",
  },
  {
    id: "five",
    href: "/command",
    label: "Coming next",
    short: "05",
    hint: "Next function",
    ready: false,
    tone: "yellow",
  },
  {
    id: "six",
    href: "/command",
    label: "Coming next",
    short: "06",
    hint: "Next function",
    ready: false,
    tone: "ember",
  },
];

export function screenForPath(pathname: string) {
  return PRIMARY_SCREENS.find((item) => item.ready && item.href === pathname) ?? null;
}
