import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { registerForPushNotificationsAsync } from "@/services/PushTokenService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import ExpoNotificationService from "../services/NotificationService";

// ✅ Setup Android Notification Channel
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
const setupNotificationChannel = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "SpeakPrep Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2563EB",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      showBadge: true,
    });
  }
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasHandledNotification, setHasHandledNotification] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        // ⏳ Splash delay
        await new Promise((res) => setTimeout(res, 1200));

        // 🔑 Get token
        const token = await AsyncStorage.getItem("token");

        // 🔔 Notification Setup
        await setupNotificationChannel();
        await ExpoNotificationService.createChannels();
        await ExpoNotificationService.requestPermissions();

        const expoPushToken = await registerForPushNotificationsAsync();
        console.log("Expo Push Token:", expoPushToken);

        // 📡 Send token to backend
        if (expoPushToken && token) {
          await fetch("https://oneserve.in/user/save-token", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ pushToken: expoPushToken }),
          });
        }

        const response = await Notifications.getLastNotificationResponseAsync();
        const hasNotification = !!response;

        if (!hasNotification) {
          router.replace(token ? "/(tabs)" : "/login");
        }
      } catch (error) {
        console.log("Initialization Error:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    initApp();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        if (hasHandledNotification) return;

        setHasHandledNotification(true);

        const data = response.notification.request.content.data;

        const token = await AsyncStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        let params = data.params || {};

        if (typeof params === "string") {
          try {
            params = JSON.parse(params);
          } catch {
            params = {};
          }
        }

        if (data?.route) {
          router.push({
            pathname: data.route,
            params,
          });
        }
      },
    );

    return () => subscription.remove();
  }, [hasHandledNotification]);

  useEffect(() => {
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();

      if (response && !hasHandledNotification) {
        setHasHandledNotification(true);

        const data = response.notification.request.content.data;

        const token = await AsyncStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        let params = data.params || {};

        if (typeof params === "string") {
          try {
            params = JSON.parse(params);
          } catch {
            params = {};
          }
        }

        if (data?.route) {
          router.replace({
            pathname: data.route,
            params,
          });
        }
      }
    };

    checkInitialNotification();
  }, [hasHandledNotification]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
