import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';
import {
  AppColors,
  AppRadii,
  AppShadows,
  AppSpacing,
  AppTypography,
} from '../../constants/theme';

function ColorSwatch({ name, value }: { name: string; value: string }) {
  return (
    <View style={styles.swatchCard}>
      <View style={[styles.swatch, { backgroundColor: value }]} />
      <Text style={styles.tokenName}>{name}</Text>
      <Text style={styles.tokenValue}>{value}</Text>
    </View>
  );
}

function TokenSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function DesignSystemOverview() {
  const colors: Array<[string, string]> = [
    ['brand.primary', AppColors.brand.primary],
    ['brand.action', AppColors.brand.action],
    ['brand.link', AppColors.brand.link],
    ['status.success', AppColors.status.success],
    ['status.warning', AppColors.status.warning],
    ['status.danger', AppColors.status.danger],
    ['status.info', AppColors.status.info],
    ['surface.page', AppColors.surface.page],
    ['surface.card', AppColors.surface.card],
    ['text.primary', AppColors.text.primary],
    ['text.body', AppColors.text.body],
    ['border.default', AppColors.border.default],
  ];

  const textSamples: Array<[string, TextStyle, string]> = [
    ['screenTitle', AppTypography.textStyles.screenTitle, 'Doctor dashboard'],
    ['sectionTitle', AppTypography.textStyles.sectionTitle, 'Operational alerts'],
    ['cardTitle', AppTypography.textStyles.cardTitle, 'Hospital utilization'],
    ['body', AppTypography.textStyles.body, 'Updated clinical data and backend status.'],
    ['caption', AppTypography.textStyles.caption, 'Last sync: 2 minutes ago'],
    ['buttonLabel', AppTypography.textStyles.buttonLabel, 'Run analysis'],
  ];

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Design System Tokens</Text>
      <Text style={styles.description}>
        Centralized source for StatuScope colors, typography, spacing, radii, and elevation.
      </Text>

      <TokenSection title="Colors">
        <View style={styles.grid}>
          {colors.map(([name, value]) => (
            <ColorSwatch key={name} name={name} value={value} />
          ))}
        </View>
      </TokenSection>

      <TokenSection title="Typography">
        <View style={styles.stack}>
          {textSamples.map(([name, textStyle, sample]) => (
            <View key={name} style={styles.sampleRow}>
              <Text style={styles.tokenName}>{name}</Text>
              <Text style={[styles.sampleText, textStyle]}>{sample}</Text>
            </View>
          ))}
        </View>
      </TokenSection>

      <TokenSection title="Spacing, Radius, Elevation">
        <View style={styles.scaleRow}>
          {[AppSpacing[4], AppSpacing[8], AppSpacing[12], AppSpacing[16]].map((size) => (
            <View key={size} style={styles.scaleItem}>
              <View style={[styles.spacingBlock, { width: size, height: size }]} />
              <Text style={styles.tokenValue}>{size}px</Text>
            </View>
          ))}
        </View>
        <View style={styles.radiusRow}>
          <View style={[styles.radiusCard, { borderRadius: AppRadii.md }]}>
            <Text style={styles.tokenValue}>md</Text>
          </View>
          <View style={[styles.radiusCard, { borderRadius: AppRadii.xl }]}>
            <Text style={styles.tokenValue}>xl</Text>
          </View>
          <View style={[styles.radiusCard, { borderRadius: AppRadii['5xl'] }]}>
            <Text style={styles.tokenValue}>5xl</Text>
          </View>
          <View style={[styles.radiusCard, AppShadows.card]}>
            <Text style={styles.tokenValue}>card shadow</Text>
          </View>
        </View>
      </TokenSection>
    </View>
  );
}

const meta = {
  title: 'Componentes reutilizables/Foundation/DesignSystem',
  component: DesignSystemOverview,
  tags: ['autodocs'],
} satisfies Meta<typeof DesignSystemOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    gap: AppSpacing.screen,
    padding: AppSpacing.screen,
    backgroundColor: AppColors.surface.canvas,
  },
  title: {
    ...AppTypography.textStyles.screenTitle,
    color: AppColors.text.primary,
  },
  description: {
    ...AppTypography.textStyles.body,
    color: AppColors.text.body,
  },
  section: {
    gap: AppSpacing[6],
  },
  sectionTitle: {
    ...AppTypography.textStyles.sectionTitle,
    color: AppColors.text.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing[6],
  },
  swatchCard: {
    width: 160,
    gap: AppSpacing[3],
    padding: AppSpacing[6],
    borderRadius: AppRadii.xl,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.card,
  },
  swatch: {
    height: AppSpacing[16],
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: AppColors.border.soft,
  },
  tokenName: {
    ...AppTypography.textStyles.captionStrong,
    color: AppColors.text.primary,
  },
  tokenValue: {
    ...AppTypography.textStyles.caption,
    color: AppColors.text.secondary,
  },
  stack: {
    gap: AppSpacing[6],
  },
  sampleRow: {
    gap: AppSpacing[3],
    padding: AppSpacing[6],
    borderRadius: AppRadii.xl,
    backgroundColor: AppColors.surface.card,
  },
  sampleText: {
    color: AppColors.text.primary,
  },
  scaleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: AppSpacing[8],
  },
  scaleItem: {
    alignItems: 'center',
    gap: AppSpacing[3],
  },
  spacingBlock: {
    borderRadius: AppRadii.sm,
    backgroundColor: AppColors.brand.action,
  },
  radiusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing[8],
    marginTop: AppSpacing[8],
  },
  radiusCard: {
    width: 120,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.card,
  },
});
