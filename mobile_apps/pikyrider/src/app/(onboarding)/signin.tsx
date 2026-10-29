import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Text,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import StepperHeader from "@/components/ui/StepperHeader";
import FormSectionHeader from "@/components/ui/FormSectionHeader";
import CustomInput from "@/components/formElement/CustomInput";
import Button from "@/components/ui/Button";
import { Mail, Lock } from "lucide-react-native";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { emailSchema } from "@/lib/validation/auth";

export default function SigninStepScreen() {
  const router = useRouter();
  const { setFlow, setIdentifier, identifier } = useOnboardingStore();

  const [email, setEmail] = useState(identifier || "");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = 1;
  const totalSteps = 2;

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) {
      // Re-validate dynamically if an error was already visible
      const result = emailSchema.safeParse(text.trim());
      if (result.success) {
        setError(undefined);
      }
    }
  };

  const handleNext = () => {
    const trimmed = email.trim();
    const result = emailSchema.safeParse(trimmed);

    if (!result.success) {
      setError(
        result.error.issues[0]?.message || "Please enter a valid email address",
      );
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    // Save to Zustand store
    setFlow("signin");
    setIdentifier(trimmed, "email");

    setIsSubmitting(false);
    router.push("/(onboarding)/otp");
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(onboarding)/welcome");
    }
  };

  const handleSwitchToSignup = () => {
    setFlow("signup");
    router.replace("/(onboarding)/signup");
  };

  return (
    <SafeAreaView className="bg-canvas flex-1 p-6">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-between"
        >
          <View>
            <StepperHeader
              currentStep={currentStep}
              totalSteps={totalSteps}
              onBack={handleBack}
            />

            <View className="mt-8">
              <FormSectionHeader
                caption="Welcome back"
                title="What’s your email?"
                description="We’ll send a one-time code to sign you in."
                className="mt-12 mb-8"
              />

              {/* Email Input */}
              <View className="mt-8">
                <CustomInput
                  label="Email address"
                  icon={
                    <Mail size={20} color={error ? "#EF4444" : "#838383"} />
                  }
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
                  error={error}
                />
              </View>
            </View>
          </View>

          <View className="mt-auto pt-4">
            <View className="flex-row items-center justify-center gap-1.5 mb-3">
              <Lock size={14} color="#616161" />
              <Text className="text-muted font-lexend-regular text-[12px]">
                Passwordless login. Quick & secure.
              </Text>
            </View>
            <Button
              variant="tertiary"
              onPress={handleNext}
              showIcon={true}
              disabled={!email.trim() || isSubmitting}
              loading={isSubmitting}
            >
              Next
            </Button>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
