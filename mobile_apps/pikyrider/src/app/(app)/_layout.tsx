import { Redirect, Stack } from "expo-router";
import { useOnboardingStore } from "@/store/useOnboardingStore";

export default function AppLayout() {
  const isAuthenticated = useOnboardingStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#090909" },
      }}
    >
      <Stack.Screen name="index" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
