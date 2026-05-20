import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/lib/theme-context';

export default function ModalScreen() {
  const { theme } = useAppTheme();

  return (
    <LinearGradient colors={theme.gradientColors} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>This is a modal</Text>
        <Link href="/" dismissTo style={styles.link}>
          <Text style={[styles.linkText, { color: theme.textSecondary }]}>Go to home screen</Text>
        </Link>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
