"use client";

import { APP_BUILD, APP_BUILD_LABEL } from "@/lib/app-build";
import { fieldPin } from "@/lib/access";
import type { ShopSettings } from "@/lib/session";
import type { CrewMember, Role } from "@/lib/types";
import { useState } from "react";

export default function SettingsPage({
  role,
  settings,
  crew,
  signedIn,
  onSettings,
  onReset,
  onReloadApp,
  onSignOut,
  onImportShop,
  onExportShop,
}: {
  role: Role;
  settings: ShopSettings;
  crew: CrewMember[];
  signedIn: string;
  onSettings: (next: ShopSettings) => void;
  onReset: () => void;
  onReloadApp: () => void;
  onSignOut: () => void;
  onImportShop: (raw: string) => boolean;
  onExportShop: () => string;
}) {
  const [backup, setBackup] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  async function copyBackup() {
    const raw = onExportShop();
    try {
      await navigator.clipboard.writeText(raw);
      setNotice("Shop backup copied. Paste it on the other phone in Settings.");
    } catch {
      setBackup(raw);
      setNotice("Copy failed. The backup is in the box below — send that text.");
    }
  }

  return (
    <section className="page jobs-board">
      <p className="section-kicker">Settings</p>
      <h1>
        Shop
        <br />
        <strong>Controls.</strong>
      </h1>
      <p className="board-copy">
        Signed in as <strong>{signedIn}</strong> · {APP_BUILD_LABEL} ({APP_BUILD})
      </p>
      <article className="plate settings-card">
        <label className="settings-field">
          Shop name
          <input
            value={settings.shopName}
            disabled={role !== "boss"}
            onChange={(event) =>
              onSettings({ ...settings, shopName: event.target.value })
            }
          />
        </label>
        <label className="settings-field">
          Account / boss code
          <input
            value={settings.account}
            disabled={role !== "boss"}
            onChange={(event) =>
              onSettings({ ...settings, account: event.target.value })
            }
          />
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
        <p className="board-copy">
          {role === "boss"
            ? "Boss Command is the rolodex, job tumbler, maps, and Hours pay-run."
            : "Employee Command is your clock, assigned stops, directions, and your card."}
        </p>
        <button type="button" className="ghost-action" onClick={onReloadApp}>
          Reload latest app
        </button>
        <button type="button" className="ghost-action" onClick={onSignOut}>
          Switch who is on this phone
        </button>
      </article>

      {role === "boss" && (
        <article className="plate settings-card">
          <p className="card-label">Employee field PINs</p>
          <p className="board-copy">
            Other phones open jobcommand.app, tap EMPLOYEE, pick a name, and
            enter the last 4 digits of that shop phone.
          </p>
          <ul className="pin-list">
            {crew.map((row) => (
              <li key={row.id}>
                <span>
                  {row.name}
                  <small>{row.phone}</small>
                </span>
                <b>{fieldPin(row)}</b>
              </li>
            ))}
          </ul>
        </article>
      )}

      <article className="plate settings-card">
        <p className="card-label">Share this shop</p>
        <p className="board-copy">
          Jobs live on this phone until you send a backup. Copy it, text it to
          another phone, then paste and load.
        </p>
        <button type="button" className="ghost-action" onClick={() => void copyBackup()}>
          Copy shop backup
        </button>
        <label className="settings-field">
          Paste backup
          <textarea
            className="talk-input"
            rows={3}
            value={backup}
            onChange={(event) => setBackup(event.target.value)}
            placeholder="Paste shop JSON from the boss phone"
          />
        </label>
        <button
          type="button"
          className="ghost-action"
          onClick={() => {
            const ok = onImportShop(backup);
            setNotice(ok ? "Shop loaded onto this phone." : "That backup could not be read.");
          }}
        >
          Load backup on this phone
        </button>
        {notice && <p className="board-copy">{notice}</p>}
      </article>

      {role === "boss" && (
        <button type="button" className="ghost-action" onClick={onReset}>
          Reset demo shop
        </button>
      )}
    </section>
  );
}
