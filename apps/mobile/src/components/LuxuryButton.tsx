import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface LuxuryButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'gold' | 'glass' | 'outline';
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export const LuxuryButton: React.FC<LuxuryButtonProps> = ({
  title,
  variant = 'gold',
  loading = false,
  disabled,
  className = '',
  textClassName = '',
  style,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'gold':
        return {
          backgroundColor: '#C9A45C',
          shadowColor: '#C9A45C',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.6,
          shadowRadius: 16,
          elevation: 8,
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(23, 18, 13, 0.85)',
          borderWidth: 1,
          borderColor: 'rgba(201, 164, 92, 0.4)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: '#C9A45C',
        };
    }
  };

  const getTextColor = () => {
    return variant === 'gold' ? '#0C0A07' : '#FFFFFF';
  };

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      style={[
        {
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        },
        getVariantStyle(),
        style,
      ]}
      className={`active:opacity-80 ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={{
            color: getTextColor(),
            fontSize: 16,
            fontWeight: 'bold',
            letterSpacing: 0.5,
          }}
          className={textClassName}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
