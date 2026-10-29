import React from "react";
import { View, Text } from "react-native";

interface FormSectionHeaderProps {
  caption?: string;
  title: string;
  description?: string;
  className?: string;
}

export const FormSectionHeader: React.FC<FormSectionHeaderProps> = ({
  caption,
  title,
  description,
  className = "",
}) => {
  return (
    <View className={className}>
      {caption ? (
        <Text className="text-secondary font-lexend-medium text-caption uppercase tracking-widest mb-3 ">
          {caption}
        </Text>
      ) : null}

      <Text
        className={`text-display-lg text-primary font-lexend-light ${
          caption ? "mt-2" : ""
        }`}
      >
        {title}
      </Text>

      {description ? (
        <Text className="text-body-sm text-muted font-lexend-regular mt-3 leading-5 ">
          {description}
        </Text>
      ) : null}
    </View>
  );
};

export default FormSectionHeader;
