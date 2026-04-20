import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CircularScore } from '@/components/circular-score';
import { GradientScreen } from '@/components/gradient-screen';
import { PremiumButton } from '@/components/premium-button';
import type { SlopResult } from '@/constants/slop-types';
import { useAppTheme } from '@/lib/theme-context';
import { analyzeIdeaWithAiService } from '@/lib/ai-service';
import { saveAnalysis } from '@/lib/slop-storage';

export default function AnalyzeScreen() {
  const { theme } = useAppTheme();
  const [ideaText, setIdeaText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [latestResult, setLatestResult] = useState<SlopResult | null>(null);

  const handleAnalyze = async () => {
    if (!ideaText.trim()) {
      Alert.alert('Fikir gerekli', 'Lutfen analiz etmek icin bir fikir metni gir.');
      return;
    }

    setIsLoading(true);
    const id = Date.now().toString();

    try {
      console.log('AI service istegi basladi...');
      const result = await analyzeIdeaWithAiService(ideaText.trim());
      console.log('AI service yaniti alindi.');

      await saveAnalysis({
        id,
        ideaText: ideaText.trim(),
        createdAt: new Date().toISOString(),
        result,
      });
      setLatestResult(result);
    } catch (error) {
      console.error('Analyze akisi hatasi:', error);
      Alert.alert('Baglanti hatasi, lutfen tekrar deneyin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#e0c3fc', '#8ec5fc']} style={{ flex: 1 }}>
      <GradientScreen>
        <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={[styles.header, { color: theme.textPrimary }]}>Nokta Analyzer</Text>
          <Text style={[styles.subHeader, { color: theme.textSecondary }]}>
            Fikrini yaz, teknik risk puanini premium analiz panelinde aninda gor.
          </Text>

          {latestResult && (
            <View
              style={[
                styles.resultCard,
                { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
              ]}>
              <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>Slop Skoru</Text>
              <CircularScore score={latestResult.slop_score} />
              <Text style={[styles.analysisText, { color: theme.textSecondary }]}>
                {latestResult.analysis}
              </Text>
            </View>
          )}

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>GIRISIM FIKRI</Text>
            <TextInput
              value={ideaText}
              onChangeText={setIdeaText}
              placeholder="Fikrini buraya yaz veya yapistir..."
              placeholderTextColor={theme.isDark ? '#7C88A8' : '#7081A7'}
              multiline
              textAlignVertical="top"
              style={[
                styles.input,
                {
                  color: theme.textPrimary,
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                },
              ]}
            />
            <PremiumButton
              onPress={handleAnalyze}
              disabled={isLoading}
              loading={isLoading}
              title="Analiz Et"
            />
            {isLoading && (
              <View style={styles.loadingInline}>
                <ActivityIndicator size="small" color={theme.textSecondary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                  Model yaniti bekleniyor...
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      </GradientScreen>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 12,
  },
  header: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subHeader: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    marginTop: 8,
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
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  input: {
    minHeight: 220,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 23,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  loadingInline: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultCard: {
    marginTop: 8,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
