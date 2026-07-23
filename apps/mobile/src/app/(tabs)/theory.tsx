import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GlassCard } from '@/components/GlassCard';
import { AvatarRing } from '@/components/AvatarRing';
import { ModuleDetailModal } from '@/components/ModuleDetailModal';
import {
  Lock,
  CheckCircle2,
  Clock,
  FileText,
  Microscope,
  Activity,
  Apple,
  FlaskConical,
  Scissors,
  BookOpen,
} from 'lucide-react-native';
import { getTheoreticalModules, TheoreticalModule, storage } from '@/services';

const DISCIPLINES = [
  { id: '1', name: 'Tricología y Dermatología', icon: Microscope },
  { id: '2', name: 'Endocrinología', icon: Activity },
  { id: '3', name: 'Nutrición', icon: Apple },
  { id: '4', name: 'Química Cosmética', icon: FlaskConical },
  { id: '5', name: 'Parte Mecánica', icon: Scissors },
];

export default function TheoryScreen() {
  const router = useRouter();
  const [modules, setModules] = useState<TheoreticalModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDiscipline, setActiveDiscipline] = useState('1');
  const [selectedModule, setSelectedModule] = useState<TheoreticalModule | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const token = await storage.getToken();
        const data = await getTheoreticalModules(token || '', true);
        setModules(data);
      } catch (err) {
        console.error('Error cargando módulos teóricos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenModal = (mod: TheoreticalModule) => {
    setSelectedModule(mod);
    setModalVisible(true);
  };

  const handleStartLesson = (moduleId: string) => {
    router.push(`/lesson/${moduleId}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0C0A07' }} edges={['top', 'left', 'right']} className="flex-1 bg-[#0C0A07]">
      <StatusBar barStyle="light-content" backgroundColor="#0C0A07" />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#0C0A07' }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }}
        className="flex-1 bg-[#0C0A07] px-5"
      >
        {/* Header Section matching 06_Teoria.png */}
        <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' }}>
          Fase Teórica
        </Text>
        <Text style={{ color: '#B0A894', fontSize: 14, marginTop: 2 }}>
          10 Meses · 5 Avatares IA
        </Text>

        {/* Horizontal Disciplines Selector matching 06_Teoria.png */}
        <Text style={{ color: '#C9A45C', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginTop: 22, marginBottom: 14 }}>
          DISCIPLINAS · 5 AVATARES IA
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16, paddingRight: 20 }}
          style={{ marginBottom: 24 }}
        >
          {DISCIPLINES.map((disc) => {
            const Icon = disc.icon;
            const isActive = activeDiscipline === disc.id;
            return (
              <TouchableOpacity
                key={disc.id}
                onPress={() => setActiveDiscipline(disc.id)}
                activeOpacity={0.8}
                style={{ alignItems: 'center', width: 76 }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: isActive ? 'rgba(201, 164, 92, 0.18)' : '#17120D',
                    borderWidth: 1.5,
                    borderColor: isActive ? '#C9A45C' : 'rgba(255, 255, 255, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Icon color={isActive ? '#C9A45C' : '#B0A894'} size={24} />
                </View>
                <Text
                  numberOfLines={2}
                  style={{
                    color: isActive ? '#FFFFFF' : '#B0A894',
                    fontSize: 11,
                    fontWeight: isActive ? 'bold' : '500',
                    textAlign: 'center',
                    lineHeight: 14,
                  }}
                >
                  {disc.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Modules Timeline Cards matching 06_Teoria.png */}
        {loading ? (
          <ActivityIndicator color="#C9A45C" size="small" style={{ marginVertical: 30 }} />
        ) : (
          <View style={{ gap: 16 }}>
            {/* Supabase Dynamic Modules */}
            {modules.map((mod, idx) => (
              <TouchableOpacity
                key={mod.id}
                onPress={() => handleOpenModal(mod)}
                activeOpacity={0.85}
              >
                <GlassCard
                  style={{
                    backgroundColor: '#17120D',
                    borderRadius: 24,
                    borderLeftWidth: 4,
                    borderLeftColor: idx === 0 ? '#C9A45C' : 'rgba(201, 164, 92, 0.4)',
                    borderColor: 'rgba(201, 164, 92, 0.2)',
                    padding: 20,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#C9A45C', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      MES {mod.month} · SEMANA {mod.week} (LECCIÓN DISPONIBLE)
                    </Text>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(201, 164, 92, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen color="#C9A45C" size={18} />
                    </View>
                  </View>

                  <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
                    {mod.title}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Clock color="#B0A894" size={14} style={{ marginRight: 6 }} />
                      <Text style={{ color: '#B0A894', fontSize: 13 }}>
                        {mod.totalDurationMinutes || 20}m Teoría
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <FileText color="#B0A894" size={14} style={{ marginRight: 6 }} />
                      <Text style={{ color: '#B0A894', fontSize: 13 }}>
                        Autoevaluación
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}

            {/* Locked Future Module Placeholder matching 06_Teoria.png */}
            <GlassCard
              style={{
                backgroundColor: '#140E0A',
                borderRadius: 24,
                borderColor: 'rgba(255, 255, 255, 0.04)',
                padding: 20,
                opacity: 0.6,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#524C40', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  PRÓXIMA CLASE · MES 2 SEMANA 2
                </Text>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.03)', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock color="#524C40" size={16} />
                </View>
              </View>

              <Text style={{ color: '#524C40', fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
                Química Cosmética y Formulaciones Capilares
              </Text>
            </GlassCard>
          </View>
        )}
      </ScrollView>

      {/* Modal Detalle 07_Modal_DetalleModulo.png */}
      <ModuleDetailModal
        visible={modalVisible}
        module={selectedModule}
        onClose={() => setModalVisible(false)}
        onStartLesson={handleStartLesson}
      />
    </SafeAreaView>
  );
}
