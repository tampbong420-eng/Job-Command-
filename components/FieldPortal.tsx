"use client";

import EmployeeHome from "@/components/EmployeeHome";
import EmployeeJobs from "@/components/EmployeeJobs";
import {
  assignedJob,
  toggleCrewClock,
} from "@/lib/assign";
import { crewByToken } from "@/lib/field";
import {
  commitShop,
  getServerShopSnapshot,
  getShopSnapshot,
  subscribeShop,
} from "@/lib/session";
import type { JobStatus } from "@/lib/types";
import { useMemo, useState, useSyncExternalStore } from "react";

export default function FieldPortal({ token }: { token: string }) {
  const shop = useSyncExternalStore(
    subscribeShop,
    getShopSnapshot,
    getServerShopSnapshot,
  );
  const member = useMemo(
    () => crewByToken(shop.crew, token),
    [shop.crew, token],
  );
  const [tab, setTab] = useState<"command" | "jobs">("command");

  if (!member) {
    return (
      <main className="app-shell theme-employee">
        <div className="grain" />
        <section className="page">
          <p className="section-kicker">Field portal</p>
          <h1>
            Invite
            <br />
            <strong>Expired.</strong>
          </h1>
          <p className="board-copy">That crew token is not on this shop roster.</p>
        </section>
      </main>
    );
  }

  const job = assignedJob(shop.jobs, member);

  function patchStatus(jobId: string, status: JobStatus) {
    commitShop({
      ...getShopSnapshot(),
      jobs: getShopSnapshot().jobs.map((row) =>
        row.id === jobId ? { ...row, status } : row,
      ),
    });
  }

  return (
    <main className="app-shell theme-employee">
      <div className="grain" />
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/job-command-logo.jpg" alt="" />
          </div>
          <div>
            <p className="eyebrow">FIELD PORTAL</p>
            <p className="brand-name">
              <span className="job-word">JOB </span>
              <span className="command-word">COMMAND</span>
            </p>
          </div>
        </div>
        <p className="account-chip">{member.id.toUpperCase()}</p>
      </header>
      {tab === "command" ? (
        <EmployeeHome
          member={member}
          crew={shop.crew}
          jobs={shop.jobs}
          onToggleClock={() =>
            commitShop({
              ...getShopSnapshot(),
              crew: toggleCrewClock(getShopSnapshot().crew, member.id),
            })
          }
          onDirections={() => {
            if (!job) return;
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.address)}`,
              "_blank",
            );
          }}
        />
      ) : (
        <EmployeeJobs
          member={member}
          jobs={shop.jobs}
          onStatus={patchStatus}
          onDirections={(target) => {
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target.address)}`,
              "_blank",
            );
          }}
        />
      )}
      <nav className="bottom-nav" aria-label="Field">
        <button
          type="button"
          className={tab === "command" ? "selected" : ""}
          onClick={() => setTab("command")}
        >
          Command
        </button>
        <button
          type="button"
          className={tab === "jobs" ? "selected" : ""}
          onClick={() => setTab("jobs")}
        >
          My Stops
        </button>
      </nav>
    </main>
  );
}
