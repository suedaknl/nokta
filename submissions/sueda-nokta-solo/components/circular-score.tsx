import { StyleSheet, Text, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';

import { useAppTheme } from '@/lib/theme-context';

type CircularScoreProps = {
  score: number;
};

function getScoreColor(score: number) {
  if (score >= 80) return '#FE5E73';
  if (score >= 50) return '#FF9F46';
  return '#36D887';
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'AŞIRI RİSKLİ / YÜKSEK SLOP';
  if (score >= 50) return 'RİSKLİ / ORTA SLOP';
  return 'SAĞLIKLI / DÜŞÜK SLOP';
}

export function CircularScore({ score }: CircularScoreProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const scoreColor = getScoreColor(clampedScore);
  const { theme } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <CircularProgress
        value={clampedScore}
        radius={110}
        duration={1200}
        progressValueColor={theme.textPrimary}
        maxValue={100}
        title={'/100'}
        titleColor={theme.textSecondary}
        titleStyle={styles.titleStyle}
        activeStrokeColor={scoreColor}
        inActiveStrokeColor={theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
        inActiveStrokeOpacity={0.8}
        inActiveStrokeWidth={16}
        activeStrokeWidth={20}
      />
      <Text style={[styles.label, { color: scoreColor }]}>{getScoreLabel(clampedScore)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  titleStyle: {
    fontWeight: '600',
    fontSize: 16,
    opacity: 0.8,
  },
  label: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
