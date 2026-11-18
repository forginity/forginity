import { Stack } from "expo-router";

export const unstable_settings = {
  anchor: "welcome",
};

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#090909" },
      }}
    >
      <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
      <Stack.Screen name="auth" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="country" />
    </Stack>
  );
}
