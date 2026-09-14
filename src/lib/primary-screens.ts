export const PRIMARY_SCREEN_IDS = [
  "crew",
  "board",
  "jobs",
  "sites",
  "clock",
  "shop",
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
    href: "/command",
    label: "Active jobs",
    short: "Crew",
    hint: "Staffed work and live crew",
    ready: true,
  },
  {
    id: "board",
    href: "/command/board",
    label: "Dispatch",
    short: "Board",
    hint: "Status lanes",
    ready: true,
  },
  {
    id: "jobs",
    href: "/jobs",
    label: "Work orders",
    short: "Jobs",
    hint: "Every ticket",
    ready: true,
  },
  {
    id: "sites",
    href: "/customers",
    label: "Sites",
    short: "Sites",
    hint: "Customers and addresses",
    ready: true,
  },
  {
    id: "clock",
    href: "/command/clock",
    label: "Time deck",
    short: "Clock",
    hint: "Coming next",
    ready: false,
  },
  {
    id: "shop",
    href: "/command/shop",
    label: "Shop books",
    short: "Shop",
    hint: "Coming next",
    ready: false,
  },
];
