import { ref, type Ref } from 'vue';
import { Notify } from 'quasar';
import { logError, toAppError, toUserMessage, type AppError } from '@/utils/errorHandling';
import { captureError } from '@/services/sentry';

export function useErrorHandler(): {
  message: Ref<string>;
  handle: (err: unknown, retry?: () => void) => AppError;
  clear: () => void;
} {
  const message = ref('');

  function handle(err: unknown, retry?: () => void): AppError {
    const appError = toAppError(err);
    message.value = toUserMessage(appError);
    logError(appError);
    captureError(message.value);

    Notify.create({
      type: 'negative',
      message: message.value,
      timeout: 2500,
      actions:
        appError.kind === 'network' && retry
          ? [{ label: 'ещё раз', color: 'white', handler: retry }]
          : [],
    });

    return appError;
  }

  function clear(): void {
    message.value = '';
  }

  return { message, handle, clear };
}
