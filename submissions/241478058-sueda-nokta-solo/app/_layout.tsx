import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { View } from 'react-native';
import { useRef } from 'react';

import { AppThemeProvider, useAppTheme } from '@/lib/theme-context';

// Drop-in Primitive ve Bağımlılık Paketleri
import { AuditWidget } from '@xtatistix/mobile-audit';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef } from 'react-native-view-shot';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <RootNavigator />
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { mode, theme } = useAppTheme();
  const rootRef = useRef<View>(null);

  // ZIRHLI HAFIZA OBJESİ: Kütüphanenin beklediği özel loadNotes ve saveNotes fonksiyonları
  const customStorage = {
    loadNotes: async () => {
      try {
        const data = await AsyncStorage.getItem('@nokta_audit_notes');
        return data ? JSON.parse(data) : [];
      } catch { return []; }
    },
    saveNotes: async (notes: any) => {
      try {
        await AsyncStorage.setItem('@nokta_audit_notes', JSON.stringify(notes));
      } catch { }
    },
    ...AsyncStorage
  };

  const widgetDeps: any = {
    FileSystem: FileSystem,
    Sharing: Sharing,
    AsyncStorage: customStorage, // Her ihtimale karşı
    storage: customStorage,      // Hatanın asıl çözümü: Widget bu key'i arıyor
    captureScreen: async () => {
      if (!rootRef.current) {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      }

      try {
        // SİYAH EKRAN ÇÖZÜMÜ: Bileşenin render edilmesini beklemek için Promise ve setTimeout kullanıyoruz
        const uri = await new Promise<string>((resolve, reject) => {
          setTimeout(async () => {
            try {
              const capturedUri = await captureRef(rootRef, {
                format: 'jpg',
                quality: 0.6, // Kaliteyi biraz düşürmek hızı artırır ve siyah ekranı önler
                result: 'tmpfile'
              });
              resolve(capturedUri);
            } catch (err) {
              reject(err);
            }
          }, 150); // 150ms bekleme süresi yerel görünümün oturmasını sağlar
        });

        return uri.startsWith('file://') ? uri : `file://${uri}`;
      } catch (e) {
        console.error('[AuditWidget] captureScreen failed:', e);
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      }
    },
    captureRef: async (ref: any) => {
      if (!ref || !ref.current) {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      }
      try {
        const uri = await captureRef(ref, { format: 'jpg', quality: 0.6, result: 'tmpfile' });
        return uri.startsWith('file://') ? uri : `file://${uri}`;
      } catch (e) {
        console.error('[AuditWidget] captureRef failed:', e);
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      }
    },
    shareFile: async (uri: string) => {
      try {
        const localUri = uri.startsWith('file://') ? uri : `file://${uri}`;
        await Sharing.shareAsync(localUri);
      } catch (error) {
        console.error('[AuditWidget] shareFile failed:', error);
      }
    },
  };

  return (
    <ThemeProvider value={mode === 'dark' ? DarkTheme : DefaultTheme}>
      {/* collapsable={false} değerinin burada olması kritik önem taşır */}
      <View
        ref={rootRef}
        style={{ flex: 1, backgroundColor: mode === 'dark' ? '#000000' : '#ffffff' }}
        collapsable={false}
      >
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <AuditWidget appName="NoktaKlon" deps={widgetDeps} />
      </View>
    </ThemeProvider>
  );
}