import { Image } from "expo-image";

const Logo = () => {
  return (
    <Image
      source={require("../../../assets/logo/common/logo-full.png")}
      style={{ width: "100%", height: 50 }}
      contentFit="contain"
    />
  );
};

export default Logo;
