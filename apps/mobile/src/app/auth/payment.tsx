import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { CreditCard, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { DESIGN_TOKENS } from '@iltct/shared';

export default function PaymentScreen() {
  const router = useRouter();
  const [currency, setCurrency] = useState<'MXN' | 'USD'>('MXN');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'MERCADOPAGO' | 'TRANSFER'>('CARD');
  const [loading, setLoading] = useState(false);

  const isMXN = currency === 'MXN';
  const enrollmentAmount = isMXN ? DESIGN_TOKENS.pricing.enrollmentMXN : DESIGN_TOKENS.pricing.enrollmentUSD;
  const tuitionAmount = isMXN ? DESIGN_TOKENS.pricing.tuitionMXN : DESIGN_TOKENS.pricing.tuitionUSD;
  const totalAmount = enrollmentAmount + tuitionAmount;
  const currencySymbol = isMXN ? '$' : 'USD $';

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/auth/verify');
    }, 1200);
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ backgroundColor: '#0C0A07' }}
      className="px-6 py-10"
    >
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />

      {/* Back Navigation */}
      <TouchableOpacity 
        onPress={() => router.back()} 
        className="flex-row items-center space-x-2 my-4"
        activeOpacity={0.7}
      >
        <ArrowLeft color="#C9A45C" size={20} />
        <Text className="text-[#C9A45C] text-sm font-semibold">Volver</Text>
      </TouchableOpacity>

      {/* Header */}
      <View className="mb-6">
        <View className="flex-row items-center space-x-3 mb-4">
          <Image
            source={require('../../../assets/brand/icono_redondo_anillo_1024.png')}
            style={{ width: 36, height: 36 }}
            resizeMode="contain"
          />
          <Text className="text-[#C9A45C] text-xl font-bold tracking-widest">
            ILTCT
          </Text>
        </View>
        <Text className="text-white text-3xl font-bold mb-2">
          Pago de Inscripción
        </Text>
        <Text className="text-[#B0A894] text-sm">
          Completá el pago para activar tu acceso a las clases y módulos del instituto.
        </Text>
      </View>

      {/* Currency Switcher */}
      <View className="flex-row bg-[#15100A] rounded-xl p-1 mb-6 border border-white/10">
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg items-center ${
            isMXN ? 'bg-[#C9A45C]' : 'bg-transparent'
          }`}
          onPress={() => setCurrency('MXN')}
          activeOpacity={0.8}
        >
          <Text className={`font-bold text-xs ${isMXN ? 'text-[#0C0A07]' : 'text-[#B0A894]'}`}>
            MXN ($ Pesos Mexicanos)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-lg items-center ${
            !isMXN ? 'bg-[#C9A45C]' : 'bg-transparent'
          }`}
          onPress={() => setCurrency('USD')}
          activeOpacity={0.8}
        >
          <Text className={`font-bold text-xs ${!isMXN ? 'text-[#0C0A07]' : 'text-[#B0A894]'}`}>
            USD ($ Dólares US)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Price Breakdown Card */}
      <View className="bg-[#15100A] border border-white/10 rounded-2xl p-5 mb-6">
        <Text className="text-[#C9A45C] text-xs font-bold uppercase tracking-wider mb-4">
          DESGLOSE DE MATRÍCULA Y ACCESO
        </Text>

        <View className="flex-row justify-between mb-3 pb-3 border-b border-white/10">
          <Text className="text-white text-sm">Inscripción Única de Ingreso</Text>
          <Text className="text-[#C9A45C] text-sm font-bold">
            {currencySymbol} {enrollmentAmount.toLocaleString()}
          </Text>
        </View>

        <View className="flex-row justify-between mb-4 pb-3 border-b border-white/10">
          <Text className="text-white text-sm">Programa Completo (17 meses)</Text>
          <Text className="text-[#C9A45C] text-sm font-bold">
            {currencySymbol} {tuitionAmount.toLocaleString()}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-white text-lg font-bold">Total a Pagar</Text>
          <Text className="text-[#C9A45C] text-2xl font-bold">
            {currencySymbol} {totalAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Payment Method Selector */}
      <Text className="text-[#B0A894] text-xs font-semibold uppercase tracking-wider mb-3">
        MÉTODO DE PAGO
      </Text>
      <View className="space-y-3 mb-6">
        {[
          { id: 'CARD', label: 'Tarjeta de Crédito / Débito', icon: CreditCard },
          { id: 'MERCADOPAGO', label: 'MercadoPago / SPEI', icon: CheckCircle2 },
          { id: 'TRANSFER', label: 'Transferencia Bancaria Directa', icon: ShieldCheck },
        ].map((item) => {
          const IconComp = item.icon;
          const isSelected = paymentMethod === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setPaymentMethod(item.id as any)}
              activeOpacity={0.8}
              className={`flex-row items-center justify-between p-4 rounded-xl border ${
                isSelected 
                  ? 'bg-[#1F1912] border-[#C9A45C]' 
                  : 'bg-[#15100A] border-white/10'
              }`}
            >
              <div className="flex-row items-center space-x-3">
                <IconComp color={isSelected ? '#C9A45C' : '#897F6B'} size={20} />
                <Text className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-[#B0A894]'}`}>
                  {item.label}
                </Text>
              </div>
              <View className={`w-5 h-5 rounded-full border items-center justify-center ${
                isSelected ? 'border-[#C9A45C] bg-[#C9A45C]' : 'border-white/20'
              }`}>
                {isSelected && <View className="w-2 h-2 rounded-full bg-[#0C0A07]" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handlePay}
        disabled={loading}
        activeOpacity={0.85}
        className="bg-[#C9A45C] py-4 rounded-xl flex-row items-center justify-center space-x-2 shadow-lg mb-8"
      >
        <Text className="text-[#0C0A07] font-bold text-base">
          {loading ? 'Procesando Pago...' : 'Confirmar y Pagar'}
        </Text>
        <ArrowRight color="#0C0A07" size={20} />
      </TouchableOpacity>
    </ScrollView>
  );
}
