export const PRIMARY_SCREEN_IDS = [
  "crew",
  "two",
  "three",
  "four",
  "five",
  "six",
] as const;

export type PrimaryScreenId = (typeof PRIMARY_SCREEN_IDS)[number];

export type PrimaryScreen = {
  id: PrimaryScreenId;
  href: string;
  label: string;
  short: string;
  hint: string;
  ready: boolean;
};

export const PRIMARY_SCREENS: PrimaryScreen[] = [
  {
    id: "crew",
    href: "/command/crew",
    label: "Active jobs & crew",
    short: "Jobs",
    hint: "Staffed work, maps, and live crew",
    ready: true,
  },
  {
    id: "two",
    href: "/command",
    label: "Coming next",
    short: "02",
    hint: "Next function",
    ready: false,
  },
  {
    id: "three",
    href: "/command",
    label: "Coming next",
    short: "03",
    hint: "Next function",
    ready: false,
  },
  {
    id: "four",
    href: "/command",
    label: "Coming next",
    short: "04",
    hint: "Next function",
    ready: false,
  },
  {
    id: "five",
    href: "/command",
    label: "Coming next",
    short: "05",
    hint: "Next function",
    ready: false,
  },
  {
    id: "six",
    href: "/command",
    label: "Coming next",
    short: "06",
    hint: "Next function",
    ready: false,
  },
];
