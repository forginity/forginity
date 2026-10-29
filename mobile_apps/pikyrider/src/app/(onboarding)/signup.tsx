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
import { Lock, AtSign, Phone } from "lucide-react-native";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { authIdentifierSchema, detectAuthMethod } from "@/lib/validation/auth";

export default function SignupStepScreen() {
  const router = useRouter();
  const { setFlow, setIdentifier, identifier } = useOnboardingStore();

  const [value, setValue] = useState(identifier || "");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = 1;
  const totalSteps = 5;

  const detectedMethod = detectAuthMethod(value);

  const handleChangeText = (text: string) => {
    setValue(text);
    if (error) {
      const result = authIdentifierSchema.safeParse(text.trim());
      if (result.success) {
        setError(undefined);
      }
    }
  };

  const handleNext = () => {
    const trimmed = value.trim();
    const result = authIdentifierSchema.safeParse(trimmed);

    if (!result.success) {
      setError(
        result.error.issues[0]?.message ||
          "Please enter a valid email address or phone number",
      );
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    const method = detectAuthMethod(trimmed);
    setFlow("signup");
    setIdentifier(trimmed, method);

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

  const handleSwitchToSignin = () => {
    setFlow("signin");
    router.replace("/(onboarding)/signin");
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
                caption="Your account"
                title="What’s your mobile or email?"
                description="We’ll send a one-time code to confirm it’s you."
                className="mt-12 mb-8"
              />

              {/* Custom Input */}
              <View className="mt-8">
                <CustomInput
                  label="Mobile or Email"
                  icon={
                    detectedMethod === "phone" ? (
                      <Phone size={20} color={error ? "#EF4444" : "#838383"} />
                    ) : (
                      <AtSign size={20} color={error ? "#EF4444" : "#838383"} />
                    )
                  }
                  placeholder="name@example.com or phone"
                  value={value}
                  onChangeText={handleChangeText}
                  keyboardType="email-address"
                  returnKeyType="done"
                  autoCapitalize="none"
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
                No passwords. No inbox noise.
              </Text>
            </View>
            <Button
              variant="tertiary"
              onPress={handleNext}
              showIcon={true}
              disabled={!value.trim() || isSubmitting}
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
