import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storage } from './storage';

/**
 * Resuelve dinámicamente la URL base del Backend NestJS.
 */
const getApiBaseUrl = (): string => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.developer?.extra?.expoClient?.hostUri;

  const metroIp = hostUri ? hostUri.split(':')[0] : '192.168.1.16';

  let baseUrl = process.env.EXPO_PUBLIC_API_URL || `http://${metroIp}:3001/api/v1`;

  // Asegurar sufijo /api/v1
  if (!baseUrl.endsWith('/api/v1')) {
    baseUrl = baseUrl.replace(/\/$/, '') + '/api/v1';
  }

  // Si corre en Android y la URL contiene localhost o 127.0.0.1, reemplazar por la IP de Metro Wi-Fi
  if (Platform.OS === 'android' && (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1'))) {
    baseUrl = baseUrl.replace('localhost', metroIp).replace('127.0.0.1', metroIp);
  }

  return baseUrl;
};

export const API_BASE_URL = getApiBaseUrl();

export async function fetchClient<T>(
  endpoint: string,
  options: RequestInit = {},
  explicitToken?: string
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  console.log(`[API Request] -> ${options.method || 'GET'} ${url}`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Obtener token guardado si no se pasó uno explícitamente
  const token = explicitToken || (await storage.getToken());
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || `Error HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error: any) {
    if (error.message && error.message.includes('Network request failed')) {
      throw new Error(`Imposible conectar con el backend en ${url}. Verificá que tu celular esté en la red Wi-Fi 192.168.1.16.`);
    }
    throw error;
  }
}
