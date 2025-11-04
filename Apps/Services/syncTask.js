import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import { openDatabaseSync } from "expo-sqlite";
import { apiFetch } from "./api";
import { getCurrentNetworkState } from "../Context/NetworkContext";
import { Platform } from "react-native";

const TASK_NAME = "SYNC_TASK";

// 🧩 Configuración inicial de notificaciones (debe llamarse al iniciar la app)
export async function setupNotifications() {
  try {
    // 🟢 Permitir mostrar notificaciones incluso si la app está abierta
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // 🟢 Pedir permisos si no existen
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("🚫 Permiso de notificaciones denegado por el usuario");
      return;
    }

    // 🟢 Canal de notificaciones en Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Sincronización automática",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
      console.log("📱 Canal de notificaciones Android configurado");
    }
  } catch (error) {
    console.error("❌ Error configurando notificaciones:", error);
  }
}

// 🧩 Función principal de sincronización
export async function performSync() {
  try {
    const { isConnected, isInternetReachable } = getCurrentNetworkState();
    if (!(isConnected || isInternetReachable)) {
      console.log("⚠️ Sin conexión, omitiendo sincronización");
      return;
    }

    const now = new Date().toLocaleTimeString();
    console.log(`🔁 Ejecutando sincronización a las ${now}`);

    const db = openDatabaseSync("auth.db");

    // 🔹 Consulta de tablas locales
    const users = await db.getAllAsync("SELECT * FROM users");
    const etapas = await db.getAllAsync("SELECT * FROM T_05_ETAPA_GESTACIONAL");
    const eventos = await db.getAllAsync("SELECT * FROM T_05_REGISTRO_EVENTOS");
    const supleme = await db.getAllAsync("SELECT * FROM T_05_REGISTRO_SUPLEMENTOS");
    const agendages = await db.getAllAsync("SELECT * FROM T_05_AGENDA_GESTACIONAL");
    const diasges = await db.getAllAsync("SELECT * FROM T_05_DIAS_GESTACION");

    console.log(`📦 ${users.length} usuarios, ${etapas.length} etapas, ${eventos.length} eventos, ${supleme.length} supleme, ${agendages.length} agendages, ${diasges.length} diasges`);

    let usersSynced = 0;
    let etapasSynced = 0;
    let eventosSynced = 0;
    let suplemeSynced = 0;
    let agendaSynced = 0;
    let diasgesSynced = 0;

    if (users.length > 0) {
      try {
        const sync_users = await apiFetch(
          "/syncalluser",
          { method: "POST", body: JSON.stringify(users) },
          true
        );
        console.log("✅ Users sincronizadas correctamente");
        //console.log("📦 Respuesta completa:", JSON.stringify(sync_users, null, 2));
        usersSynced = users.length;
      } catch (err) {
        console.log("❌ Error sincronizando users:", err.message);
      }
    }

    if (etapas.length > 0) {
      try {
        const sync_eta = await apiFetch(
          "/saveorudparragesta",
          { method: "POST", body: JSON.stringify(etapas) },
          true
        );
        console.log("✅ Etapas sincronizadas correctamente");
        //console.log("📦 Respuesta completa:", JSON.stringify(sync_eta, null, 2));
        etapasSynced = etapas.length;
      } catch (err) {
        console.log("❌ Error sincronizando etapas:", err.message);
      }
    }

    if (eventos.length > 0) {
      try {
        const sync_events = await apiFetch(
          "/syncalleventuser",
          { method: "POST", body: JSON.stringify(eventos) },
          true
        );
        console.log("✅ Eventos sincronizadas correctamente");
        //console.log("📦 Respuesta completa:", JSON.stringify(sync_events, null, 2));
        eventosSynced = eventos.length;
      } catch (err) {
        console.log("❌ Error sincronizando eventos:", err.message);
      }
    }

    if (supleme.length > 0) {
      try {
        const sync_suple = await apiFetch(
          "/syncallsuple",
          { method: "POST", body: JSON.stringify(supleme) },
          true
        );
        console.log("✅ Suplementos sincronizados correctamente");
        //console.log("📦 Respuesta completa:", JSON.stringify(sync_suple, null, 2));
        suplemeSynced = supleme.length;
      } catch (err) {
        console.log("❌ Error sincronizando suplementos:", err.message);
      }
    }

    if (agendages.length > 0) {
      try {
        const sync_agenda = await apiFetch(
          "/syncallagendagesta",
          { method: "POST", body: JSON.stringify(agendages) },
          true
        );
        console.log("✅ Agenda Gestacional sincronizadas correctamente");
        //console.log("📦 Respuesta completa:", JSON.stringify(sync_agenda, null, 2));
        agendaSynced = agendages.length;
      } catch (err) {
        console.log("❌ Error sincronizando Agenda Gestacional:", err.message);
      }
    }

    if (diasges.length > 0) {
      try {
        const sync_diasges = await apiFetch(
          "/syncalldaysgesta",
          { method: "POST", body: JSON.stringify(diasges) },
          true
        );
        console.log("✅ Dias Gestacion sincronizados correctamente");
        //console.log("📦 Respuesta completa:", JSON.stringify(sync_diasges, null, 2));
        diasgesSynced = diasges.length;
      } catch (err) {
        console.log("❌ Error sincronizando dias Gestacion:", err.message);
      }
    }

    // 🟢 Mostrar notificación de éxito
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "✅ Sincronización exitosa",
        body: `Usuarios: ${usersSynced}, Etapas: ${etapasSynced}, Eventos: ${eventosSynced}, Suplementos: ${suplemeSynced}, Agenda: ${agendaSynced}, DiasGesta: ${diasgesSynced}`,
        sound: "default",
        channelId: "default", // 👈 Obligatorio en Android
      },
      trigger: null,
    });

    console.log("📢 Notificación mostrada correctamente");
  } catch (err) {
    console.error("❌ Error general en sincronización:", err);

    // 🔴 Notificación de error
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "❌ Error en sincronización",
        body: err.message ?? "Error desconocido",
        sound: "default",
        channelId: "default",
      },
      trigger: null,
    });
  }
}

// 🔹 Define la tarea background
TaskManager.defineTask(TASK_NAME, async () => {
  console.log("🕒 Tarea SYNC_TASK ejecutada en segundo plano");
  await performSync();
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// 🔸 Registrar tarea
export async function registerBackgroundSync() {
  try {
    const status = await BackgroundFetch.getStatusAsync();

    if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
      console.warn("⚠️ Background fetch restringido por el sistema");
      return;
    }

    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 300,//60, // cada 1 minuto (Android limita mínimo ~15min reales)
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log("✅ Background sync registrado correctamente");
  } catch (err) {
    console.error("❌ Error registrando BackgroundFetch:", err);
  }
}
