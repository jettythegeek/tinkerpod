import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const AUTH_TOKEN_STORAGE_KEY = 'tinkerpod.auth.token' as const;

export interface ApiEnvelope<T> {
  readonly success: boolean;
  readonly message: string;
  readonly data: T;
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

export async function getStoredAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function fetchApiHealth(): Promise<ApiEnvelope<HealthData>> {
  const response = await apiClient.get<ApiEnvelope<HealthData>>('/health');
  return response.data;
}
