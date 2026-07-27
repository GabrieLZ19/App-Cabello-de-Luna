import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Moon, User, Camera, X, Upload, Plus } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { GlassCard } from "@/components/GlassCard";
import { CustomAlert } from "@/components/CustomAlert";
import {
  getStudentPractices,
  uploadCutEvidenceWithFiles,
  PracticalModelData,
  storage,
} from "@/services";

export default function PracticeScreen() {
  const { t } = useTranslation();
  const [models, setModels] = useState<PracticalModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados para CustomAlert internacionalizado
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">(
    "success",
  );

  // Modal de Subida de Ficha
  const [uploadModalVisible, setModalVisible] = useState(false);
  const [selectedModelNum, setSelectedModelNum] = useState<number>(1);
  const [photoBeforeUri, setPhotoBeforeUri] = useState<string | null>(null);
  const [photoAfterUri, setPhotoAfterUri] = useState<string | null>(null);
  const [technicalSheet, setTechnicalSheet] = useState("");

  const totalCuts = models.reduce((acc, m) => acc + (m.cuts?.length || 0), 0);
  const requiredCuts = 70;
  const progressPercent = Math.min(
    Math.round((totalCuts / requiredCuts) * 100),
    100,
  );

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const loadData = async () => {
    try {
      const token = await storage.getToken();
      const data = await getStudentPractices(token || "");
      setModels(data);
    } catch (err: any) {
      console.error("Error cargando prácticas clínicas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openUploadModal = (modelNum: number) => {
    setSelectedModelNum(modelNum);
    setPhotoBeforeUri(null);
    setPhotoAfterUri(null);
    setTechnicalSheet("");
    setModalVisible(true);
  };

  const pickImage = async (type: "before" | "after") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlert(
        t("practice.permissionDeniedTitle"),
        t("practice.permissionDeniedMessage"),
        "error",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64Data = `data:image/jpeg;base64,${asset.base64}`;

      if (type === "before") {
        setPhotoBeforeUri(base64Data);
      } else {
        setPhotoAfterUri(base64Data);
      }
    }
  };

  const handleSendEvidence = async () => {
    if (!photoBeforeUri || !photoAfterUri) {
      showAlert(
        t("practice.incompletePhotosTitle"),
        t("practice.incompletePhotosMessage"),
        "info",
      );
      return;
    }

    setSubmitting(true);
    try {
      const token = await storage.getToken();
      const currentModelCuts =
        models.find((m) => m.modelNumber === selectedModelNum)?.cuts?.length ||
        0;

      const formattedNum =
        selectedModelNum < 10 ? `0${selectedModelNum}` : `${selectedModelNum}`;
      const modelLabelText = t("practice.modelLabel", { number: formattedNum });

      await uploadCutEvidenceWithFiles(
        {
          modelName: modelLabelText,
          modelNumber: selectedModelNum,
          cutNumber: currentModelCuts + 1,
          lunarPhase: t("practice.currentLunarPhaseName"),
          photoBeforeBase64: photoBeforeUri,
          photoAfterBase64: photoAfterUri,
          technicalSheetText:
            technicalSheet.trim() || t("practice.defaultSheetText"),
        },
        token || "",
      );

      setModalVisible(false);
      showAlert(
        t("practice.alertTitle"),
        t("practice.alertSuccessMessage"),
        "success",
      );
      await loadData();
    } catch (err: any) {
      showAlert(
        t("practice.sendErrorTitle"),
        err.message || t("practice.sendErrorMessage"),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#0C0A07" }}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />
      <ScrollView
        style={{ flex: 1, backgroundColor: "#0C0A07" }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Principal */}
        <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "bold" }}>
          {t("practice.title")}
        </Text>
        <Text
          style={{
            color: "#897F6B",
            fontSize: 14,
            marginTop: 4,
            marginBottom: 20,
          }}
        >
          {t("practice.subtitle")}
        </Text>

        {/* Tarjeta Fase Lunar */}
        <GlassCard
          style={{
            backgroundColor: "#15100A",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(201, 164, 92, 0.25)",
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
              backgroundColor: "rgba(201, 164, 92, 0.12)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
            }}
          >
            <Moon color="#C9A45C" size={24} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}
            >
              {t("practice.currentPhase")}
            </Text>
            <Text style={{ color: "#B0A894", fontSize: 13, marginTop: 2 }}>
              {t("practice.moonDesc")}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "rgba(201, 164, 92, 0.15)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(201, 164, 92, 0.3)",
            }}
          >
            <Text
              style={{ color: "#C9A45C", fontSize: 12, fontWeight: "bold" }}
            >
              {t("practice.moonCount")}
            </Text>
          </View>
        </GlassCard>

        {/* Tarjeta Progreso hacia el Título */}
        <GlassCard
          style={{
            backgroundColor: "#15100A",
            borderRadius: 20,
            borderWidth: 1,
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
              marginBottom: 14,
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

          {/* Barra de Progreso */}
          <View
            style={{
              height: 8,
              backgroundColor: "#221C14",
              borderRadius: 4,
              overflow: "hidden",
              marginBottom: 14,
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

          <Text style={{ color: "#897F6B", fontSize: 12, lineHeight: 18 }}>
            {t("practice.cutsRequirement")}
          </Text>
        </GlassCard>

        {/* Grid de 2 Columnas para los 10 Modelos */}
        {loading ? (
          <ActivityIndicator
            color="#C9A45C"
            size="small"
            style={{ marginVertical: 30 }}
          />
        ) : (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const modelData = models.find((m) => m.modelNumber === num);
              const cutsCount = modelData?.cuts?.length || 0;
              const hasCuts = cutsCount > 0;
              const formattedNum = num < 10 ? `0${num}` : `${num}`;

              return (
                <View
                  key={num}
                  style={{
                    width: "48%",
                    marginBottom: 16,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => openUploadModal(num)}
                  >
                    <GlassCard
                      style={{
                        backgroundColor: "#15100A",
                        borderRadius: 22,
                        borderWidth: hasCuts ? 1.5 : 1,
                        borderColor: hasCuts
                          ? "#C9A45C"
                          : "rgba(255, 255, 255, 0.08)",
                        padding: 16,
                        alignItems: "center",
                        position: "relative",
                        minHeight: 180,
                        justifyContent: "center",
                      }}
                    >
                      {/* Indicador verde de entrega */}
                      {hasCuts && (
                        <View
                          style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: "#22C55E",
                            elevation: 4,
                            shadowColor: "#22C55E",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.8,
                            shadowRadius: 4,
                          }}
                        />
                      )}

                      {/* Ícono de Avatar / Plus */}
                      <View
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: 29,
                          backgroundColor: hasCuts
                            ? "rgba(201, 164, 92, 0.15)"
                            : "rgba(255, 255, 255, 0.05)",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 12,
                          borderWidth: hasCuts ? 1 : 0,
                          borderColor: "rgba(201, 164, 92, 0.4)",
                        }}
                      >
                        {hasCuts ? (
                          <User color="#C9A45C" size={28} />
                        ) : (
                          <Plus color="#4A4235" size={28} />
                        )}
                      </View>

                      {/* Título de la Modelo */}
                      <Text
                        style={{
                          color: hasCuts ? "#FFFFFF" : "#897F6B",
                          fontSize: 15,
                          fontWeight: "bold",
                          marginBottom: 2,
                        }}
                      >
                        {t("practice.modelLabel", { number: formattedNum })}
                      </Text>

                      {/* Contador o Estado */}
                      <Text
                        style={{
                          color: "#897F6B",
                          fontSize: 12,
                          marginBottom: 14,
                        }}
                      >
                        {hasCuts
                          ? t("practice.modelCuts", { current: cutsCount })
                          : t("practice.assignModel", { number: formattedNum })}
                      </Text>

                      {/* Botón de Acción */}
                      <View
                        style={{
                          width: "100%",
                          backgroundColor: hasCuts
                            ? "rgba(201, 164, 92, 0.15)"
                            : "rgba(255, 255, 255, 0.03)",
                          borderWidth: 1,
                          borderColor: hasCuts
                            ? "#C9A45C"
                            : "rgba(255, 255, 255, 0.08)",
                          paddingVertical: 9,
                          borderRadius: 12,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: hasCuts ? "#C9A45C" : "#5A5243",
                            fontSize: 13,
                            fontWeight: "bold",
                          }}
                        >
                          {t("practice.uploadSheet")}
                        </Text>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal Interactivo de Carga de Evidencias */}
      <Modal visible={uploadModalVisible} animationType="slide" transparent>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.88)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#15100A",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderWidth: 1,
              borderColor: "rgba(201, 164, 92, 0.3)",
              padding: 20,
              maxHeight: "90%",
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
                style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "bold" }}
              >
                {t("practice.modalHeaderTitle", {
                  number:
                    selectedModelNum < 10
                      ? `0${selectedModelNum}`
                      : `${selectedModelNum}`,
                })}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ padding: 4 }}
              >
                <X color="#FFFFFF" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  color: "#B0A894",
                  fontSize: 12,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {t("practice.evidencePhotosSection")}
              </Text>

              <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={() => pickImage("before")}
                  style={{
                    flex: 1,
                    height: 110,
                    backgroundColor: "#0C0A07",
                    borderWidth: 1,
                    borderColor: photoBeforeUri
                      ? "#C9A45C"
                      : "rgba(255, 255, 255, 0.1)",
                    borderRadius: 14,
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {photoBeforeUri ? (
                    <Image
                      source={{ uri: photoBeforeUri }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <>
                      <Camera color="#897F6B" size={24} />
                      <Text
                        style={{ color: "#B0A894", fontSize: 12, marginTop: 4 }}
                      >
                        {t("practice.photoBeforeLabel")}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => pickImage("after")}
                  style={{
                    flex: 1,
                    height: 110,
                    backgroundColor: "#0C0A07",
                    borderWidth: 1,
                    borderColor: photoAfterUri
                      ? "#C9A45C"
                      : "rgba(255, 255, 255, 0.1)",
                    borderRadius: 14,
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {photoAfterUri ? (
                    <Image
                      source={{ uri: photoAfterUri }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <>
                      <Camera color="#897F6B" size={24} />
                      <Text
                        style={{ color: "#B0A894", fontSize: 12, marginTop: 4 }}
                      >
                        {t("practice.photoAfterLabel")}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <Text
                style={{
                  color: "#B0A894",
                  fontSize: 12,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {t("practice.technicalSheetSection")}
              </Text>

              <TextInput
                placeholder={t("practice.technicalSheetPlaceholder")}
                placeholderTextColor="#524C40"
                multiline
                numberOfLines={4}
                value={technicalSheet}
                onChangeText={setTechnicalSheet}
                style={{
                  backgroundColor: "#0C0A07",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 14,
                  padding: 14,
                  color: "#FFFFFF",
                  fontSize: 14,
                  textAlignVertical: "top",
                  marginBottom: 20,
                  minHeight: 90,
                }}
              />

              <TouchableOpacity
                onPress={handleSendEvidence}
                disabled={submitting}
                style={{
                  backgroundColor: "#C9A45C",
                  paddingVertical: 16,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  marginBottom: 12,
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="#0C0A07" size="small" />
                ) : (
                  <>
                    <Upload
                      color="#0C0A07"
                      size={18}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        color: "#0C0A07",
                        fontWeight: "bold",
                        fontSize: 15,
                      }}
                    >
                      {t("practice.sendForReviewButton")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Alerta Personalizada */}
      <CustomAlert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        buttonText={t("components.accept")}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}
