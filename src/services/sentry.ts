const events: string[] = [];

export function captureError(message: string): void {
  if (import.meta.env.VITE_SENTRY_MOCK === 'false') return;
  events.push(message);
  if (events.length > 30) events.shift();
}

export function captureMetric(name: string, value: number): void {
  if (import.meta.env.VITE_SENTRY_MOCK === 'false') return;
  events.push(`${name}:${String(Math.round(value))}`);
}

export function readSentryEvents(): readonly string[] {
  return events;
}
