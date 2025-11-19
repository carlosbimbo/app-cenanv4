import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import { openDatabaseSync } from "expo-sqlite";
import { Platform, Vibration } from "react-native";
import * as SecureStore from "expo-secure-store";
import { format } from "date-fns";

const TASK_NAME = "SYNC_EVENTOS_TASK";
const SYNC_EVENTOS_CHANNEL_ID = "sync_eventos_channel";

// ---------------------------------------------------------
// 🔔 CONFIGURACIÓN DE NOTIFICACIONES
// ---------------------------------------------------------
export async function setupEventosNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(SYNC_EVENTOS_CHANNEL_ID, {
      name: "Notificacion de Eventos de Gestante",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default", // solo sonido del dispositivo
      vibrationPattern: [500, 500, 500, 500, 500],
    });
  }
}

// ---------------------------------------------------------
// 🆕 CARGAR ALARMAS DESDE SQLITE (hora "HH:MM")
// ---------------------------------------------------------
export let alarmTimes = [];

async function loadAlarmTimesFromDB(userId, today) {
  try {
    const db = openDatabaseSync("auth.db");

    // Campos reales según tu tabla
    const rows = db.getAllSync(
      `SELECT ( rtrim(A.ideven) || rtrim(A.iduser) ) as idalar, A.hora,(A.descrip || ' - ' || (CASE WHEN A.TIPO = 1 THEN 'Nota Libre' WHEN A.TIPO = 2 THEN 'Cita Medica' WHEN A.TIPO = 3 THEN 'Toma de Medicamento' ELSE 'Nota Libre' END )) as mensaje 
       FROM T_05_REGISTRO_EVENTOS A       
       WHERE A.iduser = ? AND A.fecha = ?`,
      [userId, today]
    );

    if (!rows || rows.length === 0) return [];

    return rows.map((r) => {
      // Convertir "HH:MM" -> hour, minute
      const [h, m] = r.hora.split(":").map(Number);

      return {
        idalar: r.idalar,
        hour: h,
        minute: m,
        message: r.mensaje,

        // Mantiene tu validador original
        validatorQuery:
          "SELECT * FROM T_05_REGISTRO_EVENTOS WHERE iduser = ? AND fecha = ?",
      };
    });
  } catch (err) {
    console.warn("⚠️ Error cargando alarmas desde DB:", err);
    return [];
  }
}

async function validateAlarmCondition(alarm, userId, fechaqueryevento) {
  try {
    const db = openDatabaseSync("auth.db");
    const result = db.getFirstSync(alarm.validatorQuery, [userId,fechaqueryevento]);
    return !!result;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------
// 🛡 SISTEMA ANTI-DUPLICADO
// ---------------------------------------------------------
async function wasExecutedToday(alarm) {
  const key = `EVENTOS_EXEC_${alarm.idalar}_${alarm.hour}_${alarm.minute}`;
  const last = await SecureStore.getItemAsync(key);
  const today = format(new Date(), "yyyy-MM-dd");
  return last === today;
}

async function markExecutedToday(alarm) {
  const key = `EVENTOS_EXEC_${alarm.idalar}_${alarm.hour}_${alarm.minute}`;
  const today = format(new Date(), "yyyy-MM-dd");
  await SecureStore.setItemAsync(key, today);
}

// ---------------------------------------------------------
// 🔔 LISTENER: sin sonido MP3, solo vibración fuerte
// ---------------------------------------------------------
Notifications.addNotificationReceivedListener(() => {
  Vibration.vibrate([500, 500, 500, 500, 500], true);
  setTimeout(() => Vibration.cancel(), 8000);
});

// ---------------------------------------------------------
// 🚀 LÓGICA PRINCIPAL
// ---------------------------------------------------------
export async function eventosSync() {
  try {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const fechaqueryevento = format(now, "yyyy-MM-dd");

    const userId = await SecureStore.getItemAsync("userlogintask");
    if (!userId) return;

    // 🆕 Cargar alarmas desde la base de datos
    alarmTimes = await loadAlarmTimesFromDB(userId, fechaqueryevento);

    for (const alarm of alarmTimes) {
      if (alarm.hour !== hour || alarm.minute !== minute) continue;

      const alreadyDone = await wasExecutedToday(alarm);
      if (alreadyDone) continue;

      const valid = await validateAlarmCondition(
        alarm,
        userId,
        fechaqueryevento
      );
      if (!valid) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💊⏰ Recordatorio de Eventos",
          body: alarm.message,
          sound: "default", 
          channelId: SYNC_EVENTOS_CHANNEL_ID,
          data: { idalar: alarm.idalar },
        },
        trigger: null,
      });

      await markExecutedToday(alarm);
    }
  } catch (err) {
    console.error("Error en alarma:", err);
  }
}

// ---------------------------------------------------------
// BACKGROUND TASK
// ---------------------------------------------------------
TaskManager.defineTask(TASK_NAME, async () => {
  await eventosSync();
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export async function registerEventosBackgroundTask() {
  await BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });

  console.log("✔ Background alarm task registered de Eventos");
}
