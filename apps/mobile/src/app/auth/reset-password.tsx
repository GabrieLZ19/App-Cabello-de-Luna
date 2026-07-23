import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lock, Eye, EyeOff, ChevronLeft, ArrowRight, AlertCircle } from 'lucide-react-native';
import { confirmPasswordReset } from '@/services';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetEmail = (params.email as string) || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      setError('Por favor completá todos los campos.');
      return;
    }

    if (password.trim().length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verificalas.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Petición desacoplada mediante la capa de servicios (confirmPasswordReset)
      await confirmPasswordReset(targetEmail, password.trim());
      // Navegar a la pantalla de éxito dedicada (reset-success.tsx)
      router.push('/auth/reset-success');
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña.');
      setLoading(false);
    }
  };

  const getInputStyle = (inputName: string) => {
    const isFocused = focusedInput === inputName;
    return {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: isFocused ? 'rgba(201, 164, 92, 0.08)' : '#15100A',
      borderWidth: 1.5,
      borderColor: isFocused ? '#C9A45C' : error ? '#f87171' : 'rgba(255, 255, 255, 0.1)',
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
    };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0C0A07' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: '#0C0A07' }}
        >
          {/* Top Left Circular Back Arrow Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#15100A',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <ChevronLeft color="#FFFFFF" size={22} />
          </TouchableOpacity>

          {/* Lock Icon Box */}
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: '#C9A45C',
              backgroundColor: 'rgba(201, 164, 92, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <Lock color="#C9A45C" size={30} />
          </View>

          {/* Header Text */}
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
            Creá tu nueva contraseña
          </Text>
          <Text style={{ color: '#B0A894', fontSize: 14, lineHeight: 22, marginBottom: 28 }}>
            Ingresá y confirmá tu nueva clave para acceder a tu cuenta.
          </Text>

          {/* Error Alert Box */}
          {error ? (
            <View style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', borderWidth: 1, borderColor: '#f87171', borderRadius: 12, padding: 12, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
              <AlertCircle color="#f87171" size={18} style={{ marginRight: 8 }} />
              <Text style={{ color: '#f87171', fontSize: 13, flex: 1 }}>{error}</Text>
            </View>
          ) : null}

          {/* New Password Field */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#B0A894', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              NUEVA CONTRASEÑA
            </Text>
            <View style={getInputStyle('password')}>
              <Lock color={focusedInput === 'password' ? '#C9A45C' : '#897F6B'} size={18} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#524C40"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                textContentType="newPassword"
                value={password}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                onChangeText={(val) => {
                  setPassword(val);
                  if (error) setError('');
                }}
                style={{ color: '#FFFFFF', flex: 1, fontSize: 15, marginLeft: 12 }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                {showPassword ? <EyeOff color="#897F6B" size={18} /> : <Eye color="#897F6B" size={18} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password Field */}
          <View style={{ marginBottom: 28 }}>
            <Text style={{ color: '#B0A894', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              CONFIRMAR NUEVA CONTRASEÑA
            </Text>
            <View style={getInputStyle('confirmPassword')}>
              <Lock color={focusedInput === 'confirmPassword' ? '#C9A45C' : '#897F6B'} size={18} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#524C40"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                textContentType="newPassword"
                value={confirmPassword}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  if (error) setError('');
                }}
                style={{ color: '#FFFFFF', flex: 1, fontSize: 15, marginLeft: 12 }}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} activeOpacity={0.7}>
                {showConfirmPassword ? <EyeOff color="#897F6B" size={18} /> : <Eye color="#897F6B" size={18} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#C9A45C',
              paddingVertical: 16,
              borderRadius: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#C9A45C',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#0C0A07" size="small" />
            ) : (
              <>
                <Text style={{ color: '#0C0A07', fontWeight: 'bold', fontSize: 16, marginRight: 8 }}>
                  Restablecer contraseña
                </Text>
                <ArrowRight color="#0C0A07" size={20} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
