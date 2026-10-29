import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import StepperHeader from "@/components/ui/StepperHeader";
import FormSectionHeader from "@/components/ui/FormSectionHeader";
import SelectionCard, {
  SelectionCardOption,
} from "@/components/formElement/SelectionCard";
import Button from "@/components/ui/Button";
import { User, Sparkles, HelpCircle } from "lucide-react-native";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { genderSchema } from "@/lib/validation/auth";

export default function GenderScreen() {
  const router = useRouter();
  const { gender, setGender: setStoreGender } = useOnboardingStore();
  const [selectedGender, setSelectedGender] = useState<string>(gender || "man");

  const currentStep = 4;
  const totalSteps = 5;

  const options: SelectionCardOption[] = [
    {
      id: "man",
      label: "Man",
      description: "He / Him",
      icon: (
        <User
          size={20}
          color={selectedGender === "man" ? "#0E0E0E" : "#F6F6F6"}
        />
      ),
    },
    {
      id: "woman",
      label: "Woman",
      description: "She / Her",
      icon: (
        <User
          size={20}
          color={selectedGender === "woman" ? "#0E0E0E" : "#F6F6F6"}
        />
      ),
    },
    {
      id: "nonbinary",
      label: "Nonbinary",
      description: "They / Them",
      icon: (
        <Sparkles
          size={20}
          color={selectedGender === "nonbinary" ? "#0E0E0E" : "#F6F6F6"}
        />
      ),
    },
    {
      id: "prefer_not_to_say",
      label: "Prefer not to say",
      description: "Private",
      icon: (
        <HelpCircle
          size={20}
          color={selectedGender === "prefer_not_to_say" ? "#0E0E0E" : "#F6F6F6"}
        />
      ),
    },
  ];

  const handleNext = () => {
    const result = genderSchema.safeParse(selectedGender);
    if (!result.success) return;

    setStoreGender(selectedGender);
    router.push("/(onboarding)/country");
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(onboarding)/profile");
    }
  };

  return (
    <SafeAreaView className="bg-canvas flex-1 p-6">
      <View className="flex-1 justify-between">
        <View>
          {/* Stepper Header: Step 4 */}
          <StepperHeader
            currentStep={currentStep}
            totalSteps={totalSteps}
            onBack={handleBack}
          />

          {/* Form Section Header */}
          <FormSectionHeader
            caption="Make it yours"
            title="How do you identify?"
            description="This helps us shape a more personal Powder experience."
            className="mt-12 mb-8"
          />

          {/* 2x2 Grid of Selection Cards */}
          <View className="gap-3.5">
            {/* Row 1 */}
            <View className="flex-row gap-3.5">
              <SelectionCard
                option={options[0]}
                isSelected={selectedGender === options[0].id}
                onSelect={setSelectedGender}
              />
              <SelectionCard
                option={options[1]}
                isSelected={selectedGender === options[1].id}
                onSelect={setSelectedGender}
              />
            </View>

            {/* Row 2 */}
            <View className="flex-row gap-3.5">
              <SelectionCard
                option={options[2]}
                isSelected={selectedGender === options[2].id}
                onSelect={setSelectedGender}
              />
              <SelectionCard
                option={options[3]}
                isSelected={selectedGender === options[3].id}
                onSelect={setSelectedGender}
              />
            </View>
          </View>
        </View>

        {/* Bottom CTA */}
        <View className="mt-auto pt-6">
          <Button
            variant="tertiary"
            onPress={handleNext}
            showIcon={true}
            disabled={!selectedGender}
          >
            Next
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
