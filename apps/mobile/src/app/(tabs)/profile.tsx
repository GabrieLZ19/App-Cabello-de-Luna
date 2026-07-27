import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { GlassCard } from "@/components/GlassCard";
import { AvatarRing } from "@/components/AvatarRing";
import {
  Settings,
  Award,
  GraduationCap,
  CreditCard,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { getProfile, storage, UserProfile } from "@/services";

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const cachedUser = await storage.getUserData();
        if (cachedUser) {
          setProfile(cachedUser);
        }

        const freshProfile = await getProfile("");
        if (freshProfile) {
          setProfile(freshProfile);
          await storage.setUserData(freshProfile);
        }
      } catch (err) {
        console.error("Error cargando perfil de usuario:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await storage.removeToken();
      router.replace("/auth/login");
    } catch (err) {
      console.error("Error cerrando sesión:", err);
      router.replace("/auth/login");
    }
  };

  const userName = profile?.fullName || "Mariana Gualda";
  const userRole =
    profile?.enrollmentStatus === "ACTIVE"
      ? t("profile.activeRole")
      : t("profile.registeredRole");
  const franchiseName =
    profile?.franchise?.name || t("profile.defaultFranchise");

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#0C0A07" }}
      edges={["top", "left", "right"]}
      className="flex-1 bg-[#0C0A07]"
    >
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />
      <ScrollView
        style={{ flex: 1, backgroundColor: "#0C0A07" }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 100,
        }}
        className="flex-1 bg-[#0C0A07] px-5"
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "bold" }}>
            {t("profile.title")}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/settings")}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Settings color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <AvatarRing name={userName} isIA={false} size={84} />
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 22,
              fontWeight: "bold",
              marginTop: 12,
              textAlign: "center",
            }}
          >
            {userName}
          </Text>
          <Text
            style={{
              color: "#B0A894",
              fontSize: 13,
              marginTop: 2,
              textAlign: "center",
            }}
          >
            {userRole}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(201, 164, 92, 0.1)",
              borderWidth: 1,
              borderColor: "#C9A45C",
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              marginTop: 12,
            }}
          >
            <Award color="#C9A45C" size={16} style={{ marginRight: 6 }} />
            <Text style={{ color: "#C9A45C", fontSize: 12, fontWeight: "600" }}>
              {t("profile.pathBadge")}
            </Text>
          </View>
        </View>

        <GlassCard
          style={{
            padding: 20,
            marginBottom: 16,
            borderRadius: 24,
            backgroundColor: "#17120D",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}
            >
              {t("profile.certificationSection")}
            </Text>
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text
                style={{ color: "#B0A894", fontSize: 11, fontWeight: "600" }}
              >
                {t("profile.stepProgress")}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#1C150E",
              borderWidth: 1,
              borderColor: "rgba(201, 164, 92, 0.4)",
              borderRadius: 18,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
                marginRight: 10,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(201, 164, 92, 0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <GraduationCap color="#C9A45C" size={22} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "bold" }}
                >
                  {t("profile.intermediateTitle")}
                </Text>
                <Text style={{ color: "#B0A894", fontSize: 12, marginTop: 1 }}>
                  {t("profile.intermediateSubtitle")}
                </Text>
                <Text style={{ color: "#B0A894", fontSize: 11, marginTop: 2 }}>
                  {t("profile.intermediatePhase")}
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: "rgba(201, 164, 92, 0.2)",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
              }}
            >
              <Text
                style={{ color: "#C9A45C", fontSize: 10, fontWeight: "bold" }}
              >
                {t("profile.inProgressStatus")}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#140E0A",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 18,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: 0.7,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
                marginRight: 10,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Award color="#524C40" size={22} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#897F6B", fontSize: 15, fontWeight: "bold" }}
                >
                  {t("profile.finalTitle")}
                </Text>
                <Text style={{ color: "#524C40", fontSize: 12, marginTop: 1 }}>
                  {t("profile.finalSubtitle")}
                </Text>
                <Text style={{ color: "#524C40", fontSize: 11, marginTop: 2 }}>
                  {t("profile.finalRequirement")}
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
              }}
            >
              <Text
                style={{ color: "#524C40", fontSize: 10, fontWeight: "bold" }}
              >
                {t("profile.lockedStatus")}
              </Text>
            </View>
          </View>
        </GlassCard>

        <View style={{ gap: 12 }}>
          <TouchableOpacity activeOpacity={0.8}>
            <GlassCard
              style={{
                backgroundColor: "#17120D",
                borderColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: 20,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(201, 164, 92, 0.12)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <CreditCard color="#C9A45C" size={20} />
                </View>
                <Text
                  style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "bold" }}
                >
                  {t("profile.subscriptionAndPayments")}
                </Text>
              </View>
              <ChevronRight color="#897F6B" size={20} />
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8}>
            <GlassCard
              style={{
                backgroundColor: "#17120D",
                borderColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: 20,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(201, 164, 92, 0.12)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <ShieldCheck color="#C9A45C" size={20} />
                </View>
                <View>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 15,
                      fontWeight: "bold",
                    }}
                  >
                    {t("profile.licenseAndFranchise")}
                  </Text>
                  <Text
                    style={{ color: "#B0A894", fontSize: 11, marginTop: 1 }}
                  >
                    {franchiseName}
                  </Text>
                </View>
              </View>
              <ChevronRight color="#897F6B" size={20} />
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} activeOpacity={0.8}>
            <GlassCard
              style={{
                backgroundColor: "rgba(248, 113, 113, 0.08)",
                borderColor: "rgba(248, 113, 113, 0.25)",
                borderRadius: 20,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(248, 113, 113, 0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <LogOut color="#F87171" size={20} />
              </View>
              <Text
                style={{ color: "#F87171", fontSize: 15, fontWeight: "bold" }}
              >
                {t("profile.logout")}
              </Text>
            </GlassCard>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
