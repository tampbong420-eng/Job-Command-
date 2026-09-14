import { describe, expect, it } from "vitest";
import {
  fieldDestination,
  mapsUrl,
  preferredNextStatus,
  telUrl,
} from "@/lib/field";

describe("field helpers", () => {
  it("prefers job location over the customer address", () => {
    expect(
      fieldDestination({
        location: "Roof penthouse",
        customerAddress: "1 Icehouse Rd",
      }),
    ).toBe("Roof penthouse");
  });

  it("builds maps and tel urls", () => {
    expect(mapsUrl("Zone 4")).toContain("destination=Zone%204");
    expect(telUrl("(206) 555-0130")).toBe("tel:2065550130");
  });

  it("walks a job through the six pipeline stages", () => {
    expect(preferredNextStatus("queued")).toBe("estimate_sent");
    expect(preferredNextStatus("estimate_sent")).toBe("estimate_approved");
    expect(preferredNextStatus("estimate_approved")).toBe("assigned");
    expect(preferredNextStatus("assigned")).toBe("in_progress");
    expect(preferredNextStatus("in_progress")).toBe("completed");
    expect(preferredNextStatus("completed")).toBeNull();
  });
});
