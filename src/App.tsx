import { useCallback, useEffect, useState, lazy, Suspense } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useCompany } from '@/lib/company';
import { useEmployees } from '@/lib/employees';
import { useCustomers } from '@/lib/customers';
import { useExpenses } from '@/lib/expenses';
import { useVapi } from '@/lib/useVapi';
import { useVapiSettings } from '@/lib/useVapiSettings';
import { useStore } from '@/lib/store';
import { ReceptionistCard } from '@/components/ReceptionistCard';
import { PricingCard } from '@/components/PricingCard';
import { ForwardingGuide } from '@/components/ForwardingGuide';
import { LegalPage } from '@/components/LegalPage';
import { InviteSheet } from '@/components/InviteSheet';
import { SettingsFooter } from '@/components/SettingsFooter';
import { JobPipeline } from '@/components/JobPipeline';
import { ExpenseLedger } from '@/components/ExpenseLedger';
import { SettingsPanel } from '@/components/SettingsPanel';
import { Modal } from '@/components/Modal';
import { estimateTotals, money } from '@/lib/money';
import { cn, timeAgo } from '@/lib/format';
import type { Employee } from '@/types';

const CrewMap = lazy(() => import('@/components/CrewMap'));

type Tab = 'dashboard' | 'map' | 'jobs' | 'receptionist' | 'expenses' | 'pricing' | 'settings';

type ModalState =
  | { kind: 'invite'; data: Employee }
  | { kind: 'privacy' }
  | { kind: 'terms' }
  | null;

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'map', label: 'Live GPS' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'receptionist', label: 'AI Receptionist' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'pricing', label: 'Pricing' },
];

export function App() {
  const { profile: company, save: saveCompany, patch: patchCompany } = useCompany();
  const { settings: vapiSettings, save: saveVapi } = useVapiSettings();
  const { employees, addEmployee } = useEmployees();
  const { jobs, addJob, patchJob } = useCustomers();
  const { expenses, upsertExpense, removeExpense } = useExpenses();
  const { addCall, resetDemo, state } = useStore();
  const calls = state.calls;

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [modalState, setModalState] = useState<ModalState>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [crewName, setCrewName] = useState('');

  const vapi = useVapi({
    publicKey: vapiSettings.publicKey,
    assistantId: vapiSettings.assistantId,
  });

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const onTestCall = useCallback(() => {
    void vapi.start().then((result) => {
      addCall({
        direction: 'test',
        summary: result?.demo
          ? 'Simulated inbound — connect Vapi in Settings for a live voice path.'
          : 'Web test call dispatched to the receptionist engine.',
        durationSec: 0,
      });
      setNotice(result?.demo ? 'Simulated inbound logged' : 'Test call started');
    });
  }, [addCall, vapi]);

  const pipelineValue = jobs
    .filter((job) => job.status !== 'complete')
    .reduce((sum, job) => sum + estimateTotals(job).total, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      {notice && (
        <div className="fixed top-4 right-4 z-50 bg-amber-500 text-neutral-950 px-4 py-3 rounded-xl font-black shadow-2xl border border-amber-400">
          {notice}
        </div>
      )}

      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-6 py-4 flex flex-col gap-4 sticky top-0 z-40">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center font-black text-neutral-950 text-lg shadow-inner">
              JC
            </div>
            <div>
              <h1 className="text-lg font-black tracking-widest text-white">JOB COMMAND</h1>
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                Enterprise Trade OS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wider text-neutral-500 border border-neutral-800 rounded-full px-3 py-1">
              {isSupabaseConfigured ? 'Supabase live' : 'Demo desk'}
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase',
                activeTab === 'settings'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800',
              )}
            >
              Settings
            </button>
          </div>
        </div>
        <nav className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800',
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Kpi label="Open pipeline" value={money(pipelineValue)} />
              <Kpi label="Crew online" value={String(employees.filter((e) => e.status !== 'offline').length)} />
              <Kpi label="Active jobs" value={String(jobs.filter((j) => j.status !== 'complete').length)} />
              <Kpi
                label="Month expenses"
                value={money(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-sm font-black uppercase tracking-wider text-amber-500 mb-4">
                  Company profile
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 mb-1">Company name</label>
                    <input
                      type="text"
                      value={company.companyName}
                      onChange={(event) => patchCompany({ companyName: event.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-amber-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 mb-1">
                      Business phone line
                    </label>
                    <input
                      type="text"
                      value={company.businessPhone}
                      onChange={(event) => patchCompany({ businessPhone: event.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-amber-500 outline-none transition-colors"
                    />
                  </div>
                  <p className="text-xs text-neutral-500">
                    {company.trade} · {company.serviceArea}
                  </p>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl md:col-span-2">
                <div className="flex justify-between items-center mb-4 gap-3">
                  <h2 className="text-sm font-black uppercase tracking-wider text-amber-500">
                    Active field crew & fleet
                  </h2>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                    {employees.filter((emp) => emp.status !== 'offline').length} units online
                  </span>
                </div>
                <form
                  className="flex gap-2 mb-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!crewName.trim()) return;
                    const created = addEmployee(crewName.trim(), 'Field tech');
                    setCrewName('');
                    setModalState({ kind: 'invite', data: created });
                  }}
                >
                  <input
                    value={crewName}
                    onChange={(event) => setCrewName(event.target.value)}
                    placeholder="Add a tech…"
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-amber-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-neutral-800 font-black text-xs uppercase tracking-wider px-3 rounded-xl"
                  >
                    Onboard
                  </button>
                </form>
                <div className="space-y-3">
                  {employees.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex justify-between items-center bg-neutral-950 p-4 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-3 h-3 rounded-full',
                            emp.status === 'offline' ? 'bg-neutral-600' : 'bg-emerald-500 animate-pulse',
                          )}
                        />
                        <div>
                          <p className="font-bold text-sm text-white">{emp.name}</p>
                          <p className="text-xs text-neutral-400">
                            {emp.role} · {emp.status} · Speed: {emp.speed || 0} MPH · Battery:{' '}
                            {emp.battery || 100}% · {timeAgo(emp.lastPing)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModalState({ kind: 'invite', data: emp })}
                        className="text-xs bg-amber-500 text-neutral-950 font-black px-3.5 py-2 rounded-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10"
                      >
                        Invite link
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl h-[650px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-500">
                Live fleet command radar
              </h2>
              <span className="text-xs text-neutral-400 font-medium">
                {isSupabaseConfigured
                  ? 'Realtime telemetry via Supabase channels'
                  : 'Demo telemetry — connect Supabase for multi-device GPS'}
              </span>
            </div>
            <div className="flex-1 relative overflow-hidden rounded-xl border border-neutral-800">
              <Suspense
                fallback={
                  <div className="h-full grid place-items-center text-neutral-500 text-sm">
                    Loading radar…
                  </div>
                }
              >
                <CrewMap
                  employees={employees}
                  jobs={jobs}
                  onOpenEmployee={(emp) => setModalState({ kind: 'invite', data: emp })}
                />
              </Suspense>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <JobPipeline jobs={jobs} employees={employees} onAdd={addJob} onPatch={patchJob} />
        )}

        {activeTab === 'receptionist' && (
          <div className="space-y-6">
            <ReceptionistCard
              profile={company}
              canTest={Boolean(vapiSettings.publicKey)}
              live={vapi.isLive}
              error={vapi.error}
              onToggle={(next) => patchCompany({ receptionistOn: next })}
              onArmed={(armed) => patchCompany({ lineArmed: armed })}
              onTestCall={onTestCall}
              onOpenSettings={() => setActiveTab('settings')}
            />
            <ForwardingGuide profile={company} />
            <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-500 mb-3">
                Call log
              </h2>
              <div className="space-y-2">
                {calls.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 flex justify-between gap-3"
                  >
                    <p className="text-sm">{entry.summary}</p>
                    <p className="text-xs text-neutral-500 whitespace-nowrap">{timeAgo(entry.at)}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'expenses' && (
          <ExpenseLedger
            expenses={expenses}
            employees={employees}
            onSave={upsertExpense}
            onRemove={removeExpense}
            onNotice={setNotice}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingCard
            plan={company.plan}
            onLock={(plan) => patchCompany({ plan })}
            onNotice={(msg) => setNotice(msg)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            profile={company}
            vapi={vapiSettings}
            onPatchCompany={patchCompany}
            onPatchVapi={saveVapi}
            onSave={saveCompany}
            onReset={resetDemo}
            onNotice={setNotice}
          />
        )}
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-900 px-6 py-4 text-xs text-neutral-400">
        <SettingsFooter
          onOpenPrivacy={() => setModalState({ kind: 'privacy' })}
          onOpenTerms={() => setModalState({ kind: 'terms' })}
          onOpenPricing={() => setActiveTab('pricing')}
        />
      </footer>

      {modalState?.kind === 'invite' && (
        <Modal onClose={() => setModalState(null)}>
          <InviteSheet
            employee={modalState.data}
            token={modalState.data.inviteToken || 'jc-secure-token-default'}
            companyName={company.companyName}
            onClose={() => setModalState(null)}
            onNotice={(msg) => setNotice(msg)}
          />
        </Modal>
      )}

      {(modalState?.kind === 'privacy' || modalState?.kind === 'terms') && (
        <Modal onClose={() => setModalState(null)}>
          <LegalPage kind={modalState.kind} onClose={() => setModalState(null)} />
        </Modal>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="text-xl font-black mt-1">{value}</p>
    </div>
  );
}

export default App;
