import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

export type IconButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "raised"
  | "ghost";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps {
  icon: ReactNode;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  hitSlop?: number;
}

const variantStyles: Record<
  IconButtonVariant,
  {
    container: string;
    loadingColor: string;
  }
> = {
  primary: {
    container: "bg-base",
    loadingColor: "#F6F6F6",
  },
  secondary: {
    container: "bg-raised", // 141414
    loadingColor: "#F6F6F6",
  },
  raised: {
    container: "bg-raised", // 141414
    loadingColor: "#F6F6F6",
  },
  tertiary: {
    container: "",
    loadingColor: "#0E0E0E",
  },
  ghost: {
    container: "bg-transparent",
    loadingColor: "#F6F6F6",
  },
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11", // 44px by 44px
  lg: "h-12 w-12",
};

export const IconButton = ({
  icon,
  onPress,
  variant = "secondary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  hitSlop = 12,
}: IconButtonProps) => {
  const isDisabled = disabled || loading;
  const styles = variantStyles[variant];
  const sizeClass = sizeStyles[size];

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withTiming(0.94, { duration: 80 });
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      scale.value = withTiming(1, { duration: 120 });
    }
  };

  const content = (
    <View className="items-center justify-center flex-1">
      {loading ? (
        <ActivityIndicator size="small" color={styles.loadingColor} />
      ) : (
        icon
      )}
    </View>
  );

  return (
    <Animated.View style={animatedStyle} className={className}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        hitSlop={hitSlop}
        className={`rounded-full overflow-hidden ${sizeClass} ${
          isDisabled ? "opacity-50" : ""
        }`}
      >
        {({ pressed }) =>
          variant === "tertiary" ? (
            <LinearGradient
              colors={["#FF6347", "#FF8A3D"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              className={`flex-1 items-center justify-center ${
                pressed ? "opacity-90" : "opacity-100"
              }`}
            >
              {content}
            </LinearGradient>
          ) : (
            <View
              className={`flex-1 items-center justify-center ${styles.container} ${
                pressed ? "opacity-80" : "opacity-100"
              }`}
            >
              {content}
            </View>
          )
        }
      </Pressable>
    </Animated.View>
  );
};

export default IconButton;
