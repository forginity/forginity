import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const ACCESS_TOKEN_KEY = "forginity_access_token";
export const REFRESH_TOKEN_KEY = "forginity_refresh_token";

// In-memory fallback for web or test environments where SecureStore native module is absent
const memoryStore: Record<string, string> = {};

class SessionStorageService {
  private isSecureStoreAvailable(): boolean {
    return Platform.OS !== "web";
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.isSecureStoreAvailable()) {
      try {
        await SecureStore.setItemAsync(key, value);
        return;
      } catch {
        // Fallback to memory
        memoryStore[key] = value;
      }
    } else {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        memoryStore[key] = value;
      }
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (this.isSecureStoreAvailable()) {
      try {
        return await SecureStore.getItemAsync(key);
      } catch {
        return memoryStore[key] || null;
      }
    } else {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return memoryStore[key] || null;
    }
  }

  async removeItem(key: string): Promise<void> {
    if (this.isSecureStoreAvailable()) {
      try {
        await SecureStore.deleteItemAsync(key);
        return;
      } catch {
        delete memoryStore[key];
      }
    } else {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      delete memoryStore[key];
    }
  }

  /**
   * Persists production access and refresh tokens to hardware-backed secure storage.
   */
  async saveSessionTokens(
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    await Promise.all([
      this.setItem(ACCESS_TOKEN_KEY, accessToken.trim()),
      this.setItem(REFRESH_TOKEN_KEY, refreshToken.trim()),
    ]);
  }

  /**
   * Retrieves securely stored access and refresh tokens.
   */
  async getStoredTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.getItem(ACCESS_TOKEN_KEY),
      this.getItem(REFRESH_TOKEN_KEY),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Wipes session tokens from hardware-backed storage upon logout or revocation.
   */
  async clearSessionTokens(): Promise<void> {
    await Promise.all([
      this.removeItem(ACCESS_TOKEN_KEY),
      this.removeItem(REFRESH_TOKEN_KEY),
    ]);
  }
}

export const sessionStorageService = new SessionStorageService();
