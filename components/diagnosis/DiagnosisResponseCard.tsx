import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { InlineWarningBanner } from '../feedback/InlineWarningBanner';

export interface DiagnosisResponseCardProps {
  title?: string;
  responseText: string;
  highlightText?: string;
  warningMessage?: string;
  showWarning?: boolean;
  leadingIcon?: React.ReactNode;
  style?: ViewStyle;
}

export function DiagnosisResponseCard({
  title,
  responseText,
  highlightText,
  warningMessage,
  showWarning = false,
  leadingIcon,
  style,
}: DiagnosisResponseCardProps) {
  const renderText = () => {
    if (!highlightText || !responseText.includes(highlightText)) {
      return <Text style={styles.text}>{responseText}</Text>;
    }

    const [before, after] = responseText.split(highlightText);

    return (
      <Text style={styles.text}>
        {before}
        <Text style={styles.highlight}>{highlightText}</Text>
        {after}
      </Text>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {title || leadingIcon ? (
        <View style={styles.header}>
          {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
      ) : (
        <View style={styles.insightPill}>
          <Text style={styles.insightPillText}>AI Differential Insight</Text>
        </View>
      )}

      <View style={styles.content}>{renderText()}</View>

      {showWarning && warningMessage ? (
        <InlineWarningBanner message={warningMessage} variant="critical" style={styles.warningBanner} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE6F5',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '700',
    color: '#0F172A',
  },
  insightPill: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  insightPillText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: '#0003B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    lineHeight: 25,
    color: '#334155',
  },
  highlight: {
    color: '#DC2626',
    fontWeight: '700',
  },
  warningBanner: {
    marginTop: 6,
    borderRadius: 12,
  },
});
