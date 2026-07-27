import React from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Check, ArrowRight } from "lucide-react-native";

export default function ResetSuccessScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleGoToLogin = () => {
    router.replace("/auth/login");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#0C0A07" }}
      className="flex-1 bg-[#0C0A07]"
    >
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          backgroundColor: "#0C0A07",
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "rgba(201, 164, 92, 0.15)",
            borderWidth: 2,
            borderColor: "#C9A45C",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#C9A45C",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Check color="#0C0A07" size={36} strokeWidth={3.5} />
          </View>
        </View>

        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 28,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          {t("auth.resetSuccessTitle")}
        </Text>

        <Text
          style={{
            color: "#B0A894",
            fontSize: 15,
            lineHeight: 24,
            textAlign: "center",
            marginBottom: 40,
            maxWidth: 320,
          }}
        >
          {t("auth.resetSuccessSubtitle")}
        </Text>

        <TouchableOpacity
          onPress={handleGoToLogin}
          activeOpacity={0.85}
          style={{
            width: "100%",
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
          }}
        >
          <Text
            style={{
              color: "#0C0A07",
              fontWeight: "bold",
              fontSize: 16,
              marginRight: 8,
            }}
          >
            {t("auth.loginButton")}
          </Text>
          <ArrowRight color="#0C0A07" size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
