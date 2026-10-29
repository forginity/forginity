import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import RadialBackground from "@/components/visuals/RadialBackground";
import { useOnboardingStore } from "@/store/useOnboardingStore";

export default function HomeScreen() {
  const router = useRouter();
  const { profile, identifier, country, resetOnboarding } =
    useOnboardingStore();

  const displayName = profile.firstName
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : identifier || "Rider";

  const handleSignOut = () => {
    resetOnboarding();
    router.replace("/(onboarding)/welcome");
  };

  return (
    <SafeAreaView className="bg-canvas flex-1 p-6 justify-between">
      <RadialBackground className="-z-10" />

      <View>
        <View className="flex-row justify-center mb-8">
          <Logo />
        </View>

        <View className="bg-raised rounded-[24px] p-6 border border-border/40">
          <Text className="text-secondary text-caption uppercase tracking-wider mb-2">
            Welcome to Pikyrider
          </Text>
          <Text className="text-primary text-heading-lg font-lexend-semibold mb-4">
            {displayName}
          </Text>

          <View className="gap-2.5 pt-2 border-t border-border/30">
            {profile.userName ? (
              <View className="flex-row justify-between items-center">
                <Text className="text-muted text-body-sm font-lexend-regular">
                  Handle
                </Text>
                <Text className="text-primary text-body-sm font-lexend-medium">
                  @{profile.userName}
                </Text>
              </View>
            ) : null}

            {identifier ? (
              <View className="flex-row justify-between items-center">
                <Text className="text-muted text-body-sm font-lexend-regular">
                  Account
                </Text>
                <Text className="text-primary text-body-sm font-lexend-medium">
                  {identifier}
                </Text>
              </View>
            ) : null}

            {country ? (
              <View className="flex-row justify-between items-center">
                <Text className="text-muted text-body-sm font-lexend-regular">
                  Terrain
                </Text>
                <Text className="text-primary text-body-sm font-lexend-medium">
                  {country.flagEmoji} {country.name}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View className="pt-6">
        <Button variant="secondary" onPress={handleSignOut}>
          Sign out
        </Button>
      </View>
    </SafeAreaView>
  );
}
