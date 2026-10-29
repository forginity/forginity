import React from "react";
import { View, Text } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import IconButton from "@/components/ui/IconButton";

interface StepperHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  className?: string;
}

export const StepperHeader: React.FC<StepperHeaderProps> = ({
  currentStep,
  totalSteps,
  onBack,
  className = "",
}) => {
  const formattedCurrent = String(currentStep).padStart(2, "0");
  const formattedTotal = String(totalSteps).padStart(2, "0");

  return (
    <View className={`w-full gap-4 ${className}`}>
      {/* header */}
      <View className="flex-row items-center justify-between mb-4">
        <IconButton
          onPress={onBack}
          variant="secondary"
          size="md"
          icon={<ArrowLeft size={18} color="#F6F6F6" />}
        />

        <Text className="text-secondary font-lexend-medium text-caption tracking-widest">
          {formattedCurrent} / {formattedTotal}
        </Text>
      </View>

      {/* progress bars */}
      <View className="flex-row items-center gap-1.5 w-full">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompletedOrCurrent = stepNumber <= currentStep;

          return (
            <View
              key={index}
              className={`h-[3px] flex-1 rounded-full ${
                isCompletedOrCurrent ? "bg-primary" : "bg-border"
              }`}
            />
          );
        })}
      </View>
    </View>
  );
};

export default StepperHeader;
