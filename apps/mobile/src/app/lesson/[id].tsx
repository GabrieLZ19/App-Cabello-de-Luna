import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  X,
  Clock,
  CheckCircle2,
  Play,
  Pause,
  ChevronRight,
  Sparkles,
  Lock,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Award,
  FileText,
  HelpCircle,
  GraduationCap,
  ListChecks,
} from 'lucide-react-native';
import { GlassCard } from '@/components/GlassCard';
import { getModuleById, TheoreticalModule, ChapterItem, GlossaryItem, PracticalCase, PracticalActivity, storage } from '@/services';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LessonDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const moduleId = (id as string) || 'mod-1';

  const [moduleData, setModuleData] = useState<TheoreticalModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSegment, setCurrentSegment] = useState<
    'video' | 'summary' | 'eval'
  >('video');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(20 * 60);

  // Estado para controlar cuáles secciones del Resumen están abiertas
  const [openSummarySections, setOpenSummarySections] = useState<Record<string, boolean>>({
    intro: true,
    objectives: true,
    competencies: true,
  });

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadLessonContent() {
      try {
        const token = await storage.getToken();
        const data = await getModuleById(moduleId, token || '');
        setModuleData(data);
      } catch (err) {
        console.error('Error cargando detalle pedagógico de la clase:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLessonContent();
  }, [moduleId]);

  const toggleChapter = (chapterId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  const toggleSummarySectionKey = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSummarySections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAllSummarySections = (expand: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const allKeys = [
      'intro', 'objectives', 'competencies', 'whatIs', 'philosophy',
      'system', 'multidiscipline', 'keyConcepts', 'glossary',
      'practicalCase', 'practicalActivity', 'conclusion', 'bibliography'
    ];
    const newState: Record<string, boolean> = {};
    allKeys.forEach((k) => { newState[k] = expand; });
    setOpenSummarySections(newState);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0C0A07', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#C9A45C" size="large" />
      </SafeAreaView>
    );
  }

  // Parse Chapters strictly from Supabase DB via REST service
  const getChaptersList = (): ChapterItem[] => {
    if (!moduleData?.chaptersJson) return [];
    if (Array.isArray(moduleData.chaptersJson)) return moduleData.chaptersJson;
    if (typeof moduleData.chaptersJson === 'string') {
      try {
        const parsed = JSON.parse(moduleData.chaptersJson);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const chapters = getChaptersList();
  const objectives: string[] = moduleData?.objectivesJson || [];
  const competencies: string[] = moduleData?.competenciesJson || [];
  const keyConcepts: string[] = moduleData?.keyConceptsJson || [];
  const glossary: GlossaryItem[] = moduleData?.glossaryJson || [];
  const practicalCase: PracticalCase | undefined = moduleData?.practicalCaseJson;
  const practicalActivity: PracticalActivity | undefined = moduleData?.practicalActivityJson;
  const bibliography: string[] = moduleData?.bibliographyJson || [];
  const evaluationId = moduleData?.evaluations?.[0]?.id || 'eval-1';
  const totalQuestions = moduleData?.evaluations?.[0]?.totalQuestions || 5;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0C0A07' }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 }}>
        {/* Top Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#15100A',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X color="#FFFFFF" size={20} />
          </TouchableOpacity>

          {/* Timer Pill */}
          <View
            style={{
              backgroundColor: '#15100A',
              borderWidth: 1.5,
              borderColor: '#C9A45C',
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Clock color="#C9A45C" size={15} />
            <Text style={{ color: '#C9A45C', fontWeight: 'bold', fontSize: 14 }}>
              {formatTimer(secondsLeft)}
            </Text>
          </View>
        </View>

        {/* Title & Info Badges (100% Dynamic from Supabase DB) */}
        <View style={{ gap: 6, marginBottom: 16 }}>
          <Text style={{ color: '#C9A45C', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
            {moduleData?.moduleName}
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', lineHeight: 30 }}>
            Clase {moduleData?.week}: {moduleData?.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock color="#B0A894" size={13} style={{ marginRight: 4 }} />
              <Text style={{ color: '#B0A894', fontSize: 12 }}>{moduleData?.totalDurationMinutes || 20} min</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <GraduationCap color="#B0A894" size={13} style={{ marginRight: 4 }} />
              <Text style={{ color: '#B0A894', fontSize: 12 }}>{moduleData?.level || 'Técnico Profesional'}</Text>
            </View>
          </View>
          <Text style={{ color: '#C9A45C', fontSize: 12, fontWeight: '600', marginTop: 2 }}>
            Avatar IA · {moduleData?.instructorName || moduleData?.avatar?.name}
          </Text>
        </View>

        {/* 3 Segment Progress Tabs */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => setCurrentSegment('video')}
            style={{ flex: 1 }}
            activeOpacity={0.8}
          >
            <View
              style={{
                height: 3,
                backgroundColor: currentSegment === 'video' ? '#C9A45C' : 'rgba(255, 255, 255, 0.15)',
                borderRadius: 2,
                marginBottom: 6,
              }}
            />
            <Text style={{ color: currentSegment === 'video' ? '#FFFFFF' : '#897F6B', fontSize: 12, fontWeight: 'bold' }}>
              1 Video
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurrentSegment('summary')}
            style={{ flex: 1 }}
            activeOpacity={0.8}
          >
            <View
              style={{
                height: 3,
                backgroundColor: currentSegment === 'summary' ? '#C9A45C' : 'rgba(255, 255, 255, 0.15)',
                borderRadius: 2,
                marginBottom: 6,
              }}
            />
            <Text style={{ color: currentSegment === 'summary' ? '#FFFFFF' : '#897F6B', fontSize: 12, fontWeight: 'bold' }}>
              2 Resumen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurrentSegment('eval')}
            style={{ flex: 1 }}
            activeOpacity={0.8}
          >
            <View
              style={{
                height: 3,
                backgroundColor: currentSegment === 'eval' ? '#C9A45C' : 'rgba(255, 255, 255, 0.15)',
                borderRadius: 2,
                marginBottom: 6,
              }}
            />
            <Text style={{ color: currentSegment === 'eval' ? '#FFFFFF' : '#897F6B', fontSize: 12, fontWeight: 'bold' }}>
              3 Evaluación
            </Text>
          </TouchableOpacity>
        </View>

        {/* SEGMENT 1: VIDEO Y CAPÍTULOS DE LA LECCIÓN (100% DESDE SUPABASE DB) */}
        {currentSegment === 'video' && (
          <View>
            {/* AI Avatar Player Banner Card */}
            <View
              style={{
                width: '100%',
                height: 220,
                borderRadius: 24,
                backgroundColor: '#17120D',
                borderWidth: 1,
                borderColor: 'rgba(201, 164, 92, 0.3)',
                marginBottom: 16,
                position: 'relative',
                overflow: 'hidden',
                justifyContent: 'space-between',
                padding: 16,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' }} />
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>AVATAR IA</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: '#B0A894', fontSize: 11, fontWeight: 'bold' }}>CC</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(15, 11, 7, 0.85)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 16,
                    padding: 12,
                    marginRight: 12,
                  }}
                >
                  <Text style={{ color: '#C9A45C', fontSize: 11, fontWeight: 'bold', marginBottom: 2 }}>
                    Especialista capilar · explica
                  </Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 12, lineHeight: 18 }}>
                    «El principio central del método es Menos es Más: detener el daño acumulativo para devolver la fibra a su estado natural.»
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setIsPlaying(!isPlaying)}
                  activeOpacity={0.8}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: '#C9A45C',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#C9A45C',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  {isPlaying ? (
                    <Pause color="#0C0A07" size={24} fill="#0C0A07" />
                  ) : (
                    <Play color="#0C0A07" size={24} fill="#0C0A07" style={{ marginLeft: 2 }} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Media Progress Bar */}
            <View style={{ marginBottom: 24 }}>
              <View style={{ height: 4, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                <View style={{ width: '42%', height: '100%', backgroundColor: '#C9A45C', borderRadius: 2 }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#B0A894', fontSize: 11 }}>08:24</Text>
                <Text style={{ color: '#B0A894', fontSize: 11 }}>20:00</Text>
              </View>
            </View>

            {/* DESARROLLO DE LOS TEMAS (CAPÍTULOS 100% DINÁMICOS DESDE SUPABASE DB) */}
            <Text style={{ color: '#C9A45C', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
              DESARROLLO DE LOS TEMAS (CAPÍTULOS)
            </Text>

            <View style={{ gap: 12, marginBottom: 24 }}>
              {chapters.map((chap) => {
                const isExpanded = expandedChapter === chap.id;
                return (
                  <View key={chap.id}>
                    <TouchableOpacity
                      onPress={() => toggleChapter(chap.id)}
                      activeOpacity={0.85}
                      style={{
                        backgroundColor: '#17120D',
                        borderRadius: 18,
                        borderWidth: 1.5,
                        borderColor: isExpanded ? '#C9A45C' : 'rgba(255, 255, 255, 0.08)',
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <View
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 19,
                          backgroundColor: chap.status === 'completed'
                            ? 'rgba(34, 197, 94, 0.15)'
                            : chap.status === 'active'
                            ? 'rgba(201, 164, 92, 0.15)'
                            : 'rgba(255, 255, 255, 0.04)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 14,
                        }}
                      >
                        {chap.status === 'completed' ? (
                          <CheckCircle2 color="#22C55E" size={20} />
                        ) : chap.status === 'active' ? (
                          <Play color="#C9A45C" size={18} fill="#C9A45C" style={{ marginLeft: 2 }} />
                        ) : (
                          <Lock color="#897F6B" size={18} />
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' }}>
                          {chap.title}
                        </Text>
                        <Text style={{ color: '#B0A894', fontSize: 12, marginTop: 2 }}>
                          {chap.timestamp}
                        </Text>
                      </View>

                      <ChevronDown
                        color="#B0A894"
                        size={20}
                        style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                      />
                    </TouchableOpacity>

                    {isExpanded ? (
                      <GlassCard style={{ marginTop: 8, padding: 18, borderRadius: 16, backgroundColor: '#140E0A', borderColor: 'rgba(201, 164, 92, 0.2)', borderWidth: 1 }}>
                        <Text style={{ color: '#B0A894', fontSize: 13, lineHeight: 22 }}>
                          {chap.content}
                        </Text>
                      </GlassCard>
                    ) : null}
                  </View>
                );
              })}
            </View>

            {/* AI Assistant Card */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                backgroundColor: '#17120D',
                borderRadius: 18,
                borderWidth: 1,
                borderColor: 'rgba(201, 164, 92, 0.25)',
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(201, 164, 92, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                <Sparkles color="#C9A45C" size={22} />
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', flex: 1 }}>
                ¿Dudas? Preguntá al asistente IA
              </Text>
              <ChevronRight color="#B0A894" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentSegment('summary')}
              activeOpacity={0.85}
              style={{
                width: '100%',
                backgroundColor: '#C9A45C',
                paddingVertical: 16,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#C9A45C',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text style={{ color: '#0C0A07', fontWeight: 'bold', fontSize: 16, marginRight: 8 }}>
                Continuar al resumen
              </Text>
              <ArrowRight color="#0C0A07" size={20} />
            </TouchableOpacity>
          </View>
        )}

        {/* SEGMENT 2: RESUMEN Y ESTRUCTURA PEDAGÓGICA TOTALMENTE DESPLEGABLE (100% DINÁMICO DESDE SUPABASE DB) */}
        {currentSegment === 'summary' && (
          <View style={{ gap: 14 }}>
            {/* Header + Control General para Expandir/Colapsar Todo */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ color: '#C9A45C', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                INFORME PEDAGÓGICO COMPLETO
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => toggleAllSummarySections(true)}
                  style={{ backgroundColor: 'rgba(201, 164, 92, 0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}
                >
                  <Text style={{ color: '#C9A45C', fontSize: 11, fontWeight: 'bold' }}>Expandir todo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleAllSummarySections(false)}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}
                >
                  <Text style={{ color: '#B0A894', fontSize: 11, fontWeight: 'bold' }}>Colapsar todo</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SECCIÓN: INTRODUCCIÓN (Desplegable) */}
            {moduleData?.introductionText ? (
              <View>
                <TouchableOpacity
                  onPress={() => toggleSummarySectionKey('intro')}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#17120D',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: openSummarySections.intro ? '#C9A45C' : 'rgba(255, 255, 255, 0.08)',
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', flex: 1 }}>
                    Introducción
                  </Text>
                  <ChevronDown color="#B0A894" size={20} style={{ transform: [{ rotate: openSummarySections.intro ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {openSummarySections.intro && (
                  <GlassCard style={{ marginTop: 8, padding: 18, borderRadius: 16, backgroundColor: '#140E0A', borderColor: 'rgba(201, 164, 92, 0.2)', borderWidth: 1 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 13, lineHeight: 22 }}>
                      {moduleData.introductionText}
                    </Text>
                  </GlassCard>
                )}
              </View>
            ) : null}

            {/* SECCIÓN: OBJETIVOS DE APRENDIZAJE (Desplegable) */}
            {objectives.length > 0 ? (
              <View>
                <TouchableOpacity
                  onPress={() => toggleSummarySectionKey('objectives')}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#17120D',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: openSummarySections.objectives ? '#C9A45C' : 'rgba(255, 255, 255, 0.08)',
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', flex: 1 }}>
                    Objetivos de Aprendizaje
                  </Text>
                  <ChevronDown color="#B0A894" size={20} style={{ transform: [{ rotate: openSummarySections.objectives ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {openSummarySections.objectives && (
                  <GlassCard style={{ marginTop: 8, padding: 18, borderRadius: 16, backgroundColor: '#140E0A', borderColor: 'rgba(201, 164, 92, 0.2)', borderWidth: 1 }}>
                    {objectives.map((obj, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 10 }}>
                        <CheckCircle2 color="#C9A45C" size={16} style={{ marginTop: 2 }} />
                        <Text style={{ color: '#FFFFFF', fontSize: 13, flex: 1, lineHeight: 20 }}>{obj}</Text>
                      </View>
                    ))}
                  </GlassCard>
                )}
              </View>
            ) : null}

            {/* SECCIÓN: COMPETENCIAS A DESARROLLAR (Desplegable) */}
            {competencies.length > 0 ? (
              <View>
                <TouchableOpacity
                  onPress={() => toggleSummarySectionKey('competencies')}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#17120D',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: openSummarySections.competencies ? '#C9A45C' : 'rgba(255, 255, 255, 0.08)',
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', flex: 1 }}>
                    Competencias a Desarrollar
                  </Text>
                  <ChevronDown color="#B0A894" size={20} style={{ transform: [{ rotate: openSummarySections.competencies ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {openSummarySections.competencies && (
                  <GlassCard style={{ marginTop: 8, padding: 18, borderRadius: 16, backgroundColor: '#140E0A', borderColor: 'rgba(201, 164, 92, 0.2)', borderWidth: 1 }}>
                    {competencies.map((comp, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 10 }}>
                        <ListChecks color="#C9A45C" size={16} style={{ marginTop: 2 }} />
                        <Text style={{ color: '#FFFFFF', fontSize: 13, flex: 1, lineHeight: 20 }}>{comp}</Text>
                      </View>
                    ))}
                  </GlassCard>
                )}
              </View>
            ) : null}

            {/* SECCIÓN: CONCEPTOS CLAVE (Desplegable) */}
            {keyConcepts.length > 0 ? (
              <View>
                <TouchableOpacity
                  onPress={() => toggleSummarySectionKey('keyConcepts')}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#17120D',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: openSummarySections.keyConcepts ? '#C9A45C' : 'rgba(255, 255, 255, 0.08)',
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', flex: 1 }}>
                    Conceptos Clave
                  </Text>
                  <ChevronDown color="#B0A894" size={20} style={{ transform: [{ rotate: openSummarySections.keyConcepts ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {openSummarySections.keyConcepts && (
                  <GlassCard style={{ marginTop: 8, padding: 18, borderRadius: 16, backgroundColor: '#140E0A', borderColor: 'rgba(201, 164, 92, 0.2)', borderWidth: 1 }}>
                    <View style={{ gap: 8 }}>
                      {keyConcepts.map((kc, idx) => (
                        <Text key={idx} style={{ color: '#FFFFFF', fontSize: 13, lineHeight: 20 }}>
                          • {kc}
                        </Text>
                      ))}
                    </View>
                  </GlassCard>
                )}
              </View>
            ) : null}

            {/* SECCIÓN: GLOSARIO TÉCNICO (Desplegable) */}
            {glossary.length > 0 ? (
              <View>
                <TouchableOpacity
                  onPress={() => toggleSummarySectionKey('glossary')}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#17120D',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: openSummarySections.glossary ? '#C9A45C' : 'rgba(255, 255, 255, 0.08)',
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', flex: 1 }}>
                    Glosario Técnico ({glossary.length} Términos)
                  </Text>
                  <ChevronDown color="#B0A894" size={20} style={{ transform: [{ rotate: openSummarySections.glossary ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {openSummarySections.glossary && (
                  <View style={{ marginTop: 8, gap: 10 }}>
                    {glossary.map((g, idx) => (
                      <GlassCard key={idx} style={{ padding: 14, borderRadius: 14, backgroundColor: '#140E0A' }}>
                        <Text style={{ color: '#C9A45C', fontSize: 14, fontWeight: 'bold', marginBottom: 2 }}>{g.term}</Text>
                        <Text style={{ color: '#B0A894', fontSize: 12, lineHeight: 18 }}>{g.definition}</Text>
                      </GlassCard>
                    ))}
                  </View>
                )}
              </View>
            ) : null}

            {/* SECCIÓN: CASO PRÁCTICO (Desplegable) */}
            {practicalCase ? (
              <View>
                <TouchableOpacity
                  onPress={() => toggleSummarySectionKey('practicalCase')}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#17120D',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: openSummarySections.practicalCase ? '#C9A45C' : 'rgba(255, 255, 255, 0.08)',
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', flex: 1 }}>
                    Caso Práctico de Estudio
                  </Text>
                  <ChevronDown color="#B0A894" size={20} style={{ transform: [{ rotate: openSummarySections.practicalCase ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {openSummarySections.practicalCase && (
                  <GlassCard style={{ marginTop: 8, padding: 18, borderRadius: 16, backgroundColor: '#140E0A', borderColor: 'rgba(201, 164, 92, 0.2)', borderWidth: 1 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 6 }}>{practicalCase.title}</Text>
                    <Text style={{ color: '#B0A894', fontSize: 13, lineHeight: 20, marginBottom: 12 }}>{practicalCase.description}</Text>
                    {practicalCase.questions?.map((q, idx) => (
                      <Text key={idx} style={{ color: '#FFFFFF', fontSize: 12, marginBottom: 4 }}>• {q}</Text>
                    ))}
                  </GlassCard>
                )}
              </View>
            ) : null}

            {/* SECCIÓN: ACTIVIDAD PRÁCTICA GUIADA (Desplegable) */}
            {practicalActivity ? (
              <View>
                <TouchableOpacity
                  onPress={() => toggleSummarySectionKey('practicalActivity')}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#17120D',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: openSummarySections.practicalActivity ? '#C9A45C' : 'rgba(255, 255, 255, 0.08)',
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', flex: 1 }}>
                    Actividad Práctica Guiada
                  </Text>
                  <ChevronDown color="#B0A894" size={20} style={{ transform: [{ rotate: openSummarySections.practicalActivity ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {openSummarySections.practicalActivity && (
                  <GlassCard style={{ marginTop: 8, padding: 18, borderRadius: 16, backgroundColor: '#140E0A', borderColor: 'rgba(201, 164, 92, 0.2)', borderWidth: 1 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
                      {practicalActivity.title}
                    </Text>
                    <Text style={{ color: '#B0A894', fontSize: 13, lineHeight: 20 }}>
                      {practicalActivity.instructions}
                    </Text>
                  </GlassCard>
                )}
              </View>
            ) : null}

            {/* SECCIÓN: CONCLUSIÓN (Desplegable) */}
            {moduleData?.conclusionText ? (
              <View>
                <TouchableOpacity
                  onPress={() => toggleSummarySectionKey('conclusion')}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#17120D',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: openSummarySections.conclusion ? '#C9A45C' : 'rgba(255, 255, 255, 0.08)',
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', flex: 1 }}>
                    Conclusión
                  </Text>
                  <ChevronDown color="#B0A894" size={20} style={{ transform: [{ rotate: openSummarySections.conclusion ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {openSummarySections.conclusion && (
                  <GlassCard style={{ marginTop: 8, padding: 18, borderRadius: 16, backgroundColor: '#140E0A', borderColor: 'rgba(201, 164, 92, 0.2)', borderWidth: 1 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 13, lineHeight: 22 }}>
                      {moduleData.conclusionText}
                    </Text>
                  </GlassCard>
                )}
              </View>
            ) : null}

            {/* SECCIÓN: BIBLIOGRAFÍA Y REFERENCIAS (Desplegable) */}
            {bibliography.length > 0 ? (
              <View>
                <TouchableOpacity
                  onPress={() => toggleSummarySectionKey('bibliography')}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#17120D',
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: openSummarySections.bibliography ? '#C9A45C' : 'rgba(255, 255, 255, 0.08)',
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', flex: 1 }}>
                    Bibliografía y Referencias
                  </Text>
                  <ChevronDown color="#B0A894" size={20} style={{ transform: [{ rotate: openSummarySections.bibliography ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {openSummarySections.bibliography && (
                  <GlassCard style={{ marginTop: 8, padding: 18, borderRadius: 16, backgroundColor: '#140E0A', borderColor: 'rgba(201, 164, 92, 0.2)', borderWidth: 1 }}>
                    {bibliography.map((b, idx) => (
                      <Text key={idx} style={{ color: '#B0A894', fontSize: 12, lineHeight: 18, marginBottom: 4 }}>
                        • {b}
                      </Text>
                    ))}
                  </GlassCard>
                )}
              </View>
            ) : null}

            {/* AI Assistant Card */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                backgroundColor: '#17120D',
                borderRadius: 18,
                borderWidth: 1,
                borderColor: 'rgba(201, 164, 92, 0.25)',
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 6,
                marginBottom: 16,
              }}
            >
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(201, 164, 92, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                <Sparkles color="#C9A45C" size={22} />
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', flex: 1 }}>
                ¿Dudas? Preguntá al asistente IA
              </Text>
              <ChevronRight color="#B0A894" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentSegment('eval')}
              activeOpacity={0.85}
              style={{
                width: '100%',
                backgroundColor: '#C9A45C',
                paddingVertical: 16,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#C9A45C',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text style={{ color: '#0C0A07', fontWeight: 'bold', fontSize: 16, marginRight: 8 }}>
                Ir a la evaluación
              </Text>
              <ArrowRight color="#0C0A07" size={20} />
            </TouchableOpacity>
          </View>
        )}

        {/* SEGMENT 3: AUTOEVALUACIÓN DE LA CLASE */}
        {currentSegment === 'eval' && (
          <GlassCard style={{ padding: 24, borderRadius: 24, backgroundColor: '#17120D', alignItems: 'center' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(201, 164, 92, 0.15)', borderWidth: 1.5, borderColor: '#C9A45C', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Award color="#C9A45C" size={32} />
            </View>

            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
              Autoevaluación de la Clase
            </Text>

            <Text style={{ color: '#B0A894', fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 24, maxWidth: 300 }}>
              El examen contiene {totalQuestions} preguntas de opción múltiple con un tiempo máximo de 20:00 minutos. Se requiere un 70% de aciertos para aprobar.
            </Text>

            <TouchableOpacity
              onPress={() => router.push(`/quiz/${evaluationId}`)}
              activeOpacity={0.85}
              style={{
                width: '100%',
                backgroundColor: '#C9A45C',
                paddingVertical: 15,
                paddingHorizontal: 12,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#C9A45C',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{ color: '#0C0A07', fontWeight: 'bold', fontSize: 14, marginRight: 6, flexShrink: 1 }}
              >
                Iniciar autoevaluación ({totalQuestions} preguntas)
              </Text>
              <ArrowRight color="#0C0A07" size={18} />
            </TouchableOpacity>
          </GlassCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
