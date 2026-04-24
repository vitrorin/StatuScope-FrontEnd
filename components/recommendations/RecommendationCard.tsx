import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ActionChipButton } from './ActionChipButton';
import { MetaInfoRow } from './MetaInfoRow';
import { SeverityBadge } from './SeverityBadge';
import { CardBase } from '../patterns/CardBase';

export type RecommendationSeverity = 'high' | 'medium' | 'low';
export type ImageMode = 'heatmap' | 'chart' | 'supply' | 'placeholder';

export interface RecommendationAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export interface MetaItem {
  label: string;
  icon?: React.ReactNode;
}

export interface RecommendationCardProps {
  severity: RecommendationSeverity;
  category: string;
  title: string;
  description: string;
  metaItems?: MetaItem[];
  actions?: RecommendationAction[];
  imageMode?: ImageMode;
  style?: ViewStyle;
}

const imageEmojis: Record<ImageMode, string> = {
  heatmap: '🗺️',
  chart: '📊',
  supply: '📦',
  placeholder: '🖼️',
};

export function RecommendationCard({
  severity,
  category,
  title,
  description,
  metaItems = [],
  actions = [],
  imageMode = 'placeholder',
  style,
}: RecommendationCardProps) {
  return (
    <CardBase style={[styles.container, style]}>
      <View style={styles.imageContainer}>
        <View style={styles.image}>
          <Text style={styles.imageEmoji}>{imageEmojis[imageMode]}</Text>
        </View>
        <View style={styles.badgeContainer}>
          <SeverityBadge label={severity.toUpperCase()} severity={severity} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        {metaItems.length > 0 ? <MetaInfoRow items={metaItems} /> : null}

        {actions.length > 0 ? (
          <View style={styles.actionsContainer}>
            <View style={styles.actions}>
              {actions.map((action, index) => (
                <ActionChipButton
                  key={`${action.label}-${index}`}
                  label={action.label}
                  variant={action.variant || 'secondary'}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </CardBase>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 0,
  },
  imageContainer: {
    position: 'relative',
    width: 140,
    backgroundColor: '#F5F7FB',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  image: {
    width: 140,
    height: '100%',
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageEmoji: {
    fontSize: 40,
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D4ED8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  actionsContainer: {
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
