import { View } from "react-native";
import Svg, {
  Defs,
  RadialGradient as SvgRadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

interface RadialBackgroundProps {
  color?: string;
  backgroundColor?: string;
  opacity?: number;
  className?: string;
}

const RadialBackground = ({
  color = "#2A2A2A",
  backgroundColor = "#0E0E0E",
  opacity = 1,
  className = "",
}: RadialBackgroundProps) => {
  return (
    <View pointerEvents="none" className={`absolute inset-0 ${className}`}>
      <Svg width="100%" height="100%">
        <Defs>
          <SvgRadialGradient
            id="authRadialGradient"
            cx="50%"
            cy="35%"
            rx="70%"
            ry="60%"
          >
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="100%" stopColor={backgroundColor} stopOpacity={1} />
          </SvgRadialGradient>
        </Defs>

        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#authRadialGradient)"
        />
      </Svg>
    </View>
  );
};

export default RadialBackground;
