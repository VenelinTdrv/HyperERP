/** Today's date in Sofia as YYYY-MM-DD. */
export const todayIso = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Sofia' }).format(new Date());

const DAY = 86400000;
const shiftDay = (value: string, days: number) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  const d = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  return new Date(+d + days * DAY).toISOString().slice(0, 10) + value.slice(10);
};

/** Shifts demo date fields so the newest `anchor` value lands on today, keeping relative spacing. */
export function rebaseDates<T extends Record<string, unknown>>(rows: T[], keys: (keyof T)[], anchor: keyof T = keys[0] as keyof T): T[] {
  const max = rows.map(r => String(r[anchor] ?? '').slice(0, 10)).filter(Boolean).sort().pop();
  if (!max) return rows;
  const diff = Math.round((+new Date(`${todayIso()}T12:00:00Z`) - +new Date(`${max}T12:00:00Z`)) / DAY);
  return rows.map(r => { const n = { ...r }; for (const k of keys) if (typeof n[k] === 'string') (n as Record<string, unknown>)[k as string] = shiftDay(n[k] as string, diff); return n; });
}
