import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications appear
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class ExpoNotificationService {
  // 1. Request permission (Android 13+ needs this)
  static async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== "granted") {
        console.log("Notification permission denied");
        return false;
      }

      console.log("Notification permission granted");
      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  }

  // 2. Schedule immediate notification
  static async showNotification(title: string, body: string, data?: any) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: "default", // Plays default sound
        },
        trigger: null, // Show immediately
      });

      console.log("Notification sent");
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }

  // 3. Schedule notification for specific time
  static async scheduleNotification(
    title: string,
    body: string,
    date: Date,
    data?: any,
  ) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: {
          date: date, // Date object
          channelId: "default", // Android channel
        },
      });

      console.log("Notification scheduled for:", date);
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  }

  // 4. Schedule daily reminder (example: 9 AM daily)
  static async scheduleDailyReminder() {
    const trigger: Notifications.DailyTriggerInput = {
      type: "daily",
      hour: 9, // 9 AM
      minute: 0,
      channelId: "reminders",
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Practice Reminder",
        body: "Time to practice your interview skills!",
        sound: "default",
      },
      trigger,
    });
  }

  // 5. Cancel all notifications
  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("All notifications cancelled");
  }

  // 6. Get all scheduled notifications
  static async getScheduledNotifications() {
    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();
    console.log("Scheduled notifications:", notifications);
    return notifications;
  }

  // 7. Create notification channel (Android 8+)
  static async createChannels() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });

      await Notifications.setNotificationChannelAsync("reminders", {
        name: "Reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: "default",
      });
    }
  }
}

export default ExpoNotificationService;
