import React from "react";
import { View, Text } from "react-native";
import { Info } from "lucide-react-native";

export interface InfoCardProps {
  text: string;
  icon?: React.ReactNode;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  text,
  icon = <Info size={18} color="#838383" />,
  className = "",
}) => {
  return (
    <View
      className={`bg-raised rounded-[18px] p-4 flex-row items-center gap-3.5 ${className}`}
    >
      {icon ? (
        <View className="items-center justify-center">{icon}</View>
      ) : null}

      <Text className="flex-1 text-muted font-lexend-regular text-[13px] leading-5">
        {text}
      </Text>
    </View>
  );
};

export default InfoCard;
