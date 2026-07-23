import React from 'react';
import { Modal, View, Text, TouchableOpacity, Image } from 'react-native';
import { Play, Clock, Sparkles } from 'lucide-react-native';
import { AvatarRing } from './AvatarRing';
import { TheoreticalModule } from '@/services';

export interface ModuleDetailModalProps {
  visible: boolean;
  module: TheoreticalModule | null;
  onClose: () => void;
  onStartLesson: (moduleId: string) => void;
}

export function ModuleDetailModal({
  visible,
  module,
  onClose,
  onStartLesson,
}: ModuleDetailModalProps) {
  if (!visible || !module) return null;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          justifyContent: 'flex-end',
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: '#15100A',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderWidth: 1,
            borderColor: 'rgba(201, 164, 92, 0.25)',
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 36,
          }}
        >
          {/* Top Pill Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignSelf: 'center',
              marginBottom: 20,
            }}
          />

          {/* Module Category & Title */}
          <Text
            style={{
              color: '#C9A45C',
              fontSize: 11,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            MÓDULO TEÓRICO
          </Text>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 22,
              fontWeight: 'bold',
              lineHeight: 30,
              marginBottom: 16,
            }}
          >
            {module.title}
          </Text>

          {/* Media Preview Card matching 07_Modal_DetalleModulo.png */}
          <View
            style={{
              width: '100%',
              height: 170,
              borderRadius: 20,
              backgroundColor: '#0C0A07',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Play Button Circle */}
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(201, 164, 92, 0.25)',
                borderWidth: 1.5,
                borderColor: '#C9A45C',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Play color="#FFFFFF" size={26} fill="#FFFFFF" style={{ marginLeft: 3 }} />
            </View>

            {/* Duration Badge Pill */}
            <View
              style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Clock color="#B0A894" size={12} />
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>
                {module.totalDurationMinutes || 20}:00
              </Text>
            </View>
          </View>

          {/* Instructor Card Section */}
          <Text style={{ color: '#B0A894', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
            Impartido por
          </Text>
          <View
            style={{
              backgroundColor: '#17120D',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <AvatarRing name="Mariana IA" isIA={true} size={40} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>
                {module.instructorName || 'Especialista en Tricología Cosmética'}
              </Text>
              <Text style={{ color: '#B0A894', fontSize: 12, marginTop: 2 }}>
                Avatar IA · Tricología y Dermatología
              </Text>
            </View>
          </View>

          {/* Class Includes Section */}
          <Text style={{ color: '#B0A894', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
            La clase incluye
          </Text>
          <View
            style={{
              backgroundColor: '#17120D',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Text style={{ color: '#B0A894', fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
              Resumen escrito completo desde el método oficial, glosario técnico y autoevaluación interactiva de 5 preguntas para certificar tu avance.
            </Text>

            {/* Primary Action Button */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                onStartLesson(module.id);
              }}
              activeOpacity={0.85}
              style={{
                width: '100%',
                backgroundColor: '#C9A45C',
                paddingVertical: 14,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#C9A45C',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Play color="#0C0A07" size={18} fill="#0C0A07" style={{ marginRight: 8 }} />
              <Text style={{ color: '#0C0A07', fontWeight: 'bold', fontSize: 15 }}>
                Comenzar clase ({module.totalDurationMinutes || 20} min)
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
