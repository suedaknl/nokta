import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type PremiumButtonProps = PropsWithChildren<{
  onPress: () => void;
  disabled?: boolean;
  title: string;
  loading?: boolean;
}>;

export function PremiumButton({ onPress, disabled, title, loading }: PremiumButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed, disabled && styles.disabled]}>
      <LinearGradient colors={['#8E6CFF', '#6E55F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
        <Text style={styles.text}>{loading ? 'Analiz ediliyor...' : title}</Text>
      </LinearGradient>
      <View style={styles.glow} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginTop: 14,
    borderRadius: 16,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.8,
  },
  button: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  glow: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: -8,
    height: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(117,91,250,0.32)',
    zIndex: -1,
  },
});
