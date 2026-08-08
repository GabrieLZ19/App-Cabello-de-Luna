import React, { useEffect, useState, useCallback } from "react";
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
  RefreshControl,
  StyleSheet,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import {
  Moon,
  User,
  Camera,
  X,
  Upload,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Lock,
  RotateCcw,
  ChevronRight,
  Video,
  Play,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { GlassCard } from "@/components/GlassCard";
import { CustomAlert } from "@/components/CustomAlert";
import {
  getStudentPractices,
  uploadCutEvidenceWithFiles,
  PracticalModelData,
  CutData,
  storage,
} from "@/services";

export default function PracticeScreen() {
  const { t } = useTranslation();
  const [models, setModels] = useState<PracticalModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">(
    "success",
  );

  // Modal de Subida de Ficha
  const [uploadModalVisible, setModalVisible] = useState(false);
  const [selectedModelNum, setSelectedModelNum] = useState<number>(1);
  const [targetCutNum, setTargetCutNum] = useState<number>(1);
  const [photoBeforeUri, setPhotoBeforeUri] = useState<string | null>(null);
  const [photoAfterUri, setPhotoAfterUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoMimeType, setVideoMimeType] = useState<string | undefined>();
  const [technicalSheet, setTechnicalSheet] = useState("");

  // Modal de Historial / Feedback
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedCutDetail, setSelectedCutDetail] = useState<CutData | null>(
    null,
  );
  const [selectedModelForHistory, setSelectedModelForHistory] = useState<
    number | null
  >(null);
  const [selectedModelCuts, setSelectedModelCuts] = useState<CutData[]>([]);

  // Contador total de cortes aprobados
  const totalCuts = models.reduce((acc, m) => {
    const approvedCuts = m.cuts?.filter((c) => c.status === "APPROVED") || [];
    return acc + approvedCuts.length;
  }, 0);

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const openUploadModal = (modelNum: number, cutNumToUpload: number) => {
    setSelectedModelNum(modelNum);
    setTargetCutNum(cutNumToUpload);
    setPhotoBeforeUri(null);
    setPhotoAfterUri(null);
    setVideoUri(null);
    setVideoMimeType(undefined);
    setTechnicalSheet("");
    setModalVisible(true);
  };

  const openHistoryModal = (modelNum: number, cuts: CutData[]) => {
    setSelectedModelForHistory(modelNum);
    setSelectedModelCuts(cuts);
    setHistoryModalVisible(true);
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

      if (type === "before") setPhotoBeforeUri(base64Data);
      else setPhotoAfterUri(base64Data);
    }
  };

  const pickVideo = async () => {
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
      mediaTypes: ["videos"],
      quality: 0.4,
      videoMaxDuration: 60,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const mime = asset.mimeType || "video/mp4";
    const maxBytes = 12 * 1024 * 1024;

    if (asset.fileSize && asset.fileSize > maxBytes) {
      showAlert(
        t("practice.videoTooLargeTitle"),
        t("practice.videoTooLargeMessage"),
        "error",
      );
      return;
    }

    try {
      setSubmitting(true);
      let base64 = asset.base64;
      if (!base64 && asset.uri) {
        base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      if (!base64) {
        showAlert(
          t("practice.videoErrorTitle"),
          t("practice.videoErrorMessage"),
          "error",
        );
        return;
      }

      // ~1.37x overhead for base64 length vs bytes
      if (base64.length * 0.75 > maxBytes) {
        showAlert(
          t("practice.videoTooLargeTitle"),
          t("practice.videoTooLargeMessage"),
          "error",
        );
        return;
      }

      setVideoMimeType(mime);
      setVideoUri(`data:${mime};base64,${base64}`);
      showAlert(
        t("practice.videoAttachedTitle"),
        t("practice.videoAttachedMessage"),
        "success",
      );
    } catch {
      showAlert(
        t("practice.videoErrorTitle"),
        t("practice.videoErrorMessage"),
        "error",
      );
    } finally {
      setSubmitting(false);
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
      const formattedModelNum =
        selectedModelNum < 10 ? `0${selectedModelNum}` : `${selectedModelNum}`;

      await uploadCutEvidenceWithFiles(
        {
          modelName: t("practice.modelLabel", { number: formattedModelNum }),
          modelNumber: selectedModelNum,
          cutNumber: targetCutNum,
          lunarPhase: t("practice.currentLunarPhaseName"),
          photoBeforeBase64: photoBeforeUri,
          photoAfterBase64: photoAfterUri,
          technicalSheetText:
            technicalSheet.trim() || t("practice.defaultSheetText"),
          videoOptionalBase64: videoUri || undefined,
          videoMimeType: videoMimeType,
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

  const renderStatusIcon = (status: string, size = 16) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 color="#22C55E" size={size} />;
      case "CORRECTION_REQUIRED":
        return <AlertTriangle color="#EF4444" size={size} />;
      case "IN_REVIEW":
      case "PENDING":
        return <Clock color="#C9A45C" size={size} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "#22C55E";
      case "CORRECTION_REQUIRED":
        return "#EF4444";
      default:
        return "#C9A45C";
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C9A45C"
            colors={["#C9A45C"]}
          />
        }
      >
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

        {/* Banner Fase Lunar */}
        <GlassCard style={styles.lunarCard}>
          <View style={styles.lunarIconContainer}>
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
          <View style={styles.lunarCountBadge}>
            <Text
              style={{ color: "#C9A45C", fontSize: 12, fontWeight: "bold" }}
            >
              {t("practice.moonCount")}
            </Text>
          </View>
        </GlassCard>

        {/* Progreso General */}
        <GlassCard style={styles.progressCard}>
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
          <View style={styles.progressBarBackground}>
            <View
              style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
            />
          </View>
          <Text style={{ color: "#897F6B", fontSize: 12, lineHeight: 18 }}>
            {t("practice.cutsRequirement")}
          </Text>
        </GlassCard>

        {/* Grid de 10 Modelos */}
        {loading ? (
          <ActivityIndicator
            color="#C9A45C"
            size="small"
            style={{ marginVertical: 30 }}
          />
        ) : (
          <View style={styles.modelGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const modelData = models.find((m) => m.modelNumber === num);
              const cuts = modelData?.cuts || [];
              const latestCut = cuts.length > 0 ? cuts[cuts.length - 1] : null;
              const approvedCutsCount = cuts.filter(
                (c) => c.status === "APPROVED",
              ).length;
              const formattedNum = num < 10 ? `0${num}` : `${num}`;

              // Un modelo se desbloquea si es el 1 o si el anterior ya tiene al menos 1 corte
              const prevModel = models.find((m) => m.modelNumber === num - 1);
              const isUnlocked =
                num === 1 || (prevModel && (prevModel.cuts?.length || 0) > 0);

              // 🛡️ Lógica secuencial: Se habilita el botón si no hay cortes o el último está APROBADO
              const canUploadNext =
                !latestCut || latestCut.status === "APPROVED";
              const nextCutNumber = cuts.length + 1;

              return (
                <View key={num} style={styles.modelCardWrapper}>
                  <GlassCard
                    style={[
                      styles.modelCard,
                      {
                        backgroundColor: isUnlocked ? "#15100A" : "#0F0C08",
                        borderColor: !isUnlocked
                          ? "rgba(255, 255, 255, 0.04)"
                          : "rgba(201, 164, 92, 0.3)",
                        opacity: isUnlocked ? 1 : 0.5,
                      },
                    ]}
                  >
                    {/* Botón táctil superior para ver HISTORIAL */}
                    {cuts.length > 0 && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => openHistoryModal(num, cuts)}
                        style={styles.historyPlugin}
                      >
                        <MessageSquare color="#C9A45C" size={14} />
                        {latestCut && renderStatusIcon(latestCut.status, 12)}
                      </TouchableOpacity>
                    )}

                    <View style={{ alignItems: "center", marginTop: 12 }}>
                      <View
                        style={[
                          styles.avatarContainer,
                          {
                            backgroundColor: isUnlocked
                              ? "rgba(255, 255, 255, 0.05)"
                              : "rgba(255, 255, 255, 0.02)",
                          },
                        ]}
                      >
                        {!isUnlocked ? (
                          <Lock color="#524C40" size={22} />
                        ) : (
                          <User color="#C9A45C" size={24} />
                        )}
                      </View>

                      <Text
                        style={{
                          color: isUnlocked ? "#FFFFFF" : "#524C40",
                          fontSize: 14,
                          fontWeight: "bold",
                        }}
                      >
                        {t("practice.modelLabel", { number: formattedNum })}
                      </Text>

                      <Text
                        style={{ color: "#897F6B", fontSize: 11, marginTop: 2 }}
                      >
                        {isUnlocked
                          ? `${approvedCutsCount}/7 ${t("practice.statusApproved")}`
                          : t("practice.lockedStatus")}
                      </Text>
                    </View>

                    {/* Botón de Acción Principal */}
                    <View style={{ width: "100%", marginTop: 12 }}>
                      {isUnlocked && nextCutNumber <= 7 ? (
                        canUploadNext ? (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => openUploadModal(num, nextCutNumber)}
                            style={styles.actionButton}
                          >
                            <Text style={styles.actionButtonText}>
                              {cuts.length === 0
                                ? t("practice.uploadSheet")
                                : `Subir Corte 0${nextCutNumber}`}
                            </Text>
                          </TouchableOpacity>
                        ) : latestCut?.status === "CORRECTION_REQUIRED" ? (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => openHistoryModal(num, cuts)}
                            style={[
                              styles.actionButton,
                              styles.correctionButton,
                            ]}
                          >
                            <RotateCcw color="#EF4444" size={12} />
                            <Text
                              style={[
                                styles.actionButtonText,
                                { color: "#EF4444" },
                              ]}
                            >
                              {`Corregir Corte 0${latestCut.cutNumber}`}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <View
                            style={[styles.actionButton, styles.disabledButton]}
                          >
                            <Clock color="#524C40" size={12} />
                            <Text
                              style={[
                                styles.actionButtonText,
                                { color: "#524C40" },
                              ]}
                            >
                              {t("practice.statusInReview")}
                            </Text>
                          </View>
                        )
                      ) : !isUnlocked ? (
                        <View
                          style={[styles.actionButton, styles.disabledButton]}
                        >
                          <Text
                            style={[
                              styles.actionButtonText,
                              { color: "#524C40" },
                            ]}
                          >
                            {t("practice.lockedStatus")}
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={[styles.actionButton, styles.approvedButton]}
                        >
                          <CheckCircle2 color="#22C55E" size={12} />
                          <Text
                            style={[
                              styles.actionButtonText,
                              { color: "#22C55E" },
                            ]}
                          >
                            Completado
                          </Text>
                        </View>
                      )}
                    </View>
                  </GlassCard>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal de Historial de Cortes */}
      <Modal visible={historyModalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.historyModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("practice.historyTitle", {
                  number: selectedModelForHistory,
                })}
              </Text>
              <TouchableOpacity
                onPress={() => setHistoryModalVisible(false)}
                style={{ padding: 4 }}
              >
                <X color="#FFFFFF" size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {selectedModelCuts.map((cut, index) => {
                const isLast = index === selectedModelCuts.length - 1;
                return (
                  <TouchableOpacity
                    key={cut.id}
                    style={[
                      styles.historyItem,
                      isLast && styles.historyItemLast,
                    ]}
                    onPress={() => {
                      setSelectedCutDetail(cut);
                      setHistoryModalVisible(false);
                      setFeedbackModalVisible(true);
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <View
                        style={[
                          styles.cutNumberCircle,
                          { borderColor: getStatusColor(cut.status) },
                        ]}
                      >
                        <Text
                          style={[
                            styles.cutNumberText,
                            { color: getStatusColor(cut.status) },
                          ]}
                        >
                          {cut.cutNumber}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.historyItemTitle}>
                          {t("practice.cutFormat", { number: cut.cutNumber })}
                        </Text>
                        <Text style={styles.historyItemDate}>
                          {cut.submittedAt
                            ? new Date(cut.submittedAt).toLocaleDateString()
                            : "Reciente"}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {renderStatusIcon(cut.status, 16)}
                      <ChevronRight color="#524C40" size={18} />
                    </View>
                  </TouchableOpacity>
                );
              })}

              {selectedModelCuts.length > 0 &&
                selectedModelCuts[selectedModelCuts.length - 1].status !==
                  "APPROVED" && (
                  <View style={styles.blockingNotice}>
                    <Clock color="#C9A45C" size={16} />
                    <Text style={styles.blockingNoticeText}>
                      {t("practice.waitingApproval", {
                        number:
                          selectedModelCuts[selectedModelCuts.length - 1]
                            .cutNumber,
                      })}
                    </Text>
                  </View>
                )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal de Detalle / Retroalimentación Individual */}
      {selectedCutDetail && (
        <Modal visible={feedbackModalVisible} animationType="slide" transparent>
          <SafeAreaView style={styles.modalOverlay}>
            <View style={styles.feedbackModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {t("practice.cutFormat", {
                    number: selectedCutDetail.cutNumber,
                  })}{" "}
                  · Detalle
                </Text>
                <TouchableOpacity
                  onPress={() => setFeedbackModalVisible(false)}
                  style={{ padding: 4 }}
                >
                  <X color="#FFFFFF" size={22} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${getStatusColor(selectedCutDetail.status)}20`,
                    },
                  ]}
                >
                  {renderStatusIcon(selectedCutDetail.status, 20)}
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(selectedCutDetail.status) },
                    ]}
                  >
                    {t(
                      `practice.status${selectedCutDetail.status === "CORRECTION_REQUIRED" ? "Correction" : selectedCutDetail.status === "APPROVED" ? "Approved" : "InReview"}`,
                    )}
                  </Text>
                </View>

                {selectedCutDetail.evidence && (
                  <>
                    <View style={styles.evidenceContainer}>
                      <View style={styles.photoWrapper}>
                        <Text style={styles.photoLabel}>
                          {t("practice.photoBeforeLabel")}
                        </Text>
                        <Image
                          source={{
                            uri: selectedCutDetail.evidence.photoBeforeUrl,
                          }}
                          style={styles.evidencePhoto}
                        />
                      </View>
                      <View style={styles.photoWrapper}>
                        <Text style={styles.photoLabel}>
                          {t("practice.photoAfterLabel")}
                        </Text>
                        <Image
                          source={{
                            uri: selectedCutDetail.evidence.photoAfterUrl,
                          }}
                          style={styles.evidencePhoto}
                        />
                      </View>
                    </View>

                    {selectedCutDetail.evidence.videoOptionalUrl ? (
                      <View style={styles.detailVideoBlock}>
                        <Text style={styles.photoLabel}>
                          {t("practice.optionalVideoSection")}
                        </Text>
                        <TouchableOpacity
                          style={styles.detailVideoOpen}
                          activeOpacity={0.85}
                          onPress={() => {
                            const url =
                              selectedCutDetail.evidence?.videoOptionalUrl;
                            if (url) Linking.openURL(url);
                          }}
                        >
                          <View style={styles.detailVideoPlayIcon}>
                            <Play color="#0C0A07" size={22} fill="#C9A45C" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.detailVideoTitle}>
                              {t("practice.playAttachedVideo")}
                            </Text>
                            <Text style={styles.detailVideoHint}>
                              {t("practice.playAttachedVideoHint")}
                            </Text>
                          </View>
                          <Video color="#C9A45C" size={18} />
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </>
                )}

                <Text style={styles.sectionTitle}>
                  {t("practice.instructorComments")}
                </Text>
                <View style={styles.commentsBox}>
                  <Text style={styles.commentsText}>
                    {selectedCutDetail.feedbacks &&
                    selectedCutDetail.feedbacks.length > 0
                      ? selectedCutDetail.feedbacks[
                          selectedCutDetail.feedbacks.length - 1
                        ].comments
                      : t("practice.noFeedbackYet")}
                  </Text>
                </View>

                {selectedCutDetail.status === "CORRECTION_REQUIRED" && (
                  <TouchableOpacity
                    onPress={() => {
                      setFeedbackModalVisible(false);
                      openUploadModal(
                        selectedModelForHistory || 1,
                        selectedCutDetail.cutNumber,
                      );
                    }}
                    style={[
                      styles.actionButton,
                      styles.correctionButton,
                      { marginTop: 10, paddingVertical: 14 },
                    ]}
                  >
                    <RotateCcw color="#EF4444" size={16} />
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: "#EF4444", fontSize: 14 },
                      ]}
                    >
                      {t("practice.reuploadEvidence")}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.backToHistoryBtn}
                  onPress={() => {
                    setFeedbackModalVisible(false);
                    setHistoryModalVisible(true);
                  }}
                >
                  <Text style={styles.backToHistoryText}>
                    Volver al Historial
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>
      )}

      {/* Modal de Subida de Ficha */}
      <Modal visible={uploadModalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.uploadModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("practice.modalHeaderTitle", {
                  number: targetCutNum,
                  model: selectedModelNum,
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
              <Text style={styles.sectionTitle}>
                {t("practice.evidencePhotosSection")}
              </Text>
              <View style={styles.photoPickerContainer}>
                <TouchableOpacity
                  onPress={() => pickImage("before")}
                  style={[
                    styles.photoPicker,
                    {
                      borderColor: photoBeforeUri
                        ? "#C9A45C"
                        : "rgba(255, 255, 255, 0.1)",
                    },
                  ]}
                >
                  {photoBeforeUri ? (
                    <Image
                      source={{ uri: photoBeforeUri }}
                      style={styles.pickedImage}
                    />
                  ) : (
                    <>
                      <Camera color="#897F6B" size={24} />
                      <Text style={styles.photoPickerText}>
                        {t("practice.photoBeforeLabel")}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => pickImage("after")}
                  style={[
                    styles.photoPicker,
                    {
                      borderColor: photoAfterUri
                        ? "#C9A45C"
                        : "rgba(255, 255, 255, 0.1)",
                    },
                  ]}
                >
                  {photoAfterUri ? (
                    <Image
                      source={{ uri: photoAfterUri }}
                      style={styles.pickedImage}
                    />
                  ) : (
                    <>
                      <Camera color="#897F6B" size={24} />
                      <Text style={styles.photoPickerText}>
                        {t("practice.photoAfterLabel")}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>
                {t("practice.optionalVideoSection")}
              </Text>
              <View
                style={[
                  styles.videoPicker,
                  {
                    borderColor: videoUri
                      ? "rgba(201, 164, 92, 0.55)"
                      : "rgba(255, 255, 255, 0.1)",
                    backgroundColor: videoUri
                      ? "rgba(201, 164, 92, 0.08)"
                      : "#0C0A07",
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={pickVideo}
                  style={styles.videoPickerMain}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.videoIconWrap,
                      videoUri && {
                        backgroundColor: "rgba(201, 164, 92, 0.18)",
                        borderColor: "rgba(201, 164, 92, 0.4)",
                      },
                    ]}
                  >
                    <Video
                      color={videoUri ? "#C9A45C" : "#897F6B"}
                      size={20}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.photoPickerText,
                        {
                          marginTop: 0,
                          color: videoUri ? "#C9A45C" : "#B0A894",
                          fontWeight: videoUri ? "600" : "500",
                        },
                      ]}
                    >
                      {videoUri
                        ? t("practice.videoSelected")
                        : t("practice.videoOptionalLabel")}
                    </Text>
                    {videoUri ? (
                      <Text style={styles.videoHint}>
                        {t("practice.videoTapToReplace")}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
                {videoUri ? (
                  <TouchableOpacity
                    onPress={() => {
                      setVideoUri(null);
                      setVideoMimeType(undefined);
                    }}
                    style={styles.videoRemoveBtn}
                    hitSlop={10}
                    accessibilityLabel={t("practice.videoRemove")}
                  >
                    <X color="#B0A894" size={16} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <Text style={styles.sectionTitle}>
                {t("practice.technicalSheetSection")}
              </Text>
              <TextInput
                placeholder={t("practice.technicalSheetPlaceholder")}
                placeholderTextColor="#524C40"
                multiline
                numberOfLines={4}
                value={technicalSheet}
                onChangeText={setTechnicalSheet}
                style={styles.technicalInput}
              />

              <TouchableOpacity
                onPress={handleSendEvidence}
                disabled={submitting}
                style={styles.submitButton}
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
                    <Text style={styles.submitButtonText}>
                      {t("practice.sendForReviewButton")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

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

const styles = StyleSheet.create({
  lunarCard: {
    backgroundColor: "#15100A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(201, 164, 92, 0.25)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  lunarIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(201, 164, 92, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  lunarCountBadge: {
    backgroundColor: "rgba(201, 164, 92, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(201, 164, 92, 0.3)",
  },
  progressCard: {
    backgroundColor: "#15100A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#221C14",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#C9A45C",
    borderRadius: 4,
  },
  modelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  modelCardWrapper: { width: "48%", marginBottom: 16 },
  modelCard: {
    borderRadius: 22,
    padding: 14,
    alignItems: "center",
    position: "relative",
    minHeight: 210,
    justifyContent: "space-between",
  },
  historyPlugin: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(201, 164, 92, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(201, 164, 92, 0.3)",
  },
  actionButton: {
    width: "100%",
    backgroundColor: "rgba(201, 164, 92, 0.15)",
    borderWidth: 1,
    borderColor: "#C9A45C",
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  actionButtonText: { color: "#C9A45C", fontSize: 11, fontWeight: "bold" },
  disabledButton: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  correctionButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "#EF4444",
  },
  approvedButton: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "#22C55E",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  historyModalContent: {
    backgroundColor: "#15100A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(201, 164, 92, 0.3)",
    padding: 22,
    maxHeight: "85%",
  },
  feedbackModalContent: {
    backgroundColor: "#15100A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(201, 164, 92, 0.3)",
    padding: 22,
    maxHeight: "85%",
  },
  uploadModalContent: {
    backgroundColor: "#15100A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(201, 164, 92, 0.3)",
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  statusBadge: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  statusText: { fontWeight: "bold", fontSize: 14 },
  sectionTitle: {
    color: "#B0A894",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  commentsBox: {
    backgroundColor: "#0C0A07",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
  },
  commentsText: { color: "#FFFFFF", fontSize: 13, lineHeight: 20 },
  evidenceContainer: { flexDirection: "row", gap: 10, marginBottom: 15 },
  photoWrapper: { flex: 1 },
  photoLabel: {
    color: "#897F6B",
    fontSize: 11,
    marginBottom: 5,
    fontWeight: "600",
  },
  evidencePhoto: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  detailVideoBlock: { marginBottom: 16 },
  detailVideoOpen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0C0A07",
    borderWidth: 1,
    borderColor: "rgba(201,164,92,0.35)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  detailVideoPlayIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#C9A45C",
    alignItems: "center",
    justifyContent: "center",
  },
  detailVideoTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  detailVideoHint: {
    color: "#897F6B",
    fontSize: 11,
    marginTop: 2,
  },
  photoPickerContainer: { flexDirection: "row", gap: 12, marginBottom: 16 },
  photoPicker: {
    flex: 1,
    height: 110,
    backgroundColor: "#0C0A07",
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  pickedImage: { width: "100%", height: "100%" },
  photoPickerText: { color: "#B0A894", fontSize: 12, marginTop: 4 },
  videoPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0C0A07",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  videoPickerMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  videoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoHint: {
    color: "#897F6B",
    fontSize: 11,
    marginTop: 2,
  },
  videoRemoveBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  technicalInput: {
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
  },
  submitButton: {
    backgroundColor: "#C9A45C",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 12,
  },
  submitButtonText: { color: "#0C0A07", fontWeight: "bold", fontSize: 15 },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  historyItemLast: { borderBottomWidth: 0 },
  cutNumberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  cutNumberText: { fontWeight: "bold", fontSize: 14 },
  historyItemTitle: { color: "white", fontWeight: "bold", fontSize: 14 },
  historyItemDate: { color: "#897F6B", fontSize: 11, marginTop: 1 },
  blockingNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(201, 164, 92, 0.1)",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  blockingNoticeText: { color: "#C9A45C", fontSize: 12, flex: 1 },
  backToHistoryBtn: { alignItems: "center", padding: 10, marginTop: 10 },
  backToHistoryText: { color: "#C9A45C", fontSize: 12, fontWeight: "600" },
});
