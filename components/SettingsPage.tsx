"use client";

import type { ShopSettings } from "@/lib/session";
import type { Role } from "@/lib/types";

const PLANS: { id: ShopSettings["plan"]; label: string; price: string }[] = [
  { id: "starter", label: "Starter", price: "$49" },
  { id: "pro", label: "Pro", price: "$149" },
  { id: "enterprise", label: "Enterprise", price: "$299" },
];

export default function SettingsPage({
  role,
  settings,
  onSettings,
  onReset,
}: {
  role: Role;
  settings: ShopSettings;
  onSettings: (next: ShopSettings) => void;
  onReset: () => void;
}) {
  return (
    <section className="page jobs-board">
      <p className="section-kicker">Company hub</p>
      <h1>
        Shop
        <br />
        <strong>Controls.</strong>
      </h1>
      <article className="plate settings-card">
        <label className="settings-field">
          Company
          <input
            value={settings.shopName}
            onChange={(event) =>
              onSettings({ ...settings, shopName: event.target.value })
            }
          />
        </label>
        <label className="settings-field">
          Office line
          <input
            value={settings.companyPhone}
            onChange={(event) =>
              onSettings({ ...settings, companyPhone: event.target.value })
            }
          />
        </label>
        <label className="settings-field">
          Headquarters
          <input
            value={settings.headquarters}
            onChange={(event) =>
              onSettings({ ...settings, headquarters: event.target.value })
            }
          />
        </label>
        <label className="settings-field">
          Account
          <input
            value={settings.account}
            onChange={(event) =>
              onSettings({ ...settings, account: event.target.value })
            }
          />
        </label>
        <label className="settings-field">
          Receptionist greeting
          <textarea
            className="talk-input"
            rows={3}
            value={settings.greeting}
            onChange={(event) =>
              onSettings({ ...settings, greeting: event.target.value })
            }
          />
        </label>
        <label className="off-toggle settings-toggle">
          <input
            type="checkbox"
            checked={settings.lineArmed}
            onChange={(event) =>
              onSettings({ ...settings, lineArmed: event.target.checked })
            }
          />
          Arm AI receptionist
        </label>
        <label className="off-toggle settings-toggle">
          <input
            type="checkbox"
            checked={settings.pageAlerts}
            onChange={(event) =>
              onSettings({ ...settings, pageAlerts: event.target.checked })
            }
          />
          Page alerts when crew is on the clock
        </label>
        <div className="plan-row">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className={`ghost-action${settings.plan === plan.id ? " hours" : ""}`}
              onClick={() => onSettings({ ...settings, plan: plan.id })}
            >
              {plan.label}
              <small>{plan.price}/mo</small>
            </button>
          ))}
        </div>
        <p className="board-copy">
          {role === "boss"
            ? `${settings.shopName} · ${settings.headquarters}`
            : "Employee Command is clock, assigned stops, receipts, and directions."}
        </p>
        <button type="button" className="ghost-action" onClick={onReset}>
          Reset demo shop
        </button>
      </article>
    </section>
  );
}
