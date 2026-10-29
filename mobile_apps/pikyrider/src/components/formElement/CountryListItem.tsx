import React from "react";
import { Pressable, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export interface CountryItem {
  id: string;
  name: string;
  region: string;
  flagEmoji?: string;
  flagUrl?: string;
}

export interface CountryListItemProps {
  country: CountryItem;
  isSelected: boolean;
  onSelect: (country: CountryItem) => void;
  className?: string;
}

export const CountryListItem: React.FC<CountryListItemProps> = ({
  country,
  isSelected,
  onSelect,
  className = "",
}) => {
  return (
    <Pressable
      onPress={() => onSelect(country)}
      className={`bg-raised rounded-[18px] p-2.5 flex-row items-center justify-between active:opacity-85 ${className}`}
    >
      {/* Left side: Avatar + Names */}
      <View className="flex-row items-center flex-1 pr-4">
        {/* Circle white avatar with country flag/logo (34 by 34, pr 16) */}
        <View className="h-[34px] w-[34px] rounded-full bg-white items-center justify-center mr-4 overflow-hidden">
          <Text className="text-[20px] text-center leading-[24px]">
            {country.flagEmoji || "🌐"}
          </Text>
        </View>

        {/* Name and Region (top and down) */}
        <View className="flex-1 justify-center">
          <Text className="text-primary font-lexend-medium text-[15px] leading-5">
            {country.name}
          </Text>
          <Text className="text-muted font-lexend-regular text-[12px] leading-4 mt-0.5">
            {country.region}
          </Text>
        </View>
      </View>

      {/* Right side: Single Select Checkbox */}
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          overflow: "hidden",
          borderWidth: isSelected ? 0 : 2,
          borderColor: "#3A3A3A",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 6,
        }}
      >
        {isSelected ? (
          <LinearGradient
            colors={["#FF6347", "#FF8A3D"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={16} color="#0E0E0E" strokeWidth={3} />
          </LinearGradient>
        ) : null}
      </View>
    </Pressable>
  );
};

export default CountryListItem;
