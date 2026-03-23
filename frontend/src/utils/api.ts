import axios from 'axios';

function flattenErrorValue(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(flattenErrorValue);
  }

  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(flattenErrorValue);
  }

  return [];
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data;

  if (typeof data === 'string') {
    return data;
  }

  if (data && typeof data === 'object') {
    const detail = 'detail' in data && typeof data.detail === 'string' ? data.detail : null;
    if (detail) {
      return detail;
    }

    const flattened = flattenErrorValue(data);
    if (flattened.length > 0) {
      return flattened.join(' ');
    }
  }

  return fallback;
}
