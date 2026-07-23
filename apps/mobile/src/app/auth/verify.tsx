import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ShieldCheck, ChevronLeft, Check, AlertCircle, RefreshCw } from 'lucide-react-native';
import { verifyOtpCode, resendOtpCode, storage } from '@/services';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetEmail = (params.email as string) || 'mariana@instituto.com';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(45);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Temporizador regresivo en tiempo real (45 segundos)
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleDigitChange = (text: string, index: number) => {
    const newDigits = [...digits];
    newDigits[index] = text;
    setDigits(newDigits);
    if (error) setError('');

    // Auto-avance a la siguiente casilla
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (secondsLeft > 0 || resending) return;

    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      const res = await resendOtpCode(targetEmail);
      setSuccessMsg('Código reenviado con éxito a tu casilla.');
      setSecondsLeft(45); // Reiniciar temporizador a 45 segundos
    } catch (err: any) {
      setError(err.message || 'Error reenviando el código de verificación.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length < 6) {
      setError('Por favor ingresá los 6 dígitos del código de verificación.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await verifyOtpCode(targetEmail, code);
      console.log('Cuenta verificada con éxito:', response.user.fullName);

      if (response.accessToken) {
        await storage.setToken(response.accessToken);
        await storage.setUserData(response.user);
      }

      // Redirigir según el flujo (Recuperación de contraseña vs Registro inicial)
      if (params.mode === 'reset-password') {
        router.push({
          pathname: '/auth/reset-password',
          params: { email: targetEmail },
        });
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (err: any) {
      setError(err.message || 'El código de verificación es incorrecto.');
    } finally {
      setLoading(false);
    }
  };

  const formattedTime = `00:${secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0C0A07' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 20 }}
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

        {/* Shield Icon Box matching 04_VerificarCuenta.png */}
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
          <ShieldCheck color="#C9A45C" size={30} />
        </View>

        {/* Header Text matching 04_VerificarCuenta.png */}
        <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
          Verificá tu cuenta
        </Text>
        <Text style={{ color: '#B0A894', fontSize: 14, lineHeight: 22, marginBottom: 24 }}>
          Ingresá el código de 6 dígitos que enviamos a{' '}
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{targetEmail}</Text>
        </Text>

        {/* Error Alert Box */}
        {error ? (
          <View style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', borderWidth: 1, borderColor: '#f87171', borderRadius: 12, padding: 12, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
            <AlertCircle color="#f87171" size={18} style={{ marginRight: 8 }} />
            <Text style={{ color: '#f87171', fontSize: 13, flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        {/* Success Alert Box */}
        {successMsg ? (
          <View style={{ backgroundColor: 'rgba(201, 164, 92, 0.15)', borderWidth: 1, borderColor: '#C9A45C', borderRadius: 12, padding: 12, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
            <Check color="#C9A45C" size={18} style={{ marginRight: 8 }} />
            <Text style={{ color: '#C9A45C', fontSize: 13, flex: 1 }}>{successMsg}</Text>
          </View>
        ) : null}

        {/* 6 Digit Input Boxes matching 04_VerificarCuenta.png */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 }}>
          {digits.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              value={digit}
              onChangeText={(text) => handleDigitChange(text, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              style={{
                width: 48,
                height: 56,
                borderRadius: 14,
                backgroundColor: '#15100A',
                borderWidth: 1.5,
                borderColor: digit ? '#C9A45C' : error ? '#f87171' : 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                fontSize: 22,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            />
          ))}
        </View>

        {/* Real Countdown & Resend Option matching 04_VerificarCuenta.png */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          {secondsLeft > 0 ? (
            <Text style={{ color: '#B0A894', fontSize: 13, textAlign: 'center' }}>
              ¿No lo recibiste?{' '}
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Reenviar en {formattedTime}</Text>
            </Text>
          ) : (
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={resending}
              activeOpacity={0.7}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              {resending ? (
                <ActivityIndicator color="#C9A45C" size="small" style={{ marginRight: 8 }} />
              ) : (
                <RefreshCw color="#C9A45C" size={16} style={{ marginRight: 6 }} />
              )}
              <Text style={{ color: '#C9A45C', fontSize: 14, fontWeight: 'bold' }}>
                Reenviar código de verificación
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Primary Verification Button matching 04_VerificarCuenta.png */}
        <TouchableOpacity
          onPress={handleVerify}
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
                Verificar
              </Text>
              <Check color="#0C0A07" size={20} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
