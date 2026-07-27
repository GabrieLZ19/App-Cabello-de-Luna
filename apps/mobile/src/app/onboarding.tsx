import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChevronRight, ChevronLeft } from "lucide-react-native";
import { storage } from "@/services";

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const ONBOARDING_SLIDES = [
    {
      id: 1,
      title: t("onboarding.slide1Title"),
      subtitle: t("onboarding.slide1Sub"),
    },
    {
      id: 2,
      title: t("onboarding.slide2Title"),
      subtitle: t("onboarding.slide2Sub"),
    },
    {
      id: 3,
      title: t("onboarding.slide3Title"),
      subtitle: t("onboarding.slide3Sub"),
    },
    {
      id: 4,
      title: t("onboarding.slide4Title"),
      subtitle: t("onboarding.slide4Sub"),
    },
  ];

  const handleNext = async () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      await storage.setHasSeenOnboarding(true);
      router.replace("/auth/login");
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleSkip = async () => {
    await storage.setHasSeenOnboarding(true);
    router.replace("/auth/login");
  };

  const slide = ONBOARDING_SLIDES[currentSlide];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0A07" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingBottom: 24,
          justifyContent: "space-between",
        }}
      >
        {/* Top Header - Volver Atrás + Saltar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 8,
          }}
        >
          {currentSlide > 0 ? (
            <TouchableOpacity
              onPress={handlePrev}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}
            >
              <ChevronLeft color="#C9A45C" size={20} />
              <Text
                style={{
                  color: "#C9A45C",
                  fontSize: 14,
                  fontWeight: "600",
                  marginLeft: 4,
                }}
              >
                {t("onboarding.prev")}
              </Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          <TouchableOpacity
            onPress={handleSkip}
            activeOpacity={0.7}
            style={{ paddingHorizontal: 12, paddingVertical: 8 }}
          >
            <Text style={{ color: "#B0A894", fontSize: 14, fontWeight: "600" }}>
              {t("onboarding.skip")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center Emblem Icon */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 20,
          }}
        >
          <View
            style={{
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: "#15100A",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#C9A45C",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.85,
              shadowRadius: 28,
              elevation: 16,
            }}
          >
            <Image
              source={require("../../assets/brand/icono_redondo_anillo_1024.png")}
              style={{ width: 215, height: 215 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Bottom Content Area */}
        <View style={{ marginBottom: 12 }}>
          {/* Pagination Dots */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            {ONBOARDING_SLIDES.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentSlide(index)}
                activeOpacity={0.7}
                style={{
                  height: 8,
                  borderRadius: 4,
                  width: index === currentSlide ? 32 : 8,
                  backgroundColor:
                    index === currentSlide
                      ? "#C9A45C"
                      : "rgba(255, 255, 255, 0.2)",
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>

          {/* Slide Title & Subtitle */}
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {slide.title}
          </Text>

          <Text
            style={{
              color: "#B0A894",
              fontSize: 14,
              lineHeight: 22,
              textAlign: "center",
              marginBottom: 32,
              paddingHorizontal: 16,
            }}
          >
            {slide.subtitle}
          </Text>

          {/* Navigation Controls */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: "#C9A45C",
                paddingVertical: 16,
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#C9A45C",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.75,
                shadowRadius: 20,
                elevation: 10,
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
                {currentSlide === ONBOARDING_SLIDES.length - 1
                  ? t("onboarding.start")
                  : t("onboarding.next")}
              </Text>
              <ChevronRight color="#0C0A07" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
