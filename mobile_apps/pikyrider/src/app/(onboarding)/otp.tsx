import React, { useEffect, useState, useCallback } from "react";
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
import { authApiService, AuthApiError } from "@/services/auth-api.service";
import { sessionStorageService } from "@/services/session-storage.service";

export default function OtpVerificationScreen() {
  const router = useRouter();
  const {
    flow,
    authMethod,
    identifier,
    requestId,
    setRequestId,
    cooldownSeconds,
    setOtp: setStoreOtp,
    setSessionTokens,
    setOnboardingToken,
    setCurrentUser,
    setIsAuthenticated,
  } = useOnboardingStore();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(cooldownSeconds || 60);
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

  const verifyCode = useCallback(
    async (codeToVerify: string) => {
      const trimmed = codeToVerify.trim();
      const result = otpSchema.safeParse(trimmed);

      if (!result.success) {
        setError(
          result.error.issues[0]?.message || "Please enter a valid 6-digit code"
        );
        return;
      }

      if (!requestId) {
        setError(
          "Verification session expired. Please tap 'Resend code' to request a new code."
        );
        return;
      }

      setError(undefined);
      setIsVerifying(true);

      try {
        const response = await authApiService.verifyEmailAuth({
          requestId,
          code: trimmed,
          intent: "authentication",
        });

        setStoreOtp(trimmed);
        setCurrentUser(response.user);

        if (response.isOnboarded) {
          if (response.session) {
            await sessionStorageService.saveSessionTokens(
              response.session.accessToken,
              response.session.refreshToken
            );
            setSessionTokens(
              response.session.accessToken,
              response.session.refreshToken
            );
          } else {
            setIsAuthenticated(true);
          }
          setIsVerifying(false);
        } else {
          if (response.onboardingToken) {
            setOnboardingToken(response.onboardingToken);
          }
          setIsVerifying(false);
          router.replace("/(onboarding)/profile");
        }
      } catch (err: any) {
        setIsVerifying(false);
        if (err instanceof AuthApiError) {
          if (err.remainingAttempts !== undefined) {
            setError(
              `Invalid code. You have ${err.remainingAttempts} attempt${
                err.remainingAttempts === 1 ? "" : "s"
              } remaining.`
            );
          } else if (
            err.code === "REQUEST_EXPIRED" ||
            err.statusCode === 410 ||
            err.statusCode === 404
          ) {
            setError(
              "Verification request expired or not found. Please tap 'Resend code'."
            );
          } else {
            setError(err.message);
          }
        } else {
          setError(
            err?.message || "Unable to verify code. Please check your connection."
          );
        }
      }
    },
    [
      requestId,
      router,
      setCurrentUser,
      setIsAuthenticated,
      setOnboardingToken,
      setSessionTokens,
      setStoreOtp,
    ]
  );

  const handleNext = () => {
    verifyCode(otp);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(onboarding)/auth");
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    if (!identifier) {
      setError("Email address missing. Please go back and enter your email.");
      return;
    }

    setIsResending(true);
    setError(undefined);

    try {
      const response = await authApiService.initiateEmailAuth({
        email: identifier,
        productName: "TrackRide",
        intent: "authentication",
      });

      setRequestId(response.requestId);
      setCountdown(response.cooldownSeconds || 60);
      setOtp("");
      setResendNotice("A new 6-digit code has been sent.");
      setTimeout(() => {
        setResendNotice(null);
      }, 4000);
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        setError(err.message);
      } else {
        setError(err?.message || "Failed to resend code. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  // Dynamic content based on whether the user is using email or phone
  const isPhone = authMethod === "phone";
  const displayTarget =
    identifier || (isPhone ? "your mobile number" : "your email");

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
                    if (val.length === 6 && !isVerifying) {
                      verifyCode(val);
                    }
                  }}
                  error={error}
                  autoFocus={true}
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
                  disabled={countdown > 0 || isResending}
                  textClassName={`font-lexend-regular text-[12px] ${
                    countdown > 0 || isResending
                      ? "text-muted"
                      : "text-accent-warm"
                  }`}
                  className="px-0"
                >
                  {isResending
                    ? "Sending..."
                    : countdown > 0
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
