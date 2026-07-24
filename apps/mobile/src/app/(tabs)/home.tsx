import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useRouter, useNavigation } from "expo-router";
import { GlassCard } from "@/components/GlassCard";
import { AvatarRing } from "@/components/AvatarRing";
import { CircularProgress } from "@/components/CircularProgress";
import {
  Bookmark,
  Play,
  Lock,
  MessageSquare,
  BookOpen,
} from "lucide-react-native";
import { getTheoreticalModules, storage, TheoreticalModule } from "@/services";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const [userData, setUserData] = useState<any>(null);
  const [currentModule, setCurrentModule] = useState<TheoreticalModule | null>(
    null,
  );
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const loadDashboard = async () => {
    try {
      const storedUser = await storage.getUserData();
      if (storedUser) {
        setUserData(storedUser);
      }

      const modules = await getTheoreticalModules("");
      const completed = await storage.getCompletedModules();

      if (modules && modules.length > 0) {
        const uncompleted =
          modules.find((m) => !completed.includes(m.id)) ||
          modules[modules.length - 1];
        setCurrentModule(uncompleted);

        const percent = Math.round(
          (completed.filter((id) => modules.some((m) => m.id === id)).length /
            modules.length) *
            100,
        );
        setProgressPercent(percent);
      }
    } catch (err) {
      console.error("Error cargando datos del dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const unsubscribe = navigation.addListener("focus", () => {
      loadDashboard();
    });
    return unsubscribe;
  }, [navigation]);

  const userName = userData?.fullName || "Ana Sofía López";

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
        {/* Header Section matching 05_Home.png */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View>
            <Text style={{ color: "#B0A894", fontSize: 14 }}>
              Bienvenida Especialista,
            </Text>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 26,
                fontWeight: "bold",
                marginTop: 2,
              }}
            >
              {userName}
            </Text>
          </View>

          {/* Top Right User Avatar Ring with Red Notification Dot */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ position: "relative" }}
          >
            <AvatarRing
              name={userName}
              imageUri={userData?.avatarUrl}
              isIA={false}
              size={46}
            />
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#EF4444",
                borderWidth: 2,
                borderColor: "#0C0A07",
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Section 1: "Tu Progreso" Card */}
        <GlassCard style={{ padding: 20, marginBottom: 24, borderRadius: 24 }}>
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
              Tu Progreso
            </Text>
            <View
              style={{
                backgroundColor: "rgba(201, 164, 92, 0.15)",
                borderWidth: 1,
                borderColor: "rgba(201, 164, 92, 0.3)",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 14,
              }}
            >
              <Text
                style={{
                  color: "#C9A45C",
                  fontSize: 11,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                MES {currentModule?.month || 1} DE 17
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Circular Progress Ring on Left */}
            <CircularProgress
              percentage={progressPercent}
              size={84}
              strokeWidth={8}
            />

            {/* Right Side Progress Details */}
            <View style={{ flex: 1, marginLeft: 20 }}>
              {/* Theory Line */}
              <View style={{ marginBottom: 14 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ color: "#B0A894", fontSize: 13 }}>
                    Teoría · Mes 1-10
                  </Text>
                  <Text
                    style={{
                      color: "#C9A45C",
                      fontSize: 13,
                      fontWeight: "bold",
                    }}
                  >
                    {progressPercent}%
                  </Text>
                </View>
                <View
                  style={{
                    height: 6,
                    backgroundColor: "#262018",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${progressPercent}%`,
                      height: "100%",
                      backgroundColor: "#C9A45C",
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>

              {/* Practice Line */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#B0A894", fontSize: 13 }}>
                  Práctica · Mes 11-17
                </Text>
                <Lock color="#524C40" size={16} />
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Section 2: "Semana Actual" */}
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 14,
          }}
        >
          Semana Actual
        </Text>

        {/* Premium Luxury Weekly Module Card with LinearGradient and Subtle Gold Glow */}
        <TouchableOpacity
          onPress={() =>
            currentModule && router.push(`/lesson/${currentModule.id}`)
          }
          activeOpacity={0.9}
          style={{
            borderRadius: 24,
            borderWidth: 1.5,
            borderColor: "rgba(201, 164, 92, 0.35)",
            marginBottom: 24,
            overflow: "hidden",
            shadowColor: "#C9A45C",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={["rgba(36, 28, 20, 0.98)", "rgba(18, 14, 10, 0.98)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 22 }}
          >
            {loading ? (
              <ActivityIndicator
                color="#C9A45C"
                size="small"
                style={{ marginVertical: 20 }}
              />
            ) : (
              <>
                {/* Card Top Badge & Bookmark */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(201, 164, 92, 0.2)",
                      borderWidth: 1,
                      borderColor: "rgba(201, 164, 92, 0.4)",
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 14,
                    }}
                  >
                    <Text
                      style={{
                        color: "#C9A45C",
                        fontSize: 11,
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                      }}
                    >
                      MÓDULO DE LA SEMANA
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSaved(!saved)}
                    activeOpacity={0.7}
                    style={{ padding: 4 }}
                  >
                    <Bookmark
                      color={saved ? "#C9A45C" : "#FFFFFF"}
                      fill={saved ? "#C9A45C" : "transparent"}
                      size={20}
                    />
                  </TouchableOpacity>
                </View>

                {/* Real Module Title from Supabase Backend */}
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 19,
                    fontWeight: "bold",
                    marginTop: 14,
                    lineHeight: 26,
                  }}
                >
                  {currentModule?.title ||
                    "Estructura Capilar y Cauterización Térmica"}
                </Text>
                <Text
                  style={{
                    color: "#B0A894",
                    fontSize: 13,
                    marginTop: 6,
                    lineHeight: 19,
                  }}
                >
                  {currentModule?.description ||
                    "Diagnóstico capilar avanzado y tratamientos de restauración con biotecnología."}
                </Text>

                {/* Card Bottom Row: Docente IA Left + Circular Gold Neon Play Button Right */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 22,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                      marginRight: 12,
                    }}
                  >
                    <AvatarRing
                      name={currentModule?.avatar?.name || "Mariana Gualda IA"}
                      imageUri={currentModule?.avatar?.avatarVideoUrl}
                      isIA={true}
                      size={44}
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ color: "#B0A894", fontSize: 11 }}>
                        Docente IA Especialista
                      </Text>
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 13,
                          fontWeight: "bold",
                        }}
                      >
                        {currentModule?.avatar?.name || "Clon Mariana Gualda"}
                      </Text>
                    </View>
                  </View>

                  {/* Circular Gold Neon Play Button with Dual Halo Glow */}
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: "rgba(201, 164, 92, 0.2)",
                      borderWidth: 1,
                      borderColor: "rgba(201, 164, 92, 0.4)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LinearGradient
                      colors={["#F3D99A", "#C9A45C", "#A8823B"]}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Play
                        color="#0C0A07"
                        size={20}
                        style={{ marginLeft: 2 }}
                      />
                    </LinearGradient>
                  </View>
                </View>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Section 3: "Herramientas" (Restored Previous Perfect Design) */}
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 14,
          }}
        >
          Herramientas
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Glosario Card */}
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.8}>
            <GlassCard
              style={{ borderRadius: 24, padding: 18, alignItems: "center" }}
            >
              <BookOpen color="#C9A45C" size={30} />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: 15,
                  marginTop: 10,
                }}
              >
                Glosario
              </Text>
              <Text
                style={{
                  color: "#B0A894",
                  fontSize: 11,
                  textAlign: "center",
                  marginTop: 3,
                }}
              >
                Términos del Método
              </Text>
            </GlassCard>
          </TouchableOpacity>

          {/* Soporte Card */}
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.8}>
            <GlassCard
              style={{ borderRadius: 24, padding: 18, alignItems: "center" }}
            >
              <MessageSquare color="#C9A45C" size={30} />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: 15,
                  marginTop: 10,
                }}
              >
                Soporte
              </Text>
              <Text
                style={{
                  color: "#B0A894",
                  fontSize: 11,
                  textAlign: "center",
                  marginTop: 3,
                }}
              >
                Asistencia Técnica
              </Text>
            </GlassCard>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
