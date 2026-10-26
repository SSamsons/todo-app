import type { App } from 'vue';
import { Notify } from 'quasar';
import { captureError, captureMetric } from '@/services/sentry';
import { logError, toAppError, toUserMessage } from '@/utils/errorHandling';

function report(err: unknown): void {
  const appError = toAppError(err);
  const message = toUserMessage(appError);
  logError(appError);
  captureError(message);
  Notify.create({ type: 'negative', message });
}

export function setupApp(app: App): void {
  app.config.errorHandler = (err: unknown) => {
    report(err);
  };

  window.addEventListener('unhandledrejection', (event) => {
    report(event.reason);
  });

  const entry = performance.getEntriesByType('navigation')[0];
  if (entry && 'duration' in entry) captureMetric('load', entry.duration);
}
