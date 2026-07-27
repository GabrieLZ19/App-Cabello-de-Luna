import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text
          style={{
            color: "#B0A894",
            fontSize: 13,
            marginBottom: 6,
            fontWeight: "500",
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor="#897F6B"
        style={[
          {
            backgroundColor: "#15100A",
            borderWidth: 1,
            borderColor: error ? "#f87171" : "rgba(255, 255, 255, 0.1)",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: "#FFFFFF",
            fontSize: 15,
          },
          style,
        ]}
        {...props}
      />
      {error && (
        <Text style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
};
