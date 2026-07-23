import { fetchClient } from './config';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  language?: string;
  enrollmentStatus: string;
  currentPhase: string;
  franchise?: {
    code: string;
    name: string;
    location?: string;
  } | null;
}

export interface LoginResponse {
  message: string;
  user: UserProfile;
  accessToken: string;
}

export interface RegisterResponse {
  message: string;
  user: UserProfile;
  accessToken: string;
  otpCode?: string;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  return fetchClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function validateFranchiseCode(
  code: string
): Promise<{ valid: boolean; franchise: { code: string; name: string } }> {
  return fetchClient<{ valid: boolean; franchise: { code: string; name: string } }>(
    '/auth/validate-franchise',
    {
      method: 'POST',
      body: JSON.stringify({ code }),
    }
  );
}

export async function registerStudent(data: {
  email: string;
  password: string;
  fullName: string;
  franchiseCode: string;
}): Promise<RegisterResponse> {
  return fetchClient<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function requestPasswordReset(
  email: string
): Promise<{ message: string; otpCode?: string }> {
  return fetchClient<{ message: string; otpCode?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset(
  email: string,
  newPassword: string
): Promise<{ message: string }> {
  return fetchClient<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword }),
  });
}

export async function resendOtpCode(
  email: string
): Promise<{ message: string; otpCode?: string }> {
  return fetchClient<{ message: string; otpCode?: string }>('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtpCode(
  email: string,
  code: string
): Promise<LoginResponse> {
  return fetchClient<LoginResponse>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export async function getProfile(token: string): Promise<UserProfile> {
  return fetchClient<UserProfile>('/auth/me', { method: 'GET' }, token);
}
