import React from 'react';
import { Image } from 'expo-image';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { MapControlButton } from './MapControlButton';
import { MapLegend } from './MapLegend';

export interface RadarMapPin {
  top: string;
  left: string;
  borderColor: string;
  fillColor?: string;
  icon?: React.ReactNode;
}

export interface RadarMapCardProps {
  title: string;
  subtitle?: string;
  legendItems?: { label: string; color: string }[];
  showOverlayPanel?: boolean;
  overlayTitle?: string;
  overlayBadgeLabel?: string;
  overlayItems?: { label: string; value: string; color?: string }[];
  showControls?: boolean;
  footerTextLeft?: string;
  footerTextRight?: string;
  mapImageUri?: string;
  style?: StyleProp<ViewStyle>;
  showHeader?: boolean;
  showFooter?: boolean;
  mapHeight?: number;
  pins?: RadarMapPin[];
}

const defaultPins: RadarMapPin[] = [
  {
    top: '49%',
    left: '48%',
    borderColor: '#EF4444',
    icon: <MaterialCommunityIcons name="alert" size={16} color="#EF4444" />,
  },
  {
    top: '33%',
    left: '63%',
    borderColor: '#0003B8',
    icon: <MaterialCommunityIcons name="hospital-box-outline" size={12} color="#0003B8" />,
  },
];

export function RadarMapCard({
  title,
  subtitle,
  legendItems,
  showOverlayPanel = false,
  overlayTitle,
  overlayBadgeLabel,
  overlayItems,
  showControls = false,
  footerTextLeft,
  footerTextRight,
  mapImageUri,
  style,
  showHeader = false,
  showFooter = true,
  mapHeight = 520,
  pins,
}: RadarMapCardProps) {
  const mapPins = pins ?? defaultPins;

  return (
    <View style={[styles.card, style]}>
      {showHeader ? (
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Feather name="map" size={18} color="#0003B8" />
            <Text style={styles.headerTitle}>{title}</Text>
          </View>

          {legendItems && legendItems.length > 0 ? (
            <MapLegend items={legendItems} orientation="horizontal" />
          ) : null}
        </View>
      ) : null}

      <View style={[styles.mapContainer, { height: mapHeight }]}>
        {mapImageUri ? (
          <Image source={{ uri: mapImageUri }} style={styles.mapImage} contentFit="cover" />
        ) : (
          <View style={styles.mapPlaceholder} />
        )}

        <View style={styles.blueArea} />
        <View style={styles.heatArea} />
        <View style={styles.purpleArea} />

        {showOverlayPanel ? (
          <View style={styles.overlayPanel}>
            <View style={styles.overlayHeader}>
              <Text style={styles.overlayTitle}>{overlayTitle || title}</Text>
              {overlayBadgeLabel ? (
                <View style={styles.overlayBadge}>
                  <Text style={styles.overlayBadgeText}>{overlayBadgeLabel}</Text>
                </View>
              ) : null}
            </View>
            {overlayItems?.map((item, index) => (
              <View key={index} style={styles.overlayItem}>
                <View style={[styles.overlayDot, { backgroundColor: item.color || '#1D4ED8' }]} />
                <Text style={styles.overlayLabel}>{item.label}</Text>
                <Text style={styles.overlayValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {mapPins.map((pin, index) => (
          <View
            key={index}
            style={[styles.pinWrap, { top: pin.top as never, left: pin.left as never }]}
          >
            <View
              style={[
                styles.pin,
                {
                  borderColor: pin.borderColor,
                  backgroundColor: pin.fillColor || '#FFFFFF',
                },
              ]}
            >
              {pin.icon}
            </View>
          </View>
        ))}

        {showControls ? (
          <View style={styles.controlsContainer}>
            <MapControlButton icon="plus" style={styles.controlButton} />
            <MapControlButton icon="minus" style={styles.controlButton} />
            <MapControlButton icon="settings" style={styles.controlButton} />
          </View>
        ) : null}
      </View>

      {showFooter ? (
        <View style={styles.footer}>
          {legendItems && legendItems.length > 0 && !showHeader ? (
            <MapLegend items={legendItems} orientation="horizontal" style={styles.footerLegend} />
          ) : (
            <Text style={styles.footerText}>{footerTextLeft}</Text>
          )}
          <Text style={styles.footerText}>{footerTextRight}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FCFDFE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 3, 184, 0.05)',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    minHeight: 66,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  mapContainer: {
    position: 'relative',
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  mapImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0.78,
  },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#DCE7F3',
  },
  blueArea: {
    position: 'absolute',
    top: -24,
    right: -12,
    width: '56%',
    height: '118%',
    backgroundColor: 'rgba(80, 195, 244, 0.10)',
    borderRadius: 220,
  },
  heatArea: {
    position: 'absolute',
    top: 94,
    left: '34%',
    width: 230,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
  },
  purpleArea: {
    position: 'absolute',
    top: 48,
    left: '44%',
    width: 220,
    height: 280,
    borderRadius: 999,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },
  overlayPanel: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 214,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  overlayTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: '#64748B',
  },
  overlayBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  overlayBadgeText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: '#16A34A',
  },
  overlayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  overlayDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  overlayLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: '#334155',
  },
  overlayValue: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  pinWrap: {
    position: 'absolute',
  },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  controlsContainer: {
    position: 'absolute',
    right: 18,
    bottom: 16,
    gap: 10,
  },
  controlButton: {
    width: 40,
    minWidth: 40,
    minHeight: 40,
    borderWidth: 0,
    borderRadius: 10,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  footer: {
    minHeight: 38,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 18,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  footerLegend: {
    flex: 1,
  },
  footerText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#64748B',
  },
});
