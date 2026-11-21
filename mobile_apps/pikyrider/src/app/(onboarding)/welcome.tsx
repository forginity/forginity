import { useState } from "react";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import Glow from "@/components/visuals/Glow";
import TerenMap from "@/components/visuals/TerenMap";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RadialBackground from "@/components/visuals/RadialBackground";
import { useRouter } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useGoogleAuthPrompt } from "@/services/google-auth.service";
import { authApiService, AuthApiError } from "@/services/auth-api.service";
import { sessionStorageService } from "@/services/session-storage.service";

const Auth = () => {
  const router = useRouter();
  const {
    startAuthFlow,
    setAuthMethod,
    setIdentifier,
    setCurrentUser,
    setSessionTokens,
    setOnboardingToken,
  } = useOnboardingStore();

  const { promptGoogleSignIn } = useGoogleAuthPrompt();
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    if (isGoogleSubmitting) return;

    setError(null);
    setIsGoogleSubmitting(true);

    try {
      const promptResult = await promptGoogleSignIn();
      if (!promptResult) {
        setIsGoogleSubmitting(false);
        return;
      }

      const response = await authApiService.authenticateGoogle({
        idToken: promptResult.idToken,
      });

      if (response.isOnboarded) {
        await sessionStorageService.saveSessionTokens(
          response.session.accessToken,
          response.session.refreshToken
        );
        setCurrentUser(response.user);
        setSessionTokens(
          response.session.accessToken,
          response.session.refreshToken
        );
        setIsGoogleSubmitting(false);
        router.replace("/(app)");
      } else {
        startAuthFlow("signup");
        setAuthMethod("google");
        if (response.user.email) {
          setIdentifier(response.user.email, "google");
        }
        setOnboardingToken(response.onboardingToken);
        setCurrentUser(response.user);
        setIsGoogleSubmitting(false);
        router.push("/(onboarding)/profile");
      }
    } catch (err: unknown) {
      setIsGoogleSubmitting(false);
      if (err instanceof AuthApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to complete Google sign-in. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView className="bg-canvas flex-1 p-6">
      <RadialBackground className={"-z-10"} />

      <View className="flex-row justify-center ">
        <Logo />
      </View>

      <View className="mt-12 mb-10">
        <Text className="text-5xl text-primary font-lexend-regular">
          Find the line.
        </Text>
        <Text className="text-5xl text-primary mt-1 font-lexend-regular">
          Own the day.
        </Text>
        <Text className="body-sm text-muted mt-4 max-w-72 font-lexend-regular">
          Ride, tour and navigate beyond the last signal.
        </Text>
      </View>

      <View className="relative">
        <TerenMap />
        <View className="absolute left-1/2 -translate-x-1/2 -translate-y-1">
          <Glow
            className="absolute -right-[130px] -top-[60px]"
            size={260}
            color="#FF8A3D"
            opacity={0.08}
          />
        </View>
        <View className="absolute -right-[130px] -top-[60px]">
          <Glow
            className="absolute -right-[130px] -top-[60px]"
            size={260}
            color="#FF8A3D"
            opacity={0.08}
          />
        </View>
      </View>

      <View className="mt-auto">
        {error ? (
          <View className="flex-row items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 mb-3">
            <AlertCircle size={16} color="#EF4444" />
            <Text className="text-red-400 font-lexend-regular text-[12px] flex-1">
              {error}
            </Text>
          </View>
        ) : null}

        <View className="gap-3">
          <Button
            variant="tertiary"
            onPress={() => {
              startAuthFlow("signup");
              router.push("/(onboarding)/auth");
            }}
            showIcon={true}
          >
            Sign up
          </Button>

          <Button
            variant="secondary"
            onPress={() => {
              startAuthFlow("signin");
              router.push("/(onboarding)/auth");
            }}
          >
            Sign in
          </Button>

          <Button
            variant="secondary"
            onPress={handleGoogleSignIn}
            loading={isGoogleSubmitting}
            disabled={isGoogleSubmitting}
          >
            G <Text className="pl-6">Continue with Google</Text>
          </Button>
        </View>
        <Text className="text-center mt-4 text-muted font-lexend-light">
          By continuing, you agree to TrackRide&apos;s Terms of Use and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Auth;
