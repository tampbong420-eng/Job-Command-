import type { CompanyProfile, VapiSettings } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase';
import { JOB_COMMAND_SPEC } from '@/system/masterSpec';

const inputClass =
  'w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-amber-500 outline-none transition-colors';

export function SettingsPanel({
  profile,
  vapi,
  onPatchCompany,
  onPatchVapi,
  onSave,
  onReset,
  onNotice,
}: {
  profile: CompanyProfile;
  vapi: VapiSettings;
  onPatchCompany: (partial: Partial<CompanyProfile>) => void;
  onPatchVapi: (partial: Partial<VapiSettings>) => void;
  onSave: () => Promise<void>;
  onReset: () => void;
  onNotice: (msg: string) => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-amber-500">Shop profile</h2>
        <label className="block text-xs font-bold text-neutral-400">
          Company name
          <input
            className={`${inputClass} mt-1`}
            value={profile.companyName}
            onChange={(event) => onPatchCompany({ companyName: event.target.value })}
          />
        </label>
        <label className="block text-xs font-bold text-neutral-400">
          Business phone
          <input
            className={`${inputClass} mt-1`}
            value={profile.businessPhone}
            onChange={(event) => onPatchCompany({ businessPhone: event.target.value })}
          />
        </label>
        <label className="block text-xs font-bold text-neutral-400">
          Trades
          <input
            className={`${inputClass} mt-1`}
            value={profile.trade}
            onChange={(event) => onPatchCompany({ trade: event.target.value })}
          />
        </label>
        <label className="block text-xs font-bold text-neutral-400">
          Service area
          <input
            className={`${inputClass} mt-1`}
            value={profile.serviceArea}
            onChange={(event) => onPatchCompany({ serviceArea: event.target.value })}
          />
        </label>
        <label className="block text-xs font-bold text-neutral-400">
          Greeting
          <textarea
            className={`${inputClass} mt-1`}
            rows={3}
            value={profile.greeting}
            onChange={(event) => onPatchCompany({ greeting: event.target.value })}
          />
        </label>
        <label className="block text-xs font-bold text-neutral-400">
          After hours
          <textarea
            className={`${inputClass} mt-1`}
            rows={3}
            value={profile.afterHours}
            onChange={(event) => onPatchCompany({ afterHours: event.target.value })}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            void onSave().then(() => onNotice('Shop profile saved'));
          }}
          className="bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg"
        >
          Save profile
        </button>
      </section>

      <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-amber-500">Voice + sync</h2>
        <p className="text-sm text-neutral-400">
          Paste Vapi keys from the dashboard. Keys stay in this browser (and Supabase if connected).
        </p>
        <label className="block text-xs font-bold text-neutral-400">
          Vapi public key
          <input
            className={`${inputClass} mt-1`}
            value={vapi.publicKey}
            onChange={(event) => onPatchVapi({ publicKey: event.target.value })}
            autoComplete="off"
          />
        </label>
        <label className="block text-xs font-bold text-neutral-400">
          Assistant ID
          <input
            className={`${inputClass} mt-1`}
            value={vapi.assistantId}
            onChange={(event) => onPatchVapi({ assistantId: event.target.value })}
            autoComplete="off"
          />
        </label>
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-neutral-400 space-y-2">
          <p>
            Data plane:{' '}
            <span className="text-white font-bold">
              {isSupabaseConfigured ? 'Supabase Realtime' : 'Local demo (no cloud keys)'}
            </span>
          </p>
          <p>
            Spec {JOB_COMMAND_SPEC.version} · {JOB_COMMAND_SPEC.modules.length} modules
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onReset();
            onNotice('Demo fleet restored');
          }}
          className="bg-neutral-800 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg"
        >
          Restore demo data
        </button>
      </section>
    </div>
  );
}
