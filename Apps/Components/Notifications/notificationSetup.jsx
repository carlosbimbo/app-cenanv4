import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function setupBackendNotifications() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }

  if (Platform.OS === "android") {
    // Definimos los audios que configuraste en app.json
    const canales = [
      { id: "v8_alerta_uno", sound: "alerta_uno", name: "Alerta Médica 1 v8" },
      { id: "v8_alerta_dos", sound: "alerta_dos", name: "Alerta Médica 2 v8" },
      { id: "v8_alerta_tres", sound: "alerta_tres", name: "Alerta Médica 3 v8" },
    ];

    for (const canal of canales) {
      await Notifications.setNotificationChannelAsync(canal.id, {
        name: canal.name,
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        // Aquí vinculamos el ID del canal con el archivo físico
        sound: canal.sound, 
      });
    }
  }
}