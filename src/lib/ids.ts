export function uid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`;
}

export function inviteToken(): string {
  return `jc_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
}
