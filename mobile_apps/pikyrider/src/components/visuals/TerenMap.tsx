import Glow from "./Glow";
import Svg, {
  ClipPath,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  G,
  Circle,
} from "react-native-svg";
import { View } from "react-native";

const TerenMap = () => {
  return (
    <Svg width="100%" height={200} viewBox="0 0 342 200" fill="none">
      <Defs>
        {/* Orange gradient */}
        <LinearGradient
          id="accentGradient"
          x1="62"
          y1="107"
          x2="327"
          y2="107"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FF6347" />
          <Stop offset="1" stopColor="#FF8A3D" />
        </LinearGradient>

        {/* Point gradient */}
        <LinearGradient
          id="pointGradient"
          x1="68"
          y1="157"
          x2="80"
          y2="157"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FF6347" />
          <Stop offset="1" stopColor="#FF8A3D" />
        </LinearGradient>

        {/* Glow */}
        <RadialGradient
          id="glow"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(573.5 3.5) scale(130)"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FF8A3D" stopOpacity={0.0627} />
          <Stop offset="1" stopColor="#0E0E0E" stopOpacity={0} />
        </RadialGradient>

        <ClipPath id="clip">
          <Rect width="342" height="200" />
        </ClipPath>
      </Defs>

      <G clipPath="url(#clip)">
        {/* Background waveform */}
        <Path
          d="M-12.7579 150.827C34.3158 69.0677 72.3368 189.663 127.558 111.992C182.779 34.3198 220.8 24.0998 274.211 96.6616C327.621 169.223 355.684 184.553 402.758 103.816M-16.3789 174.333C31.6 94.6176 74.1474 212.147 134.8 135.498C195.453 58.8477 223.516 49.6497 281.453 118.124C339.389 186.597 360.211 203.971 405.474 129.366M-20 197.839C30.6947 121.19 78.6737 234.631 144.758 159.003C210.842 83.3756 230.758 73.1557 291.411 140.607C352.063 208.059 367.453 225.433 410 153.893M7.1579 54.7597C56.9474-10.6481 96.779 89.5076 146.568 38.4078C196.358-12.6921 242.526.593872 288.695 50.6717C334.863 100.75 351.158 110.97 392.8 49.6497M-5.51579 79.2877C47.8947 11.8358 92.2526 115.058 151.095 61.9137C209.937 8.76985 245.242 21.0338 297.747 72.1337C350.253 123.234 360.211 135.498 400.042 74.1777"
          stroke="#3A3A3A"
          strokeOpacity={0.8}
          fill="none"
        />

        {/* Orange route */}
        <Path
          d="M62 172C90.62 155.75 86.38 121.083 120.3 116.75C159.52 111.333 146.8 66.9167 186.02 64.75C232.66 62.5833 230.54 144.917 270.82 131.917C306.86 120 297.32 61.5 327 42"
          stroke="url(#accentGradient)"
          strokeWidth={2.5}
          fill="none"
        />

        {/* Starting point */}
        <Circle cx={65.5} cy={169.543} r={6} fill="url(#pointGradient)" />

        {/* Destination circle */}
        <Circle cx={271} cy={58} r={17} fill="#F6F6F6" />

        {/* Destination flag */}
        <Path
          d="M265.667 64.6664V52.6655C265.667 52.562 265.691 52.4599 265.738 52.3673C265.784 52.2747 265.851 52.1942 265.934 52.1321C266.626 51.6128 267.468 51.332 268.334 51.332C270.333 51.332 271.667 52.6655 273.222 52.6655C274.111 52.6655 274.792 52.4877 275.266 52.1321C275.365 52.0578 275.483 52.0126 275.606 52.0014C275.73 51.9903 275.854 52.0138 275.964 52.0691C276.075 52.1245 276.168 52.2096 276.233 52.315C276.298 52.4203 276.333 52.5417 276.333 52.6655V59.3327C276.333 59.4362 276.309 59.5383 276.262 59.6308C276.216 59.7234 276.149 59.8039 276.066 59.866C275.374 60.3854 274.532 60.6661 273.666 60.6661C271.667 60.6661 270.333 59.3327 268.334 59.3327C267.35 59.3327 266.401 59.6954 265.667 60.3514"
          stroke="#0E0E0E"
          strokeWidth={1.7}
          strokeLinecap="round"
        />

       
      </G>
    </Svg>
  );
};

export default TerenMap;
