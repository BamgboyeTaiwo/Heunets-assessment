import { isAxiosError } from 'axios';
import { ApiErrorBody } from '@/services/apiClient';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (message) return message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
