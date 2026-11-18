import React, { type ComponentRef, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Text,
  View,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import StepperHeader from "@/components/ui/StepperHeader";
import FormSectionHeader from "@/components/ui/FormSectionHeader";
import CustomInput from "@/components/formElement/CustomInput";
import Button from "@/components/ui/Button";
import InfoCard from "@/components/ui/InfoCard";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { validateProfile } from "@/lib/validation/auth";
import {
  type UsernameCheckState,
  getUsernameError,
  isUsernameVerifiedFor,
  normalizeUsername,
  resolveUsernameVerification,
} from "@/lib/validation/username-verification";
import { authApiService } from "@/services/auth-api.service";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, setProfile } = useOnboardingStore();

  const [firstName, setFirstName] = useState(profile.firstName || "");
  const [lastName, setLastName] = useState(profile.lastName || "");
  const [userName, setUserName] = useState(profile.userName || "");
  const [usernameState, setUsernameState] = useState<UsernameCheckState>(() =>
    profile.isUsernameVerified && profile.userName
      ? { status: "available", username: normalizeUsername(profile.userName) }
      : { status: "idle" }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<"firstName" | "lastName" | "userName", string>>
  >({});
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  const firstNameRef = useRef<ComponentRef<typeof TextInput>>(null);
  const lastNameRef = useRef<ComponentRef<typeof TextInput>>(null);
  const userNameRef = useRef<ComponentRef<typeof TextInput>>(null);
  const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const verificationSeqRef = useRef(0);

  const currentStep = 3;
  const totalSteps = 5;

  const effectiveUsernameState: UsernameCheckState =
    usernameState.status === "available" && !profile.isUsernameVerified
      ? { status: "idle" }
      : usernameState;

  // Android keyboards on Samsung devices do not reliably resize KeyboardAvoidingView alone
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
    verificationSeqRef.current += 1;
    setUsernameState({ status: "idle" });
    if (profile.isUsernameVerified) {
      setProfile({ isUsernameVerified: false });
    }
    if (errors.userName) {
      setErrors((prev) => ({ ...prev, userName: undefined }));
    }
  };

  const handleVerifyUsername = async () => {
    const candidate = normalizeUsername(userName);
    const seq = ++verificationSeqRef.current;

    setErrors((prev) => ({ ...prev, userName: undefined }));
    setUsernameState({ status: "checking", candidate });

    const nextState = await resolveUsernameVerification(userName, (normalized) =>
      authApiService.checkUsernameAvailability(normalized)
    );

    if (seq !== verificationSeqRef.current) {
      return;
    }

    setUsernameState(nextState);
    if (nextState.status === "available") {
      setProfile({ userName: nextState.username, isUsernameVerified: true });
      return;
    }

    const errorMessage = getUsernameError(nextState);
    if (errorMessage) {
      setErrors((prev) => ({ ...prev, userName: errorMessage }));
    }
  };

  const handleNext = async () => {
    if (isSubmitting || effectiveUsernameState.status === "checking") {
      return;
    }

    const trimmedData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userName: userName.trim(),
    };

    const result = validateProfile(trimmedData);

    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    const normalizedUserName = result.data.userName;

    if (
      effectiveUsernameState.status === "taken" &&
      effectiveUsernameState.username === normalizedUserName
    ) {
      setErrors({ userName: effectiveUsernameState.message });
      return;
    }

    let verifiedUsername = normalizedUserName;

    if (!isUsernameVerifiedFor(effectiveUsernameState, trimmedData.userName)) {
      const seq = ++verificationSeqRef.current;
      setIsSubmitting(true);
      setErrors({});
      setUsernameState({ status: "checking", candidate: normalizedUserName });

      try {
        const nextState = await resolveUsernameVerification(
          trimmedData.userName,
          (normalized) => authApiService.checkUsernameAvailability(normalized)
        );

        if (seq !== verificationSeqRef.current) {
          return;
        }

        setUsernameState(nextState);
        if (nextState.status !== "available") {
          setErrors({ userName: getUsernameError(nextState) });
          return;
        }
        verifiedUsername = nextState.username;
      } finally {
        setIsSubmitting(false);
      }
    }

    setErrors({});
    setProfile({
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      userName: verifiedUsername,
      isUsernameVerified: true,
    });

    router.push("/(onboarding)/gender");
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(onboarding)/auth");
    }
  };

  const isCheckingUsername = effectiveUsernameState.status === "checking";
  const isUsernameVerified = isUsernameVerifiedFor(
    effectiveUsernameState,
    userName
  );
  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    userName.trim().length > 0 &&
    !isCheckingUsername &&
    !isSubmitting;

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
              <StepperHeader
                currentStep={currentStep}
                totalSteps={totalSteps}
                onBack={handleBack}
              />

              <FormSectionHeader
                caption="Your profile"
                title="What should we call you?"
                description="Your name helps your crew recognize you out there."
                className="mt-12 mb-8"
              />

              <View className="gap-3">
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

                <CustomInput
                  ref={lastNameRef}
                  label="Second name"
                  placeholder="Ridge"
                  value={lastName}
                  onChangeText={handleLastNameChange}
                  returnKeyType="next"
                  onSubmitEditing={() => userNameRef.current?.focus()}
                  blurOnSubmit={false}
                  error={errors.lastName}
                />

                <CustomInput
                  ref={userNameRef}
                  label="User name"
                  placeholder="alex_ridge"
                  value={userName}
                  onChangeText={handleUserNameChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
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
                        disabled={!userName.trim() || isCheckingUsername || isSubmitting}
                        textClassName="text-[12px] font-lexend-medium"
                        className="rounded-xl"
                      >
                        {isCheckingUsername ? "Checking..." : "Verify"}
                      </Button>
                    )
                  }
                />

                <View className="mt-2">
                  <InfoCard text="Your user name will be visible to people you ride with." />
                </View>
              </View>
            </View>

            <View className="mt-auto pt-6">
              <Button
                variant="tertiary"
                onPress={handleNext}
                showIcon={true}
                disabled={!isFormValid}
                loading={isSubmitting}
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
