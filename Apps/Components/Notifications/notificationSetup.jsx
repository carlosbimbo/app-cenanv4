import * as Notifications from "expo-notifications";
import { Platform, Vibration } from "react-native";
import { Audio } from "expo-av";

const CHANNEL_ID = "sync_alarmasuplement_channel";

export async function setupBackendNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  if (Platform.OS === "android") {
    // Canal base (fallback)
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Alarmas Suplementos Bebé",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [500, 500, 500, 500, 500],
      enableVibrate: true,
      sound: "default"
    });
  }

  // Cómo se muestran las notificaciones
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false, // lo manejamos manualmente
      shouldSetBadge: false,
    }),
  });
}
