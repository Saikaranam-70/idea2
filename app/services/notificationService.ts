import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification:
    async (): Promise<Notifications.NotificationBehavior> => ({
      shouldShowBanner: true, // ✅ NEW
      shouldShowList: true, // ✅ NEW
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
});

export const setupNotificationChannel = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Study Reminders",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      showBadge: true,
    });
  }
};

export const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("Notification permission not granted");
  }
};

export const scheduleTestStreakReminder = async (streak: number) => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📚 Study Reminder (TEST)",
      body: `Complete today lecture and your streak is ${streak}.`,
    },
    trigger: { seconds: 10 }, // 🔴 DO NOT use repeats in Expo Go
  });
};
