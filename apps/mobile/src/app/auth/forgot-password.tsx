import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  KeyRound,
  Mail,
  ChevronLeft,
  Send,
  ArrowLeft,
  AlertCircle,
} from "lucide-react-native";
import { requestPasswordReset } from "@/services";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSendResetCode = async () => {
    if (!email.trim()) {
      setError(t("auth.requiredEmailError"));
      return;
    }

    setError("");
    setLoading(true);

    try {
      await requestPasswordReset(email.trim());
      router.push({
        pathname: "/auth/verify",
        params: { email: email.trim(), mode: "reset-password" },
      });
    } catch (err: any) {
      setError(
        err.message || "Error al procesar la solicitud con el servidor.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = () => {
    const isFocused = focusedInput === "email";
    return {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      backgroundColor: isFocused ? "rgba(201, 164, 92, 0.08)" : "#15100A",
      borderWidth: 1.5,
      borderColor: isFocused
        ? "#C9A45C"
        : error
          ? "#f87171"
          : "rgba(255, 255, 255, 0.1)",
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
    };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0A07" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: "#0C0A07" }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#15100A",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <ChevronLeft color="#FFFFFF" size={22} />
          </TouchableOpacity>

          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "#C9A45C",
              backgroundColor: "rgba(201, 164, 92, 0.1)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <KeyRound color="#C9A45C" size={30} />
          </View>

          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 28,
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            {t("auth.forgotPasswordTitle")}
          </Text>
          <Text
            style={{
              color: "#B0A894",
              fontSize: 14,
              lineHeight: 22,
              marginBottom: 28,
            }}
          >
            {t("auth.forgotPasswordSubtitle")}
          </Text>

          {error ? (
            <View
              style={{
                backgroundColor: "rgba(248, 113, 113, 0.1)",
                borderWidth: 1,
                borderColor: "#f87171",
                borderRadius: 12,
                padding: 12,
                marginBottom: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <AlertCircle
                color="#f87171"
                size={18}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: "#f87171", fontSize: 13, flex: 1 }}>
                {error}
              </Text>
            </View>
          ) : null}

          <View style={{ marginBottom: 28 }}>
            <Text
              style={{
                color: "#B0A894",
                fontSize: 12,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              {t("auth.emailLabel")}
            </Text>
            <View style={getInputStyle()}>
              <Mail
                color={focusedInput === "email" ? "#C9A45C" : "#897F6B"}
                size={18}
              />
              <TextInput
                placeholder={t("auth.emailPlaceholder")}
                placeholderTextColor="#524C40"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
                onChangeText={(val) => {
                  setEmail(val);
                  if (error) setError("");
                }}
                style={{
                  color: "#FFFFFF",
                  flex: 1,
                  fontSize: 15,
                  marginLeft: 12,
                }}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSendResetCode}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#C9A45C",
              paddingVertical: 16,
              borderRadius: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#C9A45C",
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
                <Send color="#0C0A07" size={18} style={{ marginRight: 8 }} />
                <Text
                  style={{ color: "#0C0A07", fontWeight: "bold", fontSize: 16 }}
                >
                  {t("auth.sendLinkButton")}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => router.push("/auth/login")}
              activeOpacity={0.7}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <ArrowLeft color="#B0A894" size={16} style={{ marginRight: 6 }} />
              <Text
                style={{ color: "#B0A894", fontSize: 14, fontWeight: "600" }}
              >
                {t("auth.backToLogin")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
