import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Text,
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
import { authApiService, AuthApiError } from "@/services/auth-api.service";

export default function AuthScreen() {
  const router = useRouter();
  const {
    flow,
    setFlow,
    setIdentifier,
    identifier,
    setAuthInitiateData,
  } = useOnboardingStore();

  const [email, setEmail] = useState(identifier || "");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = flow === "signup";
  const currentStep = 1;
  const totalSteps = isSignup ? 5 : 2;

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) {
      const result = emailSchema.safeParse(text.trim());
      if (result.success) {
        setError(undefined);
      }
    }
  };

  const handleNext = async () => {
    const trimmed = email.trim();
    const result = emailSchema.safeParse(trimmed);

    if (!result.success) {
      setError(
        result.error.issues[0]?.message || "Please enter a valid email address"
      );
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    try {
      const response = await authApiService.initiateEmailAuth({
        email: trimmed,
        productName: "TrackRide",
        intent: "authentication",
      });

      // Save to Zustand store
      setIdentifier(trimmed, "email");
      setAuthInitiateData({
        requestId: response.requestId,
        isNewUser: response.isNewUser,
        cooldownSeconds: response.cooldownSeconds,
      });

      // Dynamically align flow with server account discovery
      if (response.isNewUser) {
        setFlow("signup");
      } else {
        setFlow("signin");
      }

      setIsSubmitting(false);
      router.push("/(onboarding)/otp");
    } catch (err: any) {
      setIsSubmitting(false);
      if (err instanceof AuthApiError) {
        setError(err.message);
      } else {
        setError(err?.message || "Failed to send verification code. Please try again.");
      }
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(onboarding)/welcome");
    }
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
                caption={isSignup ? "Create your account" : "Welcome back"}
                title="What’s your email?"
                description={
                  isSignup
                    ? "We’ll send a one-time code to create your rider account."
                    : "We’ll send a one-time code to sign you in."
                }
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
