import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Moon, User, Plus } from "lucide-react-native";
import { GlassCard } from "@/components/GlassCard";
import { CustomAlert } from "@/components/CustomAlert";
import {
  getStudentPractices,
  submitCutEvidence,
  PracticalModelData,
  storage,
} from "@/services";

export default function PracticeScreen() {
  const { t } = useTranslation();
  const [models, setModels] = useState<PracticalModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const totalCuts = models.reduce((acc, m) => acc + (m.cuts?.length || 0), 1);
  const requiredCuts = 70;
  const progressPercent = Math.min(
    Math.round((totalCuts / requiredCuts) * 100),
    100,
  );

  useEffect(() => {
    async function loadData() {
      try {
        const token = await storage.getToken();
        const data = await getStudentPractices(token || "");
        setModels(data);
      } catch (err) {
        console.error("Error cargando prácticas clínicas:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUploadEvidence = async (modelNum: number) => {
    setSubmitting(true);
    try {
      const token = await storage.getToken();
      await submitCutEvidence(
        {
          modelName: `Modelo ${modelNum < 10 ? "0" + modelNum : modelNum}`,
          modelNumber: modelNum,
          cutNumber: 2,
          lunarPhase: "Cuarto Creciente",
          photoBeforeUrl: "https://cdn.iltct.com/models/before-sample.jpg",
          photoAfterUrl: "https://cdn.iltct.com/models/after-sample.jpg",
          technicalSheetText: "Ficha técnica cargada por la alumna.",
        },
        token || "",
      );

      setAlertMessage(t("practice.alertSuccessMessage"));
      setAlertVisible(true);

      const updatedData = await getStudentPractices(token || "");
      setModels(updatedData);
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo enviar la evidencia.");
    } finally {
      setSubmitting(false);
    }
  };

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
        <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "bold" }}>
          {t("practice.title")}
        </Text>
        <Text
          style={{
            color: "#B0A894",
            fontSize: 14,
            marginTop: 2,
            marginBottom: 20,
          }}
        >
          {t("practice.subtitle")}
        </Text>

        <GlassCard
          style={{
            backgroundColor: "#17120D",
            borderRadius: 20,
            borderColor: "rgba(201, 164, 92, 0.2)",
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(201, 164, 92, 0.15)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
            }}
          >
            <Moon color="#C9A45C" size={24} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "bold" }}
            >
              {t("practice.currentPhase")}
            </Text>
            <Text style={{ color: "#B0A894", fontSize: 12, marginTop: 2 }}>
              {t("practice.moonDesc")}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 12,
            }}
          >
            <Text
              style={{ color: "#C9A45C", fontSize: 12, fontWeight: "bold" }}
            >
              {t("practice.moonCount")}
            </Text>
          </View>
        </GlassCard>

        <GlassCard
          style={{
            backgroundColor: "#17120D",
            borderRadius: 20,
            borderColor: "rgba(255, 255, 255, 0.08)",
            padding: 20,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "bold" }}
            >
              {t("practice.titleProgress")}
            </Text>
            <Text
              style={{ color: "#C9A45C", fontSize: 16, fontWeight: "bold" }}
            >
              {t("practice.cutsCount", {
                current: totalCuts,
                total: requiredCuts,
              })}
            </Text>
          </View>

          <View
            style={{
              height: 8,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 4,
              overflow: "hidden",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                backgroundColor: "#C9A45C",
                borderRadius: 4,
              }}
            />
          </View>

          <Text style={{ color: "#B0A894", fontSize: 12, lineHeight: 18 }}>
            {t("practice.cutsRequirement")}
          </Text>
        </GlassCard>

        {loading ? (
          <ActivityIndicator
            color="#C9A45C"
            size="small"
            style={{ marginVertical: 20 }}
          />
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
            {/* Modelo 01 */}
            <View style={{ width: "48%" }}>
              <GlassCard
                style={{
                  backgroundColor: "#17120D",
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: "#C9A45C",
                  padding: 16,
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#22C55E",
                  }}
                />

                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "rgba(201, 164, 92, 0.15)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <User color="#C9A45C" size={26} />
                </View>

                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontWeight: "bold",
                    marginBottom: 2,
                  }}
                >
                  {t("practice.modelLabel", { number: "01" })}
                </Text>
                <Text
                  style={{ color: "#B0A894", fontSize: 12, marginBottom: 14 }}
                >
                  {t("practice.modelCuts", {
                    current: models[0]?.cuts?.length || 1,
                  })}
                </Text>

                <TouchableOpacity
                  onPress={() => handleUploadEvidence(1)}
                  disabled={submitting}
                  activeOpacity={0.8}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(201, 164, 92, 0.15)",
                    borderWidth: 1,
                    borderColor: "#C9A45C",
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  {submitting ? (
                    <ActivityIndicator color="#C9A45C" size="small" />
                  ) : (
                    <Text
                      style={{
                        color: "#C9A45C",
                        fontSize: 13,
                        fontWeight: "bold",
                      }}
                    >
                      {t("practice.uploadSheet")}
                    </Text>
                  )}
                </TouchableOpacity>
              </GlassCard>
            </View>

            {/* Modelo 02 */}
            <View style={{ width: "48%" }}>
              <GlassCard
                style={{
                  backgroundColor: "#17120D",
                  borderRadius: 20,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <User color="#897F6B" size={26} />
                </View>

                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontWeight: "bold",
                    marginBottom: 2,
                  }}
                >
                  {t("practice.modelLabel", { number: "02" })}
                </Text>
                <Text
                  style={{ color: "#B0A894", fontSize: 12, marginBottom: 14 }}
                >
                  {t("practice.modelCuts", { current: 0 })}
                </Text>

                <TouchableOpacity
                  onPress={() => handleUploadEvidence(2)}
                  activeOpacity={0.8}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#897F6B",
                      fontSize: 13,
                      fontWeight: "bold",
                    }}
                  >
                    {t("practice.uploadSheet")}
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            </View>

            {/* Modelo 03 */}
            <View style={{ width: "48%" }}>
              <GlassCard
                style={{
                  backgroundColor: "#140E0A",
                  borderRadius: 20,
                  borderStyle: "dashed",
                  borderWidth: 1.5,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  padding: 20,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Plus color="#897F6B" size={22} />
                </View>

                <Text
                  style={{
                    color: "#897F6B",
                    fontSize: 13,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {t("practice.assignModel", { number: "03" })}
                </Text>
              </GlassCard>
            </View>

            {/* Modelo 04 */}
            <View style={{ width: "48%" }}>
              <GlassCard
                style={{
                  backgroundColor: "#140E0A",
                  borderRadius: 20,
                  borderStyle: "dashed",
                  borderWidth: 1.5,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  padding: 20,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Plus color="#897F6B" size={22} />
                </View>

                <Text
                  style={{
                    color: "#897F6B",
                    fontSize: 13,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {t("practice.assignModel", { number: "04" })}
                </Text>
              </GlassCard>
            </View>
          </View>
        )}
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        type="success"
        title={t("practice.alertTitle")}
        message={alertMessage}
        buttonText="Aceptar"
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}
