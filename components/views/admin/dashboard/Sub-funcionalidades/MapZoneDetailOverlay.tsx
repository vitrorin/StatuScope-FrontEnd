import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OverlayStatCard } from '@/components/overlays/OverlayStatCard';
import { CardBase } from '@/components/patterns/CardBase';
import { AdminDashboardZone } from '@/components/views/admin/dashboard/Sub-funcionalidades/types';
import { useTranslation } from '@/i18n';
import { isSpanish } from '@/components/views/admin/localization';
import { AppColors } from '@/constants/theme';

interface MapZoneDetailOverlayProps {
  visible: boolean;
  zone: AdminDashboardZone | null;
  showRadius?: boolean;
  onClose: () => void;
}

export function MapZoneDetailOverlay({ visible, zone, showRadius = true, onClose }: MapZoneDetailOverlayProps) {
  const { language } = useTranslation();
  if (!zone) return null;
  const accent = zone.borderColor;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{isSpanish(language) ? 'Resumen de zona' : 'Zone Overview'}</Text>
              <Text style={styles.title}>{zone.name}</Text>
              <Text style={styles.subtitle}>{zone.note}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.78}>
              <Feather name="x" size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.metricsGrid}>
            <OverlayStatCard label={isSpanish(language) ? 'Nivel de riesgo' : 'Risk Level'} value={zone.risk} accentColor={accent} style={styles.statCard} />
            <OverlayStatCard label={isSpanish(language) ? 'Enfermedad principal' : 'Primary Disease'} value={zone.disease} accentColor={accent} style={styles.statCard} />
            <OverlayStatCard label={isSpanish(language) ? 'Casos' : 'Cases'} value={zone.cases} accentColor={accent} style={styles.statCard} />
            {showRadius ? <OverlayStatCard label={isSpanish(language) ? 'Radio' : 'Radius'} value={zone.radius} accentColor={accent} style={styles.statCard} /> : null}
            <OverlayStatCard label={isSpanish(language) ? 'Prioridad' : 'Priority'} value={zone.priority} accentColor={accent} style={styles.statCard} />
          </View>
        </CardBase>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AppColors.modal.backdrop,
  },
  dialog: {
    width: '100%',
    maxWidth: 680,
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.soft,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: AppColors.brand.action,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    color: AppColors.text.primary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: AppColors.text.soft,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border.default,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 24,
  },
  statCard: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '48%',
    width: '48%',
    minHeight: 104,
    borderRadius: 16,
    padding: 14,
  },
});

export default MapZoneDetailOverlay;
