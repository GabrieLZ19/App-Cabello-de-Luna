import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react-native";
import { DESIGN_TOKENS } from "@iltct/shared";

export default function PaymentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currency, setCurrency] = useState<"MXN" | "USD">("MXN");
  const [paymentMethod, setPaymentMethod] = useState<
    "CARD" | "MERCADOPAGO" | "TRANSFER"
  >("CARD");
  const [loading, setLoading] = useState(false);

  const isMXN = currency === "MXN";
  const enrollmentAmount = isMXN
    ? DESIGN_TOKENS.pricing.enrollmentMXN
    : DESIGN_TOKENS.pricing.enrollmentUSD;
  const tuitionAmount = isMXN
    ? DESIGN_TOKENS.pricing.tuitionMXN
    : DESIGN_TOKENS.pricing.tuitionUSD;
  const totalAmount = enrollmentAmount + tuitionAmount;
  const currencySymbol = isMXN ? "$" : "USD $";

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/auth/verify");
    }, 1200);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
      }}
      style={{ backgroundColor: "#0C0A07" }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />

      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 16,
        }}
        activeOpacity={0.7}
      >
        <ArrowLeft color="#C9A45C" size={20} />
        <Text
          style={{
            color: "#C9A45C",
            fontSize: 14,
            fontWeight: "600",
            marginLeft: 8,
          }}
        >
          {t("auth.back")}
        </Text>
      </TouchableOpacity>

      <View style={{ marginBottom: 24 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Image
            source={require("../../../assets/brand/icono_redondo_anillo_1024.png")}
            style={{ width: 36, height: 36, marginRight: 12 }}
            resizeMode="contain"
          />
          <Text
            style={{
              color: "#C9A45C",
              fontSize: 20,
              fontWeight: "bold",
              letterSpacing: 2,
            }}
          >
            ILTCT
          </Text>
        </View>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          {t("auth.paymentTitle")}
        </Text>
        <Text style={{ color: "#B0A894", fontSize: 14 }}>
          {t("auth.paymentSubtitle")}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#15100A",
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: "center",
            backgroundColor: isMXN ? "#C9A45C" : "transparent",
          }}
          onPress={() => setCurrency("MXN")}
          activeOpacity={0.8}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 12,
              color: isMXN ? "#0C0A07" : "#B0A894",
            }}
          >
            {t("auth.mxnLabel")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: "center",
            backgroundColor: !isMXN ? "#C9A45C" : "transparent",
          }}
          onPress={() => setCurrency("USD")}
          activeOpacity={0.8}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 12,
              color: !isMXN ? "#0C0A07" : "#B0A894",
            }}
          >
            {t("auth.usdLabel")}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          backgroundColor: "#15100A",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            color: "#C9A45C",
            fontSize: 12,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 16,
          }}
        >
          {t("auth.priceBreakdown")}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255,255,255,0.1)",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 14 }}>
            {t("auth.oneTimeEnrollment")}
          </Text>
          <Text style={{ color: "#C9A45C", fontSize: 14, fontWeight: "bold" }}>
            {currencySymbol} {enrollmentAmount.toLocaleString()}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255,255,255,0.1)",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 14 }}>
            {t("auth.fullProgram")}
          </Text>
          <Text style={{ color: "#C9A45C", fontSize: 14, fontWeight: "bold" }}>
            {currencySymbol} {tuitionAmount.toLocaleString()}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}>
            {t("auth.totalToPay")}
          </Text>
          <Text style={{ color: "#C9A45C", fontSize: 24, fontWeight: "bold" }}>
            {currencySymbol} {totalAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      <Text
        style={{
          color: "#B0A894",
          fontSize: 12,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        {t("auth.paymentMethodLabel")}
      </Text>

      <View style={{ gap: 12, marginBottom: 24 }}>
        {[
          { id: "CARD", label: t("auth.cardMethod"), icon: CreditCard },
          {
            id: "MERCADOPAGO",
            label: t("auth.mercadopagoMethod"),
            icon: CheckCircle2,
          },
          {
            id: "TRANSFER",
            label: t("auth.transferMethod"),
            icon: ShieldCheck,
          },
        ].map((item) => {
          const IconComp = item.icon;
          const isSelected = paymentMethod === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setPaymentMethod(item.id as any)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderRadius: 14,
                borderWidth: 1,
                backgroundColor: isSelected ? "#1F1912" : "#15100A",
                borderColor: isSelected ? "#C9A45C" : "rgba(255,255,255,0.1)",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <IconComp
                  color={isSelected ? "#C9A45C" : "#897F6B"}
                  size={20}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: isSelected ? "#FFFFFF" : "#B0A894",
                    marginLeft: 12,
                  }}
                >
                  {item.label}
                </Text>
              </View>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: isSelected ? "#C9A45C" : "rgba(255,255,255,0.2)",
                  backgroundColor: isSelected ? "#C9A45C" : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isSelected && (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#0C0A07",
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={handlePay}
        disabled={loading}
        activeOpacity={0.85}
        style={{
          backgroundColor: "#C9A45C",
          paddingVertical: 16,
          borderRadius: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
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
          {loading ? t("auth.processingPayment") : t("auth.confirmAndPay")}
        </Text>
        <ArrowRight color="#0C0A07" size={20} />
      </TouchableOpacity>
    </ScrollView>
  );
}
