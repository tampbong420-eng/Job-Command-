export type LeadExtract = {
  name: string | null;
  phone: string | null;
  service: string | null;
  address: string | null;
  timeline: string | null;
  urgency: string | null;
};

export function extractLead(transcript: string): LeadExtract {
  const text = transcript.replace(/\s+/g, " ").trim();
  const phone =
    text.match(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/)?.[0] ?? null;
  const address =
    text.match(/\d{2,5}\s+[A-Za-z0-9 .'-]+(?:Ave|St|Rd|Dr|Ln|Blvd|Way|Pike|Circle)[^.,]*/i)?.[0] ??
    null;
  const nameMatch = text.match(/(?:this is|my name is|I'm|I am)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i);
  const urgency = /asap|emergency|today|urgent/i.test(text)
    ? "urgent"
    : /this week|soon/i.test(text)
      ? "soon"
      : "normal";
  const service = /cabinet/i.test(text)
    ? "Cabinet refinish"
    : /exterior|siding|trim/i.test(text)
      ? "Exterior paint"
      : /interior|room|house/i.test(text)
        ? "Interior paint"
        : "Painting";
  const timeline = /next week/i.test(text)
    ? "Next week"
    : /this week/i.test(text)
      ? "This week"
      : /asap|today/i.test(text)
        ? "ASAP"
        : "Flexible";
  return {
    name: nameMatch?.[1] ?? null,
    phone: phone?.replace(/[^\d+]/g, "") ?? null,
    service,
    address,
    timeline,
    urgency,
  };
}
