import type { EstimateTotals, Job, LineItem } from '@/types';

export function lineTotal(item: LineItem): number {
  return roundMoney(item.qty * item.rate);
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function estimateTotals(job: Pick<Job, 'items' | 'markupPct' | 'taxPct'>): EstimateTotals {
  const labor = roundMoney(
    job.items.filter((item) => item.kind === 'labor').reduce((sum, item) => sum + lineTotal(item), 0),
  );
  const materials = roundMoney(
    job.items
      .filter((item) => item.kind === 'material')
      .reduce((sum, item) => sum + lineTotal(item), 0),
  );
  const subtotal = roundMoney(labor + materials);
  const markup = roundMoney(subtotal * (job.markupPct / 100));
  const tax = roundMoney((subtotal + markup) * (job.taxPct / 100));
  const total = roundMoney(subtotal + markup + tax);
  return { labor, materials, subtotal, markup, tax, total };
}

export function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
