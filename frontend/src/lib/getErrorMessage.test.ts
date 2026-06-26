import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './getErrorMessage';

function buildAxiosError(message: string | string[]): AxiosError {
  const error = new AxiosError('Request failed');
  error.response = {
    data: { message },
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: error.config as never,
  };
  return error;
}

describe('getErrorMessage', () => {
  it('returns the API message when present', () => {
    expect(getErrorMessage(buildAxiosError('Invalid email or password'))).toBe(
      'Invalid email or password',
    );
  });

  it('joins validation message arrays', () => {
    expect(getErrorMessage(buildAxiosError(['name is required', 'email must be valid']))).toBe(
      'name is required, email must be valid',
    );
  });

  it('falls back to the error message for plain errors', () => {
    expect(getErrorMessage(new Error('Network down'))).toBe('Network down');
  });

  it('uses the provided fallback for unrecognized errors', () => {
    expect(getErrorMessage('nope', 'Default message')).toBe('Default message');
  });
});
