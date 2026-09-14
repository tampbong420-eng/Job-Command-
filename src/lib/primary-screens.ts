export const PRIMARY_SCREEN_IDS = [
  "crew",
  "two",
  "three",
  "four",
  "five",
  "six",
] as const;

export type PrimaryScreenId = (typeof PRIMARY_SCREEN_IDS)[number];

export const PAD_TONES = ["green", "gold", "sky", "amber", "orange", "rose"] as const;
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
  green: {
    ready: "bg-emerald-500 text-emerald-950 ring-emerald-400/80",
    wait: "bg-card text-muted-foreground ring-emerald-500/25",
    mark: "text-emerald-400",
    bar: "bg-emerald-500",
  },
  gold: {
    ready: "bg-primary text-primary-foreground ring-primary/80",
    wait: "bg-card text-muted-foreground ring-primary/25",
    mark: "text-primary",
    bar: "bg-primary",
  },
  sky: {
    ready: "bg-sky-500 text-sky-950 ring-sky-400/80",
    wait: "bg-card text-muted-foreground ring-sky-500/25",
    mark: "text-sky-400",
    bar: "bg-sky-500",
  },
  amber: {
    ready: "bg-amber-400 text-amber-950 ring-amber-300/80",
    wait: "bg-card text-muted-foreground ring-amber-400/25",
    mark: "text-amber-400",
    bar: "bg-amber-400",
  },
  orange: {
    ready: "bg-orange-500 text-orange-950 ring-orange-400/80",
    wait: "bg-card text-muted-foreground ring-orange-500/25",
    mark: "text-orange-400",
    bar: "bg-orange-500",
  },
  rose: {
    ready: "bg-rose-500 text-rose-50 ring-rose-400/80",
    wait: "bg-card text-muted-foreground ring-rose-500/25",
    mark: "text-rose-400",
    bar: "bg-rose-500",
  },
} as const;

export const PRIMARY_SCREENS: PrimaryScreen[] = [
  {
    id: "crew",
    href: "/command/crew",
    label: "Active jobs & crew",
    short: "Jobs",
    hint: "Staffed work, maps, and live crew",
    ready: true,
    tone: "green",
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
    tone: "sky",
  },
  {
    id: "four",
    href: "/command",
    label: "Coming next",
    short: "04",
    hint: "Next function",
    ready: false,
    tone: "amber",
  },
  {
    id: "five",
    href: "/command",
    label: "Coming next",
    short: "05",
    hint: "Next function",
    ready: false,
    tone: "orange",
  },
  {
    id: "six",
    href: "/command",
    label: "Coming next",
    short: "06",
    hint: "Next function",
    ready: false,
    tone: "rose",
  },
];

export function screenForPath(pathname: string) {
  return PRIMARY_SCREENS.find((item) => item.ready && item.href === pathname) ?? null;
}
