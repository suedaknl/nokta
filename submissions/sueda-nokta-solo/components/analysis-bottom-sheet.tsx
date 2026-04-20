import { forwardRef, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { CircularScore } from '@/components/circular-score';
import { SectionAccordion } from '@/components/section-accordion';
import { useAppTheme } from '@/lib/theme-context';
import type { SlopResult } from '@/constants/slop-types';

type Props = {
  result: SlopResult | null;
  ideaText: string;
};

export const AnalysisBottomSheet = forwardRef<BottomSheet, Props>(({ result, ideaText }, ref) => {
  const { theme } = useAppTheme();
  const snapPoints = useMemo(() => ['70%', '95%'], []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '#FE5E73';
      case 'high':
        return '#FF9F46';
      case 'medium':
        return '#FFD166';
      default:
        return '#36D887';
    }
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={theme.mode === 'dark' ? styles.bottomSheetDark : styles.bottomSheetLight}
      handleIndicatorStyle={{ backgroundColor: theme.textSecondary }}
    >
      {result && (
        <BottomSheetScrollView contentContainerStyle={styles.sheetContainer}>
          <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Anında Analiz Raporu</Text>
          <Text style={[styles.sheetIdeaText, { color: theme.textSecondary }]}>
            "{ideaText}"
          </Text>

          <View style={[styles.detailCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Mühendislik Skoru</Text>
            <View style={styles.scoreRow}>
              <CircularScore score={result.slop_score} />
            </View>
            <Text style={[styles.analysisText, { color: theme.textSecondary }]}>
              {result.analysis}
            </Text>
          </View>

          <SectionAccordion title="Temel Eleştiriler" iconName="wrench">
            {result.flaws.map((flaw, idx) => (
              <View key={`flaw-${idx}`} style={styles.listItem}>
                <MaterialCommunityIcons name="alert-circle-outline" size={22} color={getSeverityColor(flaw.severity)} style={styles.iconOffset} />
                <View style={{ flex: 1 }}>
                   <Text style={[styles.listItemTitle, { color: theme.textPrimary }]}>{flaw.type} <Text style={[styles.badgeText, { color: getSeverityColor(flaw.severity) }]}>({flaw.severity})</Text></Text>
                   <Text style={[styles.listItemDesc, { color: theme.textSecondary }]}>{flaw.description}</Text>
                </View>
              </View>
            ))}
          </SectionAccordion>

          <SectionAccordion title="Kritik Mühendislik Soruları" iconName="help-circle-outline">
            <Text style={[styles.deepDiveHint, { color: theme.textSecondary }]}>
              Fikrin teknik risklerini minimize etmek için mentor soruları.
            </Text>
            {result.engineering_questions.map((q, idx) => (
              <View key={`q-${idx}`} style={styles.listItem}>
                <MaterialCommunityIcons name="comment-question-outline" size={22} color={getSeverityColor(q.severity)} style={styles.iconOffset} />
                <View style={{ flex: 1 }}>
                   <Text style={[styles.listItemTitle, { color: theme.textPrimary }]}>{q.question} <Text style={[styles.badgeText, { color: getSeverityColor(q.severity) }]}>({q.severity})</Text></Text>
                   <Text style={[styles.listItemDesc, { color: theme.textSecondary }]}>{q.why_critical}</Text>
                </View>
              </View>
            ))}
          </SectionAccordion>
        </BottomSheetScrollView>
      )}
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  bottomSheetLight: {
    backgroundColor: '#FAFBFD',
  },
  bottomSheetDark: {
    backgroundColor: '#090B13',
  },
  sheetContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
    gap: 16,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  sheetIdeaText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  detailCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  scoreRow: {
    alignItems: 'center',
  },
  analysisText: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  deepDiveHint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  iconOffset: {
    marginTop: 2,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  listItemDesc: {
    fontSize: 15,
    lineHeight: 22,
  },
});
