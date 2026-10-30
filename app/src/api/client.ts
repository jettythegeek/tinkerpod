import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const AUTH_TOKEN_STORAGE_KEY = 'tinkerpod.auth.token' as const;
export const AUTH_SESSION_STORAGE_KEY = 'tinkerpod.auth.session' as const;

export interface ApiEnvelope<T> {
  readonly success: boolean;
  readonly message: string;
  readonly data: T;
}

export interface ApiErrorData {
  readonly errors?: Record<string, string[]>;
  readonly remaining_attempts?: number;
  readonly locked_until?: string;
  readonly lockout_minutes?: number;
}

export interface HealthData {
  readonly service: string;
  readonly version: string;
  readonly status: string;
  readonly database: string;
  readonly timezone: string;
  readonly timestamp: string;
}

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export function setApiAuthToken(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

export async function getStoredAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function setStoredAuthToken(token: string | null): Promise<void> {
  try {
    if (token === null) {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_STORAGE_KEY);
    } else {
      await SecureStore.setItemAsync(AUTH_TOKEN_STORAGE_KEY, token);
    }
  } catch {
    // Ignore storage errors in non-native test environments
  }
}

export function extractApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiEnvelope<ApiErrorData | null>>;
    const envelopeMessage = axiosErr.response?.data?.message;
    if (typeof envelopeMessage === 'string' && envelopeMessage.trim() !== '') {
      return envelopeMessage;
    }
  }

  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }

  return fallback;
}

export async function fetchApiHealth(): Promise<ApiEnvelope<HealthData>> {
  const response = await apiClient.get<ApiEnvelope<HealthData>>('/health');
  return response.data;
}
