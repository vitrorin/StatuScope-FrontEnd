import React, { useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MapControlButton } from '@/components/dashboard/MapControlButton';
import { MapLegend } from '@/components/dashboard/MapLegend';
import { RadarMapPin } from '@/components/dashboard/RadarMapCard';
import { CardBase } from '@/components/patterns/CardBase';

interface ExpandedMapOverlayProps {
  visible: boolean;
  title: string;
  mapImageUri: string;
  legendItems: { label: string; color: string }[];
  pins: RadarMapPin[];
  onClose: () => void;
}

export function ExpandedMapOverlay({
  visible,
  title,
  mapImageUri,
  legendItems,
  pins,
  onClose,
}: ExpandedMapOverlayProps) {
  const [zoom, setZoom] = useState(1);

  const clampedZoom = useMemo(() => Math.max(1, Math.min(zoom, 2.2)), [zoom]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        setZoom(1);
        onClose();
      }}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={() => {
            setZoom(1);
            onClose();
          }}
        />

        <CardBase style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Expanded Map</Text>
              <Text style={styles.title}>{title}</Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setZoom(1);
                onClose();
              }}
              activeOpacity={0.75}
            >
              <Feather name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.mapShell}>
            <View style={[styles.mapStage, { transform: [{ scale: clampedZoom }] }]}>
              <Image source={{ uri: mapImageUri }} style={styles.mapImage} contentFit="cover" />

              <View style={styles.blueArea} />
              <View style={styles.heatArea} />
              <View style={styles.purpleArea} />

              {pins.map((pin, index) => {
                const pinNode = (
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
                );

                return (
                  <View
                    key={pin.id ?? index}
                    style={[styles.pinWrap, { top: pin.top as never, left: pin.left as never }]}
                  >
                    {pin.onPress ? (
                      <TouchableOpacity activeOpacity={0.85} onPress={pin.onPress}>
                        {pinNode}
                      </TouchableOpacity>
                    ) : (
                      pinNode
                    )}
                  </View>
                );
              })}
            </View>

            <View style={styles.controlsContainer}>
              <MapControlButton
                icon="plus"
                style={styles.controlButton}
                onPress={() => setZoom((current) => Math.min(current + 0.2, 2.2))}
              />
              <MapControlButton
                icon="minus"
                style={styles.controlButton}
                onPress={() => setZoom((current) => Math.max(current - 0.2, 1))}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <MapLegend items={legendItems} orientation="horizontal" style={styles.legend} />
            <Text style={styles.zoomText}>Zoom {clampedZoom.toFixed(1)}x</Text>
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
    backgroundColor: 'rgba(255,255,255,0.74)',
  },
  dialog: {
    width: '100%',
    maxWidth: 1040,
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#1718C7',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  mapShell: {
    height: 700,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  mapStage: {
    flex: 1,
  },
  mapImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0.78,
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
    top: 126,
    left: '34%',
    width: 290,
    height: 230,
    borderRadius: 999,
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
  },
  purpleArea: {
    position: 'absolute',
    top: 76,
    left: '44%',
    width: 280,
    height: 340,
    borderRadius: 999,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },
  pinWrap: {
    position: 'absolute',
  },
  pin: {
    width: 34,
    height: 34,
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
    bottom: 18,
    gap: 10,
  },
  controlButton: {
    width: 42,
    minWidth: 42,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  footer: {
    minHeight: 44,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 18,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  legend: {
    flex: 1,
  },
  zoomText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#526174',
  },
});

export default ExpandedMapOverlay;
