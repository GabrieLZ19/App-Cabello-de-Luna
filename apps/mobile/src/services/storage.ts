import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'iltct_auth_token';
const USER_KEY = 'iltct_user_data';
const ONBOARDING_KEY = 'iltct_has_seen_onboarding';

export const storage = {
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
        return;
      }
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (e) {
      console.error('Error guardando token:', e);
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (e) {
      console.error('Error eliminando token:', e);
    }
  },

  async getUserData(): Promise<any | null> {
    try {
      let dataStr: string | null = null;
      if (Platform.OS === 'web') {
        dataStr = localStorage.getItem(USER_KEY);
      } else {
        dataStr = await SecureStore.getItemAsync(USER_KEY);
      }
      return dataStr ? JSON.parse(dataStr) : null;
    } catch {
      return null;
    }
  },

  async setUserData(user: any): Promise<void> {
    try {
      const dataStr = JSON.stringify(user);
      if (Platform.OS === 'web') {
        localStorage.setItem(USER_KEY, dataStr);
        return;
      }
      await SecureStore.setItemAsync(USER_KEY, dataStr);
    } catch (e) {
      console.error('Error guardando datos de usuario:', e);
    }
  },

  async getHasSeenOnboarding(): Promise<boolean> {
    try {
      let val: string | null = null;
      if (Platform.OS === 'web') {
        val = localStorage.getItem(ONBOARDING_KEY);
      } else {
        val = await SecureStore.getItemAsync(ONBOARDING_KEY);
      }
      return val === 'true';
    } catch {
      return false;
    }
  },

  async setHasSeenOnboarding(seen: boolean): Promise<void> {
    try {
      const val = seen ? 'true' : 'false';
      if (Platform.OS === 'web') {
        localStorage.setItem(ONBOARDING_KEY, val);
        return;
      }
      await SecureStore.setItemAsync(ONBOARDING_KEY, val);
    } catch (e) {
      console.error('Error guardando estado de onboarding:', e);
    }
  },
};
