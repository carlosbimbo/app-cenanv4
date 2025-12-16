import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import { Vibration } from "react-native";

const soundMap = {
  alerta1: require("../../../assets/alerta1.mp3"),
  alerta2: require("../../../assets/alerta2.mp3"),
  alerta3: require("../../../assets/alerta3.mp3"),
};

export function registerNotificationListener() {
  Notifications.addNotificationReceivedListener(async (notification) => {
    try {
      const data = notification.request.content.data;
      const soundKey = notification.request.content.sound;

      console.log("🔔 Notificación recibida:", data, soundKey);

      // 🔊 Reproducir sonido correcto
      if (soundKey && soundMap[soundKey]) {
        const { sound } = await Audio.Sound.createAsync(soundMap[soundKey]);
        await sound.playAsync();

        setTimeout(() => sound.unloadAsync(), 10000);
      }

      // 📳 Vibración fuerte tipo alarma
      Vibration.vibrate([800, 800, 800, 800, 800], true);
      setTimeout(() => Vibration.cancel(), 8000);

    } catch (err) {
      console.warn("❌ Error reproduciendo sonido:", err);
    }
  });
}
