import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { GradientScreen } from '@/components/gradient-screen';
import { useAppTheme } from '@/lib/theme-context';

export default function ExploreScreen() {
  const { theme } = useAppTheme();

  return (
    <GradientScreen>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={[styles.header, { color: theme.textPrimary }]}>Explore</Text>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Nokta Fikir Pazari</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              Bu alan, trend fikir sinyallerini ve topluluk geri bildirimlerini gezmek icin ayrildi.
              Simdilik odak Track B: Slop Detector ve teknik risk analizi.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#132347',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
});
