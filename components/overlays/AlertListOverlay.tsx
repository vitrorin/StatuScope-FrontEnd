import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AlertCard, AlertCardVariant } from '@/components/feedback/AlertCard';
import { OverlayDialog } from '@/components/overlays/OverlayDialog';
import { OverlayHeader } from '@/components/overlays/OverlayHeader';
import { AppSpacing } from '@/constants/theme';

export interface AlertListOverlayItem {
  id: string;
  title: string;
  description: string;
  metadata?: string;
  severity?: AlertCardVariant;
  variant?: AlertCardVariant;
}

export interface AlertListOverlayProps<TAlert extends AlertListOverlayItem = AlertListOverlayItem> {
  visible: boolean;
  title: string;
  eyebrow?: string;
  alerts: TAlert[];
  onClose: () => void;
  onSelectAlert: (alert: TAlert) => void;
  testID?: string;
}

export function AlertListOverlay<TAlert extends AlertListOverlayItem>({
  visible,
  title,
  eyebrow,
  alerts,
  onClose,
  onSelectAlert,
  testID,
}: AlertListOverlayProps<TAlert>) {
  return (
    <OverlayDialog visible={visible} onClose={onClose} size="lg" scrollable testID={testID}>
      <OverlayHeader title={title} eyebrow={eyebrow} onClose={onClose} />
      <View style={styles.list}>
        {alerts.map((alert) => (
          <Pressable
            key={alert.id}
            onPress={() => onSelectAlert(alert)}
            style={styles.alertButton}
            testID={testID ? `${testID}-item-${alert.id}` : undefined}
          >
            <AlertCard
              title={alert.title}
              description={alert.description}
              metadata={alert.metadata}
              variant={alert.variant ?? alert.severity ?? 'warning'}
            />
          </Pressable>
        ))}
      </View>
    </OverlayDialog>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: AppSpacing[6],
  },
  alertButton: {
    width: '100%',
  },
});
