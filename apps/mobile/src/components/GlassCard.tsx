import React from "react";
import { View, ViewProps } from "react-native";

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <View
      style={[
        {
          backgroundColor: "rgba(23, 18, 13, 0.92)",
          borderWidth: 1,
          borderColor: "rgba(201, 164, 92, 0.18)",
          borderRadius: 24,
          padding: 20,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 15,
          elevation: 8,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};
