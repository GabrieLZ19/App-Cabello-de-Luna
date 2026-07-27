import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
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
  User,
  Mail,
  Ticket,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react-native";
import { validateFranchiseCode, registerStudent } from "@/services";

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!code.trim()) {
      setError(t("auth.requiredCodeError"));
      return;
    }
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError(t("auth.requiredFieldsError"));
      return;
    }

    setError("");
    setLoading(true);

    try {
      await validateFranchiseCode(code.trim());

      const response = await registerStudent({
        email: email.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        franchiseCode: code.trim(),
      });

      console.log("Registro exitoso:", response.user.fullName);

      router.push({
        pathname: "/auth/verify",
        params: { email: email.trim() },
      });
    } catch (err: any) {
      setError(err.message || "Error al procesar el registro con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (inputName: string) => {
    const isFocused = focusedInput === inputName;
    return {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      backgroundColor: isFocused ? "rgba(201, 164, 92, 0.08)" : "#15100A",
      borderWidth: 1.5,
      borderColor: isFocused ? "#C9A45C" : "rgba(255, 255, 255, 0.1)",
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
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: "#0C0A07" }}
        >
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Image
              source={require("../../../assets/brand/icono_redondo_anillo_1024.png")}
              style={{ width: 60, height: 60, marginBottom: 14 }}
              resizeMode="contain"
            />
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 26,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              {t("auth.registerTitle")}
            </Text>
            <Text
              style={{ color: "#B0A894", fontSize: 14, textAlign: "center" }}
            >
              {t("auth.registerSubtitle")}
            </Text>
          </View>

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

          <View style={{ marginBottom: 20 }}>
            <View style={{ marginBottom: 16 }}>
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
                {t("auth.fullNameLabel")}
              </Text>
              <View style={getInputStyle("fullName")}>
                <User
                  color={focusedInput === "fullName" ? "#C9A45C" : "#897F6B"}
                  size={18}
                />
                <TextInput
                  placeholder="Mariana Gualda"
                  placeholderTextColor="#524C40"
                  value={fullName}
                  onFocus={() => setFocusedInput("fullName")}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={(val) => {
                    setFullName(val);
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

            <View style={{ marginBottom: 16 }}>
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
              <View style={getInputStyle("email")}>
                <Mail
                  color={focusedInput === "email" ? "#C9A45C" : "#897F6B"}
                  size={18}
                />
                <TextInput
                  placeholder={t("auth.emailPlaceholder")}
                  placeholderTextColor="#524C40"
                  keyboardType="email-address"
                  autoCapitalize="none"
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

            <View style={{ marginBottom: 16 }}>
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
                {t("auth.franchiseCodeLabel")}
              </Text>
              <View style={getInputStyle("code")}>
                <Ticket
                  color={focusedInput === "code" ? "#C9A45C" : "#897F6B"}
                  size={18}
                />
                <TextInput
                  placeholder="ILTCT-MEX"
                  placeholderTextColor="#524C40"
                  autoCapitalize="characters"
                  value={code}
                  onFocus={() => setFocusedInput("code")}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={(val) => {
                    setCode(val);
                    if (error) setError("");
                  }}
                  style={{
                    color: "#FFFFFF",
                    flex: 1,
                    fontSize: 15,
                    fontWeight: "bold",
                    marginLeft: 12,
                  }}
                />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
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
                {t("auth.passwordLabel")}
              </Text>
              <View style={getInputStyle("password")}>
                <Lock
                  color={focusedInput === "password" ? "#C9A45C" : "#897F6B"}
                  size={18}
                />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#524C40"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  keyboardType="default"
                  textContentType="newPassword"
                  value={password}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (error) setError("");
                  }}
                  style={{
                    color: "#FFFFFF",
                    flex: 1,
                    fontSize: 15,
                    marginLeft: 12,
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff color="#897F6B" size={18} />
                  ) : (
                    <Eye color="#897F6B" size={18} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
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
              marginBottom: 20,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#0C0A07" size="small" />
            ) : (
              <>
                <Text
                  style={{
                    color: "#0C0A07",
                    fontWeight: "bold",
                    fontSize: 16,
                    marginRight: 8,
                  }}
                >
                  {t("auth.continueToPayment")}
                </Text>
                <ArrowRight color="#0C0A07" size={20} />
              </>
            )}
          </TouchableOpacity>

          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => router.push("/auth/login")}
              activeOpacity={0.7}
              style={{ flexDirection: "row" }}
            >
              <Text style={{ color: "#B0A894", fontSize: 13 }}>
                {t("auth.alreadyHaveAccount")}
              </Text>
              <Text
                style={{ color: "#C9A45C", fontSize: 13, fontWeight: "bold" }}
              >
                {t("auth.loginButton")}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: "#15100A",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 14,
              padding: 16,
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <ShieldCheck
              color="#C9A45C"
              size={20}
              style={{ marginTop: 2, marginRight: 10 }}
            />
            <Text
              style={{
                color: "#B0A894",
                fontSize: 12,
                lineHeight: 18,
                flex: 1,
              }}
            >
              {t("auth.franchiseCodeNotice")}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
