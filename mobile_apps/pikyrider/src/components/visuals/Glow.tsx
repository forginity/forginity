import React from "react";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";

type GlowProps = {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
};

const Glow = ({
  size = 260,
  color = "#FF8A3D",
  opacity = 0.08,
  className = "",
}: GlowProps) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      fill="none"
      className={className}
    >
      <Defs>
        <RadialGradient
          id="glow"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(130 130) scale(130)"
        >
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Circle cx="130" cy="130" r="130" fill="url(#glow)" />
    </Svg>
  );
};

export default Glow;
