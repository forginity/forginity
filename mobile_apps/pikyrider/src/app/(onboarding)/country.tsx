import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  View,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import StepperHeader from "@/components/ui/StepperHeader";
import FormSectionHeader from "@/components/ui/FormSectionHeader";
import CustomInput from "@/components/formElement/CustomInput";
import CountryListItem, {
  CountryItem,
} from "@/components/formElement/CountryListItem";
import Button from "@/components/ui/Button";
import { Search, Check, AlertCircle } from "lucide-react-native";
import { useOnboardingStore, COUNTRIES_DATA } from "@/store/useOnboardingStore";
import { countrySchema } from "@/lib/validation/auth";
import { mapGenderToBackend } from "@/lib/validation/onboarding-state";
import { authApiService, AuthApiError } from "@/services/auth-api.service";
import { sessionStorageService } from "@/services/session-storage.service";

export default function CountryScreen() {
  const router = useRouter();
  const {
    profile,
    gender,
    onboardingToken,
    country: storedCountry,
    setProfile,
    setCountry: setStoreCountry,
    setSessionTokens,
    setCurrentUser,
    setOnboardingToken,
  } = useOnboardingStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryItem | null>(
    storedCountry || COUNTRIES_DATA[0],
  );
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const currentStep = 5;
  const totalSteps = 5;

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COUNTRIES_DATA;
    return COUNTRIES_DATA.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const handleFinish = async () => {
    if (!selectedCountry) return;

    const result = countrySchema.safeParse(selectedCountry);
    if (!result.success) {
      setError("Please select a valid country.");
      return;
    }

    if (!onboardingToken) {
      setError("Onboarding session expired. Please sign in again.");
      return;
    }

    setIsFinishing(true);
    setError(undefined);

    try {
      const response = await authApiService.submitOnboarding(
        {
          username: profile.userName.trim().toLowerCase() || undefined,
          firstName: profile.firstName.trim() || "Rider",
          lastName: profile.lastName.trim() || "Member",
          gender: mapGenderToBackend(gender),
          country: selectedCountry.id.toUpperCase(),
        },
        onboardingToken
      );

      await sessionStorageService.saveSessionTokens(
        response.session.accessToken,
        response.session.refreshToken
      );
      setCurrentUser(response.user);
      setStoreCountry(selectedCountry);
      setOnboardingToken(null);
      setIsFinishing(false);
      setSessionTokens(
        response.session.accessToken,
        response.session.refreshToken
      );
    } catch (err: any) {
      setIsFinishing(false);
      if (err instanceof AuthApiError) {
        if (err.statusCode === 409) {
          setProfile({ isUsernameVerified: false });
        }
        setError(err.message);
      } else {
        setError(
          err?.message || "Failed to complete onboarding. Please try again."
        );
      }
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(onboarding)/gender");
    }
  };

  return (
    <SafeAreaView className="bg-canvas flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-between p-6">
            <View className="flex-1">
              {/* Stepper Header: Step 5 */}
              <StepperHeader
                currentStep={currentStep}
                totalSteps={totalSteps}
                onBack={handleBack}
              />

              {/* Form Section Header */}
              <FormSectionHeader
                caption="Home terrain"
                title="Where do you ride?"
                description="We’ll tune maps, units and local safety info."
                className="mt-12 mb-8"
              />

              {/* Search input with search icon */}
              <View className="mb-4">
                <CustomInput
                  label="Search countries"
                  placeholder="Search by country"
                  icon={<Search size={20} color="#838383" />}
                  value={searchQuery}
                  onChangeText={(val) => {
                    setSearchQuery(val);
                    if (error) setError(undefined);
                  }}
                  returnKeyType="search"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              {/* Error display */}
              {error ? (
                <View className="flex-row items-center gap-1.5 mb-3 px-1">
                  <AlertCircle size={14} color="#EF4444" />
                  <Text className="text-red-400 font-lexend-regular text-[12px]">
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Country List */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                className="flex-1"
                contentContainerStyle={{ gap: 10, paddingBottom: 16 }}
              >
                {filteredCountries.map((country) => (
                  <CountryListItem
                    key={country.id}
                    country={country}
                    isSelected={selectedCountry?.id === country.id}
                    onSelect={(c) => {
                      setSelectedCountry(c);
                      if (error) setError(undefined);
                      Keyboard.dismiss();
                    }}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Bottom Section: Finish setup with check icon */}
            <View className="pt-4">
              <Button
                variant="tertiary"
                onPress={handleFinish}
                showIcon={true}
                icon={<Check size={19} color="#0E0E0E" />}
                disabled={!selectedCountry || isFinishing}
                loading={isFinishing}
              >
                Finish setup
              </Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
