import "../global.css";
import { Stack } from "expo-router";
import {
  Lexend_100Thin,
  Lexend_200ExtraLight,
  Lexend_300Light,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  Lexend_800ExtraBold,
  Lexend_900Black,
} from "@expo-google-fonts/lexend";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { sessionManagerService } from "@/services/session-manager.service";
import { useOnboardingStore } from "@/store/useOnboardingStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isHydrated, setIsHydrated] = useState(false);
  const isAuthenticated = useOnboardingStore((s) => s.isAuthenticated);
  const [loaded, error] = useFonts({
    Lexend_100Thin,
    Lexend_200ExtraLight,
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    Lexend_800ExtraBold,
    Lexend_900Black,
  });

  useEffect(() => {
    let isMounted = true;
    async function prepare() {
      try {
        await sessionManagerService.hydrateSession();
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }
    prepare();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if ((loaded || error) && isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, isHydrated]);

  if ((!loaded && !error) || !isHydrated) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: "#090909" },
      }}
    >
      <Stack.Protected guard={isAuthenticated} redirectTo="/(onboarding)/welcome">
        <Stack.Screen name="(app)" options={{ gestureEnabled: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated} redirectTo="/(app)">
        <Stack.Screen name="(onboarding)" options={{ gestureEnabled: false }} />
      </Stack.Protected>
    </Stack>
  );
}
