import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { CircularScore } from '@/components/circular-score';
import { SectionAccordion } from '@/components/section-accordion';
import { GradientScreen } from '@/components/gradient-screen';
import type { SavedAnalysis } from '@/lib/slop-storage';
import { getSavedAnalyses } from '@/lib/slop-storage';
import { useAppTheme } from '@/lib/theme-context';

export default function VaultScreen() {
  const { theme } = useAppTheme();
  const [items, setItems] = useState<SavedAnalysis[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<SavedAnalysis | null>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['70%', '95%'], []);

  useFocusEffect(
    useCallback(() => {
      void getSavedAnalyses().then(setItems);
    }, [])
  );

  const handleOpenDetail = (entry: SavedAnalysis) => {
    setSelectedEntry(entry);
    bottomSheetRef.current?.expand();
  };

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
    <LinearGradient colors={['#e0c3fc', '#8ec5fc']} style={{ flex: 1 }}>
      <GradientScreen>
        <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={[styles.header, { color: theme.textPrimary }]}>Vault</Text>
          <Text style={[styles.subHeader, { color: theme.textSecondary }]}>
            Kaydedilen analizler burada tutulur.
          </Text>

          {items.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Henuz kayit yok</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Analyze sekmesinden bir fikir analiz edip vault'a ekle.
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleOpenDetail(item)}
                style={({ pressed }) => [
                  styles.ideaCard,
                  { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
                  pressed && styles.ideaCardPressed,
                ]}>
                <View style={styles.ideaHeaderRow}>
                  <Text numberOfLines={1} style={[styles.ideaTitle, { color: theme.textPrimary }]}>
                    {item.ideaText}
                  </Text>
                  <Text style={styles.scorePill}>{item.result.slop_score}</Text>
                </View>
                <Text style={[styles.ideaDate, { color: theme.textSecondary }]}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
                <Text numberOfLines={2} style={[styles.ideaSummary, { color: theme.textSecondary }]}>
                  {item.result.analysis}
                </Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={theme.mode === 'dark' ? styles.bottomSheetDark : styles.bottomSheetLight}
        handleIndicatorStyle={{ backgroundColor: theme.textSecondary }}
      >
        {selectedEntry && (
          <BottomSheetScrollView contentContainerStyle={styles.sheetContainer}>
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Anında Analiz Raporu</Text>
            <Text style={[styles.sheetIdeaText, { color: theme.textSecondary }]}>
              "{selectedEntry.ideaText}"
            </Text>

            <View style={[styles.detailCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Mühendislik Skoru</Text>
              <View style={styles.scoreRow}>
                <CircularScore score={selectedEntry.result.slop_score} />
              </View>
              <Text style={[styles.analysisText, { color: theme.textSecondary }]}>
                {selectedEntry.result.analysis}
              </Text>
            </View>

            <SectionAccordion title="Temel Eleştiriler" iconName="wrench">
              {selectedEntry.result.flaws.map((flaw, idx) => (
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
              {selectedEntry.result.engineering_questions.map((q, idx) => (
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
      </GradientScreen>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 34,
    gap: 12,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subHeader: {
    fontSize: 16,
    lineHeight: 22,
  },
  emptyCard: {
    marginTop: 10,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  ideaCard: {
    marginTop: 10,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  ideaCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  ideaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ideaTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  scorePill: {
    color: '#FFE1E1',
    backgroundColor: '#3A171C',
    borderWidth: 1,
    borderColor: '#B94150',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: '800',
  },
  ideaDate: {
    fontSize: 13,
  },
  ideaSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
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
