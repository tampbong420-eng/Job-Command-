import { z } from "zod";
import type { AppDb } from "@/db/types";
import { telemetryPings } from "@/db/schema";
import { simulatedFix } from "@/lib/crew";
import type { PublicUser } from "@/lib/domain";

export const PING_INTERVAL_SEC = 15;

export const fleetPingSchema = z.object({
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  battery: z.number().int().min(0).max(100).optional(),
});

export async function ingestFleetPing(
  db: AppDb,
  actor: PublicUser,
  input: z.infer<typeof fleetPingSchema>,
) {
  const sim = simulatedFix(actor.id);
  const lat = input.lat ?? sim.lat;
  const lng = input.lng ?? sim.lng;
  const battery = input.battery ?? sim.battery;
  await db.insert(telemetryPings).values({
    id: crypto.randomUUID(),
    userId: actor.id,
    lat: String(lat),
    lng: String(lng),
    battery,
  });
  return {
    ok: true as const,
    nextPingSec: PING_INTERVAL_SEC,
    lat,
    lng,
    battery,
  };
}
