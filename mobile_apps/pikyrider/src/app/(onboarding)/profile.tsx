import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  View,
  TextInput,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import StepperHeader from "@/components/ui/StepperHeader";
import FormSectionHeader from "@/components/ui/FormSectionHeader";
import CustomInput from "@/components/formElement/CustomInput";
import Button from "@/components/ui/Button";
import InfoCard from "@/components/ui/InfoCard";
import { Check, CheckCircle2 } from "lucide-react-native";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { profileSchema } from "@/lib/validation/auth";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, setProfile } = useOnboardingStore();

  const [firstName, setFirstName] = useState(profile.firstName || "");
  const [lastName, setLastName] = useState(profile.lastName || "");
  const [userName, setUserName] = useState(profile.userName || "");
  const [isUsernameVerified, setIsUsernameVerified] = useState(
    profile.isUsernameVerified || false
  );
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<"firstName" | "lastName" | "userName", string>>
  >({});
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const userNameRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const currentStep = 3;
  const totalSteps = 5;

  // Dedicated keyboard listener to guarantee Samsung / Android devices lift above keyboard
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow",
      (e) => {
        setKeyboardPadding(e.endCoordinates.height);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 80);
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide",
      () => {
        setKeyboardPadding(0);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleFirstNameChange = (val: string) => {
    setFirstName(val);
    if (errors.firstName) {
      setErrors((prev) => ({ ...prev, firstName: undefined }));
    }
  };

  const handleLastNameChange = (val: string) => {
    setLastName(val);
    if (errors.lastName) {
      setErrors((prev) => ({ ...prev, lastName: undefined }));
    }
  };

  const handleUserNameChange = (val: string) => {
    setUserName(val);
    setIsUsernameVerified(false);
    if (errors.userName) {
      setErrors((prev) => ({ ...prev, userName: undefined }));
    }
  };

  const handleVerifyUsername = () => {
    const trimmed = userName.trim();
    if (!trimmed) {
      setErrors((prev) => ({
        ...prev,
        userName: "Please enter a username to verify",
      }));
      return;
    }

    if (trimmed.length < 3) {
      setErrors((prev) => ({
        ...prev,
        userName: "Username must be at least 3 characters",
      }));
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setErrors((prev) => ({
        ...prev,
        userName: "Username can only contain letters, numbers, and underscores",
      }));
      return;
    }

    setIsCheckingUsername(true);
    setErrors((prev) => ({ ...prev, userName: undefined }));

    // Simulate availability verification with feedback
    setTimeout(() => {
      setIsCheckingUsername(false);
      setIsUsernameVerified(true);
    }, 450);
  };

  const handleNext = () => {
    const trimmedData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userName: userName.trim(),
    };

    const result = profileSchema.safeParse(trimmedData);

    if (!result.success) {
      const fieldErrors: Partial<
        Record<"firstName" | "lastName" | "userName", string>
      > = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as "firstName" | "lastName" | "userName";
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setProfile({
      ...trimmedData,
      isUsernameVerified: true,
    });

    router.push("/(onboarding)/gender");
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(onboarding)/otp");
    }
  };

  const isFormValid =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 1 &&
    userName.trim().length >= 3;

  return (
    <SafeAreaView className="bg-canvas flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "space-between",
              padding: 24,
              paddingBottom: 24 + keyboardPadding,
            }}
          >
            <View>
              {/* Stepper Header: Step 3 */}
              <StepperHeader
                currentStep={currentStep}
                totalSteps={totalSteps}
                onBack={handleBack}
              />

              {/* Form Section Header */}
              <FormSectionHeader
                caption="Your profile"
                title="What should we call you?"
                description="Your name helps your crew recognize you out there."
                className="mt-12 mb-8"
              />

              {/* Inputs */}
              <View className="gap-3">
                {/* First name */}
                <CustomInput
                  ref={firstNameRef}
                  label="First name"
                  placeholder="Alex"
                  value={firstName}
                  onChangeText={handleFirstNameChange}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                  blurOnSubmit={false}
                  error={errors.firstName}
                />

                {/* Second name */}
                <CustomInput
                  ref={lastNameRef}
                  label="Second name"
                  placeholder="Ridge"
                  value={lastName}
                  onChangeText={handleLastNameChange}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    userNameRef.current?.focus();
                  }}
                  blurOnSubmit={false}
                  error={errors.lastName}
                />

                {/* User name with Verify availability button */}
                <CustomInput
                  ref={userNameRef}
                  label="User name"
                  placeholder="alex_ridge"
                  value={userName}
                  onChangeText={handleUserNameChange}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  error={errors.userName}
                  rightElement={
                    isUsernameVerified ? (
                      <View className="flex-row items-center gap-1 bg-accent-warm/15 px-2.5 py-1.5 rounded-xl border border-accent-warm/30">
                        <Check size={13} color="#FF8A3D" />
                        <Text className="text-accent-warm text-[11px] font-lexend-medium">
                          Available
                        </Text>
                      </View>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onPress={handleVerifyUsername}
                        loading={isCheckingUsername}
                        disabled={!userName.trim() || isCheckingUsername}
                        textClassName="text-[12px] font-lexend-medium"
                        className="rounded-xl"
                      >
                        Verify
                      </Button>
                    )
                  }
                />

                {/* Info Card with I Icon */}
                <View className="mt-2">
                  <InfoCard text="Your user name will be visible to people you ride with." />
                </View>
              </View>
            </View>

            {/* Bottom CTA */}
            <View className="mt-auto pt-6">
              <Button
                variant="tertiary"
                onPress={handleNext}
                showIcon={true}
                disabled={!isFormValid}
              >
                Next
              </Button>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
