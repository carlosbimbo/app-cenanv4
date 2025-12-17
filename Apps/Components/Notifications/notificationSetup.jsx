import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function setupBackendNotifications() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }

  if (Platform.OS === "android") {
    // Definimos los audios que configuraste en app.json
    const alarmas = [
      { id: "alarm_channel_alerta1", sound: "alerta1.mp3", name: "Alerta Nivel 1" },
      { id: "alarm_channel_alerta2", sound: "alerta2.mp3", name: "Alerta Nivel 2" },
      { id: "alarm_channel_alerta3", sound: "alerta3.mp3", name: "Alerta Nivel 3" },
    ];

    for (const alarma of alarmas) {
      await Notifications.setNotificationChannelAsync(alarma.id, {
        name: alarma.name,
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        // Aquí vinculamos el ID del canal con el archivo físico
        sound: alarma.sound, 
      });
    }
  }
}