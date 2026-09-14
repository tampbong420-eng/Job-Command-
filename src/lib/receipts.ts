import { hashSeed } from "@/lib/crew";

export type ReceiptLine = { name: string; amountCents: number };

export type ParsedReceipt = {
  vendor: string;
  purchasedAt: string;
  totalCents: number;
  taxCents: number;
  lineItems: ReceiptLine[];
};

const DEMO: ParsedReceipt[] = [
  {
    vendor: "Sherwin-Williams",
    purchasedAt: new Date().toISOString(),
    totalCents: 21487,
    taxCents: 1672,
    lineItems: [
      { name: "Duration Home Extra White 5 gal", amountCents: 16899 },
      { name: "ProClassic Interior Satin 1 gal", amountCents: 2916 },
    ],
  },
  {
    vendor: "Home Depot",
    purchasedAt: new Date().toISOString(),
    totalCents: 8734,
    taxCents: 679,
    lineItems: [
      { name: "Purdy XL 2.5 in. angle sash", amountCents: 1897 },
      { name: "FrogTape 1.88 in. x 60 yd", amountCents: 2499 },
      { name: "Plastic drop cloth 9 x 12", amountCents: 1659 },
    ],
  },
];

export function demoScan(seed: string): ParsedReceipt {
  return DEMO[hashSeed(seed) % DEMO.length]!;
}

export function parseReceiptText(text: string): Partial<ParsedReceipt> {
  const vendor = /sherwin/i.test(text)
    ? "Sherwin-Williams"
    : /home depot|homedepot/i.test(text)
      ? "Home Depot"
      : text.split("\n").map((line) => line.trim()).find(Boolean) || undefined;
  const totalMatch = text.match(/total[^\d]*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
  const taxMatch = text.match(/tax[^\d]*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
  const dollars = (raw?: string) =>
    raw ? Math.round(Number(raw.replace(/,/g, "")) * 100) : undefined;
  return {
    vendor,
    totalCents: dollars(totalMatch?.[1]),
    taxCents: dollars(taxMatch?.[1]),
  };
}

export function lightingLabel(brightness: number) {
  if (brightness < 48) return "Too dark";
  if (brightness > 220) return "Too bright";
  return "Good light";
}
