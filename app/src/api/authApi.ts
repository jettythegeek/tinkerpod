import { AgeBandThemeMode } from '../theme';
import { apiClient, ApiEnvelope } from './client';

export interface ParentUserDto {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly roles: string[];
}

export interface ParentAuthData {
  readonly token: string;
  readonly token_type: string;
  readonly abilities: string[];
  readonly user: ParentUserDto;
}

export interface KidPickerProfileDto {
  readonly id: string;
  readonly first_name: string;
  readonly avatar: string;
}

export interface KidLookupData {
  readonly mode: 'single' | 'picker';
  readonly profiles: KidPickerProfileDto[];
  readonly profile: KidPickerProfileDto | null;
}

export interface KidProfileDto {
  readonly id: string;
  readonly public_id: string;
  readonly first_name: string;
  readonly username: string;
  readonly avatar: string;
  readonly age_band: AgeBandThemeMode;
  readonly theme_flag: AgeBandThemeMode;
}

export interface KidLoginData {
  readonly token: string;
  readonly token_type: string;
  readonly abilities: string[];
  readonly expires_at: string;
  readonly child: KidProfileDto;
}

export interface RegisterParentPayload {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly password: string;
}

export interface LoginParentPayload {
  readonly identifier: string;
  readonly password: string;
}

export interface ForgotPasswordPayload {
  readonly identifier: string;
  readonly channel?: 'email' | 'phone';
}

export interface ResetPasswordPayload {
  readonly identifier: string;
  readonly code: string;
  readonly password: string;
}

export interface KidLoginPayload {
  readonly profile_id?: string;
  readonly username?: string;
  readonly pin: string;
}

export async function registerParent(
  payload: RegisterParentPayload,
): Promise<ApiEnvelope<ParentAuthData>> {
  const response = await apiClient.post<ApiEnvelope<ParentAuthData>>('/auth/register', payload);
  return response.data;
}

export async function loginParent(
  payload: LoginParentPayload,
): Promise<ApiEnvelope<ParentAuthData>> {
  const response = await apiClient.post<ApiEnvelope<ParentAuthData>>('/auth/login', payload);
  return response.data;
}

export async function logoutParent(): Promise<ApiEnvelope<null>> {
  const response = await apiClient.post<ApiEnvelope<null>>('/auth/logout');
  return response.data;
}

export async function requestPasswordResetCode(
  payload: ForgotPasswordPayload,
): Promise<ApiEnvelope<null>> {
  const response = await apiClient.post<ApiEnvelope<null>>('/auth/password/forgot', payload);
  return response.data;
}

export async function confirmPasswordReset(
  payload: ResetPasswordPayload,
): Promise<ApiEnvelope<null>> {
  const response = await apiClient.post<ApiEnvelope<null>>('/auth/password/reset', payload);
  return response.data;
}

export async function lookupKidProfiles(
  identifier: string,
): Promise<ApiEnvelope<KidLookupData>> {
  const response = await apiClient.post<ApiEnvelope<KidLookupData>>('/kid/lookup', {
    identifier,
  });
  return response.data;
}

export async function loginKid(
  payload: KidLoginPayload,
): Promise<ApiEnvelope<KidLoginData>> {
  const response = await apiClient.post<ApiEnvelope<KidLoginData>>('/kid/login', payload);
  return response.data;
}
