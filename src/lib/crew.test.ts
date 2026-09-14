import { describe, expect, it } from "vitest";
import {
  broadcastSmsUrl,
  clockStateLabel,
  crewTracking,
  formatElapsed,
  mapEmbedUrl,
  shiftMeter,
  smsUrl,
  streetViewEmbedUrl,
  SHIFT_LENGTH_MS,
  OT_WARNING_MS,
} from "@/lib/crew";

import { PRIMARY_SCREENS } from "@/lib/primary-screens";

describe("crew tracking and shift meter", () => {
  it("marks the last hour before overtime in red", () => {
    const start = new Date(Date.now() - (SHIFT_LENGTH_MS - OT_WARNING_MS / 2));
    const meter = shiftMeter(start);
    expect(meter.clockedIn).toBe(true);
    expect(meter.overtimeWarning).toBe(true);
    expect(meter.overtime).toBe(false);
  });

  it("flags overtime after eight hours", () => {
    const start = new Date(Date.now() - SHIFT_LENGTH_MS - 5 * 60 * 1000);
    const meter = shiftMeter(start);
    expect(meter.overtime).toBe(true);
    expect(meter.overtimeWarning).toBe(true);
    expect(meter.progress).toBe(1);
  });

  it("keeps a fresh clock-in out of the overtime band", () => {
    const start = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const meter = shiftMeter(start);
    expect(meter.overtimeWarning).toBe(false);
    expect(formatElapsed(meter.elapsedMs)).toMatch(/^2h /);
  });

  it("puts in-progress crew on site and assigned crew en route", () => {
    const onSite = crewTracking("user_tech", "job_dock_cooler", "in_progress");
    const enRoute = crewTracking("user_liv", "job_clinic_hvac", "assigned");
    expect(["on_site", "en_route", "staging"]).toContain(onSite.status);
    expect(enRoute.status).toBe("en_route");
    expect(enRoute.miles).toBeGreaterThan(0);
    expect(enRoute.minutes).toBeGreaterThan(0);
  });

  it("labels clocked-in crew IN and clocked-out crew OUT", () => {
    expect(clockStateLabel(true)).toBe("IN");
    expect(clockStateLabel(false)).toBe("OUT");
  });

  it("builds street view, map, and sms links", () => {
    expect(streetViewEmbedUrl("410 Dockside Ave")).toContain("layer=c");
    expect(streetViewEmbedUrl("410 Dockside Ave")).toContain("output=embed");
    expect(mapEmbedUrl("410 Dockside Ave")).toContain("output=embed");
    expect(smsUrl("555-0104", "On the way")).toBe("sms:5550104?body=On%20the%20way");
    expect(broadcastSmsUrl(["555-0102", "555-0104"])).toContain("sms:/open?addresses=5550102,5550104");
  });
});

describe("home pad screens", () => {
  it("has six boxes and only the first is live", () => {
    expect(PRIMARY_SCREENS).toHaveLength(6);
    expect(PRIMARY_SCREENS.filter((item) => item.ready)).toHaveLength(1);
    expect(PRIMARY_SCREENS[0]?.href).toBe("/command/crew");
  });
});
