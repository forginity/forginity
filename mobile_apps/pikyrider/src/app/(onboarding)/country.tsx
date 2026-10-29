import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  View,
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
import { Search, Check } from "lucide-react-native";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { countrySchema } from "@/lib/validation/auth";

const COUNTRIES_DATA: CountryItem[] = [
  { id: "ca", name: "Canada", region: "North America", flagEmoji: "🇨🇦" },
  { id: "us", name: "United States", region: "North America", flagEmoji: "🇺🇸" },
  { id: "fr", name: "France", region: "Europe", flagEmoji: "🇫🇷" },
  { id: "ch", name: "Switzerland", region: "Europe", flagEmoji: "🇨🇭" },
  { id: "at", name: "Austria", region: "Europe", flagEmoji: "🇦🇹" },
  { id: "jp", name: "Japan", region: "Asia", flagEmoji: "🇯🇵" },
  { id: "nz", name: "New Zealand", region: "Oceania", flagEmoji: "🇳🇿" },
  { id: "no", name: "Norway", region: "Europe", flagEmoji: "🇳🇴" },
  { id: "it", name: "Italy", region: "Europe", flagEmoji: "🇮🇹" },
  { id: "in", name: "India", region: "Asia", flagEmoji: "🇮🇳" },
];

export default function CountryScreen() {
  const router = useRouter();
  const {
    country: storedCountry,
    setCountry: setStoreCountry,
    setIsAuthenticated,
  } = useOnboardingStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryItem | null>(
    storedCountry || COUNTRIES_DATA[0],
  );
  const [isFinishing, setIsFinishing] = useState(false);

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

  const handleFinish = () => {
    if (!selectedCountry) return;

    const result = countrySchema.safeParse(selectedCountry);
    if (!result.success) return;

    setIsFinishing(true);
    setStoreCountry(selectedCountry);
    setIsAuthenticated(true);
    setIsFinishing(false);

    router.replace("/(app)");
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
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

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
