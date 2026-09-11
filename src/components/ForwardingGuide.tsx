import type { CompanyProfile } from '@/types';

const carriers = [
  {
    name: 'Verizon',
    steps: '*72 + Job Command number, then send. Cancel with *73.',
  },
  {
    name: 'AT&T',
    steps: '*72 + Job Command number. Wait for confirmation tones. Cancel with *73.',
  },
  {
    name: 'T-Mobile',
    steps: 'Dial **21* + number + # to forward all calls. Cancel with ##21#.',
  },
  {
    name: 'Google Voice',
    steps: 'Voice settings → Calls → Forwarding → add the Job Command DID.',
  },
];

export function ForwardingGuide({ profile }: { profile: CompanyProfile }) {
  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-sm font-black uppercase tracking-wider text-amber-500 mb-2">
        Line forwarding
      </h2>
      <p className="text-sm text-neutral-400 mb-4">
        Point {profile.businessPhone || 'your published business line'} at the Vapi inbound number
        so the receptionist answers before voicemail.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {carriers.map((carrier) => (
          <div key={carrier.name} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs font-black uppercase tracking-wider text-white">{carrier.name}</p>
            <p className="text-sm text-neutral-400 mt-2">{carrier.steps}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
