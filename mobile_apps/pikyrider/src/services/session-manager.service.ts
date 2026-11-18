import { authApiService, AuthApiError } from "./auth-api.service";
import { sessionStorageService } from "./session-storage.service";
import { useOnboardingStore } from "../store/useOnboardingStore";

class SessionManagerService {
  private isHydrating = false;

  /**
   * Cold-start session hydration.
   * Restores stored credentials, performs silent token rotation, and hydrates user profile.
   */
  async hydrateSession(): Promise<boolean> {
    if (this.isHydrating) return false;
    this.isHydrating = true;

    try {
      const { accessToken, refreshToken } =
        await sessionStorageService.getStoredTokens();

      if (!refreshToken) {
        this.isHydrating = false;
        return false;
      }

      try {
        // Silent token rotation in mobile non-cookie environment
        const refreshResponse = await authApiService.refreshSession(refreshToken);
        const newAccessToken = refreshResponse.session.accessToken;
        const newRefreshToken = refreshResponse.session.refreshToken;

        // Persist rotated tokens to SecureStore
        await sessionStorageService.saveSessionTokens(
          newAccessToken,
          newRefreshToken
        );

        // Update in-memory Zustand store
        const store = useOnboardingStore.getState();
        store.setSessionTokens(newAccessToken, newRefreshToken);

        // Hydrate rider profile
        const sessionMe = await authApiService.getCurrentSession(newAccessToken);
        store.setCurrentUser(sessionMe.user);
        store.setIsAuthenticated(true);

        this.isHydrating = false;
        return true;
      } catch (err: any) {
        // If session was revoked or explicitly expired, purge credentials
        if (
          err instanceof AuthApiError &&
          (err.statusCode === 401 || err.code === "SESSION_REVOKED")
        ) {
          await sessionStorageService.clearSessionTokens();
          useOnboardingStore.getState().resetOnboarding();
          this.isHydrating = false;
          return false;
        }

        // Offline / Network error on launch: retain active session if access token exists
        if (accessToken) {
          const store = useOnboardingStore.getState();
          store.setSessionTokens(accessToken, refreshToken);
          store.setIsAuthenticated(true);
          this.isHydrating = false;
          return true;
        }

        this.isHydrating = false;
        return false;
      }
    } catch {
      this.isHydrating = false;
      return false;
    }
  }

  /**
   * Invalidates backend session and wipes local hardware-backed storage.
   */
  async logout(): Promise<void> {
    const store = useOnboardingStore.getState();
    const stored = await sessionStorageService.getStoredTokens();

    const refreshToken = store.refreshToken || stored.refreshToken || undefined;
    const accessToken = store.accessToken || stored.accessToken || undefined;

    try {
      if (refreshToken || accessToken) {
        await authApiService.revokeSession(refreshToken, accessToken);
      }
    } catch {
      // Proceed with local eviction even if network fails
    } finally {
      await sessionStorageService.clearSessionTokens();
      store.resetOnboarding();
    }
  }
}

export const sessionManagerService = new SessionManagerService();
