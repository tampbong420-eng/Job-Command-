import type { CompanyProfile } from '@/types';
import { cn } from '@/lib/format';

export function ReceptionistCard({
  profile,
  canTest,
  onToggle,
  onArmed,
  onTestCall,
  onOpenSettings,
  live = false,
  error = null,
}: {
  profile: CompanyProfile;
  canTest: boolean;
  onToggle: (next: boolean) => void;
  onArmed: (armed: boolean) => void;
  onTestCall: () => void;
  onOpenSettings: () => void;
  live?: boolean;
  error?: string | null;
}) {
  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-amber-500">
            AI Receptionist Voice Engine
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Answers the business line, captures the job, and can wake dispatch. Powered by Vapi when
            keys are saved.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border',
              live
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : profile.receptionistOn
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700',
            )}
          >
            {live ? 'Live call' : profile.receptionistOn ? 'Online' : 'Paused'}
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3">
          <span className="text-sm font-bold">Receptionist</span>
          <input
            type="checkbox"
            checked={profile.receptionistOn}
            onChange={(event) => onToggle(event.target.checked)}
            className="size-4 accent-amber-500"
          />
        </label>
        <label className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3">
          <span className="text-sm font-bold">Arm business line</span>
          <input
            type="checkbox"
            checked={profile.lineArmed}
            onChange={(event) => onArmed(event.target.checked)}
            className="size-4 accent-amber-500"
          />
        </label>
      </div>

      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Greeting</p>
        <p className="text-sm text-neutral-200">{profile.greeting}</p>
        <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 pt-2">
          After hours
        </p>
        <p className="text-sm text-neutral-400">{profile.afterHours}</p>
      </div>

      {error && (
        <p className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onTestCall}
          disabled={!profile.receptionistOn}
          className="bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg hover:bg-amber-400 disabled:opacity-40"
        >
          {canTest ? 'Start test call' : 'Simulate inbound'}
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="bg-neutral-800 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg hover:bg-neutral-700"
        >
          Voice settings
        </button>
      </div>
    </section>
  );
}
