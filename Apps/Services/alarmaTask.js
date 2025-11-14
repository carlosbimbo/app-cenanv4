import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import { Platform } from "react-native";
import { openDatabaseSync } from "expo-sqlite";
import * as SecureStore from "expo-secure-store";
import { format } from 'date-fns';

const BABY_CHANNEL_ID = "baby_alarm_channel";
let lastExecutionTimestamps = {}; // 🧠 registro de última ejecución real por hora:minuto

// -----------------------------------------------------------------------------
// Definición base de alarmas
// -----------------------------------------------------------------------------
const baseAlarmTimes = [
  { 
    idalar:1,
    hour: 10,
    minute: 28,
    message: "⏰ Mami ya toca mi hierro",
    sound: require("../../assets/alerta1.mp3"),
    validatorQuery: "select IFNULL(COUNT(*), 0) as TOTAL from T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? AND fecha = ?",
  },
  {
    idalar:2,
    hour: 10,
    minute: 57,
    message: "⏰ Mami toma mi hierro por favor",
    sound: require("../../assets/alerta2.mp3"),
    validatorQuery: "select IFNULL(COUNT(*), 0) as TOTAL from T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? AND fecha = ?",
  },
  {
    idalar:3,
    hour: 18,
    minute: 26,
    message: "⏰ Gracias mamita, tenemos más hierro",
    sound: require("../../assets/alerta3.mp3"),
    validatorQuery: "select IFNULL(COUNT(*), 0) as TOTAL from T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? AND fecha = ?",
  },
];

// -----------------------------------------------------------------------------
// Setup canal y permisos
// -----------------------------------------------------------------------------
export async function setupNotificationsBaby() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("🚫 Permiso de notificaciones denegado");
      return;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(BABY_CHANNEL_ID, {
        name: "Recordatorios Agu Agu BB 👶",
        description: "Canal exclusivo para las alarmas diarias del BB.",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#00BCD4",
      });
    }

    console.log("✅ setupNotificationsBaby configurado correctamente");
  } catch (err) {
    console.error("❌ setupNotificationsBaby error:", err);
  }
}

// -----------------------------------------------------------------------------
// Utilidades
// -----------------------------------------------------------------------------
function getNextOccurrenceDate(hour, minute) {
  const now = new Date();
  const d = new Date(now);
  d.setHours(hour, minute, 0, 0);
  if (d <= now) d.setDate(d.getDate() + 1);
  return d;
}

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

// -----------------------------------------------------------------------------
// Reintento controlado
// -----------------------------------------------------------------------------
async function retryNotificationIfBlocked(alarm, attempt = 1) {
  if (attempt > 3) {
    console.warn(`🚫 Máximo de intentos alcanzado para ${alarm.message}`);
    return;
  }

  console.log(`⚙️ Reintentando alarma: ${alarm.message} (intento ${attempt})`);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💧👶 Agu Agu del BB",
      body: `${alarm.message} (reintento ${attempt})`,
      channelId: BABY_CHANNEL_ID,
      sound: null,
      data: {
        _baby_alarm_retry: true,
        hour: alarm.hour,
        minute: alarm.minute,
        attempt,
      },
    },
    trigger: { seconds: 10 * attempt }, // 10s, 20s, 30s
  });
}

// -----------------------------------------------------------------------------
// Programación normal
// -----------------------------------------------------------------------------
async function scheduleNextOccurrence(alarm) {
  const date = getNextOccurrenceDate(alarm.hour, alarm.minute);
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "💧👶 Agu Agu del BB",
      body: alarm.message,
      channelId: BABY_CHANNEL_ID,
      sound: null,
      data: {
        _baby_alarm: true,
        hour: alarm.hour,
        minute: alarm.minute,
        message: alarm.message,
      },
    },
    trigger: date,
  });

  console.log(
    `📅 Programada ${alarm.message} para ${date.toLocaleString()} id=${identifier}`
  );
  return identifier;
}

// -----------------------------------------------------------------------------
// Limpieza
// -----------------------------------------------------------------------------
async function clearBabyScheduledNotifications() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    const isBaby =
      n.content?.channelId === BABY_CHANNEL_ID ||
      n.content?.data?._baby_alarm;
    if (isBaby) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
      console.log("🧹 Cancelada alarma previa:", n.identifier);
    }
  }
}

// -----------------------------------------------------------------------------
// Obtener hemoglobina del usuario
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// Registro
// -----------------------------------------------------------------------------
export async function registerDailyAlarms() {
  try {
    const userId = await SecureStore.getItemAsync("userlogintask");
    const fecquerysuple = new Date(); 
    const fechaquerysuple = format(fecquerysuple, 'yyyy-MM-dd');
    console.log("🧪 fechaquerysuple actual:", fechaquerysuple);

    if (!userId) {
      console.log("🚫 Sin usuario logueado, no se programan alarmas BB");
      await clearBabyScheduledNotifications();
      return;
    }

    await clearBabyScheduledNotifications();

    // ✅ Copia base de alarmas
    let alarmTimes = [...baseAlarmTimes];

    // ✅ Condición de hemoglobina
    const hemoglo = await getHemoglobinaForUser(userId);
    console.log("🧪 Hemoglobina actual:", hemoglo);

    if (hemoglo !== null && Number(hemoglo) < 11) {
      console.log("⚠️ Hemoglobina < 11 → se agregan horarios intermedios");

      const extraAlarms = [
        {
          idalar:4,
          hour: 15,
          minute: 26,
          message: "⏰ Mami ya toca mi hierro",
          sound: require("../../assets/alerta1.mp3"),
          validatorQuery: "select IFNULL(COUNT(*), 0) as TOTAL from T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? AND fecha = ?",
        },
        {
          idalar:5,
          hour: 15,
          minute: 56,
          message: "⏰ Mami toma mi hierro por favor",
          sound: require("../../assets/alerta2.mp3"),
          validatorQuery: "select IFNULL(COUNT(*), 0) as TOTAL from T_05_REGISTRO_SUPLEMENTOS WHERE iduser = ? AND fecha = ?",
        },
      ];

      alarmTimes = [...alarmTimes, ...extraAlarms];
    } else {
      console.log("✅ Hemoglobina >= 11 → se mantienen horarios normales");
    }

    // ✅ Programar todas las alarmas
    for (const alarm of alarmTimes) {
      const valid = await validateAlarmCondition(alarm, userId,fechaquerysuple);
      if (valid) {
        await scheduleNextOccurrence(alarm);
      } else {
        console.log(`🚫 No se programa: ${alarm.message} (condición falsa)`);
      }
    }

    console.log("✅ registerDailyAlarms completado correctamente");
  } catch (err) {
    console.error("❌ registerDailyAlarms error:", err);
  }
}

// -----------------------------------------------------------------------------
// Listener principal
// -----------------------------------------------------------------------------
Notifications.addNotificationReceivedListener(async (notification) => {
  const data = notification.request.content?.data ?? {};
  const hour = data.hour ?? null;
  const minute = data.minute ?? null;
  const key = `${hour}:${minute}`;
  const alarmDef = baseAlarmTimes.find(
    (a) => a.hour === hour && a.minute === minute
  );

  if (!alarmDef) {
    console.log("ℹ️ Notificación recibida pero no es una alarma BB.");
    return;
  }

  console.log(`🔔 Alarma recibida correctamente: ${alarmDef.message}`);

  // 🧩 Registrar ejecución real
  lastExecutionTimestamps[key] = Date.now();

  try {
    const { sound } = await Audio.Sound.createAsync(alarmDef.sound);
    await sound.playAsync();
    setTimeout(() => sound.unloadAsync(), 10000);
    console.log(`🔊 Sonido reproducido para ${alarmDef.message}`);
  } catch (err) {
    console.warn(
      `❌ Error reproduciendo sonido para ${alarmDef.message}, se reintentará.`,
      err
    );
    await retryNotificationIfBlocked(alarmDef, 1);
  }

  // Reprogramar para el siguiente día
  await scheduleNextOccurrence(alarmDef);
});

// -----------------------------------------------------------------------------
// Monitor de respaldo cada minuto
// -----------------------------------------------------------------------------
setInterval(async () => {
  const now = Date.now();
  for (const alarm of baseAlarmTimes) {
    const key = `${alarm.hour}:${alarm.minute}`;
    const last = lastExecutionTimestamps[key] || 0;
    const diffMin = (now - last) / 60000;

    // calcular hora exacta prevista hoy
    const target = new Date();
    target.setHours(alarm.hour, alarm.minute, 0, 0);

    const isLate = now - target.getTime() > 60000 && diffMin > 60;

    if (isLate) {
      console.warn(
        `⚠️ Alarma perdida detectada (${alarm.message}), reintentando...`
      );
      await retryNotificationIfBlocked(alarm, 1);
    } else {
      console.log(
        `🕒 Monitoreo OK: ${alarm.message} | Última ejecución: ${
          diffMin.toFixed(2)
        } min atrás`
      );
    }
  }
}, 60 * 1000);
