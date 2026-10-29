import React, { useEffect, useState } from "react";
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
import OtpInput from "@/components/formElement/OtpInput";
import Button from "@/components/ui/Button";
import { Check } from "lucide-react-native";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { otpSchema } from "@/lib/validation/auth";

export default function OtpVerificationScreen() {
  const router = useRouter();
  const {
    flow,
    authMethod,
    identifier,
    setOtp: setStoreOtp,
    setIsAuthenticated,
  } = useOnboardingStore();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const isSignin = flow === "signin";
  const currentStep = 2;
  const totalSteps = isSignin ? 2 : 5;

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const handleNext = () => {
    const trimmed = otp.trim();
    const result = otpSchema.safeParse(trimmed);

    if (!result.success) {
      setError(result.error.issues[0]?.message || "Please enter a valid 6-digit code");
      return;
    }

    setError(undefined);
    setIsVerifying(true);
    setStoreOtp(trimmed);

    // Provide visual state feedback with small delay
    setTimeout(() => {
      setIsVerifying(false);
      if (isSignin) {
        setIsAuthenticated(true);
        router.replace("/(app)");
      } else {
        router.push("/(onboarding)/profile");
      }
    }, 400);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(isSignin ? "/(onboarding)/signin" : "/(onboarding)/signup");
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(30);
    setError(undefined);
    setResendNotice("A new 6-digit code has been sent.");
    setTimeout(() => {
      setResendNotice(null);
    }, 4000);
  };

  // Dynamic content based on whether the user is using email or phone
  const isPhone = authMethod === "phone";
  const displayTarget =
    identifier || (isPhone ? "your mobile number" : "alex@ridge.cc");

  const caption = isPhone ? "Check your phone" : "Check your email";
  const description = `We sent a 6-digit code to ${displayTarget}.`;

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
                caption={caption}
                title="Enter your code"
                description={description}
                className="mt-12 mb-8"
              />

              {/* 6-digit OTP Box Input */}
              <View className="mt-4">
                <OtpInput
                  length={6}
                  value={otp}
                  onChange={(val) => {
                    setOtp(val);
                    if (error) setError(undefined);
                  }}
                  error={error}
                />
              </View>

              {/* Feedback notice when code is resent */}
              {resendNotice ? (
                <Text className="text-accent-warm text-center font-lexend-regular text-[12px] mt-4">
                  {resendNotice}
                </Text>
              ) : null}

              {/* Resend row */}
              <View className="flex-row items-center justify-between mt-6 px-1">
                <Text className="text-muted font-lexend-regular text-[12px]">
                  Didn’t get it?
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleResend}
                  disabled={countdown > 0}
                  textClassName={`font-lexend-regular text-[12px] ${
                    countdown > 0 ? "text-muted" : "text-accent-warm"
                  }`}
                  className="px-0"
                >
                  {countdown > 0
                    ? `Resend in 00:${countdown < 10 ? `0${countdown}` : countdown}`
                    : "Resend code"}
                </Button>
              </View>
            </View>
          </View>

          {/* CTA at Bottom */}
          <View className="mt-auto pt-4">
            <Button
              variant="tertiary"
              onPress={handleNext}
              showIcon={true}
              icon={<Check size={19} color="#0E0E0E" />}
              disabled={otp.length < 6 || isVerifying}
              loading={isVerifying}
            >
              Verify & continue
            </Button>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
