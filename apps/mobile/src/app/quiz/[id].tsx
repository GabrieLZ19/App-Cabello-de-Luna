import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  X,
  Clock,
  CheckCircle2,
  Lock,
  RefreshCw,
  ArrowRight,
} from "lucide-react-native";
import { GlassCard } from "@/components/GlassCard";
import {
  getModuleById,
  submitQuiz,
  TheoreticalModule,
  QuizResult,
  storage,
} from "@/services";

export default function QuizScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const moduleId = id as string;

  const [moduleData, setModuleData] = useState<TheoreticalModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [secondsLeft, setSecondsLeft] = useState(20 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (quizResult) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [quizResult]);

  useEffect(() => {
    async function loadData() {
      try {
        const token = await storage.getToken();
        const data = await getModuleById(moduleId, token || "");
        setModuleData(data);
      } catch (err) {
        console.error("Error cargando preguntas del cuestionario:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [moduleId]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  const evaluation = moduleData?.evaluations?.[0];
  const questions = evaluation?.questions || [];
  const currentQuestion = questions[currentQuestionIdx];
  const totalQuestions = questions.length || 5;
  const progressPercent = Math.round(
    ((currentQuestionIdx + 1) / totalQuestions) * 100,
  );

  const handleSelectOption = (optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIdx]: optionIdx,
    }));
  };

  const handleNextOrSubmit = async () => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setIsSubmitting(true);
      try {
        const token = await storage.getToken();
        const answersArray = questions.map(
          (_, idx) => selectedAnswers[idx] ?? 0,
        );
        const res = await submitQuiz(
          evaluation?.id || "eval-1",
          answersArray,
          token || "",
        );
        if (res.passed) {
          await storage.addCompletedModule(moduleId);
        }
        setQuizResult(res);
      } catch (err: any) {
        console.error("Error al enviar examen:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setQuizResult(null);
    setSecondsLeft(20 * 60);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#0C0A07",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="#C9A45C" size="large" />
      </SafeAreaView>
    );
  }

  // SCREEN 10 / 10b: RESULTADOS DE EVALUACIÓN
  if (quizResult) {
    const isPassed = quizResult.passed;
    const timeSpent = formatTimer(20 * 60 - secondsLeft);

    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#0C0A07" }}
        edges={["top", "left", "right"]}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 32,
            alignItems: "center",
          }}
        >
          {/* Dual Ring Score Badge */}
          <View
            style={{
              width: 148,
              height: 148,
              borderRadius: 74,
              backgroundColor: isPassed
                ? "rgba(201, 164, 92, 0.12)"
                : "rgba(248, 113, 113, 0.12)",
              borderWidth: 1.5,
              borderColor: isPassed
                ? "rgba(201, 164, 92, 0.4)"
                : "rgba(248, 113, 113, 0.4)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "#120C07",
                borderWidth: 3.5,
                borderColor: isPassed ? "#C9A45C" : "#F87171",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "bold" }}
              >
                {quizResult.score * 10}%
              </Text>
              <Text
                style={{
                  color: isPassed ? "#C9A45C" : "#F87171",
                  fontSize: 11,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginTop: 2,
                }}
              >
                {isPassed ? t("quiz.approved") : t("quiz.notApproved")}
              </Text>
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 26,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            {isPassed ? t("quiz.congratulations") : t("quiz.failedTitle")}
          </Text>
          <Text
            style={{
              color: "#B0A894",
              fontSize: 14,
              lineHeight: 22,
              textAlign: "center",
              marginBottom: 32,
              maxWidth: 320,
            }}
          >
            {isPassed
              ? t("quiz.passedDesc", {
                  title:
                    moduleData?.title ||
                    "Introducción al Método Cabello de Luna®",
                })
              : t("quiz.failedDesc")}
          </Text>

          {/* Metric Boxes */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginBottom: 28,
              width: "100%",
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "#17120D",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}
              >
                {quizResult.correctAnswers}/{quizResult.totalQuestions}
              </Text>
              <Text style={{ color: "#B0A894", fontSize: 11, marginTop: 4 }}>
                {t("quiz.correctCount")}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: "#17120D",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}
              >
                {timeSpent}
              </Text>
              <Text style={{ color: "#B0A894", fontSize: 11, marginTop: 4 }}>
                {t("quiz.timeSpent")}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: "#17120D",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: isPassed ? "#C9A45C" : "#F87171",
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                {quizResult.score * 10}
              </Text>
              <Text style={{ color: "#B0A894", fontSize: 11, marginTop: 4 }}>
                {t("quiz.grade")}
              </Text>
            </View>
          </View>

          {/* Level Unlocked or Failed Card */}
          {isPassed ? (
            <GlassCard
              style={{
                width: "100%",
                backgroundColor: "#17120D",
                borderRadius: 18,
                borderWidth: 1.5,
                borderColor: "#C9A45C",
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 32,
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
                  marginRight: 14,
                }}
              >
                <Lock color="#C9A45C" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#C9A45C",
                    fontSize: 11,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {t("quiz.newLevelUnlocked")}
                </Text>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontWeight: "bold",
                    marginTop: 2,
                  }}
                >
                  {t("quiz.nextModuleDefault")}
                </Text>
              </View>
            </GlassCard>
          ) : (
            <GlassCard
              style={{
                width: "100%",
                backgroundColor: "#17120D",
                borderRadius: 18,
                borderWidth: 1.5,
                borderColor: "#F87171",
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 32,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(248, 113, 113, 0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <RefreshCw color="#F87171" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#F87171",
                    fontSize: 11,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {t("quiz.failedBoxHeader")}
                </Text>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: "600",
                    marginTop: 2,
                  }}
                >
                  {t("quiz.failedBoxMessage")}
                </Text>
              </View>
            </GlassCard>
          )}

          {/* Action Button */}
          {isPassed ? (
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/theory")}
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
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  color: "#0C0A07",
                  fontWeight: "bold",
                  fontSize: 16,
                  marginRight: 8,
                }}
              >
                {t("quiz.continueToNextModule")}
              </Text>
              <ArrowRight color="#0C0A07" size={20} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleRetryQuiz}
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
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  color: "#0C0A07",
                  fontWeight: "bold",
                  fontSize: 16,
                  marginRight: 8,
                }}
              >
                {t("quiz.retryQuiz")}
              </Text>
              <RefreshCw color="#0C0A07" size={18} />
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // SCREEN 09: CUESTIONARIO INTERACTIVO
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#0C0A07" }}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 60,
        }}
      >
        {/* Top Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
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
            }}
          >
            <X color="#FFFFFF" size={20} />
          </TouchableOpacity>

          <View
            style={{
              backgroundColor: "#15100A",
              borderWidth: 1.5,
              borderColor: "#C9A45C",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Clock color="#C9A45C" size={16} />
            <Text
              style={{ color: "#C9A45C", fontWeight: "bold", fontSize: 14 }}
            >
              {formatTimer(secondsLeft)}
            </Text>
          </View>
        </View>

        {/* Progress Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>
            {t("quiz.questionProgress", {
              current: currentQuestionIdx + 1,
              total: totalQuestions,
            })}
          </Text>
          <Text style={{ color: "#C9A45C", fontSize: 14, fontWeight: "bold" }}>
            {progressPercent}%
          </Text>
        </View>

        {/* Gold Progress Bar */}
        <View
          style={{
            height: 6,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 24,
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

        {/* Question Card */}
        <GlassCard
          style={{
            padding: 22,
            borderRadius: 24,
            backgroundColor: "#17120D",
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 18,
              fontWeight: "bold",
              lineHeight: 26,
              marginBottom: 20,
            }}
          >
            {currentQuestion?.text}
          </Text>

          <View style={{ gap: 12 }}>
            {currentQuestion?.options.map((optText, optIdx) => {
              const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;
              return (
                <TouchableOpacity
                  key={optIdx}
                  onPress={() => handleSelectOption(optIdx)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(201, 164, 92, 0.15)"
                      : "#120C07",
                    borderWidth: 1.5,
                    borderColor: isSelected
                      ? "#C9A45C"
                      : "rgba(255, 255, 255, 0.08)",
                    borderRadius: 14,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: isSelected ? "#C9A45C" : "#897F6B",
                      backgroundColor: isSelected ? "#C9A45C" : "transparent",
                      marginRight: 14,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected ? (
                      <CheckCircle2 color="#0C0A07" size={16} />
                    ) : null}
                  </View>

                  <Text
                    style={{
                      color: isSelected ? "#FFFFFF" : "#B0A894",
                      fontSize: 15,
                      flex: 1,
                      fontWeight: isSelected ? "bold" : "normal",
                    }}
                  >
                    {optText}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* Primary Action Button */}
        <TouchableOpacity
          onPress={handleNextOrSubmit}
          disabled={isSubmitting}
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
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#0C0A07" size="small" />
          ) : (
            <>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  color: "#0C0A07",
                  fontWeight: "bold",
                  fontSize: 16,
                  marginRight: 8,
                }}
              >
                {currentQuestionIdx < totalQuestions - 1
                  ? t("quiz.next")
                  : t("quiz.finishQuiz")}
              </Text>
              <ArrowRight color="#0C0A07" size={20} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
