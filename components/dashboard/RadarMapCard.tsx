import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { MapLegend } from './MapLegend';
import { MapControlButton } from './MapControlButton';

export interface RadarMapCardProps {
  title: string;
  subtitle?: string;
  legendItems?: { label: string; color: string }[];
  showOverlayPanel?: boolean;
  overlayTitle?: string;
  overlayItems?: { label: string; value: string; color?: string }[];
  showControls?: boolean;
  footerTextLeft?: string;
  footerTextRight?: string;
  style?: ViewStyle;
}

export function RadarMapCard({
  title,
  subtitle,
  legendItems,
  showOverlayPanel = false,
  overlayTitle,
  overlayItems,
  showControls = false,
  footerTextLeft,
  footerTextRight,
  style,
}: RadarMapCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {legendItems && legendItems.length > 0 && (
          <MapLegend items={legendItems} orientation="horizontal" />
        )}
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapGrid}>
            {[...Array(5)].map((_, row) => (
              <View key={row} style={styles.mapRow}>
                {[...Array(5)].map((_, col) => {
                  const isCenter = row === 2 && col === 2;
                  const isHot = (row === 1 && col === 1) || (row === 1 && col === 3) || (row === 3 && col === 2);
                  return (
                    <View
                      key={col}
                      style={[
                        styles.mapCell,
                        isCenter && styles.mapCellCenter,
                        isHot && styles.mapCellHot,
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
          <View style={styles.markerContainer}>
            <View style={[styles.marker, styles.marker1]} />
            <View style={[styles.marker, styles.marker2]} />
            <View style={[styles.marker, styles.marker3]} />
          </View>
        </View>

        {showOverlayPanel && (
          <View style={styles.overlayPanel}>
            <Text style={styles.overlayTitle}>{overlayTitle || 'Info'}</Text>
            {overlayItems?.map((item, index) => (
              <View key={index} style={styles.overlayItem}>
                <View style={[styles.overlayDot, { backgroundColor: item.color || '#1D4ED8' }]} />
                <Text style={styles.overlayLabel}>{item.label}</Text>
                <Text style={styles.overlayValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}

        {showControls && (
          <View style={styles.controlsContainer}>
            <MapControlButton icon="+" variant="default" />
            <MapControlButton icon="−" variant="default" />
            <MapControlButton icon="◎" variant="default" />
          </View>
        )}
      </View>

      {(footerTextLeft || footerTextRight) && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>{footerTextLeft}</Text>
          <Text style={styles.footerText}>{footerTextRight}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    width: 560,
  },
  header: {
    marginBottom: 16,
  },
  titleSection: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  mapContainer: {
    position: 'relative',
    height: 280,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapGrid: {
    gap: 8,
  },
  mapRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mapCell: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  mapCellCenter: {
    backgroundColor: '#DBEAFE',
  },
  mapCellHot: {
    backgroundColor: '#FECACA',
  },
  markerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  marker: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  marker1: {
    top: '30%',
    left: '25%',
    backgroundColor: '#EF4444',
  },
  marker2: {
    top: '45%',
    left: '60%',
    backgroundColor: '#F59E0B',
  },
  marker3: {
    top: '65%',
    left: '40%',
    backgroundColor: '#1D4ED8',
  },
  overlayPanel: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 140,
  },
  overlayTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  overlayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  overlayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  overlayLabel: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  overlayValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },
  controlsContainer: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});