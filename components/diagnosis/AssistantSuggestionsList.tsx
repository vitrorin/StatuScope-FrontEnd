import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AssistantSuggestion } from '@/lib/diagnosisAssistant';
import { AppColors } from '@/constants/theme';

export interface AssistantSuggestionsListProps {
  suggestions: AssistantSuggestion[];
  heading?: string;
  primaryLabel?: string;
  localityRiskLabel?: string;
  formatRiskLevel?: (riskLevel: string | null | undefined) => string;
  formatDiseaseName?: (name: string | null | undefined) => string;
  style?: ViewStyle;
}

const RISK_COLORS: Record<string, { background: string; text: string }> = {
  HIGH: { background: AppColors.status.dangerBorder, text: AppColors.status.dangerDark },
  MEDIUM: { background: AppColors.status.warningSoft, text: AppColors.status.warningStrong },
  LOW: { background: AppColors.status.infoSoft, text: AppColors.brand.link },
  NONE: { background: AppColors.surface.muted, text: AppColors.text.body },
};

function formatConfidence(confidence?: number | null): string | null {
  if (confidence == null || Number.isNaN(confidence)) {
    return null;
  }
  return `${Math.round(confidence * 100)}%`;
}

export function AssistantSuggestionsList({
  suggestions,
  heading = 'Differential suggestions',
  primaryLabel = 'primary',
  localityRiskLabel = 'Locality risk',
  formatRiskLevel,
  formatDiseaseName,
  style,
}: AssistantSuggestionsListProps) {
  if (!suggestions.length) {
    return null;
  }

  const ordered = [...suggestions].sort((a, b) => a.rankOrder - b.rankOrder);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.heading}>{heading}</Text>
      {ordered.map((suggestion) => {
        const confidenceLabel = formatConfidence(suggestion.confidence);
        const riskKey = (suggestion.localityRiskLevel ?? 'NONE') as keyof typeof RISK_COLORS;
        const riskColors = RISK_COLORS[riskKey] ?? RISK_COLORS.NONE;

        return (
          <View key={suggestion.id ?? `${suggestion.rankOrder}-${suggestion.displayName}`} style={styles.row}>
            <View style={styles.titleRow}>
              <View style={styles.rankPill}>
                <Text style={styles.rankPillText}>{suggestion.rankOrder}</Text>
              </View>
              <Text style={styles.displayName} numberOfLines={2}>
                {formatDiseaseName ? formatDiseaseName(suggestion.displayName) : suggestion.displayName}
                {suggestion.primary ? <Text style={styles.primaryTag}>  · {primaryLabel}</Text> : null}
              </Text>
              {confidenceLabel ? <Text style={styles.confidence}>{confidenceLabel}</Text> : null}
            </View>

            {suggestion.localityRiskLevel ? (
              <View style={[styles.riskBadge, { backgroundColor: riskColors.background }]}>
                <Text style={[styles.riskBadgeText, { color: riskColors.text }]}>
                  {localityRiskLabel}: {formatRiskLevel ? formatRiskLevel(suggestion.localityRiskLevel) : suggestion.localityRiskLevel}
                </Text>
              </View>
            ) : null}

            {suggestion.rationale ? <Text style={styles.rationale}>{suggestion.rationale}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border.default,
    backgroundColor: AppColors.surface.card,
    gap: 12,
  },
  heading: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: AppColors.brand.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankPill: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: AppColors.surface.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankPillText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: AppColors.brand.primary,
  },
  displayName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: AppColors.text.primary,
  },
  primaryTag: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: AppColors.brand.primary,
  },
  confidence: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: AppColors.text.primary,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  riskBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rationale: {
    fontSize: 13,
    lineHeight: 19,
    color: AppColors.text.body,
  },
});
