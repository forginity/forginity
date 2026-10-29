import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import Glow from "@/components/visuals/Glow";
import TerenMap from "@/components/visuals/TerenMap";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RadialBackground from "@/components/visuals/RadialBackground";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/store/useOnboardingStore";

const Auth = () => {
  const router = useRouter();
  const setFlow = useOnboardingStore((s) => s.setFlow);
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
        <View className="gap-3">
          <Button
            variant="tertiary"
            onPress={() => {
              setFlow("signup");
              router.push("/(onboarding)/signup");
            }}
            showIcon={true}
          >
            Sign up
          </Button>

          <Button
            variant="secondary"
            onPress={() => {
              setFlow("signin");
              router.push("/(onboarding)/signin");
            }}
          >
            Sign in
          </Button>

          <Button variant="secondary" onPress={() => console.log("google")}>
            G <Text className="pl-6">Continue with Google</Text>
          </Button>
        </View>
        <Text className="text-center mt-4 text-muted font-lexend-light">
          By continuing, you agree to Powder's Terms of Use and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Auth;
