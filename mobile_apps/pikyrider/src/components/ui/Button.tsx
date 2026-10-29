import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";
type ButtonIconPosition = "left" | "right";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  onPress: () => void;
  icon?: ReactNode;
  showIcon?: boolean;
  iconPosition?: ButtonIconPosition;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

const variantStyles = {
  primary: {
    container: "bg-base",
    text: "text-secondary",
    iconContainer: "bg-primary/10",
    iconColor: "#F6F6F6",
  },

  secondary: {
    container: "bg-interactive",
    text: "text-primary",
    iconContainer: "bg-primary/10",
    iconColor: "#F6F6F6",
  },

  tertiary: {
    container: "",
    text: "text-accent-foreground",
    iconContainer: "bg-accent-foreground/10",
    iconColor: "#0E0E0E",
  },

  ghost: {
    container: "bg-transparent",
    text: "text-primary",
    iconContainer: "bg-transparent",
    iconColor: "#F6F6F6",
  },
} satisfies Record<ButtonVariant, object>;

export const Button = ({
  children,
  onPress,
  icon,
  showIcon = false,
  iconPosition = "right",
  variant = "primary",
  size = "lg",
  disabled = false,
  loading = false,
  className = "",
  textClassName = "",
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  const styles = variantStyles[variant];

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withTiming(0.98, { duration: 80 });
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      scale.value = withTiming(1, { duration: 120 });
    }
  };

  const iconElement = loading ? (
    <ActivityIndicator size="small" color={styles.iconColor} />
  ) : (
    (icon ?? <ArrowRight size={19} color={styles.iconColor} />)
  );

  const minHeightClass =
    variant === "ghost"
      ? size === "sm"
        ? "min-h-8"
        : size === "md"
          ? "min-h-10"
          : "min-h-12"
      : size === "sm"
        ? "min-h-10"
        : size === "md"
          ? "min-h-12"
          : "min-h-16";

  const paddingXClass =
    variant === "ghost"
      ? "px-2"
      : size === "sm"
      ? "px-3.5"
      : size === "md"
      ? "px-4"
      : "px-6";

  const content = ({ pressed }: { pressed: boolean }) => (
    <View
      className={`${minHeightClass} ${paddingXClass} flex-row items-center ${
        showIcon ? "justify-between" : "justify-center"
      } ${pressed ? "opacity-80" : "opacity-100"} ${
        isDisabled ? "opacity-50" : ""
      }`}
    >
      {showIcon && iconPosition === "left" && (
        <View
          className={`mr-3 h-8 w-8 items-center justify-center rounded-full ${styles.iconContainer}`}
        >
          {iconElement}
        </View>
      )}

      <Text
        className={`font-lexend-medium text-label-lg ${styles.text} ${textClassName}`}
      >
        {children}
      </Text>

      {showIcon && iconPosition === "right" && (
        <View
          className={`ml-3 h-8 w-8 items-center justify-center rounded-full ${styles.iconContainer}`}
        >
          {iconElement}
        </View>
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
        className="overflow-hidden rounded-full"
      >
        {({ pressed }) =>
          variant === "tertiary" ? (
            <LinearGradient
              colors={["#FF6347", "#FF8A3D"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            >
              {content({ pressed })}
            </LinearGradient>
          ) : (
            <View className={styles.container}>{content({ pressed })}</View>
          )
        }
      </Pressable>
    </Animated.View>
  );
};

export default Button;
