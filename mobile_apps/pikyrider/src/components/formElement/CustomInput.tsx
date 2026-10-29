import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View, Text, TextInput, TextInputProps, Pressable } from "react-native";
import { AlertCircle } from "lucide-react-native";

export interface CustomInputProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  onPressContainer?: () => void;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export const CustomInput = forwardRef<TextInput, CustomInputProps>(
  (
    {
      label,
      icon,
      rightElement,
      className = "",
      containerClassName = "",
      onPressContainer,
      error,
      success,
      helperText,
      onFocus,
      onBlur,
      ...inputProps
    },
    ref
  ) => {
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

    useImperativeHandle(ref, () => inputRef.current as TextInput);

    const handlePress = () => {
      inputRef.current?.focus();
      onPressContainer?.();
    };

    const hasError = Boolean(error);
    const borderClasses = hasError
      ? "border border-red-500/70"
      : isFocused
      ? "border border-accent-warm/50"
      : "border border-transparent";

    return (
      <View className={`w-full ${containerClassName}`}>
        <Pressable
          onPress={handlePress}
          className={`bg-raised rounded-[18px] p-4 flex-row items-center gap-3.5 ${borderClasses} ${className}`}
        >
          {icon ? (
            <View className="items-center justify-center">{icon}</View>
          ) : null}

          <View className="flex-1 justify-center">
            <Text className="text-secondary font-lexend-regular text-[11px] capitalize tracking-wider mb-1.5">
              {label}
            </Text>
            <TextInput
              ref={inputRef}
              placeholderTextColor="#616161"
              className="text-primary font-lexend-regular text-[16px] p-0 leading-5"
              selectionColor="#FF8A3D"
              autoCapitalize="none"
              onFocus={(e) => {
                setIsFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              {...inputProps}
            />
          </View>

          {rightElement ? (
            <View className="items-center justify-center ml-2">
              {rightElement}
            </View>
          ) : null}
        </Pressable>

        {hasError ? (
          <View className="flex-row items-center gap-1.5 mt-1.5 px-2">
            <AlertCircle size={13} color="#EF4444" />
            <Text className="text-red-400 font-lexend-regular text-[12px]">
              {error}
            </Text>
          </View>
        ) : helperText ? (
          <Text className="text-muted font-lexend-regular text-[12px] mt-1.5 px-2">
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  }
);

CustomInput.displayName = "CustomInput";

export default CustomInput;
