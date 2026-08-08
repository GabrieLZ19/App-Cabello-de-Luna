import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { GlassCard } from "@/components/GlassCard";
import {
  ArrowLeft,
  Bell,
  HelpCircle,
  FileText,
  Shield,
  Check,
  ChevronRight,
} from "lucide-react-native";
import {
  registerForPushNotifications,
  unregisterPushToken,
} from "@/services/notifications.service";

let cachedPushToken: string | null = null;
// Componente Toggle Animado Elegante
const CustomSmoothSwitch = ({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (val: boolean) => void;
}) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  const toggleSwitch = () => {
    const toValue = value ? 0 : 1;
    Animated.timing(animatedValue, {
      toValue,
      duration: 250, // Duración de la transición suave
      useNativeDriver: false,
    }).start();

    onValueChange(!value);
  };

  const trackColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#26201A", "rgba(201, 164, 92, 0.35)"],
  });

  const thumbColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#897F6B", "#C9A45C"],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22], // Desplazamiento del punto
  });

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={toggleSwitch}>
      <Animated.View
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          backgroundColor: trackColor,
          padding: 2,
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <Animated.View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: thumbColor,
            transform: [{ translateX }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 3,
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [currentLang, setCurrentLang] = useState(i18n.language || "es");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    void registerForPushNotifications().then((token) => {
      if (token) {
        cachedPushToken = token;
        setNotificationsEnabled(true);
      }
    });
  }, []);

  const handleNotificationsToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (enabled) {
      const token = await registerForPushNotifications();
      cachedPushToken = token;
      if (!token) setNotificationsEnabled(false);
    } else if (cachedPushToken) {
      await unregisterPushToken(cachedPushToken);
      cachedPushToken = null;
    }
  };

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    i18n.changeLanguage(langCode);
  };

  const languages = [
    { code: "es", label: t("settings.spanish"), short: t("settings.languageCodeEs") },
    { code: "en", label: t("settings.english"), short: t("settings.languageCodeEn") },
    { code: "pt", label: t("settings.portuguese"), short: t("settings.languageCodePt") },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#0C0A07" }}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />

      {/* Header con botón atrás */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.1)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
          }}
        >
          <ArrowLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>
        <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "bold" }}>
          {t("settings.title", "Configuración")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* SECCIÓN 1: Seleccionar Idioma */}
        <Text
          style={{
            color: "#B0A894",
            fontSize: 13,
            fontWeight: "600",
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          {t("settings.languageSection", "Idioma de la aplicación")}
        </Text>

        <GlassCard
          style={{
            padding: 8,
            marginBottom: 24,
            borderRadius: 20,
            backgroundColor: "#17120D",
          }}
        >
          {languages.map((lang, index) => {
            const isSelected = currentLang.startsWith(lang.code);
            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => changeLanguage(lang.code)}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: isSelected
                    ? "rgba(201, 164, 92, 0.12)"
                    : "transparent",
                  borderWidth: isSelected ? 1 : 0,
                  borderColor: isSelected ? "#C9A45C" : "transparent",
                  marginBottom: index !== languages.length - 1 ? 4 : 0,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 36,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: isSelected
                        ? "rgba(201, 164, 92, 0.2)"
                        : "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor: isSelected
                        ? "#C9A45C"
                        : "rgba(255,255,255,0.1)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? "#C9A45C" : "#B0A894",
                        fontSize: 11,
                        fontWeight: "bold",
                        letterSpacing: 0.5,
                      }}
                    >
                      {lang.short}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: isSelected ? "#C9A45C" : "#FFFFFF",
                      fontSize: 15,
                      fontWeight: isSelected ? "bold" : "500",
                    }}
                  >
                    {lang.label}
                  </Text>
                </View>
                {isSelected && <Check color="#C9A45C" size={18} />}
              </TouchableOpacity>
            );
          })}
        </GlassCard>

        {/* SECCIÓN 2: Preferencias */}
        <Text
          style={{
            color: "#B0A894",
            fontSize: 13,
            fontWeight: "600",
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          {t("settings.preferencesSection", "PREFERENCIAS")}
        </Text>

        <GlassCard
          style={{
            padding: 16,
            marginBottom: 24,
            borderRadius: 20,
            backgroundColor: "#17120D",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "rgba(201, 164, 92, 0.12)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Bell color="#C9A45C" size={18} />
                </View>
                <Text
                  style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "500" }}
                >
                  {t("settings.notifications")}
                </Text>
              </View>
              <Text
                style={{
                  color: "#897F6B",
                  fontSize: 11,
                  marginTop: 8,
                  marginLeft: 48,
                  lineHeight: 16,
                }}
              >
                {t("settings.notificationsExpoGoHint")}
              </Text>
            </View>

            {/* Interruptor animado y fluido */}
            <CustomSmoothSwitch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
            />
          </View>
        </GlassCard>

        {/* SECCIÓN 3: Soporte y Legales */}
        <Text
          style={{
            color: "#B0A894",
            fontSize: 13,
            fontWeight: "600",
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          {t("settings.supportSection", "SOPORTE Y LEGALES")}
        </Text>

        <GlassCard
          style={{
            padding: 8,
            marginBottom: 24,
            borderRadius: 20,
            backgroundColor: "#17120D",
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 14,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <HelpCircle color="#B0A894" size={18} />
              </View>
              <Text style={{ color: "#FFFFFF", fontSize: 15 }}>
                {t("settings.helpSupport", "Ayuda y Soporte")}
              </Text>
            </View>
            <ChevronRight color="#897F6B" size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 14,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <FileText color="#B0A894" size={18} />
              </View>
              <Text style={{ color: "#FFFFFF", fontSize: 15 }}>
                {t("settings.terms", "Términos y Condiciones")}
              </Text>
            </View>
            <ChevronRight color="#897F6B" size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 14,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Shield color="#B0A894" size={18} />
              </View>
              <Text style={{ color: "#FFFFFF", fontSize: 15 }}>
                {t("settings.privacy", "Política de Privacidad")}
              </Text>
            </View>
            <ChevronRight color="#897F6B" size={18} />
          </TouchableOpacity>
        </GlassCard>

        {/* Footer Versión */}
        <Text
          style={{
            color: "#524C40",
            fontSize: 12,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          {t("settings.appVersion", "ILTCT Mobile v1.0.0")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
