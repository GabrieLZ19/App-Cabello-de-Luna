import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, Info, ArrowRight, AlertCircle } from 'lucide-react-native';
import { loginUser, storage } from '@/services';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('sofia@instituto.com');
  const [password, setPassword] = useState('Student123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresá tu correo y contraseña.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const response = await loginUser(email, password);
      console.log('Login exitoso:', response.user.fullName);

      // Persistir token y datos de usuario en SecureStore
      if (response.accessToken) {
        await storage.setToken(response.accessToken);
        await storage.setUserData(response.user);
      }

      // Redirigir a Tabs principal tras login exitoso
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0C0A07' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 20 }}
        style={{ backgroundColor: '#0C0A07' }}
      >
        {/* Header Logo */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Image
              source={require('../../../assets/brand/icono_redondo_anillo_1024.png')}
              style={{ width: 44, height: 44, marginRight: 10 }}
              resizeMode="contain"
            />
            <Text style={{ color: '#C9A45C', fontSize: 24, fontWeight: 'bold', letterSpacing: 2 }}>
              ILTCT
            </Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
            Bienvenida de nuevo
          </Text>
          <Text style={{ color: '#B0A894', fontSize: 14, textAlign: 'center' }}>
            Ingresá con tu cuenta del instituto.
          </Text>
        </View>

        {/* Error Alert Message */}
        {errorMessage ? (
          <View style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', borderWidth: 1, borderColor: '#f87171', borderRadius: 12, padding: 12, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
            <AlertCircle color="#f87171" size={18} style={{ marginRight: 8 }} />
            <Text style={{ color: '#f87171', fontSize: 13, flex: 1 }}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Form Fields */}
        <View style={{ marginBottom: 24 }}>
          {/* Email Field */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#B0A894', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              EMAIL
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#15100A', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
              <Mail color="#897F6B" size={18} />
              <TextInput
                placeholder="mariana@instituto.com"
                placeholderTextColor="#524C40"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errorMessage) setErrorMessage('');
                }}
                style={{ color: '#FFFFFF', flex: 1, fontSize: 15, marginLeft: 12 }}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#B0A894', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              CONTRASEÑA
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#15100A', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
              <Lock color="#897F6B" size={18} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#524C40"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                keyboardType="default"
                textContentType="password"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errorMessage) setErrorMessage('');
                }}
                style={{ color: '#FFFFFF', flex: 1, fontSize: 15, marginLeft: 12 }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                {showPassword ? <EyeOff color="#897F6B" size={18} /> : <Eye color="#897F6B" size={18} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity 
            onPress={() => router.push('/auth/forgot-password')} 
            activeOpacity={0.7}
            style={{ alignItems: 'flex-end', paddingTop: 4 }}
          >
            <Text style={{ color: '#C9A45C', fontSize: 12, fontWeight: '600' }}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleLogin}
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
            marginBottom: 24,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#0C0A07" size="small" />
          ) : (
            <>
              <Text style={{ color: '#0C0A07', fontWeight: 'bold', fontSize: 16, marginRight: 8 }}>
                Ingresar
              </Text>
              <ArrowRight color="#0C0A07" size={20} />
            </>
          )}
        </TouchableOpacity>

        {/* Secondary Register Link */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity 
            onPress={() => router.push('/auth/register')} 
            activeOpacity={0.7}
            style={{ flexDirection: 'row' }}
          >
            <Text style={{ color: '#B0A894', fontSize: 13 }}>¿Primera vez? </Text>
            <Text style={{ color: '#C9A45C', fontSize: 13, fontWeight: 'bold' }}>Activá tu inscripción</Text>
          </TouchableOpacity>
        </View>

        {/* Info Notice Box */}
        <View style={{ backgroundColor: '#15100A', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'flex-start' }}>
          <Info color="#C9A45C" size={18} style={{ marginTop: 2, marginRight: 10 }} />
          <Text style={{ color: '#B0A894', fontSize: 12, lineHeight: 18, flex: 1 }}>
            El acceso es por franquicia. Registrate con el código de inscripción que te dio tu instituto.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
