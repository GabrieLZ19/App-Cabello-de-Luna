import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';

export interface CustomAlertProps {
  visible: boolean;
  type?: 'success' | 'error' | 'info';
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export function CustomAlert({
  visible,
  type = 'success',
  title,
  message,
  buttonText = 'Aceptar',
  onClose,
}: CustomAlertProps) {
  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle color="#F87171" size={36} />;
      case 'info':
        return <Info color="#C9A45C" size={36} />;
      case 'success':
      default:
        return <CheckCircle2 color="#C9A45C" size={36} />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'error':
        return 'rgba(248, 113, 113, 0.4)';
      case 'info':
      case 'success':
      default:
        return 'rgba(201, 164, 92, 0.4)';
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            width: '100%',
            backgroundColor: '#15100A',
            borderWidth: 1,
            borderColor: getBorderColor(),
            borderRadius: 24,
            padding: 24,
            alignItems: 'center',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.6,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Icon Circle */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: type === 'error' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(201, 164, 92, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            {getIcon()}
          </View>

          {/* Title */}
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            style={{
              color: '#B0A894',
              fontSize: 14,
              lineHeight: 22,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            {message}
          </Text>

          {/* Action Button */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={{
              width: '100%',
              backgroundColor: '#C9A45C',
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#C9A45C',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ color: '#0C0A07', fontWeight: 'bold', fontSize: 15 }}>
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
