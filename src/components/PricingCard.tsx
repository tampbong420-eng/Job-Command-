import type { PlanId } from '@/types';
import { cn } from '@/lib/format';

const plans: Array<{
  id: PlanId;
  name: string;
  price: string;
  blurb: string;
  features: string[];
}> = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$79',
    blurb: 'Owner-operator desk and one van.',
    features: ['AI receptionist test desk', '1 field portal', 'Job pipeline', 'Receipt ledger'],
  },
  {
    id: 'crew',
    name: 'Crew',
    price: '$189',
    blurb: 'Live GPS for a rolling crew.',
    features: ['Realtime fleet map', '5 field portals', 'Estimating markup', 'Call log'],
  },
  {
    id: 'command',
    name: 'Command',
    price: '$349',
    blurb: 'Multi-trade office with armed line.',
    features: ['Unlimited crew', 'Armed inbound line', 'Supabase sync', 'Priority voice minutes'],
  },
];

export function PricingCard({
  plan,
  onLock,
  onNotice,
}: {
  plan: PlanId;
  onLock: (plan: PlanId) => void;
  onNotice: (msg: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-black uppercase tracking-wider text-amber-500">
          Command plans
        </h2>
        <p className="text-sm text-neutral-400 mt-1">
          Lock a desk plan. Billing can be attached later; this arms product limits in the OS.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((item) => {
          const active = item.id === plan;
          return (
            <article
              key={item.id}
              className={cn(
                'bg-neutral-900 border rounded-2xl p-6 shadow-xl flex flex-col',
                active ? 'border-amber-500' : 'border-neutral-800',
              )}
            >
              <p className="text-xs font-black uppercase tracking-wider text-amber-500">
                {item.name}
              </p>
              <p className="text-3xl font-black mt-2">
                {item.price}
                <span className="text-sm text-neutral-500 font-bold">/mo</span>
              </p>
              <p className="text-sm text-neutral-400 mt-2">{item.blurb}</p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300 flex-1">
                {item.features.map((feature) => (
                  <li key={feature}>· {feature}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  onLock(item.id);
                  onNotice(`${item.name} plan locked for this shop`);
                }}
                className={cn(
                  'mt-5 w-full font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg',
                  active
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-neutral-800 text-white hover:bg-neutral-700',
                )}
              >
                {active ? 'Active plan' : 'Lock plan'}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
