import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import { openDatabaseSync } from "expo-sqlite";
import { Platform, Vibration } from "react-native";
import * as SecureStore from "expo-secure-store";
import { format } from "date-fns";
import { Audio } from "expo-av";

const TASK_NAME = "SYNC_ALARMA_TASK";
const SYNC_ALARMA_CHANNEL_ID = "sync_alarmasuple_channel";

// ---------------------------------------------------------
// 🔔 CONFIGURACIÓN DE NOTIFICACIONES
// ---------------------------------------------------------
export async function setupAlarmNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(SYNC_ALARMA_CHANNEL_ID, {
      name: "Alarmas hierro bebé",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [500, 500, 500, 500, 500],
    });
  }
}

// ---------------------------------------------------------
// 📌 VALIDACIÓN SQL
// ---------------------------------------------------------
async function validateAlarmCondition(alarm, userId,fechaquerysuple) {
    try {
      const db = openDatabaseSync("auth.db");
      const result = db.getFirstSync(alarm.validatorQuery, [userId,fechaquerysuple]);
      if (!result) return false;
      const total = result.TOTAL ?? 0;
      
      console.log('Mira esto me trajo el total de supleme : ',total);
  
      if ( (alarm.idalar === 4 || alarm.idalar === 5) && total < 2 ) {
        return true;
      }
  
      if ( (alarm.idalar === 1 || alarm.idalar === 2) && total < 1 ) {
        return true;
      }
  
      if ( alarm.idalar === 3 && (total === 1 || total === 2) ) {
        return true;
      }
  
      return false;
      //return !!result;
    } catch {
      return false;
    }
  }
/*async function validateAlarmCondition(alarm, userId) {
  try {
    const db = openDatabaseSync("auth.db");
    const result = db.getFirstSync(alarm.validatorQuery, [userId]);
    return !!result;
  } catch {
    return false;
  }
}
*/

// ---------------------------------------------------------
// 🛡 SISTEMA ANTI-DUPLICADO DINÁMICO (ID + HORA)
// ---------------------------------------------------------
async function wasExecutedToday(alarm) {
  const key = `ALARM_EXEC_${alarm.idalar}_${alarm.hour}_${alarm.minute}`;
  const last = await SecureStore.getItemAsync(key);
  const today = format(new Date(), "yyyy-MM-dd");
  return last === today;
}

async function markExecutedToday(alarm) {
  const key = `ALARM_EXEC_${alarm.idalar}_${alarm.hour}_${alarm.minute}`;
  const today = format(new Date(), "yyyy-MM-dd");
  await SecureStore.setItemAsync(key, today);
}

// ---------------------------------------------------------
// 🔊 REPRODUCCIÓN DE SONIDO + VIBRACIÓN
// ---------------------------------------------------------
Notifications.addNotificationReceivedListener(async (notification) => {
  const data = notification.request.content?.data;
  if (!data?.idalar) return;

  const alarm = alarmTimes.find((a) => a.idalar === data.idalar);
  if (!alarm) return;

  try {
    // 🔊 sonido
    const { sound } = await Audio.Sound.createAsync(alarm.sound);
    await sound.playAsync();

    setTimeout(() => sound.unloadAsync(), 10000);

    // 📳 vibración fuerte estilo alarma
    Vibration.vibrate([500, 500, 500, 500, 500], true);

    // detener vibración después de 8 segundos
    setTimeout(() => Vibration.cancel(), 8000);

  } catch (err) {
    console.warn("Error reproduciendo sonido/vibración:", err);
  }
});

// ---------------------------------------------------------
// ⏱ HORARIOS (DINÁMICOS, PUEDEN CAMBIAR)
// ---------------------------------------------------------
export let alarmTimes = [
    { idalar: 1, hour: 10, minute: 28, message: "⏰ Mami ya toca mi hierro", sound: require("../../assets/alerta1.mp3"), validatorQuery: "select IFNULL(COUNT(*), 0) as TOTAL from T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? AND fecha = ?" },
    { idalar: 2, hour: 10, minute: 58, message: "⏰ Mami toma mi hierro por favor", sound: require("../../assets/alerta2.mp3"), validatorQuery: "select IFNULL(COUNT(*), 0) as TOTAL from T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? AND fecha = ?" },
    { idalar: 3, hour: 18, minute: 28, message: "⏰ Gracias mamita, tenemos más hierro", sound: require("../../assets/alerta3.mp3"), validatorQuery: "select IFNULL(COUNT(*), 0) as TOTAL from T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? AND fecha = ?" },
    { idalar: 4, hour: 15, minute: 28, message: "⏰ Mami ya toca mi hierro", sound: require("../../assets/alerta1.mp3"), validatorQuery: "select IFNULL(COUNT(*), 0) as TOTAL from T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? AND fecha = ?" },
    { idalar: 5, hour: 15, minute: 58, message: "⏰ Mami toma mi hierro por favor", sound: require("../../assets/alerta2.mp3"), validatorQuery: "select IFNULL(COUNT(*), 0) as TOTAL from T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? AND fecha = ?" },
  ];

  async function getHemoglobinaForUser(userId) {
    try {
      const db = openDatabaseSync("auth.db");
      const result = db.getFirstSync(
        "SELECT hemoglo FROM T_05_ETAPA_GESTACIONAL WHERE id = ?",
        [userId]
      );
      if (!result) return null;
      return result.hemoglo;
    } catch (err) {
      console.warn("⚠️ Error obteniendo hemoglo del usuario:", err);
      return null;
    }
  }

// ---------------------------------------------------------
// 🚀 LÓGICA PRINCIPAL
// ---------------------------------------------------------
export async function alarmabbSync() {
  try {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const fechaquerysuple = format(now, 'yyyy-MM-dd');
    console.log("🧪 fechaquerysuple actual:", fechaquerysuple);

    const userId = await SecureStore.getItemAsync("userlogintask");
    if (!userId) return;
    const hemoglo = await getHemoglobinaForUser(userId);
    console.log("🧪 Hemoglobina actual:", hemoglo);

    for (const alarm of alarmTimes) {
      if (alarm.hour !== hour || alarm.minute !== minute) continue;
      if ((hemoglo !== null && Number(hemoglo) >= 11) && (alarm.idalar===4 || alarm.idalar===5)) continue;

      const alreadyDone = await wasExecutedToday(alarm);
      if (alreadyDone) {
        console.log(`⛔ Ya ejecutada anteriormente: ${alarm.idalar}`);
        continue;
      }

      const valid = await validateAlarmCondition(alarm, userId,fechaquerysuple);
      if (!valid) {
        console.log(`❌ No cumple condición SQL: ${alarm.idalar}`);
        continue;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💧👶 GestApp te recuerda",
          body: alarm.message,
          sound: "default",
          channelId: SYNC_ALARMA_CHANNEL_ID,
          data: { idalar: alarm.idalar },
        },
        trigger: null,
      });

      await markExecutedToday(alarm);

      console.log(`🔔 EJECUTADA: ${alarm.idalar}`);
    }
  } catch (err) {
    console.error("Error en alarma:", err);
  }
}

// ---------------------------------------------------------
// 🟦 BACKGROUND TASK
// ---------------------------------------------------------
TaskManager.defineTask(TASK_NAME, async () => {
  await alarmabbSync();
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export async function registerAlarmBackgroundTask() {
  await BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });

  console.log("✔ Background alarm task registered de Alarma");
}


