import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef } from 'react';
import type { PropsWithChildren } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';

type PremiumButtonProps = PropsWithChildren<{
  onPress: () => void;
  disabled?: boolean;
  title?: string;
  loading?: boolean;
  isRed?: boolean;
  isSquare?: boolean;
}>;

export function PremiumButton({ onPress, disabled, title, loading, isRed, isSquare }: PremiumButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.pressableWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={({ pressed }) => [styles.pressable, disabled && styles.disabled]}
      >
        <LinearGradient 
          colors={isRed ? ['#FF4B4B', '#FF0000'] : ['#8E6CFF', '#6E55F6']} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }} 
          style={[styles.button, isSquare && styles.squareButton]}
        >
          <View style={styles.contentRow}>
            {loading && <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: title ? 8 : 0 }} />}
            {title && <Text style={styles.text}>{loading ? 'Analiz ediliyor...' : title}</Text>}
            {!title && !loading && <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFFFFF" />}
          </View>
        </LinearGradient>
        <View style={styles.glow} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressableWrapper: {
    marginTop: 16,
    marginHorizontal: 8,
  },
  pressable: {
    borderRadius: 16,
  },
  disabled: {
    opacity: 0.8,
  },
  button: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  squareButton: {
    width: 52,
    height: 52,
    minHeight: 52,
    paddingHorizontal: 0,
    borderRadius: 12,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
