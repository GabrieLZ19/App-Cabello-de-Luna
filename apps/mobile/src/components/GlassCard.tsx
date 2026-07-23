import React from 'react';
import { View, ViewProps } from 'react-native';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  style,
  ...props
}) => {
  return (
    <View
      style={[
        {
          backgroundColor: 'rgba(23, 18, 13, 0.92)',
          borderWidth: 1,
          borderColor: 'rgba(201, 164, 92, 0.18)',
          borderRadius: 24,
        },
        style,
      ]}
      className={`p-5 shadow-xl ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
