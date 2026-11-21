import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession({ skipRedirectCheck: true });

export interface GoogleAuthConfig {
  webClientId?: string;
  iosClientId?: string;
  androidClientId?: string;
  redirectUri?: string;
}

export function getGoogleAuthConfig(): GoogleAuthConfig {
  const commonClientId =
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;

  return {
    webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId:
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || commonClientId,
    redirectUri: process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI,
  };
}

export function isGoogleMockEnabled(): boolean {
  return process.env.EXPO_PUBLIC_ENABLE_GOOGLE_MOCK === "true";
}

export function isGoogleAuthConfigured(): boolean {
  if (isGoogleMockEnabled()) {
    return true;
  }
  const config = getGoogleAuthConfig();
  return Boolean(
    config.androidClientId ||
      config.webClientId ||
      config.iosClientId ||
      process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID
  );
}

export interface GoogleAuthPromptResult {
  idToken: string;
}

export function useGoogleAuthPrompt() {
  const config = getGoogleAuthConfig();
  const isMock = isGoogleMockEnabled();

  // Guard against unhandled mount-time crashes on Android/iOS when client IDs are not defined
  const placeholderClientId = isMock
    ? "mock.google.client.id"
    : "unconfigured-google-client-id";

  const effectiveWebClientId = config.webClientId || placeholderClientId;
  const effectiveAndroidClientId =
    config.androidClientId || config.webClientId || placeholderClientId;
  const effectiveIosClientId =
    config.iosClientId || config.webClientId || placeholderClientId;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      clientId: effectiveAndroidClientId,
      webClientId: effectiveWebClientId,
      iosClientId: effectiveIosClientId,
      androidClientId: effectiveAndroidClientId,
      ...(config.redirectUri ? { redirectUri: config.redirectUri } : {}),
    },
    {
      scheme: "pikyrider",
    }
  );

  const promptGoogleSignIn = async (): Promise<GoogleAuthPromptResult | null> => {
    if (isGoogleMockEnabled()) {
      return {
        idToken: "mock.google.id.token",
      };
    }

    if (!isGoogleAuthConfigured()) {
      throw new Error(
        "Google Sign-In is not configured. Please set EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID or EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your environment."
      );
    }

    if (__DEV__) {
      console.log("[Google Auth] Dispatched client ID:", request?.clientId);
      console.log("[Google Auth] Dispatched redirect URI:", request?.redirectUri);
    }

    const result = await promptAsync();

    if (result.type === "cancel" || result.type === "dismiss") {
      return null;
    }

    if (result.type === "error") {
      throw new Error(
        result.error?.message || "Google sign-in was interrupted or failed."
      );
    }

    if (result.type === "success") {
      const idToken = result.params?.id_token;
      if (!idToken) {
        throw new Error("Google authentication succeeded but no ID token was returned.");
      }
      return { idToken };
    }

    return null;
  };

  return {
    promptGoogleSignIn,
    isReady: Boolean(request) || isGoogleMockEnabled(),
    rawResponse: response,
  };
}
