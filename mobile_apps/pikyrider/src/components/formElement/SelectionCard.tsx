import React from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export interface SelectionCardOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface SelectionCardProps {
  option: SelectionCardOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
  className?: string;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  option,
  isSelected,
  onSelect,
  className = "",
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 120 });
  };

  const innerContent = (
    <View
      style={{
        flex: 1,
        minHeight: 124,
        padding: 16,
        justifyContent: "space-between",
      }}
    >
      {/* Top row: Icon */}
      {option.icon ? (
        <View
          className={`h-10 w-10 rounded-full items-center justify-center ${
            isSelected ? "bg-black/15" : "bg-interactive"
          }`}
        >
          {option.icon}
        </View>
      ) : (
        <View className="h-10 w-10" />
      )}

      {/* Bottom text */}
      <View style={{ marginTop: 12 }}>
        <Text
          className={`font-lexend-regular text-[14px] ${
            isSelected ? "text-accent-foreground" : "text-primary"
          }`}
        >
          {option.label}
        </Text>
        {option.description ? (
          <Text
            className={`font-lexend-light text-[11px] mt-1 ${
              isSelected ? "text-accent-foreground/75" : "text-muted"
            }`}
          >
            {option.description}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]} className={className}>
      <Pressable
        onPress={() => onSelect(option.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          borderRadius: 18,
          overflow: "hidden",
          width: "100%",
          backgroundColor: isSelected ? undefined : "#141414",
        }}
      >
        {isSelected ? (
          <LinearGradient
            colors={["#FF6347", "#FF8A3D"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ width: "100%" }}
          >
            {innerContent}
          </LinearGradient>
        ) : (
          <View style={{ width: "100%", backgroundColor: "#141414" }}>
            {innerContent}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default SelectionCard;
