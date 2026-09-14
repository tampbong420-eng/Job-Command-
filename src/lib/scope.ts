export function polishScope(raw: string) {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return "";
  const capped = text.charAt(0).toUpperCase() + text.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
}

export function scopePrompt(input: { title: string; customer: string; notes: string }) {
  return [
    "Write a short work scope for field technicians.",
    "Use short sentences. Say what to do, where, and what to watch for.",
    "No greeting. No markdown. 80 words max.",
    `Job: ${input.title}`,
    `Customer: ${input.customer}`,
    `Boss notes: ${input.notes}`,
  ].join("\n");
}
