import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CHANNEL_ID = "sync_alarmasuplement_channel";

export async function setupBackendNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Alarmas Suplementos Bebé",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [500, 500, 500, 500, 500],
      enableVibrate: true,
      sound: "alerta1", // ⚠️ DEFAULT, luego se sobrescribe
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true, // 🔥 DEJA QUE ANDROID LO HAGA
      shouldSetBadge: false,
    }),
  });
}
